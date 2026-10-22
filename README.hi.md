<p align="center">
  <a href="README.ja.md">日本語</a> | <a href="README.zh.md">中文</a> | <a href="README.es.md">Español</a> | <a href="README.fr.md">Français</a> | <a href="README.md">English</a> | <a href="README.it.md">Italiano</a> | <a href="README.pt-BR.md">Português (BR)</a>
</p>

<p align="center">
  <img src="https://raw.githubusercontent.com/mcp-tool-shop-org/brand/main/logos/npm-launcher/readme.png" width="400" alt="npm-launcher" />
</p>

<p align="center">
  <a href="https://github.com/mcp-tool-shop-org/npm-launcher/actions"><img src="https://github.com/mcp-tool-shop-org/npm-launcher/actions/workflows/ci.yml/badge.svg" alt="CI"></a>
  <a href="https://www.npmjs.com/package/@mcptoolshop/npm-launcher"><img src="https://img.shields.io/npm/v/@mcptoolshop/npm-launcher" alt="npm version"></a>
  <a href="https://github.com/mcp-tool-shop-org/npm-launcher/blob/main/LICENSE"><img src="https://img.shields.io/badge/license-MIT-blue" alt="License"></a>
  <a href="https://mcp-tool-shop-org.github.io/npm-launcher/"><img src="https://img.shields.io/badge/Landing_Page-live-blue" alt="Landing Page"></a>
</p>

npm के लिए सामान्य GitHub-रिलीज़ बाइनरी लॉन्चर। यह GitHub रिलीज़ से प्लेटफ़ॉर्म-विशिष्ट बाइनरी डाउनलोड करता है, उन्हें स्थानीय रूप से कैश करता है, SHA256 चेकसम को सत्यापित करता है, और उन्हें सभी तर्कों के साथ चलाता है।

इस तरह से बनाया गया है कि Python CLI (या कोई भी संकलित बाइनरी) शून्य-निर्भरता `npx` वितरण प्राप्त करे।

## सुरक्षा और खतरे का मॉडल

npm-लॉन्चर बाइनरी डाउनलोड और निष्पादित करता है। यहां बताया गया है कि यह क्या एक्सेस करता है और क्या नहीं:

