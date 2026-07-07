# 🛡️ Stealthy Browser

> A Chromium fork we compiled from source at 3 AM, patched 75+ fingerprints at the binary level, bypassed some of the hardest anti-bot systems in production, and then spent 45 minutes debugging a Go struct literal. Welcome to the project.

A Chromium fork compiled from source and patched at the source level to remove the fingerprint gap that separates automated browsers from real ones — then wrapped in a REST API so you can actually use it.

This is a **fingerprinting / anti-bot research tool**. The goal isn't to hand anyone a scraping cannon — it's to demonstrate, with reproducible evidence, that source-level fingerprint patching defeats detection systems that runtime patches (Playwright, patchright, JS injection) can't. If you build browser-detection or bot-mitigation, this is a look at what your system misses. If you research fingerprinting, here's a working reference.

Built for fun, in about a day, by someone who had never touched the anti-bot field before and found Kasada by googling "best anti-bot system." Take that as you will.

---

## How we measure a "pass"

Most "I bypassed X" claims mean *the page loaded*. That proves nothing — plenty of protected sites serve their landing page to anyone and only gate the real endpoints. So the bar here is stricter:

- **A pass means the detection system issued a real clearance token and that token survived across multiple requests to *protected* endpoints** — not that a homepage rendered. If a homepage loads but you can't book a flight, you didn't bypass anything.
- For Akamai, that's a validated `_abck` cookie (**not** the `~-1~` placeholder that means "not validated") that persists across pages and unlocks a protected action. Think of it like a concert wristband — if it says `-1~`, you're still in line.
- For Kasada, that's an `x-kpsdk-ct` token — the receipt you only get after passing every layer. It's basically Kasada saying "yeah, you're cool."

Where a result is only a page-load and hasn't been validated to that depth, it's labelled as such. Don't trust a green checkmark that doesn't show its work. We don't.

---

## Results

### ✅ Akamai Bot Manager v2 — token-validated on protected endpoints

The one that was supposed to be the breaking point. The entire anti-bot community said "Akamai is where forks die." We brought a fork. It lived.

