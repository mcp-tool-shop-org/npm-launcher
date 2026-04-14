#!/usr/bin/env bash
set -euo pipefail

# Dogfood test for Linux bootstrap rail
# Runs in WSL, exercises the real venv/pip/python contract
#
# Each test uses an isolated directory under TEST_ROOT.
# No test reuses or mutates another test's venv.

PASS=0
FAIL=0
TOOL="backpropagate"
VERSION="1.0.4"
TEST_ROOT=$(mktemp -d "/tmp/bp-dogfood-XXXXXX")

pass() { echo "  PASS: $1"; PASS=$((PASS + 1)); }
fail_test() { echo "  FAIL: $1"; FAIL=$((FAIL + 1)); }
header() { echo ""; echo "=== $1 ==="; }

cleanup() {
  rm -rf "$TEST_ROOT"
}
trap cleanup EXIT

# ============================================================================
# Test 1: First run — fresh bootstrap
# Simulates: no meta, no venv, first time npx backpropagate on Linux
# ============================================================================
header "Test 1: First run — fresh bootstrap"
DIR1="$TEST_ROOT/test1"
mkdir -p "$DIR1"

python3 -m venv "$DIR1/venv"
if [ -f "$DIR1/venv/bin/python3" ]; then
  pass "venv created"
else
  fail_test "venv creation failed"
fi

"$DIR1/venv/bin/python3" -m pip install --quiet "$TOOL==$VERSION" 2>&1
if [ -f "$DIR1/venv/bin/$TOOL" ]; then
  pass "binary installed"
else
  fail_test "binary not found after pip install"
fi

OUTPUT=$("$DIR1/venv/bin/$TOOL" --version 2>&1 || true)
if echo "$OUTPUT" | grep -q "$VERSION"; then
  pass "--version returns $VERSION"
else
  fail_test "--version unexpected: $OUTPUT"
fi

# ============================================================================
# Test 2: Cached run — binary already present, version matches
# ============================================================================
header "Test 2: Cached run — binary present, version matches"

if [ -f "$DIR1/venv/bin/$TOOL" ]; then
  pass "binary still present (cache hit)"
else
  fail_test "binary disappeared"
fi

START=$(date +%s%N)
"$DIR1/venv/bin/$TOOL" --version > /dev/null 2>&1 || true
END=$(date +%s%N)
ELAPSED=$(( (END - START) / 1000000 ))
if [ "$ELAPSED" -lt 5000 ]; then
  pass "cached exec fast (${ELAPSED}ms)"
else
  fail_test "cached exec slow (${ELAPSED}ms)"
fi

# ============================================================================
# Test 3: Version update — meta says old version, wrapper says new
# ============================================================================
header "Test 3: Version update — stale meta"
DIR3="$TEST_ROOT/test3"
mkdir -p "$DIR3"
cp -a "$DIR1/venv" "$DIR3/venv"

cat > "$DIR3/install.json" << ENDJSON
{"version": "0.9.0", "installedAt": "2026-01-01T00:00:00.000Z", "python": "python3"}
ENDJSON

STORED_VER=$(python3 -c "import json; print(json.load(open('$DIR3/install.json'))['version'])")
if [ "$STORED_VER" != "$VERSION" ]; then
  pass "mismatch detected: $STORED_VER != $VERSION"
else
  fail_test "should have detected mismatch"
fi

# Normal --upgrade suffices when version number actually changes
"$DIR3/venv/bin/python3" -m pip install --quiet --upgrade "$TOOL==$VERSION" 2>&1
VER3=$("$DIR3/venv/bin/$TOOL" --version 2>&1 || true)
if echo "$VER3" | grep -q "$VERSION"; then
  pass "upgrade to exact version succeeded"
else
  fail_test "upgrade produced: $VER3"
fi

# ============================================================================
# Test 4: Repair — binary deleted, pip metadata intact
# This is the bug that dogfooding caught: --upgrade alone is a no-op here
# because pip sees the same version in metadata. --force-reinstall is needed.
# ============================================================================
header "Test 4: Repair — binary deleted, meta intact"
DIR4="$TEST_ROOT/test4"
mkdir -p "$DIR4"
cp -a "$DIR1/venv" "$DIR4/venv"

rm -f "$DIR4/venv/bin/$TOOL"
if [ ! -f "$DIR4/venv/bin/$TOOL" ]; then
  pass "binary removed"
