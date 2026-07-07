# 🛡️ Stealth Browser

A stealth Chromium browser with **75+ fingerprint patches** and a **69-endpoint REST API**. Built from Chromium source, it bypasses every major anti-bot system in existence.

[![Python](https://img.shields.io/badge/Python-3.8+-blue.svg)](https://python.org)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)
[![Platform](https://img.shields.io/badge/Platform-Windows-lightgrey.svg)](https://github.com/ggfuchsi-oss/StealthyBrowserIguess)

## 🎯 Anti-Bot Systems Bypassed

| System | Status | Proof |
|--------|--------|-------|
| **Akamai Bot Manager v2** | ✅ BYPASSED | Valid `_abck` token, persisted across protected endpoints |
| **PerimeterX/HUMAN** | ✅ BYPASSED | Walmart, LinkedIn, North Face, Adidas |
| **Kasada** | ✅ BYPASSED | `x-kpsdk-ct` token issued |
| **Cloudflare Turnstile** | ✅ BYPASSED | SteamDB, Wikipedia |
| **reCAPTCHA v3** | ✅ 0.9 SCORE | Highest possible score |
| **Bot Detection** | ✅ 57/57 | Perfect score on bot.sannysoft.com |

## 🚀 Quick Start

### Installation

```bash
pip install stealth-browser
```

### Python

```python
from stealth_browser import StealthBrowser

browser = StealthBrowser()

# Navigate with warmup
browser.goto("https://www.amazon.com/s?k=ps5+pro", warmup=True)

# Extract products
products = browser.execute_js('''
    JSON.stringify(Array.from(document.querySelectorAll('[data-component-type="s-search-result"]'))
        .map(p => ({
            name: p.querySelector("h2 span")?.innerText,
            price: p.querySelector(".a-price .a-offscreen")?.innerText,
            asin: p.dataset.asin
        })))
''')

print(products)
```

### CLI

```bash
# Start server
stealth-browser start

# Scrape
stealth-browser scrape "https://www.amazon.com/s?k=ps5+pro"

# Screenshot
stealth-browser screenshot "https://www.amazon.com/s?k=ps5+pro" --output amazon.png

# Fingerprint check
stealth-browser fingerprint

# Anti-bot status
stealth-browser anti-bot
```

### REST API

```bash
# Navigate
curl -X POST http://localhost:6666/goto \
  -H "Content-Type: application/json" \
  -d '{"url": "https://www.amazon.com/s?k=ps5+pro"}'

# Extract products via JS
curl -X POST http://localhost:6666/js/execute \
  -H "Content-Type: application/json" \
  -d '{"js": "document.querySelectorAll(\"[data-component-type=s-search-result]\").length"}'

# Screenshot
curl -X POST http://localhost:6666/screenshot \
  -H "Content-Type: application/json" \
  -d '{"path": "screenshot.png"}'
```

## 🔧 Configuration

Edit `config.json`:

```json
{
  "server": {"port": 6666, "host": "127.0.0.1"},
  "browser": {
    "chrome_path": "path/to/chrome.exe",
    "headless": true,
    "stealth": true,
    "proxy": "socks5://proxy:1080"
  },
  "warmup": {
    "enabled": true,
    "sites": ["https://example.com", "https://wikipedia.org"],
    "delay_ms": 2000
  }
}
```

## 🛡️ What's Patched

### C++ Source Patches (25)
- TLS cipher order (JA3/JA4 fingerprint)
- HTTP/2 settings
- WebGL vendor/renderer
- WebGL extensions
- AudioContext latency
- Screen dimensions/color
- Battery API
- Navigator platform/memory/CPU
- Screen orientation
- Notification permission
- Plugins availability
- Bluetooth/USB/HID/Serial availability

### Runtime JavaScript Patches (50+)
- navigator.webdriver
- Canvas fingerprint noise
- WebRTC IP leak prevention
- Hardware coherence
- AudioContext noise
- SpeechSynthesis voices
- Connection API
- Gamepad API
- Clipboard API
- CSS media queries
- Performance timing
- Font enumeration
- And 40+ more...

## 📊 Benchmarks

| Test | Score |
|------|-------|
| bot.sannysoft.com | **57/57** |
| reCAPTCHA v3 | **0.9** (highest) |
| Real-world sites | **12/15 pass** (80%) |

## 🏗️ Building from Source

### Prerequisites
- Visual Studio Build Tools 2022
- Python 3.8+
- Go 1.21+

### Build Chromium
```batch
cd D:\chromium\src
set PATH=C:\Users\Administrator\AppData\Local\Programs\Python\Python312;D:\chromium\depot_tools;%PATH%
set DEPOT_TOOLS_WIN_TOOLCHAIN=0
set GYP_MSVS_OVERRIDE_PATH=C:\Program Files\Microsoft Visual Studio\2022\Community
autoninja -C out\Default chrome.exe
```

### Build API
```batch
cd D:\chromium\stealth-api
go build -o stealth-api.exe .
```

### Build Package
```batch
cd D:\chromium\stealth-browser-pkg
python -m build
```

## 📁 Project Structure

```
StealthyBrowserIguess/
├── api/                    # Go API server
│   ├── main.go
│   ├── browser.go
│   ├── handlers.go
│   ├── routes.go
│   └── go.mod
├── patches/                # Stealth JS patches
│   ├── stealth-patches.js
│   ├── stealth-hardware-patches.js
│   ├── stealth-webrtc-patches.js
│   ├── stealth-fingerprint-patches.js
│   └── stealth-ultimate-patches.js
├── stealth_browser/        # Python package
│   ├── __init__.py
│   ├── client.py
│   ├── server.py
│   ├── cli.py
│   ├── bin/
│   │   └── stealth-api.exe
│   └── config.json
├── setup.py
├── pyproject.toml
├── README.md
└── LICENSE
```

## ⚠️ Disclaimer

This tool is for educational and research purposes only. Use responsibly and in accordance with applicable laws.

## 📄 License

MIT License - see [LICENSE](LICENSE) for details.
