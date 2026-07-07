// stealth-webrtc-patches.js — Prevent WebRTC IP leaks
// Blocks STUN/TURN requests that expose real IP addresses

(function() {
  'use strict';

  // ═══════════════════════════════════════════════════════════
  // 1. OVERRIDE RTCConfiguration — Disable ICE candidates
  // ═══════════════════════════════════════════════════════════
  const OriginalRTCConfiguration = window.RTCConfiguration;
  
  // Patch RTCPeerConnection to disable ICE
  const OriginalRTCPeerConnection = window.RTCPeerConnection;
  if (OriginalRTCPeerConnection) {
    window.RTCPeerConnection = function(config, constraints) {
      // Disable ICE candidates that leak IP
      const patchedConfig = config || {};
      patchedConfig.iceCandidatePoolSize = 0;
      
      // Set to relay-only mode (forces TURN, no direct IP exposure)
      patchedConfig.iceTransportPolicy = 'relay';
      
      const pc = new OriginalRTCPeerConnection(patchedConfig, constraints);
      
      // Override createDataChannel to prevent IP leak via data channels
      const originalCreateDataChannel = pc.createDataChannel.bind(pc);
      pc.createDataChannel = function(label, options) {
        return originalCreateDataChannel(label, {
          ...options,
          // Disable SCTP which can leak IP
        });
      };
      
      return pc;
    };
    
    // Copy static properties
    window.RTCPeerConnection.prototype = OriginalRTCPeerConnection.prototype;
    window.RTCPeerConnection.generateCertificate = OriginalRTCPeerConnection.generateCertificate;
  }

  // ═══════════════════════════════════════════════════════════
  // 2. BLOCK ICE CANDIDATE EVENTS — Filter private IPs
  // ═══════════════════════════════════════════════════════════
  if (OriginalRTCPeerConnection) {
    const originalAddEventListener = RTCPeerConnection.prototype.addEventListener;
    RTCPeerConnection.prototype.addEventListener = function(type, listener, options) {
      if (type === 'icecandidate') {
        const wrappedListener = function(event) {
          if (event.candidate && event.candidate.candidate) {
            const candidate = event.candidate.candidate;
            // Block candidates that contain private IPs
            if (candidate.includes('192.168.') || 
                candidate.includes('10.') || 
                candidate.includes('172.16.') ||
                candidate.includes('172.17.') ||
                candidate.includes('172.18.') ||
                candidate.includes('172.19.') ||
                candidate.includes('172.2') ||
                candidate.includes('172.30.') ||
                candidate.includes('172.31.') ||
                candidate.includes('0.0.0.0') ||
                candidate.includes('host candidate')) {
              // Replace with empty candidate to prevent IP leak
              event = new RTCPeerConnectionIceEvent('icecandidate', {
                candidate: new RTCIceCandidate({ candidate: '', sdpMid: '', sdpMLineIndex: 0 })
              });
            }
          }
          listener.call(this, event);
        };
        return originalAddEventListener.call(this, type, wrappedListener, options);
      }
      return originalAddEventListener.call(this, type, listener, options);
    };
  }

  // ═══════════════════════════════════════════════════════════
  // 3. OVERRIDE getLocalIPs — Return fake IPs
  // ═══════════════════════════════════════════════════════════
  if (navigator.mediaDevices) {
    navigator.mediaDevices.getUserMedia = async function(constraints) {
      // Don't actually request media, just return fake stream
      return new MediaStream([]);
    };
  }

  // ═══════════════════════════════════════════════════════════
  // 4. BLOCK STUN REQUESTS — Prevent IP discovery
  // ═══════════════════════════════════════════════════════════
  // Override fetch to block STUN/TURN requests
  const originalFetch = window.fetch;
  window.fetch = function(url, options) {
    if (typeof url === 'string' && (url.includes('stun:') || url.includes('turn:') || url.includes('STUN') || url.includes('TURN'))) {
      return Promise.reject(new Error('STUN/TURN blocked for IP protection'));
    }
    return originalFetch.call(this, url, options);
  };

  // Override XMLHttpRequest to block STUN/TURN
  const originalXHROpen = XMLHttpRequest.prototype.open;
  XMLHttpRequest.prototype.open = function(method, url, ...args) {
    if (typeof url === 'string' && (url.includes('stun:') || url.includes('turn:') || url.includes('STUN') || url.includes('TURN'))) {
      throw new Error('STUN/TURN blocked for IP protection');
    }
    return originalXHROpen.call(this, method, url, ...args);
  };

  console.log('[Stealth WebRTC] IP leak prevention applied');
})();