- **नेटवर्क:** केवल HTTPS, `github.com` और GitHub के CDN तक। कोई अन्य गंतव्य नहीं।
- **फ़ाइल सिस्टम:** केवल स्थानीय कैश में लिखता है (`~/.cache/mcptoolshop/` या `%LOCALAPPDATA%\mcptoolshop\`)। सिस्टम फ़ाइलों को संशोधित नहीं करता है या कैश के बाहर से नहीं पढ़ता है।
- **सत्यापन:** प्रत्येक बाइनरी को उसी रिलीज़ में `checksums-<version>.txt` फ़ाइल से SHA256 के विरुद्ध जांचा जाता है। बेमेल होने पर निष्पादन रद्द हो जाता है और डाउनलोड की गई फ़ाइल हटा दी जाती है।
- **कोई टेलीमेट्री नहीं।** कोई गुप्त जानकारी नहीं। कोई क्रेडेंशियल संग्रहीत या प्रेषित नहीं।
- **अनुमतियाँ:** सामान्य उपयोगकर्ता फ़ाइल सिस्टम एक्सेस और आउटबाउंड HTTPS से परे कोई आवश्यकता नहीं।

## यह कैसे काम करता है

```
npx @mcptoolshop/sovereignty tutorial
        │
        ▼
  wrapper sets config JSON
        │
        ▼
  npm-launcher resolves platform (linux-x64, darwin-arm64, etc.)
        │
        ▼
  checks local cache (~/.cache/mcptoolshop/<tool>/<version>/)
        │
        ├─ cached → run binary
        │
        └─ not cached:
             fetch checksums-<version>.txt from GitHub Release
             download <tool>-<version>-<os>-<arch>[.exe]
             verify SHA256
             cache + chmod +x
             run binary
```

## इंस्टॉल करें

```bash
npm install @mcptoolshop/npm-launcher
```

यह पैकेज रैपर पैकेजों के लिए एक लाइब्रेरी है - अंतिम उपयोगकर्ता रैपर (जैसे `npx @mcptoolshop/sovereignty`) स्थापित करते हैं, सीधे इसे नहीं।

## कॉन्फ़िगरेशन अनुबंध

रैपर `MCPTOOLSHOP_LAUNCH_CONFIG` के माध्यम से शुद्ध JSON पास करते हैं। कोई फ़ंक्शन नहीं, कोई जादू नहीं।

| फ़ील्ड | आवश्यक | उदाहरण | विवरण |
|------------|----------|------------------------|--------------------------------------|
| `toolName` | हाँ | `"sovereignty"`        | बाइनरी का आधार नाम |
| `owner`    | हाँ | `"mcp-tool-shop-org"`  | GitHub org/user |
| `repo`     | हाँ | `"sovereignty"`        | GitHub रेपो नाम |
| `version`  | हाँ | `"1.4.0"`              | सेमवर (कोई `v` उपसर्ग नहीं) |
| `tag`      | no       | `"v1.4.0"`             | गिट टैग (डिफ़ॉल्ट रूप से `v<version>`) |
| `quiet`    | no       | `true`                 | प्रगति संदेशों को दबाएं |

## एसेट नामकरण सम्मेलन

लॉक किया गया। सभी उपकरण एक ही पैटर्न का पालन करते हैं:

```
<toolName>-<version>-<os>-<arch><ext>
```

| प्लेटफ़ॉर्म | उदाहरण एसेट |
|---------------|--------------------------------------|
| लिनक्स x64 | `sovereignty-1.4.0-linux-x64`        |
| macOS ARM | `sovereignty-1.4.0-darwin-arm64`     |
| macOS इंटेल | `sovereignty-1.4.0-darwin-x64`       |
| विंडोज x64 | `sovereignty-1.4.0-win-x64.exe`     |

चेकसम फ़ाइल: `checksums-<version>.txt` (GNU कोरयूटिल्स प्रारूप)।

## एक रैपर लिखना

एक रैपर एक छोटा npm पैकेज (~3 फ़ाइलें) है:

**package.json:**
```json
{
  "name": "@mcptoolshop/sovereignty",
  "version": "1.4.0",
  "bin": { "sovereignty": "bin/sovereignty.js" },
  "dependencies": { "@mcptoolshop/npm-launcher": "^1.0.0" }
}
```

**bin/sovereignty.js:**
```js
#!/usr/bin/env node
process.env.MCPTOOLSHOP_LAUNCH_CONFIG = JSON.stringify({
  toolName: "sovereignty",
  owner: "mcp-tool-shop-org",
  repo: "sovereignty",
  version: "1.4.0",
});
require("@mcptoolshop/npm-launcher/bin/mcptoolshop-launch.js");
```

पूर्ण रैपर टेम्पलेट्स के लिए `examples/sovereignty/` और `examples/xrpl-camp/` देखें, और PyInstaller CI वर्कफ़्लो के लिए `examples/ci/release-binaries.yml` देखें।

## पर्यावरण चर

| चर | प्रभाव |
|----------|--------|
| `MCPTOOLSHOP_LAUNCHER_QUIET=1` | प्रगति संदेशों को दबाएं (त्रुटियां अभी भी प्रिंट होती हैं) |

## समर्थित प्लेटफ़ॉर्म

- लिनक्स x64
- macOS ARM64 (एप्पल सिलिकॉन)
- macOS x64 (इंटेल)
- विंडोज x64

## कैश स्थान

| OS      | पथ |
|---------|----------------------------------------------|
| लिनक्स | `~/.cache/mcptoolshop/<tool>/<version>/`     |
| macOS | `~/.cache/mcptoolshop/<tool>/<version>/`     |
| विंडोज | `%LOCALAPPDATA%\mcptoolshop\<tool>\<version>\` |

---

<a href="https://mcp-tool-shop.github.io/">MCP टूल शॉप</a> द्वारा निर्मित।