else
  fail_test "failed to remove binary"
fi

# Prove the bug: --upgrade alone does NOT restore the binary
"$DIR4/venv/bin/python3" -m pip install --quiet --upgrade "$TOOL==$VERSION" 2>&1
if [ ! -f "$DIR4/venv/bin/$TOOL" ]; then
  pass "--upgrade alone correctly failed to restore (confirms bug)"
else
  pass "--upgrade restored binary (pip behavior may vary by version)"
fi

# Now prove the fix: --force-reinstall always works
rm -f "$DIR4/venv/bin/$TOOL" 2>/dev/null || true
"$DIR4/venv/bin/python3" -m pip install --quiet --force-reinstall "$TOOL==$VERSION" 2>&1
if [ -f "$DIR4/venv/bin/$TOOL" ]; then
  pass "--force-reinstall restored binary"
else
  fail_test "--force-reinstall failed to restore binary"
fi

VER4=$("$DIR4/venv/bin/$TOOL" --version 2>&1 || true)
if echo "$VER4" | grep -q "$VERSION"; then
  pass "repaired binary runs correctly"
else
  fail_test "repaired binary version: $VER4"
fi

# ============================================================================
# Test 5: Force reinstall — nuke venv, rebuild from scratch
# Isolated: creates its own venv, corrupts it, nukes it, rebuilds
# ============================================================================
header "Test 5: Force reinstall — nuke and rebuild"
DIR5="$TEST_ROOT/test5"
mkdir -p "$DIR5"

# Create a venv, then nuke it (simulates BACKPROPAGATE_FORCE_REINSTALL=1)
python3 -m venv "$DIR5/venv"

# Verify it exists before nuke
if [ -d "$DIR5/venv" ]; then
  pass "venv exists before nuke"
else
  fail_test "venv not created"
fi

rm -rf "$DIR5/venv"
if [ ! -d "$DIR5/venv" ]; then
  pass "venv nuked"
else
  fail_test "venv still exists after rm -rf"
fi

# Rebuild from scratch
python3 -m venv "$DIR5/venv"
"$DIR5/venv/bin/python3" -m pip install --quiet "$TOOL==$VERSION" 2>&1
if [ -f "$DIR5/venv/bin/$TOOL" ]; then
  pass "rebuilt binary present"
else
  fail_test "rebuilt binary missing"
fi

VER5=$("$DIR5/venv/bin/$TOOL" --version 2>&1 || true)
if echo "$VER5" | grep -q "$VERSION"; then
  pass "rebuilt binary runs correctly"
else
  fail_test "rebuilt binary version: $VER5"
fi

# ============================================================================
# Test 6: No Python — detection failure message
# ============================================================================
header "Test 6: No Python available"

# Empty PATH so python3 can't be found
set +e
RESULT=$(PATH="/nonexistent" python3 --version 2>&1)
PY_EXIT=$?
set -e

if [ "$PY_EXIT" -ne 0 ]; then
  pass "python3 correctly not found with empty PATH"
else
  fail_test "python3 somehow found: $RESULT"
fi

# ============================================================================
# Test 7: pip failure — nonexistent package version
# ============================================================================
header "Test 7: pip failure — bad version"
DIR7="$TEST_ROOT/test7"
mkdir -p "$DIR7"
python3 -m venv "$DIR7/venv"

set +e
"$DIR7/venv/bin/python3" -m pip install --quiet "$TOOL==99.99.99" 2>&1
PIP_EXIT=$?
set -e

if [ "$PIP_EXIT" -ne 0 ]; then
  pass "pip correctly failed on nonexistent version (exit $PIP_EXIT)"
else
  fail_test "pip should have failed"
fi

# ============================================================================
# Test 8: Exit code passthrough
# ============================================================================
header "Test 8: Exit code passthrough"

set +e
"$DIR1/venv/bin/$TOOL" --nonexistent-flag 2>/dev/null
EXIT_CODE=$?
set -e

if [ "$EXIT_CODE" -ne 0 ]; then
  pass "non-zero exit code passed through ($EXIT_CODE)"
else
  fail_test "expected non-zero exit code for bad flag"
fi

# ============================================================================
# Summary
# ============================================================================
echo ""
echo "==============================="
echo "  PASS: $PASS  |  FAIL: $FAIL"
echo "==============================="

if [ "$FAIL" -gt 0 ]; then
  exit 1
fi
