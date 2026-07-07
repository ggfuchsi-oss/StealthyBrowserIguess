"""Server management for Stealth Browser."""

import os
import subprocess
import time
import signal


class StealthServer:
    """Manages the Stealth Browser server process."""
    
    def __init__(self, host: str = "127.0.0.1", port: int = 6666):
        self.host = host
        self.port = port
        self._process = None
        self._bin_path = os.path.join(os.path.dirname(__file__), "bin", "stealth-api.exe")
    
    def start(self) -> bool:
        """Start the server."""
        if not os.path.exists(self._bin_path):
            print(f"Binary not found: {self._bin_path}")
            return False
        
        self._process = subprocess.Popen(
            [self._bin_path],
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
        )
        
        # Wait for server
        for _ in range(10):
            time.sleep(1)
            try:
                import requests
                resp = requests.get(f"http://{self.host}:{self.port}/health", timeout=5)
                if resp.status_code == 200:
                    print(f"Server started on {self.host}:{self.port}")
                    return True
            except Exception:
                continue
        
        print("Failed to start server")
        return False
    
    def stop(self):
        """Stop the server."""
        if self._process:
            self._process.terminate()
            self._process.wait()
            self._process = None
            print("Server stopped")
    
    def is_running(self) -> bool:
        """Check if server is running."""
        try:
            import requests
            resp = requests.get(f"http://{self.host}:{self.port}/health", timeout=5)
            return resp.status_code == 200
        except Exception:
            return False
