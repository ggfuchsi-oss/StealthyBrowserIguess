# Stealth Browser

A stealth Chromium browser with 75+ fingerprint patches and REST API. Bypasses Akamai, PerimeterX, Kasada, Cloudflare, reCAPTCHA.

## Features

- **25 C++ source patches** compiled into Chromium binary
- **50+ runtime JavaScript patches** for comprehensive fingerprint spoofing
- **Bypasses all major anti-bot systems:**
  - Akamai Bot Manager v2 ✅
  - PerimeterX/HUMAN ✅
  - Kasada ✅ (x-kpsdk-ct token)
  - Cloudflare Turnstile ✅
  - reCAPTCHA v3 (0.9 score) ✅
- **69 REST API endpoints** for full browser control
- **Warm-up mode** for building session trust
- **Human-like interaction** (mouse, scroll, keystroke timing)

## Installation

```bash
pip install stealthy-browser
```

## Quick Start

```python
from stealthy_browser import StealthyBrowser

# Start browser
browser = StealthyBrowser()

# Navigate with warmup
browser.goto("https://www.amazon.com/s?k=ps5+pro", warmup=True)

# Extract data
print(browser.get_text())

# Take screenshot
browser.screenshot("amazon.png")

# Check fingerprint
print(browser.get_fingerprint())

# Check anti-bot status
print(browser.get_anti_bot_status())
```

## CLI Usage

```bash
# Start server
stealthy-browser start

# Scrape a URL
stealthy-browser scrape "https://www.amazon.com/s?k=ps5+pro"

# Take screenshot
stealthy-browser screenshot "https://www.amazon.com/s?k=ps5+pro" --output amazon.png

# Check fingerprint
stealthy-browser fingerprint

# Check anti-bot status
stealthy-browser anti-bot
```

## API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/health` | GET | Health check |
| `/goto` | POST | Navigate to URL |
| `/info/title` | GET | Page title |
| `/info/body/text` | GET | Page text |
| `/info/fingerprint` | GET | Browser fingerprint |
| `/info/anti-bot` | GET | Anti-bot status |
| `/cookies` | GET | Session cookies |
| `/js/execute` | POST | Execute JavaScript |
| `/screenshot` | POST | Take screenshot |
| `/warmup` | POST | Run warmup sequence |

## Configuration

Edit `config.json` to customize:

```json
{
  "server": {"port": 6666, "host": "127.0.0.1"},
  "browser": {
    "chrome_path": "path/to/chrome.exe",
    "headless": true,
    "stealth": true
  },
  "warmup": {
    "enabled": true,
    "sites": ["https://example.com"]
  }
}
```

## License

MIT
