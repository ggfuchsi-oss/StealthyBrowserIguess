"""Stealth Browser - A stealth Chromium browser with 75+ fingerprint patches."""

__version__ = "1.0.0"
__author__ = "Stealth Browser Team"

from .client import StealthBrowser
from .server import StealthServer

__all__ = ["StealthBrowser", "StealthServer"]
