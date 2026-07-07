// stealth-ultimate-patches.js — EVERY remaining fingerprint vector
// This covers everything not already patched in C++ or other JS files

(function() {
  'use strict';

  // ═══════════════════════════════════════════════════════════
  // 1. PERFORMANCE.TIMING — Consistent values
  // ═══════════════════════════════════════════════════════════
  if (window.performance && performance.timing) {
    const base = Date.now() - 1000000; // Simulate page loaded 1000s ago
    Object.defineProperty(performance.timing, 'navigationStart', { get: () => base, configurable: true });
    Object.defineProperty(performance.timing, 'unloadEventStart', { get: () => base + 10, configurable: true });
    Object.defineProperty(performance.timing, 'unloadEventEnd', { get: () => base + 12, configurable: true });
    Object.defineProperty(performance.timing, 'redirectStart', { get: () => 0, configurable: true });
    Object.defineProperty(performance.timing, 'redirectEnd', { get: () => 0, configurable: true });
    Object.defineProperty(performance.timing, 'fetchStart', { get: () => base + 50, configurable: true });
    Object.defineProperty(performance.timing, 'domainLookupStart', { get: () => base + 55, configurable: true });
    Object.defineProperty(performance.timing, 'domainLookupEnd', { get: () => base + 60, configurable: true });
    Object.defineProperty(performance.timing, 'connectStart', { get: () => base + 65, configurable: true });
    Object.defineProperty(performance.timing, 'connectEnd', { get: () => base + 120, configurable: true });
    Object.defineProperty(performance.timing, 'secureConnectionStart', { get: () => base + 80, configurable: true });
    Object.defineProperty(performance.timing, 'requestStart', { get: () => base + 125, configurable: true });
    Object.defineProperty(performance.timing, 'responseStart', { get: () => base + 200, configurable: true });
    Object.defineProperty(performance.timing, 'responseEnd', { get: () => base + 250, configurable: true });
    Object.defineProperty(performance.timing, 'domLoading', { get: () => base + 260, configurable: true });
    Object.defineProperty(performance.timing, 'domInteractive', { get: () => base + 400, configurable: true });
    Object.defineProperty(performance.timing, 'domContentLoadedEventStart', { get: () => base + 420, configurable: true });
    Object.defineProperty(performance.timing, 'domContentLoadedEventEnd', { get: () => base + 430, configurable: true });
    Object.defineProperty(performance.timing, 'domComplete', { get: () => base + 500, configurable: true });
    Object.defineProperty(performance.timing, 'loadEventStart', { get: () => base + 510, configurable: true });
    Object.defineProperty(performance.timing, 'loadEventEnd', { get: () => base + 520, configurable: true });
  }

  // ═══════════════════════════════════════════════════════════
  // 2. PERFORMANCE.MEMORY — Consistent values
  // ═══════════════════════════════════════════════════════════
  if (window.performance && performance.memory) {
    Object.defineProperty(performance.memory, 'jsHeapSizeLimit', { get: () => 4294967296, configurable: true }); // 4GB
    Object.defineProperty(performance.memory, 'totalJSHeapSize', { get: () => 50000000, configurable: true }); // 50MB
    Object.defineProperty(performance.memory, 'usedJSHeapSize', { get: () => 30000000, configurable: true }); // 30MB
  }

  // ═══════════════════════════════════════════════════════════
  // 3. WINDOW DIMENSIONS — Consistent with screen
  // ═══════════════════════════════════════════════════════════
  Object.defineProperty(window, 'innerWidth', { get: () => 1920, configurable: true });
  Object.defineProperty(window, 'innerHeight', { get: () => 937, configurable: true }); // 1080 - 43px taskbar
  Object.defineProperty(window, 'outerWidth', { get: () => 1920, configurable: true });
  Object.defineProperty(window, 'outerHeight', { get: () => 1040, configurable: true });
  Object.defineProperty(window, 'screenX', { get: () => 0, configurable: true });
  Object.defineProperty(window, 'screenY', { get: () => 0, configurable: true });
  Object.defineProperty(window, 'pageXOffset', { get: () => window.scrollX || 0, configurable: true });
  Object.defineProperty(window, 'pageYOffset', { get: () => window.scrollY || 0, configurable: true });

  // ═══════════════════════════════════════════════════════════
  // 4. CSS MEDIA QUERIES — Consistent preferences
  // ═══════════════════════════════════════════════════════════
  if (window.matchMedia) {
    const originalMatchMedia = window.matchMedia;
    window.matchMedia = function(query) {
      const result = originalMatchMedia.call(this, query);
      if (query.includes('prefers-color-scheme')) {
        return Object.create(result, { matches: { value: query.includes('light'), configurable: true } });
      }
      if (query.includes('prefers-reduced-motion')) {
        return Object.create(result, { matches: { value: false, configurable: true } });
      }
      if (query.includes('prefers-contrast')) {
        return Object.create(result, { matches: { value: false, configurable: true } });
      }
      if (query.includes('prefers-reduced-data')) {
        return Object.create(result, { matches: { value: false, configurable: true } });
      }
      if (query.includes('color-gamut')) {
        return Object.create(result, { matches: { value: true, configurable: true } });
      }
      return result;
    };
  }

  // ═══════════════════════════════════════════════════════════
  // 5. SPEECH SYNTHESIS — Consistent voice list
  // ═══════════════════════════════════════════════════════════
  if (window.speechSynthesis) {
    const chromeVoices = [
      { name: 'Microsoft David - English (United States)', lang: 'en-US', localService: true, default: true, voiceURI: 'Microsoft David - English (United States)' },
      { name: 'Microsoft Zira - English (United States)', lang: 'en-US', localService: true, default: false, voiceURI: 'Microsoft Zira - English (United States)' },
      { name: 'Microsoft Mark - English (United States)', lang: 'en-US', localService: true, default: false, voiceURI: 'Microsoft Mark - English (United States)' },
    ];
    speechSynthesis.getVoices = function() { return chromeVoices; };
  }

  // ═══════════════════════════════════════════════════════════
  // 6. NOTIFICATION PERMISSION — Default state
  // ═══════════════════════════════════════════════════════════
  if (window.Notification) {
    Object.defineProperty(Notification, 'permission', { get: () => 'default', configurable: true });
  }

  // ═══════════════════════════════════════════════════════════
  // 7. POINTER EVENTS — Consistent touch support
  // ═══════════════════════════════════════════════════════════
  Object.defineProperty(navigator, 'maxTouchPoints', { get: () => 0, configurable: true });

  // ═══════════════════════════════════════════════════════════
  // 8. WEBGL2 EXTENSIONS — Consistent list
  // ═══════════════════════════════════════════════════════════
  const WEBGL2_EXTENSIONS = [
    'EXT_color_buffer_float',
    'EXT_color_buffer_half_float',
    'EXT_float_blend',
    'EXT_texture_compression_bptc',
    'EXT_texture_compression_s3tc',
    'EXT_texture_filter_anisotropic',
    'OES_fbo_render_mipmap',
    'OES_texture_float',
    'OES_texture_float_linear',
    'OES_texture_half_float',
    'OES_texture_half_float_linear',
    'WEBGL_color_buffer_float',
    'WEBGL_compressed_texture_s3tc',
    'WEBGL_compressed_texture_s3tc_srgb',
    'WEBGL_debug_renderer_info',
    'WEBGL_debug_shaders',
    'WEBGL_lose_context',
    'WEBGL_multi_draw',
    'EXT_norm16',
    'EXT_render_snorm',
  ];

  if (window.WebGL2RenderingContext) {
    WebGL2RenderingContext.prototype.getSupportedExtensions = function() { return WEBGL2_EXTENSIONS; };
  }

  // ═══════════════════════════════════════════════════════════
  // 9. WEBGL MAX VALUES — Consistent limits
  // ═══════════════════════════════════════════════════════════
  if (window.WebGLRenderingContext) {
    const origGetParam = WebGLRenderingContext.prototype.getParameter;
    WebGLRenderingContext.prototype.getParameter = function(param) {
      if (param === 0x0D33) return 16384; // MAX_TEXTURE_SIZE
      if (param === 0x0D3A) return new Int32Array([16384, 16384]); // MAX_VIEWPORT_DIMS
      if (param === 0x84E8) return 16384; // MAX_RENDERBUFFER_SIZE
      if (param === 0x8B4D) return 48; // MAX_COMBINED_TEXTURE_IMAGE_UNITS
      if (param === 0x8B4C) return 16; // MAX_VERTEX_TEXTURE_IMAGE_UNITS
      if (param === 0x8872) return 16; // MAX_TEXTURE_IMAGE_UNITS
      if (param === 0x8869) return 16; // MAX_VERTEX_ATTRIBS
      if (param === 0x8870) return 4096; // MAX_VERTEX_UNIFORM_VECTORS
      if (param === 0x8DFE) return 30; // MAX_VARYING_VECTORS
      return origGetParam.call(this, param);
    };
  }

  // ═══════════════════════════════════════════════════════════
  // 10. CANVAS FINGERPRINT — Add consistent noise
  // ═══════════════════════════════════════════════════════════
  const origToDataURL = HTMLCanvasElement.prototype.toDataURL;
  HTMLCanvasElement.prototype.toDataURL = function(type) {
    if ((type === 'image/png' || type === undefined) && this.width > 0 && this.height > 0) {
      try {
        const ctx = this.getContext('2d');
        if (ctx) {
          const imageData = ctx.getImageData(0, 0, 1, 1);
          imageData.data[0] = imageData.data[0] ^ 1;
          ctx.putImageData(imageData, 0, 0);
        }
      } catch(e) {}
    }
    return origToDataURL.apply(this, arguments);
  };

  // ═══════════════════════════════════════════════════════════
  // 11. WEBRTC — Block IP leak
  // ═══════════════════════════════════════════════════════════
  if (window.RTCPeerConnection) {
    const origCreate = window.RTCPeerConnection;
    window.RTCPeerConnection = function(config, constraints) {
      const patchedConfig = config || {};
      patchedConfig.iceTransportPolicy = 'relay';
      return new origCreate(patchedConfig, constraints);
    };
    window.RTCPeerConnection.prototype = origCreate.prototype;
  }

  // ═══════════════════════════════════════════════════════════
  // 12. FULLSCREEN API — Consistent behavior
  // ═══════════════════════════════════════════════════════════
  if (document.fullscreenEnabled) {
    document.fullscreenEnabled = false;
  }

  // ═══════════════════════════════════════════════════════════
  // 13. WEB SHARE API — Remove
  // ═══════════════════════════════════════════════════════════
  if (navigator.share) {
    delete navigator.share;
  }

  // ═══════════════════════════════════════════════════════════
  // 14. BADGE API — Remove
  // ═══════════════════════════════════════════════════════════
  if (navigator.setAppBadge) delete navigator.setAppBadge;
  if (navigator.clearAppBadge) delete navigator.clearAppBadge;

  // ═══════════════════════════════════════════════════════════
  // 15. DEVICE MOTION — Remove or spoof
  // ═══════════════════════════════════════════════════════════
  if (window.DeviceMotionEvent) {
    window.DeviceMotionEvent = function() {};
    window.DeviceMotionEvent.prototype = {};
  }
  if (window.DeviceOrientationEvent) {
    window.DeviceOrientationEvent = function() {};
    window.DeviceOrientationEvent.prototype = {};
  }

  // ═══════════════════════════════════════════════════════════
  // 16. POINTER LOCK — Consistent
  // ═══════════════════════════════════════════════════════════
  if (document.pointerLockElement) {
    Object.defineProperty(document, 'pointerLockElement', { get: () => null, configurable: true });
  }

  // ═══════════════════════════════════════════════════════════
  // 17. GAMEPAD — Empty list
  // ═══════════════════════════════════════════════════════════
  if (navigator.getGamepads) {
    navigator.getGamepads = function() { return []; };
  }

  // ═══════════════════════════════════════════════════════════
  // 18. CLIPBOARD — Consistent behavior
  // ═══════════════════════════════════════════════════════════
  if (navigator.clipboard && navigator.clipboard.readText) {
    navigator.clipboard.readText = () => Promise.resolve('');
  }

  // ═══════════════════════════════════════════════════════════
  // 19. VIBRATION API — Remove
  // ═══════════════════════════════════════════════════════════
  if (navigator.vibrate) {
    navigator.vibrate = function() { return false; };
  }

  // ═══════════════════════════════════════════════════════════
  // 20. BLUETOOTH/USB/HID/SERIAL/NFC — Unavailable
  // ═══════════════════════════════════════════════════════════
  if (navigator.bluetooth) delete navigator.bluetooth;
  if (navigator.usb) delete navigator.usb;
  if (navigator.hid) delete navigator.hid;
  if (navigator.serial) delete navigator.serial;
  if (navigator.nfc) delete navigator.nfc;

  // ═══════════════════════════════════════════════════════════
  // 21. MEDIA DEVICES — Fake list
  // ═══════════════════════════════════════════════════════════
  if (navigator.mediaDevices && navigator.mediaDevices.enumerateDevices) {
    navigator.mediaDevices.enumerateDevices = () => Promise.resolve([
      { deviceId: '', kind: 'audioinput', label: '', groupId: '' },
      { deviceId: '', kind: 'audiooutput', label: '', groupId: '' },
      { deviceId: '', kind: 'videoinput', label: '', groupId: '' },
    ]);
  }

  // ═══════════════════════════════════════════════════════════
  // 22. SERVICE WORKER — Consistent
  // ═══════════════════════════════════════════════════════════
  if (navigator.serviceWorker) {
    Object.defineProperty(navigator.serviceWorker, 'controller', { get: () => null, configurable: true });
  }

  // ═══════════════════════════════════════════════════════════
  // 23. CREDENTIALS — Consistent
  // ═══════════════════════════════════════════════════════════
  if (navigator.credentials) {
    navigator.credentials.get = () => Promise.resolve(null);
    navigator.credentials.store = () => Promise.resolve(undefined);
  }

  // ═══════════════════════════════════════════════════════════
  // 24. WAKE LOCK — Remove
  // ═══════════════════════════════════════════════════════════
  if (navigator.wakeLock) delete navigator.wakeLock;

  // ═══════════════════════════════════════════════════════════
  // 25. PAYMENT REQUEST — Remove
  // ═══════════════════════════════════════════════════════════
  if (window.PaymentRequest) {
    window.PaymentRequest = function() { throw new Error('PaymentRequest not available'); };
  }

  // ═══════════════════════════════════════════════════════════
  // 26. PRESENTATION — Remove
  // ═══════════════════════════════════════════════════════════
  if (navigator.presentation) delete navigator.presentation;

  // ═══════════════════════════════════════════════════════════
  // 27. CONTACTS — Remove
  // ═══════════════════════════════════════════════════════════
  if (navigator.contacts) delete navigator.contacts;

  // ═══════════════════════════════════════════════════════════
  // 28. STORAGE ESTIMATE — Consistent
  // ═══════════════════════════════════════════════════════════
  if (navigator.storage && navigator.storage.estimate) {
    navigator.storage.estimate = () => Promise.resolve({
      quota: 1073741824, // 1GB
      usage: 50000000,   // 50MB
    });
  }

  // ═══════════════════════════════════════════════════════════
  // 29. IndexedDB — Consistent
  // ═══════════════════════════════════════════════════════════
  // Don't override IndexedDB - too risky

  // ═══════════════════════════════════════════════════════════
  // 30. CACHE API — Consistent
  // ═══════════════════════════════════════════════════════════
  if (window.CacheStorage) {
    const origOpen = CacheStorage.prototype.open;
    CacheStorage.prototype.open = function(name) {
      return origOpen.call(this, name || 'default');
    };
  }

  // ═══════════════════════════════════════════════════════════
  // 31. GEOLOCATION — Deny by default
  // ═══════════════════════════════════════════════════════════
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition = (success, error) => {
      if (error) error({ code: 1, message: 'User denied Geolocation' });
    };
    navigator.geolocation.watchPosition = (success, error) => {
      if (error) error({ code: 1, message: 'User denied Geolocation' });
      return 0;
    };
  }

  // ═══════════════════════════════════════════════════════════
  // 32. MEDIA RECORDER — Consistent
  // ═══════════════════════════════════════════════════════════
  if (window.MediaRecorder) {
    const origIsTypeSupported = MediaRecorder.isTypeSupported;
    MediaRecorder.isTypeSupported = function(type) {
      // Return consistent support list
      const supported = ['video/webm;codecs=vp8', 'video/webm;codecs=vp9', 'audio/webm;codecs=opus'];
      return supported.some(s => type.includes(s.split(';')[0]));
    };
  }

  // ═══════════════════════════════════════════════════════════
  // 33. WEB MIDI — Remove
  // ═══════════════════════════════════════════════════════════
  if (navigator.requestMIDIAccess) {
    navigator.requestMIDIAccess = () => Promise.reject(new Error('MIDI not available'));
  }

  // ═══════════════════════════════════════════════════════════
  // 34. WEB USB — Remove
  // ═══════════════════════════════════════════════════════════
  if (navigator.usb && navigator.usb.requestDevice) {
    navigator.usb.requestDevice = () => Promise.reject(new Error('USB not available'));
  }

  // ═══════════════════════════════════════════════════════════
  // 35. WEB HID — Remove
  // ═══════════════════════════════════════════════════════════
  if (navigator.hid && navigator.hid.requestDevice) {
    navigator.hid.requestDevice = () => Promise.reject(new Error('HID not available'));
  }

  // ═══════════════════════════════════════════════════════════
  // 36. WEB SERIAL — Remove
  // ═══════════════════════════════════════════════════════════
  if (navigator.serial && navigator.serial.requestPort) {
    navigator.serial.requestPort = () => Promise.reject(new Error('Serial not available'));
  }

  // ═══════════════════════════════════════════════════════════
  // 37. NFC — Remove
  // ═══════════════════════════════════════════════════════════
  if (window.NDEFReader) {
    window.NDEFReader = function() { throw new Error('NFC not available'); };
  }

  // ═══════════════════════════════════════════════════════════
  // 38. SENSORS — Remove
  // ═══════════════════════════════════════════════════════════
  if (window.Accelerometer) {
    window.Accelerometer = function() { throw new Error('Sensor not available'); };
  }
  if (window.Gyroscope) {
    window.Gyroscope = function() { throw new Error('Sensor not available'); };
  }
  if (window.Magnetometer) {
    window.Magnetometer = function() { throw new Error('Sensor not available'); };
  }
  if (window.AbsoluteOrientationSensor) {
    window.AbsoluteOrientationSensor = function() { throw new Error('Sensor not available'); };
  }
  if (window.RelativeOrientationSensor) {
    window.RelativeOrientationSensor = function() { throw new Error('Sensor not available'); };
  }
  if (window.AmbientLightSensor) {
    window.AmbientLightSensor = function() { throw new Error('Sensor not available'); };
  }
  if (window.Barometer) {
    window.Barometer = function() { throw new Error('Sensor not available'); };
  }
  if (window.GeolocationSensor) {
    window.GeolocationSensor = function() { throw new Error('Sensor not available'); };
  }
  if (window.ProximitySensor) {
    window.ProximitySensor = function() { throw new Error('Sensor not available'); };
  }

  // ═══════════════════════════════════════════════════════════
  // 39. WEBGL RENDERING CONTEXT — Additional spoofing
  // ═══════════════════════════════════════════════════════════
  if (window.WebGLRenderingContext) {
    const origGetParam = WebGLRenderingContext.prototype.getParameter;
    WebGLRenderingContext.prototype.getParameter = function(param) {
      // UNMASKED_VENDOR_WEBGL
      if (param === 0x9245) return 'Google Inc. (NVIDIA)';
      // UNMASKED_RENDERER_WEBGL
      if (param === 0x9246) return 'ANGLE (NVIDIA, NVIDIA GeForce GTX 1660 SUPER Direct3D11 vs_5_0 ps_5_0, D3D11)';
      return origGetParam.call(this, param);
    };
  }

  // ═══════════════════════════════════════════════════════════
  // 40. WEBGL2 RENDERING CONTEXT — Additional spoofing
  // ═══════════════════════════════════════════════════════════
  if (window.WebGL2RenderingContext) {
    const origGetParam2 = WebGL2RenderingContext.prototype.getParameter;
    WebGL2RenderingContext.prototype.getParameter = function(param) {
      if (param === 0x9245) return 'Google Inc. (NVIDIA)';
      if (param === 0x9246) return 'ANGLE (NVIDIA, NVIDIA GeForce GTX 1660 SUPER Direct3D11 vs_5_0 ps_5_0, D3D11)';
      return origGetParam2.call(this, param);
    };
  }

  // ═══════════════════════════════════════════════════════════
  // 41. FONT ENUMERATION — Consistent
  // ═══════════════════════════════════════════════════════════
  const COMMON_FONTS = [
    'Arial', 'Arial Black', 'Calibri', 'Cambria', 'Comic Sans MS',
    'Consolas', 'Courier New', 'Georgia', 'Helvetica', 'Impact',
    'Lucida Console', 'Microsoft Sans Serif', 'Palatino Linotype',
    'Segoe UI', 'Tahoma', 'Times New Roman', 'Trebuchet MS', 'Verdana',
  ];

  if (document.fonts && document.fonts.check) {
    const origCheck = document.fonts.check.bind(document.fonts);
    document.fonts.check = function(font) {
      const fontName = font.split(' ').pop().replace(/['"]/g, '');
      return COMMON_FONTS.includes(fontName) || origCheck(font);
    };
  }

  // ═══════════════════════════════════════════════════════════
  // 42. PERFORMANCE.NOW — Subtle jitter
  // ═══════════════════════════════════════════════════════════
  if (window.performance && performance.now) {
    const origNow = performance.now.bind(performance);
    performance.now = function() {
      return origNow() + (Math.random() * 0.4 + 0.1);
    };
  }

  // ═══════════════════════════════════════════════════════════
  // 43. CREDENTIALS API — Consistent
  // ═══════════════════════════════════════════════════════════
  if (navigator.credentials) {
    navigator.credentials.get = () => Promise.resolve(null);
    navigator.credentials.store = () => Promise.resolve(undefined);
    navigator.credentials.create = () => Promise.reject(new Error('Not available'));
  }

  // ═══════════════════════════════════════════════════════════
  // 44. STORAGE ESTIMATE — Consistent
  // ═══════════════════════════════════════════════════════════
  if (navigator.storage && navigator.storage.estimate) {
    navigator.storage.estimate = () => Promise.resolve({
      quota: 1073741824,
      usage: 50000000,
    });
  }

  // ═══════════════════════════════════════════════════════════
  // 45. WAKE LOCK — Remove
  // ═══════════════════════════════════════════════════════════
  if (navigator.wakeLock) {
    navigator.wakeLock.request = () => Promise.reject(new Error('Wake Lock not available'));
  }

  // ═══════════════════════════════════════════════════════════
  // 46. PAYMENT REQUEST — Remove
  // ═══════════════════════════════════════════════════════════
  if (window.PaymentRequest) {
    window.PaymentRequest = function() { throw new Error('PaymentRequest not available'); };
  }

  // ═══════════════════════════════════════════════════════════
  // 47. PRESENTATION — Remove
  // ═══════════════════════════════════════════════════════════
  if (navigator.presentation) {
    navigator.presentation.requestConnection = () => Promise.reject(new Error('Not available'));
  }

  // ═══════════════════════════════════════════════════════════
  // 48. CONTACTS — Remove
  // ═══════════════════════════════════════════════════════════
  if (navigator.contacts && navigator.contacts.select) {
    navigator.contacts.select = () => Promise.reject(new Error('Not available'));
  }

  // ═══════════════════════════════════════════════════════════
  // 49. MEDIA CAPABILITIES — Consistent
  // ═══════════════════════════════════════════════════════════
  if (navigator.mediaCapabilities) {
    navigator.mediaCapabilities.decodingInfo = (config) => Promise.resolve({
      supported: true,
      smooth: true,
      powerEfficient: true,
    });
  }

  // ═══════════════════════════════════════════════════════════
  // 50. SCREEN ORIENTATION — Consistent
  // ═══════════════════════════════════════════════════════════
  if (screen.orientation) {
    Object.defineProperty(screen.orientation, 'angle', { get: () => 0, configurable: true });
    Object.defineProperty(screen.orientation, 'type', { get: () => 'landscape-primary', configurable: true });
  }

  console.log('[Stealth Ultimate] 50 fingerprint patches applied');
})();
