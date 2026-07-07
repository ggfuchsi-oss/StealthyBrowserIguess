// stealth-fingerprint-patches.js — Comprehensive fingerprint spoofing
// Covers all major fingerprint vectors not already patched

(function() {
  'use strict';

  // ═══════════════════════════════════════════════════════════
  // 1. WEBGL EXTENSIONS — Return consistent list
  // ═══════════════════════════════════════════════════════════
  const WEBGL_EXTENSIONS = [
    'ANGLE_instanced_arrays',
    'EXT_blend_min_max',
    'EXT_color_buffer_half_float',
    'EXT_float_blend',
    'EXT_frag_depth',
    'EXT_shader_texture_lod',
    'EXT_texture_compression_bptc',
    'EXT_texture_compression_s3tc',
    'EXT_texture_filter_anisotropic',
    'EXT_texture_norm16',
    'OES_element_index_uint',
    'OES_fbo_render_mipmap',
    'OES_standard_derivatives',
    'OES_texture_float',
    'OES_texture_float_linear',
    'OES_texture_half_float',
    'OES_texture_half_float_linear',
    'OES_vertex_array_object',
    'WEBGL_color_buffer_float',
    'WEBGL_compressed_texture_s3tc',
    'WEBGL_compressed_texture_s3tc_srgb',
    'WEBGL_debug_renderer_info',
    'WEBGL_debug_shaders',
    'WEBGL_lose_context',
    'WEBGL_multi_draw',
  ];

  if (window.WebGLRenderingContext) {
    const origGetSupportedExtensions = WebGLRenderingContext.prototype.getSupportedExtensions;
    WebGLRenderingContext.prototype.getSupportedExtensions = function() {
      return WEBGL_EXTENSIONS;
    };
  }
  if (window.WebGL2RenderingContext) {
    const origGetSupportedExtensions2 = WebGL2RenderingContext.prototype.getSupportedExtensions;
    WebGL2RenderingContext.prototype.getSupportedExtensions = function() {
      return WEBGL_EXTENSIONS;
    };
  }

  // ═══════════════════════════════════════════════════════════
  // 2. CSS MEDIA QUERIES — Consistent preferences
  // ═══════════════════════════════════════════════════════════
  if (window.matchMedia) {
    const originalMatchMedia = window.matchMedia;
    window.matchMedia = function(query) {
      const result = originalMatchMedia.call(this, query);
      // Spoof common media queries
      if (query.includes('prefers-color-scheme')) {
        return Object.create(result, {
          matches: { value: query.includes('light'), configurable: true },
        });
      }
      if (query.includes('prefers-reduced-motion')) {
        return Object.create(result, {
          matches: { value: false, configurable: true },
        });
      }
      if (query.includes('prefers-contrast')) {
        return Object.create(result, {
          matches: { value: false, configurable: true },
        });
      }
      return result;
    };
  }

  // ═══════════════════════════════════════════════════════════
  // 3. PERFORMANCE.NOW — Add subtle jitter
  // ═══════════════════════════════════════════════════════════
  if (window.performance && window.performance.now) {
    const origNow = performance.now.bind(performance);
    performance.now = function() {
      // Add 0.1-0.5ms jitter (realistic for real hardware)
      return origNow() + (Math.random() * 0.4 + 0.1);
    };
  }

  // ═══════════════════════════════════════════════════════════
  // 4. SPEECH SYNTHESIS — Consistent voice list
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
  // 5. NOTIFICATION PERMISSION — Default state
  // ═══════════════════════════════════════════════════════════
  if (window.Notification) {
    Object.defineProperty(Notification, 'permission', {
      get: () => 'default',
      configurable: true,
    });
  }

  // ═══════════════════════════════════════════════════════════
  // 6. GAMEPAD API — Empty list
  // ═══════════════════════════════════════════════════════════
  if (navigator.getGamepads) {
    navigator.getGamepads = function() { return []; };
  }

  // ═══════════════════════════════════════════════════════════
  // 7. CLIPBOARD API — Consistent behavior
  // ═══════════════════════════════════════════════════════════
  if (navigator.clipboard) {
    // Keep clipboard API but don't expose readText in headless
    if (navigator.clipboard.readText) {
      navigator.clipboard.readText = () => Promise.resolve('');
    }
  }

  // ═══════════════════════════════════════════════════════════
  // 8. WEBGL MAX VALUES — Consistent limits
  // ═══════════════════════════════════════════════════════════
  if (window.WebGLRenderingContext) {
    const origGetParameter = WebGLRenderingContext.prototype.getParameter;
    WebGLRenderingContext.prototype.getParameter = function(param) {
      // Max texture size
      if (param === 0x0D33) return 16384;
      // Max viewport dims
      if (param === 0x0D3A) return new Int32Array([16384, 16384]);
      // Max renderbuffer size
      if (param === 0x84E8) return 16384;
      // Max combined texture image units
      if (param === 0x8B4D) return 48;
      // Max vertex texture image units
      if (param === 0x8B4C) return 16;
      // Max texture image units
      if (param === 0x8872) return 16;
      // Max vertex attribs
      if (param === 0x8869) return 16;
      return origGetParameter.call(this, param);
    };
  }

  // ═══════════════════════════════════════════════════════════
  // 9. FONT ENUMERATION — Return consistent list
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
      // Extract font name from font string
      const fontName = font.split(' ').pop().replace(/['"]/g, '');
      return COMMON_FONTS.includes(fontName) || origCheck(font);
    };
  }

  // ═══════════════════════════════════════════════════════════
  // 10. MATH.RANDOM — Consistent distribution
  // ═══════════════════════════════════════════════════════════
  // Don't override Math.random - it's too risky
  // Just ensure it's not seeded differently

  // ═══════════════════════════════════════════════════════════
  // 11. WEBGL UNMASKED_RENDERER_INFO — Extended spoofing
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
  // 12. CANVAS FINGERPRINT — Add consistent noise
  // ═══════════════════════════════════════════════════════════
  const origToDataURL = HTMLCanvasElement.prototype.toDataURL;
  HTMLCanvasElement.prototype.toDataURL = function(type) {
    if (type === 'image/png' || type === undefined) {
      const context = this.getContext('2d');
      if (context && this.width > 0 && this.height > 0) {
        try {
          const imageData = context.getImageData(0, 0, 1, 1);
          imageData.data[0] = imageData.data[0] ^ 1;
          context.putImageData(imageData, 0, 0);
        } catch(e) {}
      }
    }
    return origToDataURL.apply(this, arguments);
  };

  // ═══════════════════════════════════════════════════════════
  // 13. WEBRTC — Block IP leak
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
  // 14. BATTERY API — Already patched in C++
  // ═══════════════════════════════════════════════════════════

  // ═══════════════════════════════════════════════════════════
  // 15. SCREEN ORIENTATION — Consistent
  // ═══════════════════════════════════════════════════════════
  if (screen.orientation) {
    Object.defineProperty(screen.orientation, 'angle', {
      get: () => 0,
      configurable: true,
    });
    Object.defineProperty(screen.orientation, 'type', {
      get: () => 'landscape-primary',
      configurable: true,
    });
  }

  // ═══════════════════════════════════════════════════════════
  // 16. DEVICE MOTION — Spoof or remove
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
  // 17. POINTER LOCK — Consistent behavior
  // ═══════════════════════════════════════════════════════════
  if (document.pointerLockElement) {
    Object.defineProperty(document, 'pointerLockElement', {
      get: () => null,
      configurable: true,
    });
  }

  // ═══════════════════════════════════════════════════════════
  // 18. FULLSCREEN API — Consistent behavior
  // ═══════════════════════════════════════════════════════════
  if (document.fullscreenEnabled) {
    document.fullscreenEnabled = false;
  }

  // ═══════════════════════════════════════════════════════════
  // 19. WEB SHARE API — Remove
  // ═══════════════════════════════════════════════════════════
  if (navigator.share) {
    delete navigator.share;
  }

  // ═══════════════════════════════════════════════════════════
  // 20. BADGE API — Remove
  // ═══════════════════════════════════════════════════════════
  if (navigator.setAppBadge) {
    delete navigator.setAppBadge;
  }
  if (navigator.clearAppBadge) {
    delete navigator.clearAppBadge;
  }

  console.log('[Stealth FP] Comprehensive fingerprint patches applied');
})();
