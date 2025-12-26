// Advanced Security & OSINT Analysis Module

class SecurityAnalyzer {
  constructor() {
    this.suspiciousPatterns = {
      sqlInjection: /(\b(union|select|insert|delete|update|drop|create|alter|exec|execute)\b)|(-{2}|\/\*|\*\/|;)/i,
      xss: /<script|javascript:|onerror=|onload=/i,
      pathTraversal: /\.\.\//,
      commandInjection: /[;&|`$()]/,
      suspiciousBrowsers: ['curl', 'wget', 'python', 'scrapy', 'bot', 'crawler', 'spider'],
      suspiciousUserAgents: ['sqlmap', 'nikto', 'nmap', 'masscan', 'metasploit']
    };

    this.threatScores = {
      vpn: 0.3,
      proxy: 0.4,
      datacenter: 0.5,
      tor: 0.9,
      botnet: 0.95,
      malware: 0.95
    };
  }

  // Analyze user agent for threats
  analyzeUserAgent(userAgent) {
    if (!userAgent) return { risk: 'unknown', score: 0.2 };

    const ua = userAgent.toLowerCase();
    let riskScore = 0;
    let threats = [];

    // Check for suspicious browsers
    for (const bot of this.suspiciousBrowsers) {
      if (ua.includes(bot)) {
        riskScore += 0.3;
        threats.push(`Suspicious browser: ${bot}`);
      }
    }

    // Check for known attack tools
    for (const tool of this.suspiciousUserAgents) {
      if (ua.includes(tool)) {
        riskScore += 0.5;
        threats.push(`Known attack tool detected: ${tool}`);
      }
    }

    // Check for missing common headers
    if (!ua.includes('mozilla') && !ua.includes('chrome') && !ua.includes('safari') && !ua.includes('firefox')) {
      riskScore += 0.2;
      threats.push('Non-standard user agent');
    }

    return {
      risk: riskScore > 0.7 ? 'high' : riskScore > 0.4 ? 'medium' : 'low',
      score: Math.min(riskScore, 1),
      threats
    };
  }

  // Analyze IP for threats
  analyzeIP(ip) {
    let riskScore = 0;
    let threats = [];

    // Check for private IPs
    if (this.isPrivateIP(ip)) {
      riskScore += 0.1;
      threats.push('Private IP address');
    }

    // Check for known datacenter IPs (simplified)
    if (this.isDatacenterIP(ip)) {
      riskScore += 0.4;
      threats.push('Datacenter/VPS IP detected');
    }

    return {
      risk: riskScore > 0.7 ? 'high' : riskScore > 0.4 ? 'medium' : 'low',
      score: Math.min(riskScore, 1),
      threats
    };
  }

  // Check if IP is private
  isPrivateIP(ip) {
    const privateRanges = [
      /^10\./,
      /^172\.(1[6-9]|2[0-9]|3[01])\./,
      /^192\.168\./,
      /^127\./,
      /^::1$/,
      /^fc00:/i
    ];

    return privateRanges.some(range => range.test(ip));
  }

  // Check if IP is from known datacenter
  isDatacenterIP(ip) {
    // Common datacenter IP ranges (simplified)
    const datacenterRanges = [
      /^102\.159\./, // Tunisie Telecom
      /^37\.3\./, // AWS
      /^52\./, // AWS
      /^54\./, // AWS
      /^35\./, // Google Cloud
      /^104\./, // Google Cloud
      /^34\./, // Google Cloud
      /^40\./, // Azure
      /^13\./, // Azure
    ];

    return datacenterRanges.some(range => range.test(ip));
  }

  // Analyze fingerprint for spoofing
  analyzeFingerprintSpoofing(fingerprint) {
    let riskScore = 0;
    let threats = [];

    if (!fingerprint) return { risk: 'unknown', score: 0, threats };

    // Check for common spoofed values
    if (fingerprint.canvas === 'toDataURL' || fingerprint.canvas === 'getImageData') {
      riskScore += 0.3;
      threats.push('Potential canvas fingerprint spoofing');
    }

    if (fingerprint.webgl === 'ANGLE' || fingerprint.webgl === 'SwiftShader') {
      riskScore += 0.2;
      threats.push('Potential WebGL spoofing');
    }

    return {
      risk: riskScore > 0.7 ? 'high' : riskScore > 0.4 ? 'medium' : 'low',
      score: Math.min(riskScore, 1),
      threats
    };
  }

  // Detect suspicious patterns in request
  detectSuspiciousPatterns(data) {
    let riskScore = 0;
    let threats = [];

    // Check for SQL injection
    if (this.suspiciousPatterns.sqlInjection.test(JSON.stringify(data))) {
      riskScore += 0.8;
      threats.push('SQL injection pattern detected');
    }

    // Check for XSS
    if (this.suspiciousPatterns.xss.test(JSON.stringify(data))) {
      riskScore += 0.7;
      threats.push('XSS pattern detected');
    }

    // Check for path traversal
    if (this.suspiciousPatterns.pathTraversal.test(JSON.stringify(data))) {
      riskScore += 0.6;
      threats.push('Path traversal pattern detected');
    }

    return {
      risk: riskScore > 0.7 ? 'high' : riskScore > 0.4 ? 'medium' : 'low',
      score: Math.min(riskScore, 1),
      threats
    };
  }

  // Comprehensive threat assessment
  assessThreat(visitorData) {
    const uaAnalysis = this.analyzeUserAgent(visitorData.user_agent);
    const ipAnalysis = this.analyzeIP(visitorData.ip_address);
    const patternAnalysis = this.detectSuspiciousPatterns(visitorData);

    const overallScore = (uaAnalysis.score + ipAnalysis.score + patternAnalysis.score) / 3;
    const allThreats = [
      ...uaAnalysis.threats,
      ...ipAnalysis.threats,
      ...patternAnalysis.threats
    ];

    return {
      overallRisk: overallScore > 0.7 ? 'high' : overallScore > 0.4 ? 'medium' : 'low',
      overallScore: Math.round(overallScore * 100),
      components: {
        userAgent: uaAnalysis,
        ip: ipAnalysis,
        patterns: patternAnalysis
      },
      threats: allThreats,
      timestamp: new Date().toISOString()
    };
  }
}

module.exports = SecurityAnalyzer;
