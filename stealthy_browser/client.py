"""Python client for Stealth Browser API."""

import json
import os
import time
import subprocess
import threading
from typing import Optional, Dict, Any

import requests


class StealthBrowser:
    """Client for the Stealth Browser API."""
    
    def __init__(self, host: str = "127.0.0.1", port: int = 6666, auto_start: bool = True):
        self.base_url = f"http://{host}:{port}"
        self.host = host
        self.port = port
        self._server_process = None
        
        if auto_start:
            self.start()
    
    def start(self) -> bool:
        """Start the stealth browser server."""
        try:
            # Check if already running
            self._request("GET", "/health")
            print("Server already running")
            return True
        except Exception:
            pass
        
        # Find the binary
        bin_path = os.path.join(os.path.dirname(__file__), "bin", "stealth-api.exe")
        if not os.path.exists(bin_path):
            # Try relative to package
            bin_path = os.path.join(os.path.dirname(__file__), "..", "bin", "stealth-api.exe")
        
        if not os.path.exists(bin_path):
            print(f"Binary not found at {bin_path}")
            return False
        
        # Start server
        self._server_process = subprocess.Popen(
            [bin_path],
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
        )
        
        # Wait for server to start
        for _ in range(10):
            time.sleep(1)
            try:
                self._request("GET", "/health")
                print("Server started")
                return True
            except Exception:
                continue
        
        print("Failed to start server")
        return False
    
    def stop(self):
        """Stop the stealth browser server."""
        if self._server_process:
            self._server_process.terminate()
            self._server_process = None
    
    def _request(self, method: str, path: str, data: Any = None) -> Any:
        """Make an API request."""
        url = f"{self.base_url}{path}"
        if method == "GET":
            resp = requests.get(url, timeout=60)
        else:
            resp = requests.post(url, json=data, timeout=60)
        resp.raise_for_status()
        return resp.json()
    
    # Navigation
    def goto(self, url: str, warmup: bool = False) -> Dict:
        """Navigate to URL."""
        return self._request("POST", "/goto", {"url": url, "warmup": warmup})
    
    def reload(self) -> Dict:
        """Reload current page."""
        return self._request("POST", "/reload")
    
    def back(self) -> Dict:
        """Go back."""
        return self._request("POST", "/back")
    
    def forward(self) -> Dict:
        """Go forward."""
        return self._request("POST", "/forward")
    
    # Content extraction
    def get_text(self, selector: str = "body") -> str:
        """Get text content."""
        result = self._request("POST", "/dom/get-text", {"selector": selector})
        return result.get("text", "")
    
    def get_html(self, selector: str = "body") -> str:
        """Get HTML content."""
        result = self._request("POST", "/dom/get-html", {"selector": selector})
        return result.get("html", "")
    
    def get_title(self) -> str:
        """Get page title."""
        result = self._request("GET", "/info/title")
        return result.get("title", "")
    
    def get_url(self) -> str:
        """Get current URL."""
        result = self._request("GET", "/info/url")
        return result.get("url", "")
    
    def query_selector(self, selector: str) -> str:
        """Query a single element."""
        result = self._request("POST", "/dom/query", {"selector": selector})
        return result.get("html", "")
    
    def query_selector_all(self, selector: str) -> list:
        """Query all matching elements."""
        result = self._request("POST", "/dom/query-all", {"selector": selector})
        return json.loads(result.get("elements", "[]"))
    
    def get_attribute(self, selector: str, attribute: str) -> str:
        """Get element attribute."""
        result = self._request("POST", "/dom/get-attribute", {"selector": selector, "attribute": attribute})
        return result.get("value", "")
    
    def get_computed_style(self, selector: str, property: str) -> str:
        """Get computed CSS property."""
        result = self._request("POST", "/dom/get-styles", {"selector": selector, "property": property})
        return result.get("value", "")
    
    def count_elements(self, selector: str) -> int:
        """Count matching elements."""
        result = self._request("POST", "/dom/count", {"selector": selector})
        return result.get("count", 0)
    
    def is_visible(self, selector: str) -> bool:
        """Check if element is visible."""
        result = self._request("POST", "/dom/visible", {"selector": selector})
        return result.get("visible", False)
    
    # Interaction
    def click(self, selector: str) -> Dict:
        """Click element."""
        return self._request("POST", "/click", {"selector": selector})
    
    def double_click(self, selector: str) -> Dict:
        """Double click element."""
        return self._request("POST", "/double-click", {"selector": selector})
    
    def type(self, selector: str, text: str) -> Dict:
        """Type text into element."""
        return self._request("POST", "/type", {"selector": selector, "text": text})
    
    def clear(self, selector: str) -> Dict:
        """Clear element."""
        return self._request("POST", "/clear", {"selector": selector})
    
    def hover(self, selector: str) -> Dict:
        """Hover over element."""
        return self._request("POST", "/hover", {"selector": selector})
    
    def scroll(self, x: int, y: int) -> Dict:
        """Scroll page."""
        return self._request("POST", "/scroll", {"x": x, "y": y})
    
    def press_key(self, key: str) -> Dict:
        """Press keyboard key."""
        return self._request("POST", "/key", {"key": key})
    
    def select(self, selector: str, values: list) -> Dict:
        """Select option."""
        return self._request("POST", "/select", {"selector": selector, "values": values})
    
    # JavaScript
    def execute_js(self, js: str) -> Any:
        """Execute JavaScript."""
        result = self._request("POST", "/js/execute", {"js": js})
        return result.get("result")
    
    # Screenshot
    def screenshot(self, path: str = "screenshot.png") -> str:
        """Take screenshot."""
        resp = requests.post(f"{self.base_url}/screenshot", json={"path": path}, timeout=30)
        return path
    
    # Session
    def get_cookies(self) -> str:
        """Get cookies."""
        result = self._request("GET", "/cookies")
        return result.get("cookies", "")
    
    def get_local_storage(self) -> Dict:
        """Get localStorage."""
        result = self._request("GET", "/storage/local")
        return json.loads(result.get("data", "{}"))
    
    # Info
    def get_fingerprint(self) -> Dict:
        """Get browser fingerprint."""
        return self._request("GET", "/info/fingerprint")
    
    def get_anti_bot_status(self) -> Dict:
        """Get anti-bot detection status."""
        return self._request("GET", "/info/anti-bot")
    
    def get_config(self) -> Dict:
        """Get configuration."""
        return self._request("GET", "/config")
    
    def health(self) -> Dict:
        """Health check."""
        return self._request("GET", "/health")
    
    # Warmup
    def warmup(self) -> Dict:
        """Run warmup sequence."""
        return self._request("POST", "/warmup")
