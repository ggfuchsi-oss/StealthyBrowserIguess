"""CLI for Stealth Browser."""

import argparse
import sys
import json

from .client import StealthBrowser
from .server import StealthServer


def main():
    parser = argparse.ArgumentParser(description="Stealth Browser CLI")
    subparsers = parser.add_subparsers(dest="command", help="Commands")
    
    # Start server
    start_parser = subparsers.add_parser("start", help="Start the server")
    start_parser.add_argument("--host", default="127.0.0.1", help="Host")
    start_parser.add_argument("--port", type=int, default=6666, help="Port")
    
    # Stop server
    subparsers.add_parser("stop", help="Stop the server")
    
    # Status
    subparsers.add_parser("status", help="Check server status")
    
    # Scrape
    scrape_parser = subparsers.add_parser("scrape", help="Scrape a URL")
    scrape_parser.add_argument("url", help="URL to scrape")
    scrape_parser.add_argument("--warmup", action="store_true", help="Enable warmup")
    scrape_parser.add_argument("--text", action="store_true", help="Extract text only")
    
    # Screenshot
    screenshot_parser = subparsers.add_parser("screenshot", help="Take screenshot")
    screenshot_parser.add_argument("url", help="URL to screenshot")
    screenshot_parser.add_argument("--output", default="screenshot.png", help="Output file")
    
    # Fingerprint
    subparsers.add_parser("fingerprint", help="Show browser fingerprint")
    
    # Anti-bot
    subparsers.add_parser("anti-bot", help="Show anti-bot status")
    
    args = parser.parse_args()
    
    if args.command == "start":
        server = StealthServer(args.host, args.port)
        server.start()
    elif args.command == "stop":
        server = StealthServer()
        server.stop()
    elif args.command == "status":
        server = StealthServer()
        if server.is_running():
            print("Server is running")
        else:
            print("Server is not running")
    elif args.command == "scrape":
        browser = StealthBrowser(auto_start=False)
        browser.goto(args.url, warmup=args.warmup)
        if args.text:
            print(browser.get_text())
        else:
            print(json.dumps({
                "url": browser.get_url(),
                "title": browser.get_title(),
                "text": browser.get_text()[:1000],
            }, indent=2))
    elif args.command == "screenshot":
        browser = StealthBrowser(auto_start=False)
        browser.goto(args.url)
        browser.screenshot(args.output)
        print(f"Screenshot saved to {args.output}")
    elif args.command == "fingerprint":
        browser = StealthBrowser(auto_start=False)
        print(json.dumps(browser.get_fingerprint(), indent=2))
    elif args.command == "anti-bot":
        browser = StealthBrowser(auto_start=False)
        print(json.dumps(browser.get_anti_bot_status(), indent=2))
    else:
        parser.print_help()


if __name__ == "__main__":
    main()
