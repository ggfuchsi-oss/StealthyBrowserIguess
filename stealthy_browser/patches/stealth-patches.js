// stealth-patches.js — Runtime stealth patches injected via CDP
// Applied before any page JavaScript runs

(function() {
  'use strict';

  // ═══════════════════════════════════════════════════════════
  // 1. NAVIGATOR.WEBDRIVER — Remove the automation flag
  // ═══════════════════════════════════════════════════════════
  // Delete webdriver ENTIRELY — must not exist at all
  try { delete Object.getPrototypeOf(navigator).webdriver; } catch(e) {}
  try { delete navigator.__proto__.webdriver; } catch(e) {}
  // Redefine as non-existent on the prototype
  Object.defineProperty(Navigator.prototype, 'webdriver', {
    get: function() { return undefined; },
    configurable: true,
  });
  // Also try to delete the getter itself
  try {
    const desc = Object.getOwnPropertyDescriptor(Navigator.prototype, 'webdriver');
    if (desc && desc.get) {
      delete Navigator.prototype.webdriver;
    }
  } catch(e) {}

  // ═══════════════════════════════════════════════════════════
  // 2. CHROME OBJECT — Make it look like real Chrome
  // ═══════════════════════════════════════════════════════════
  if (!window.chrome) {
    window.chrome = {};
  }
  if (!window.chrome.runtime) {
    window.chrome.runtime = {
      connect: function() {},
      sendMessage: function() {},
    };
  }

  // ═══════════════════════════════════════════════════════════
  // 3. PLUGINS — Create proper PluginArray object
  // ═══════════════════════════════════════════════════════════
  // Create proper Plugin objects that pass instanceof checks
  function makePlugin(name, filename, desc) {
    const plugin = Object.create(Plugin.prototype);
    Object.defineProperties(plugin, {
      name: { value: name, writable: false },
      filename: { value: filename, writable: false },
      description: { value: desc, writable: false },
      length: { value: 1, writable: false },
    });
    plugin[0] = { type: 'application/x-google-chrome-pdf', suffixes: 'pdf', description: desc };
    return plugin;
  }

  const pluginData = [
    ['Chrome PDF Plugin', 'internal-pdf-viewer', 'Portable Document Format'],
    ['Chrome PDF Viewer', 'mhjfbmdgcfjbbpaeojofohoefgiehjai', ''],
    ['Native Client', 'internal-nacl-plugin', ''],
  ];

  const fakePlugins = pluginData.map(([n, f, d]) => makePlugin(n, f, d));
  fakePlugins.length = 3;
  fakePlugins.item = function(i) { return this[i] || null; };
  fakePlugins.namedItem = function(name) { return this.find(p => p.name === name) || null; };
  fakePlugins.refresh = function() {};
  Object.setPrototypeOf(fakePlugins, PluginArray.prototype);

  Object.defineProperty(navigator, 'plugins', {
    get: () => fakePlugins,
    configurable: true,
  });

  // ═══════════════════════════════════════════════════════════
  // 4. LANGUAGES — Realistic language list
  // ═══════════════════════════════════════════════════════════
  Object.defineProperty(navigator, 'languages', {
    get: () => ['en-US', 'en'],
    configurable: true,
  });

  // ═══════════════════════════════════════════════════════════
  // 5. PERMISSIONS API — Fake notifications permission
  // ═══════════════════════════════════════════════════════════
  const originalQuery = window.navigator.permissions.query;
  window.navigator.permissions.query = (parameters) => (
    parameters.name === 'notifications' ?
      Promise.resolve({ state: Notification.permission }) :
      originalQuery(parameters)
  );

  // ═══════════════════════════════════════════════════════════
  // 6. WEBGL VENDOR/RENDERER — Spoof GPU info
  // ═══════════════════════════════════════════════════════════
  const getParameter = WebGLRenderingContext.prototype.getParameter;
  WebGLRenderingContext.prototype.getParameter = function(parameter) {
    // UNMASKED_VENDOR_WEBGL
    if (parameter === 37445) return 'Google Inc. (NVIDIA)';
    // UNMASKED_RENDERER_WEBGL
    if (parameter === 37446) return 'ANGLE (NVIDIA, NVIDIA GeForce GTX 1660 SUPER Direct3D11 vs_5_0 ps_5_0)';
    return getParameter.call(this, parameter);
  };

  const getParameter2 = WebGL2RenderingContext.prototype.getParameter;
  WebGL2RenderingContext.prototype.getParameter = function(parameter) {
    if (parameter === 37445) return 'Google Inc. (NVIDIA)';
    if (parameter === 37446) return 'ANGLE (NVIDIA, NVIDIA GeForce GTX 1660 SUPER Direct3D11 vs_5_0 ps_5_0)';
    return getParameter2.call(this, parameter);
  };

  // ═══════════════════════════════════════════════════════════
  // 7. CANVAS FINGERPRINTING — Add subtle noise
  // ═══════════════════════════════════════════════════════════
  const originalToDataURL = HTMLCanvasElement.prototype.toDataURL;
  HTMLCanvasElement.prototype.toDataURL = function(type) {
    if (type === 'image/png' || type === undefined) {
      // Add 1px noise to make fingerprint unique but consistent
      const context = this.getContext('2d');
      if (context) {
        const imageData = context.getImageData(0, 0, 1, 1);
        // Tiny modification that's invisible but changes hash
        imageData.data[0] = imageData.data[0] ^ 1;
        context.putImageData(imageData, 0, 0);
      }
    }
    return originalToDataURL.apply(this, arguments);
  };

  // ═══════════════════════════════════════════════════════════
  // 8. TIMEZONE CONSISTENCY — Match system timezone
  // ═══════════════════════════════════════════════════════════
  const OriginalDate = Date;
  const timezoneOffset = new OriginalDate().getTimezoneOffset();

  // ═══════════════════════════════════════════════════════════
  // 9. CDP DETECTION — Hide DevTools protocol signals
  // ═══════════════════════════════════════════════════════════
  // Remove CDP-injected properties
  const cdcProps = Object.getOwnPropertyNames(window).filter(prop =>
    prop.match(/^cdc_|^__cdc_/)
  );
  cdcProps.forEach(prop => {
    try {
      delete window[prop];
    } catch(e) {}
  });

  // ═══════════════════════════════════════════════════════════
  // 10. AUTOMATION FLAGS — Remove all automation indicators
  // ═══════════════════════════════════════════════════════════
  // Remove __webdriver_evaluate, __selenium_evaluate, etc.
  const automationProps = [
    '__webdriver_evaluate',
    '__selenium_evaluate',
    '__webdriver_script_function',
    '__webdriver_script_func',
    '__webdriver_script_fn',
    '__fxdriver_evaluate',
    '__driver_evaluate',
    '__webdriver_unwrapped',
    '__selenium_unwrapped',
    '__fxdriver_unwrapped',
    '_phantom',
    '__nightmare',
    '_selenium',
    'callPhantom',
    '_phantomomas',
    'callSelenium',
    '_Selenium_IDE_Recorder',
  ];

  automationProps.forEach(prop => {
    if (window[prop]) {
      delete window[prop];
    }
  });

  // Remove from Document prototype too
  const docProps = Object.getOwnPropertyNames(Document.prototype);
  docProps.forEach(prop => {
    if (prop.match(/webdriver|selenium|driver|phantom/i)) {
      try {
        delete Document.prototype[prop];
      } catch(e) {}
    }
  });

  console.log('[Stealth] Patches applied successfully');
})();
