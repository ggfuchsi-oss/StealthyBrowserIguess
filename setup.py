from setuptools import setup, find_packages
import os

# Read README
with open("README.md", "r", encoding="utf-8") as f:
    long_description = f.read()

setup(
    name="stealthy-browser",
    version="1.0.0",
    author="Stealth Browser Team",
    description="A stealth Chromium browser with 75+ fingerprint patches and REST API. Bypasses Akamai, PerimeterX, Kasada, Cloudflare, reCAPTCHA.",
    long_description=long_description,
    long_description_content_type="text/markdown",
    url="https://github.com/ggfuchsi-oss/StealthyBrowserIguess",
    packages=find_packages(),
    package_data={
        "stealthy_browser": [
            "bin/*.exe",
            "patches/*.js",
            "config.json",
        ],
    },
    python_requires=">=3.8",
    install_requires=[
        "requests>=2.28.0",
        "websocket-client>=1.5.0",
    ],
    classifiers=[
        "Development Status :: 4 - Beta",
        "Intended Audience :: Developers",
        "License :: OSI Approved :: MIT License",
        "Operating System :: Microsoft :: Windows",
        "Programming Language :: Python :: 3",
        "Topic :: Internet :: WWW/HTTP :: Browsers",
    ],
    entry_points={
        "console_scripts": [
            "stealthy-browser=stealthy_browser.cli:main",
        ],
    },
)