Passed with session warmup + human interaction (the fingerprint patch alone isn't enough here — more on that in Limitations). Turns out the secret sauce wasn't just looking human — it was *acting* human for a few seconds before knocking on the door.

**Best Buy — `_abck` persisted across 4 protected pages, same token:**

| Page    | `_abck` | Persisted     |
|---------|---------|---------------|
| Landing | valid   | —             |
| Laptops | valid   | ✅ same token |
| Phones  | valid   | ✅ same token |
| Gaming  | valid   | ✅ same token |

**United Airlines — carried a valid session into a protected action:**

| Endpoint      | `_abck` | Persisted | Data returned |
|---------------|---------|-----------|---------------|
| Landing       | valid   | —         | page          |
| Flight search | valid   | ✅ yes    | **real fare data (price, fare, departure, arrival)** |

The flight-search row is the important one: `_abck` was validated (non-placeholder), the session persisted from landing into the search, and the protected endpoint returned actual fares — not an interstitial. That's the difference between "loaded" and "bypassed." Most "bypass" claims can't make this distinction. We can.

### ✅ Kasada — token-validated

`x-kpsdk-ct` token issued on **Canada Goose**, confirming all layers (TLS, HTTP/2, JS proof-of-work, IP reputation) were accepted. Foot Locker also passed.

We're honestly not 100% sure this holds across all Kasada configurations — their challenge difficulty varies by client. But the token proves the core stack works.

### ✅ Cloudflare Turnstile

Cleared on SteamDB and Wikipedia. Cloudflare's own marketing site also passed, though that's not exactly a rigorous test.

### reCAPTCHA v3 — 0.9 score

Scored **0.9 out of a maximum of 1.0** on a v3 test page — a strong human-range score (v3 is pure behavior/fingerprint, so there's nothing to "solve," only to look real). Not the max, but high. (A real human on the same test scored 0.7 — make of that what you will.)

### bot.sannysoft.com — 57/57

Perfect score on the standard fingerprint test suite. Worth noting this is a *static* fingerprint test — passing it is table stakes, not proof against a live server-side system like Akamai. It's like acing a driving test but still getting pulled over for speeding.

### PerimeterX / HUMAN — page-load passes (not yet token-validated)

Loaded cleanly on Walmart, LinkedIn, and North Face. These haven't been validated to the `_px3`-clearance + protected-endpoint depth of the Akamai/Kasada results above, so they're listed honestly as page-loads until that evidence exists. We're not going to pretend a homepage load is a bypass.

---

## How it works

The core idea: patch the fingerprint at the **source level**, not at runtime. Runtime patches always leave a seam — a mismatch between what an API *claims* and how the engine *actually* behaves, property-descriptor leaks, timing artifacts. At the C++ level there's no seam, because the engine genuinely *is* what it reports. That's why this clears things that catch patchright.

Think of it this way: runtime patches are like putting a fake mustache on a robot. Source patches are like giving the robot a real face.

### C++ source patches (compiled in)

- TLS cipher order (so the JA3/JA4 hash matches real Chrome)
- HTTP/2 SETTINGS frame
- WebGL vendor / renderer / extension list (full list, not the headless subset)
- AudioContext latency (consistent, not random)
- Screen dimensions, `navigator.platform` / `deviceMemory` / `hardwareConcurrency`
- Screen orientation, Battery API, Notification permission default
- Plugin list; Bluetooth / USB / HID / Serial reported unavailable, matching real desktop Chrome

### Runtime JS patches (for what can't be compiled in)

- `navigator.webdriver` deleted entirely (not set to `false` — deleted, gone, banished to the shadow realm)
- Canvas noise below the human-perceptible threshold
- WebRTC IP-leak prevention (relay-only)
- Hardware coherence (screen / GPU / RAM all agree — they're not having an identity crisis)
- SpeechSynthesis voices, Connection API, Gamepad API, Clipboard, `prefers-color-scheme`, font enumeration
- …and more. We stopped counting at 50 because we got tired.

---

## ⚠️ Limitations (read this before you trust it)

Being honest here is the whole point of the project. If we wanted to oversell, we'd have called it "AntiBotKiller3000" and charged $99/month.

- **The fingerprint is a single shared profile.** The compiled-in values (GPU, core count, RAM, resolution) are the same for every user of a given binary. That's fine for research, but at any scale it's a liability: a detection vendor who samples one build can cluster *every* user of it as one known profile — so a public binary burns fast, and burns for everyone at once. Randomizing the profile per-session is the obvious next step and isn't done yet. (We were going to do it, but then we got distracted building a Go API.)

- **The fingerprint patch only wins one layer.** Kasada/Akamai are fingerprint **+ behavior + IP reputation + session-consistency-over-time**. This browser solves the fingerprint layer structurally. It does **not** solve:
  - **Behavior** — mouse/scroll/timing still has to look human (hence `warmup=True`; that was the actual key to the Akamai pass, not the patch). If you move your mouse like a robot, you'll get caught like a robot.
  - **IP reputation** — network-wide and completely outside the browser. A bad IP fails regardless of how clean the fingerprint is. Real-world pass rate drops without residential/mobile IPs. Garbage in, garbage out.
  - **Session consistency** — tokens invalidate if behavior shifts mid-session. Don't start acting like a bot halfway through.

- **This is a moving target.** Detection systems rotate. A result that holds today can break next week. There's no permanent "bypassed" in this field — only "passed, this build, this week." If you're reading this six months from now, things may have changed. We're not fortune tellers, just compilers.

---

## Getting started

```bash
pip install stealthy-browser
```

Linux packaging is a work in progress. We'll get there. Eventually. Maybe.

### Check what the browser actually looks like to a detector

Start here — it's the cleanest thing to run first, and it's the research use case:

```bash
stealthy-browser start
stealthy-browser fingerprint     # dump the fingerprint this build presents
stealthy-browser anti-bot        # run the detection-test suite
```

### Python

```python
from stealthy_browser import StealthyBrowser

browser = StealthyBrowser()

# warmup=True runs the human-interaction/session priming that the
# server-side systems actually check for — this is the key, not just the patch
browser.goto("https://bot.sannysoft.com", warmup=True)

# Extract data from a public listing page
browser.goto("https://www.example-shop.com/search?q=item", warmup=True)
items = browser.execute_js('''
    JSON.stringify(Array.from(document.querySelectorAll('[data-result]'))
        .map(el => ({
            name: el.querySelector('h2')?.innerText,
            price: el.querySelector('.price')?.innerText
        })))
''')
print(items)
```

### REST API

```bash
# navigate (warmup optional but recommended against real systems)
curl -X POST http://localhost:6666/goto \
  -H "Content-Type: application/json" \
  -d '{"url": "https://bot.sannysoft.com", "warmup": true}'

# run arbitrary JS in-page
curl -X POST http://localhost:6666/js/execute \
  -H "Content-Type: application/json" \
  -d '{"js": "document.title"}'

# screenshot (useful for capturing evidence of a pass)
curl -X POST http://localhost:6666/screenshot \
  -H "Content-Type: application/json" \
  -d '{"path": "result.png"}'
```

---

## Configuration

Edit `config.json`:

```json
{
  "server": { "port": 6666, "host": "127.0.0.1" },
  "browser": {
    "chrome_path": "path/to/custom/chrome.exe",
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

Use a residential or mobile proxy for anything real — see Limitations. If you're still using a datacenter IP, you're basically wearing a "please block me" sign.

---

## Building from source

You're recompiling Chromium, so this is a commitment. Like, "I'm going to stare at a terminal for 6 hours" commitment.

**Prerequisites:** Visual Studio Build Tools 2022 (C++ workload), Python 3.8+, Go 1.21+, ~100GB free disk, and several hours of your life you'll never get back.

```bash
# Chromium (4-6 hours — go touch grass)
cd path\to\chromium\src
set DEPOT_TOOLS_WIN_TOOLCHAIN=0
autoninja -C out\Default chrome.exe

# API server (fast — Go is generous like that)
cd ..\stealth-api
go build -o stealth-api.exe .

# Python package
cd ..\stealth-browser-pkg
python -m build
```

---

## Project structure

```
stealthy-browser/
├── api/                     # Go REST API server
│   ├── main.go              # Where the magic starts (after 3 AM)
│   ├── browser.go           # Browser management
│   ├── handlers.go          # REST endpoints (69 of them, because why not)
│   ├── routes.go            # Route definitions
│   └── go.mod               # Dependencies
├── patches/                 # Runtime JS fingerprint patches
│   ├── stealth-patches.js
│   ├── stealth-hardware-patches.js
│   ├── stealth-webrtc-patches.js
│   ├── stealth-fingerprint-patches.js
│   └── stealth-ultimate-patches.js
├── stealthy_browser/        # Python package
│   ├── client.py
│   ├── server.py
│   ├── cli.py
│   ├── bin/
│   └── config.json
├── setup.py
├── pyproject.toml
├── README.md                # You're reading it
└── LICENSE                  # MIT (do what you want)
```

The C++ source patches live against the Chromium tree and are applied at build time — see `patches/` and the build steps above. We'd love to show you the exact diff, but it's 27GB of Chromium source and we're not about to paste that into a README.

---

## Intended use

This exists to study how modern bot detection works and to show where source-level fingerprinting beats runtime approaches. Use it for detection research, testing your own systems, privacy work, and understanding fingerprinting — the things published anti-detect projects exist for.

Don't point it at account access, credential flows, purchases, or anything that turns "does my fingerprint hold" into causing someone a problem. Keeping it in capability-testing territory is what makes it research instead of a liability — for the project and for you.

---

## License

MIT — see [LICENSE](LICENSE). Do whatever you want with it. Just keep it interesting.

---

Built with ❤️ and questionable life choices by a 17-year-old and an AI.
