// stealth-hardware-patches.js — Hardware coherence + AudioContext + SpeechSynthesis patches
// Makes all fingerprints match a real, consistent device

(function() {
  'use strict';

  // ═══════════════════════════════════════════════════════════
  // 1. SCREEN COHERENCE — Match a common 1080p monitor
  // ═══════════════════════════════════════════════════════════
  const screenProps = {
    width: 1920,
    height: 1080,
    availWidth: 1920,
    availHeight: 1040,  // Taskbar = 40px
    colorDepth: 24,
    pixelDepth: 24,
    orientation: { angle: 0, type: 'landscape-primary' },
  };

  Object.defineProperty(screen, 'width', { get: () => screenProps.width, configurable: true });
  Object.defineProperty(screen, 'height', { get: () => screenProps.height, configurable: true });
  Object.defineProperty(screen, 'availWidth', { get: () => screenProps.availWidth, configurable: true });
  Object.defineProperty(screen, 'availHeight', { get: () => screenProps.availHeight, configurable: true });
  Object.defineProperty(screen, 'colorDepth', { get: () => screenProps.colorDepth, configurable: true });
  Object.defineProperty(screen, 'pixelDepth', { get: () => screenProps.pixelDepth, configurable: true });

  // ═══════════════════════════════════════════════════════════
  // 2. HARDWARE INFO — Consistent CPU/RAM/device
  // ═══════════════════════════════════════════════════════════
  Object.defineProperty(navigator, 'hardwareConcurrency', {
    get: () => 16,  // 16-core CPU (common high-end)
    configurable: true,
  });

  Object.defineProperty(navigator, 'deviceMemory', {
    get: () => 8,  // 8GB RAM
    configurable: true,
  });

  // ═══════════════════════════════════════════════════════════
  // 3. AUDIOCONTEXT FINGERPRINT — Add consistent noise
  // ═══════════════════════════════════════════════════════════
  const OriginalAudioContext = window.AudioContext || window.webkitAudioContext;
  if (OriginalAudioContext) {
    const originalGetChannelData = AudioBuffer.prototype.getChannelData;
    AudioBuffer.prototype.getChannelData = function(channel) {
      const data = originalGetChannelData.call(this, channel);
      // Add subtle, consistent noise (same every time = consistent fingerprint)
      const len = Math.min(data.length, 128);
      for (let i = 0; i < len; i++) {
        data[i] = data[i] + (Math.sin(i * 0.001) * 0.0000001);
      }
      return data;
    };

    // Spoof AudioContext outputLatency
    if (OriginalAudioContext.prototype) {
      Object.defineProperty(OriginalAudioContext.prototype, 'outputLatency', {
        get: function() { return 0.01; },  // Consistent low latency
        configurable: true,
      });
      Object.defineProperty(OriginalAudioContext.prototype, 'baseLatency', {
        get: function() { return 0.005; },  // Consistent base latency
        configurable: true,
      });
    }
  }

  // ═══════════════════════════════════════════════════════════
  // 4. SPEECHSYNTHESIS — Consistent voice list
  // ═══════════════════════════════════════════════════════════
  if (window.speechSynthesis) {
    const chromeVoices = [
      { name: 'Microsoft David - English (United States)', lang: 'en-US', localService: true, default: true, voiceURI: 'Microsoft David - English (United States)' },
      { name: 'Microsoft Zira - English (United States)', lang: 'en-US', localService: true, default: false, voiceURI: 'Microsoft Zira - English (United States)' },
    ];

    const originalGetVoices = speechSynthesis.getVoices.bind(speechSynthesis);
    speechSynthesis.getVoices = function() {
      return chromeVoices;
    };
  }

  // ═══════════════════════════════════════════════════════════
  // 5. CONNECTION INFO — Spoof network info
  // ═══════════════════════════════════════════════════════════
  if (navigator.connection) {
    Object.defineProperty(navigator.connection, 'rtt', {
      get: () => 50,  // 50ms RTT (typical broadband)
      configurable: true,
    });
    Object.defineProperty(navigator.connection, 'downlink', {
      get: () => 10,  // 10 Mbps
      configurable: true,
    });
    Object.defineProperty(navigator.connection, 'effectiveType', {
      get: () => '4g',
      configurable: true,
    });
  }

  // ═══════════════════════════════════════════════════════════
  // 6. WINDOW GEOMETRY — Consistent with screen
  // ═══════════════════════════════════════════════════════════
  Object.defineProperty(window, 'outerWidth', {
    get: () => 1920,
    configurable: true,
  });
  Object.defineProperty(window, 'outerHeight', {
    get: () => 1040,  // Screen height minus taskbar
    configurable: true,
  });
  Object.defineProperty(window, 'screenX', {
    get: () => 0,
    configurable: true,
  });
  Object.defineProperty(window, 'screenY', {
    get: () => 0,
    configurable: true,
  });

  // ═══════════════════════════════════════════════════════════
  // 7. BATTERY API — Spoof or remove
  // ═══════════════════════════════════════════════════════════
  if (navigator.getBattery) {
    navigator.getBattery = () => Promise.resolve({
      charging: true,
      chargingTime: 0,
      dischargingTime: Infinity,
      level: 1,
      addEventListener: () => {},
      removeEventListener: () => {},
    });
  }

  // ═══════════════════════════════════════════════════════════
  // 8. MEDIA DEVICES — Fake device list
  // ═══════════════════════════════════════════════════════════
  if (navigator.mediaDevices && navigator.mediaDevices.enumerateDevices) {
    navigator.mediaDevices.enumerateDevices = () => Promise.resolve([
      { deviceId: '', kind: 'audioinput', label: '', groupId: '' },
      { deviceId: '', kind: 'audiooutput', label: '', groupId: '' },
      { deviceId: '', kind: 'videoinput', label: '', groupId: '' },
    ]);
  }

  console.log('[Stealth HW] Hardware coherence patches applied');
})();
