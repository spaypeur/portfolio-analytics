// Advanced browser fingerprinting library
class AdvancedFingerprinting {
  constructor() {
    this.fingerprint = {};
  }

  // Get canvas fingerprint
  getCanvasFingerprint() {
    try {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      // Draw different content to get a unique fingerprint
      ctx.textBaseline = 'top';
      ctx.font = '14px Arial';
      ctx.fillStyle = '#f60';
      ctx.fillRect(125, 1, 62, 20);
      ctx.fillStyle = '#069';
      ctx.fillText('Canvas fingerprinting test', 2, 15);
      ctx.fillStyle = 'rgba(102, 204, 0, 0.7)';
      ctx.fillText('Canvas fingerprinting test', 4, 17);
      
      // Try different operations to get more variation
      ctx.globalCompositeOperation = 'multiply';
      ctx.fillStyle = 'rgb(255,0,255)';
      ctx.beginPath();
      ctx.arc(50, 50, 50, 0, Math.PI * 2, true);
      ctx.fill();
      
      return canvas.toDataURL();
    } catch (e) {
      return null;
    }
  }

  // Get WebGL fingerprint
  getWebGLFingerprint() {
    try {
      const canvas = document.createElement('canvas');
      const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
      
      if (!gl) return null;
      
      const rendererInfo = gl.getExtension('WEBGL_debug_renderer_info');
      if (rendererInfo) {
        const renderer = gl.getParameter(rendererInfo.UNMASKED_RENDERER_WEBGL);
        const vendor = gl.getParameter(rendererInfo.UNMASKED_VENDOR_WEBGL);
        
        // Get additional WebGL parameters
        const version = gl.getParameter(gl.VERSION);
        const shadingLanguageVersion = gl.getParameter(gl.SHADING_LANGUAGE_VERSION);
        const vendorUnmasked = gl.getParameter(rendererInfo.UNMASKED_VENDOR_WEBGL);
        const rendererUnmasked = gl.getParameter(rendererInfo.UNMASKED_RENDERER_WEBGL);
        
        return {
          vendor: vendor,
          renderer: renderer,
          version: version,
          shadingLanguageVersion: shadingLanguageVersion,
          vendorUnmasked: vendorUnmasked,
          rendererUnmasked: rendererUnmasked
        };
      }
      
      return null;
    } catch (e) {
      return null;
    }
  }

  // Get audio fingerprint
  getAudioFingerprint() {
    try {
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const analyser = audioContext.createAnalyser();
      const gain = audioContext.createGain();
      const scriptProcessor = audioContext.createScriptProcessor(4096, 1, 1);

      oscillator.connect(analyser);
      analyser.connect(scriptProcessor);
      scriptProcessor.connect(gain);
      gain.connect(audioContext.destination);

      oscillator.frequency.value = 1000;
      oscillator.start(0);

      // Process audio data to generate fingerprint
      const fingerprint = new Float32Array(10);
      analyser.getFloatFrequencyData(fingerprint);

      oscillator.stop();
      audioContext.close();

      return Array.from(fingerprint).join(',');
    } catch (e) {
      return null;
    }
  }

  // Get font fingerprint
  getFontFingerprint() {
    const testFonts = [
      'Arial', 'Helvetica', 'Times New Roman', 'Courier New', 'Verdana', 
      'Georgia', 'Palatino', 'Garamond', 'Comic Sans MS', 'Trebuchet MS', 
      'Arial Black', 'Impact', 'Monaco', 'Consolas', 'Lucida Console'
    ];
    
    const testString = 'mmmmmmmmmmlli';
    const testSize = '72px';
    
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    const detect = (font) => {
      ctx.font = testSize + ' ' + font;
      return ctx.measureText(testString).width;
    };
    
    // Create a test element with default fonts
    const defaultFonts = ['monospace', 'sans-serif', 'serif'];
    const defaultWidths = {};
    
    for (const font of defaultFonts) {
      defaultWidths[font] = detect(font);
    }
    
    // Check each test font
    const detectedFonts = [];
    for (const font of testFonts) {
      for (const defaultFont of defaultFonts) {
        if (detect(font + ',' + defaultFont) !== defaultWidths[defaultFont]) {
          detectedFonts.push(font);
          break;
        }
      }
    }
    
    return detectedFonts;
  }

  // Get plugin fingerprint
  getPluginFingerprint() {
    const plugins = [];
    
    if (navigator.plugins) {
      for (let i = 0; i < navigator.plugins.length; i++) {
        const plugin = navigator.plugins[i];
        plugins.push({
          name: plugin.name,
          description: plugin.description,
          filename: plugin.filename,
          length: plugin.length
        });
      }
    }
    
    return plugins;
  }

  // Get timezone information
  getTimezoneFingerprint() {
    return {
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      timezoneOffset: new Date().getTimezoneOffset(),
      daylightSavingTime: this.isDST(new Date())
    };
  }

  // Check if daylight saving time is active
  isDST(date) {
    const jan = new Date(date.getFullYear(), 0, 1);
    const jul = new Date(date.getFullYear(), 6, 1);
    const standardOffset = Math.max(jan.getTimezoneOffset(), jul.getTimezoneOffset());
    return date.getTimezoneOffset() < standardOffset;
  }

  // Get hardware information
  getHardwareFingerprint() {
    return {
      hardwareConcurrency: navigator.hardwareConcurrency || null,
      deviceMemory: navigator.deviceMemory || null,
      screenResolution: `${screen.width}x${screen.height}`,
      colorDepth: screen.colorDepth,
      pixelDepth: screen.pixelDepth,
      touchSupport: 'ontouchstart' in window || navigator.maxTouchPoints > 0 || navigator.msMaxTouchPoints > 0,
      maxTouchPoints: navigator.maxTouchPoints || null
    };
  }

  // Get platform information
  getPlatformFingerprint() {
    return {
      platform: navigator.platform,
      userAgent: navigator.userAgent,
      appVersion: navigator.appVersion,
      vendor: navigator.vendor,
      product: navigator.product,
      language: navigator.language,
      languages: navigator.languages,
      onLine: navigator.onLine
    };
  }

  // Generate complete fingerprint
  generateFingerprint() {
    return {
      canvas: this.getCanvasFingerprint(),
      webgl: this.getWebGLFingerprint(),
      audio: this.getAudioFingerprint(),
      fonts: this.getFontFingerprint(),
      plugins: this.getPluginFingerprint(),
      timezone: this.getTimezoneFingerprint(),
      hardware: this.getHardwareFingerprint(),
      platform: this.getPlatformFingerprint(),
      timestamp: new Date().toISOString()
    };
  }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = AdvancedFingerprinting;
}