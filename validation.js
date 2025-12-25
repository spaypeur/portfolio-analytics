// Data validation and sanitization utilities
class DataValidator {
  constructor() {
    // Define validation rules
    this.validationRules = {
      ip_address: {
        type: 'string',
        required: true,
        validator: (value) => this.isValidIp(value)
      },
      user_agent: {
        type: 'string',
        required: false,
        maxLength: 500,
        sanitizer: (value) => this.sanitizeString(value)
      },
      browser_name: {
        type: 'string',
        required: false,
        maxLength: 50,
        validator: (value) => this.isValidBrowserName(value)
      },
      os_name: {
        type: 'string',
        required: false,
        maxLength: 50,
        validator: (value) => this.isValidOsName(value)
      },
      device_type: {
        type: 'string',
        required: false,
        enum: ['Mobile', 'Tablet', 'Desktop']
      },
      screen_width: {
        type: 'number',
        required: false,
        min: 0,
        max: 10000
      },
      screen_height: {
        type: 'number',
        required: false,
        min: 0,
        max: 10000
      },
      language: {
        type: 'string',
        required: false,
        maxLength: 10,
        validator: (value) => this.isValidLanguageCode(value)
      },
      referrer: {
        type: 'string',
        required: false,
        maxLength: 1000,
        validator: (value) => this.isValidUrl(value)
      },
      page_visited: {
        type: 'string',
        required: false,
        maxLength: 1000,
        validator: (value) => this.isValidUrl(value)
      },
      canvas_fingerprint: {
        type: 'string',
        required: false,
        maxLength: 1000
      },
      audio_fingerprint: {
        type: 'string',
        required: false,
        maxLength: 1000
      },
      webgl_renderer: {
        type: 'string',
        required: false,
        maxLength: 200
      },
      timezone: {
        type: 'string',
        required: false,
        maxLength: 100
      },
      user_language: {
        type: 'string',
        required: false,
        maxLength: 10
      },
      platform: {
        type: 'string',
        required: false,
        maxLength: 50
      }
    };
  }

  // Validate IP address
  isValidIp(ip) {
    if (!ip) return false;
    
    // IPv4 regex
    const ipv4Regex = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
    
    // IPv6 regex (simplified)
    const ipv6Regex = /^([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$|^::1$|^::$/;
    
    return ipv4Regex.test(ip) || ipv6Regex.test(ip);
  }

  // Validate browser name
  isValidBrowserName(name) {
    if (!name) return true; // Optional field
    const validBrowsers = ['Chrome', 'Firefox', 'Safari', 'Edge', 'Opera', 'IE', 'Unknown'];
    return validBrowsers.includes(name);
  }

  // Validate OS name
  isValidOsName(name) {
    if (!name) return true; // Optional field
    const validOS = ['Windows', 'MacOS', 'Linux', 'Android', 'iOS', 'Unknown'];
    return validOS.includes(name);
  }

  // Validate language code
  isValidLanguageCode(code) {
    if (!code) return true; // Optional field
    // Simple validation for language codes (2-3 letters, optionally with region)
    const languageRegex = /^[a-zA-Z]{2,3}(-[a-zA-Z]{2,3})?$/;
    return languageRegex.test(code);
  }

  // Validate URL
  isValidUrl(url) {
    if (!url) return true; // Optional field
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }

  // Sanitize string input
  sanitizeString(str) {
    if (typeof str !== 'string') return null;
    
    // Remove potentially dangerous characters
    return str
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '') // Remove script tags
      .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '') // Remove iframe tags
      .replace(/javascript:/gi, '') // Remove javascript: protocol
      .replace(/vbscript:/gi, '') // Remove vbscript: protocol
      .replace(/on\w+\s*=/gi, '') // Remove event handlers
      .trim();
  }

  // Sanitize number input
  sanitizeNumber(num) {
    if (typeof num === 'string') {
      num = parseFloat(num);
    }
    
    if (isNaN(num) || num === null || num === undefined) {
      return null;
    }
    
    return num;
  }

  // Validate and sanitize a data object
  validateAndSanitize(data) {
    const result = { valid: true, errors: [], sanitizedData: {} };
    
    for (const [field, value] of Object.entries(data)) {
      const rule = this.validationRules[field];
      
      if (!rule) {
        // Skip validation for unknown fields
        result.sanitizedData[field] = value;
        continue;
      }
      
      // Check if field is required
      if (rule.required && (value === undefined || value === null || value === '')) {
        result.valid = false;
        result.errors.push(`Field '${field}' is required`);
        continue;
      }
      
      // Skip validation if value is not provided and not required
      if (value === undefined || value === null || value === '') {
        result.sanitizedData[field] = value;
        continue;
      }
      
      // Type validation
      if (rule.type) {
        if (rule.type === 'string' && typeof value !== 'string') {
          result.valid = false;
          result.errors.push(`Field '${field}' must be a string`);
          continue;
        }
        
        if (rule.type === 'number' && isNaN(parseFloat(value))) {
          result.valid = false;
          result.errors.push(`Field '${field}' must be a number`);
          continue;
        }
      }
      
      // Length validation
      if (rule.maxLength && typeof value === 'string' && value.length > rule.maxLength) {
        result.valid = false;
        result.errors.push(`Field '${field}' exceeds maximum length of ${rule.maxLength}`);
        continue;
      }
      
      // Range validation for numbers
      if (rule.min !== undefined && rule.type === 'number' && parseFloat(value) < rule.min) {
        result.valid = false;
        result.errors.push(`Field '${field}' must be at least ${rule.min}`);
        continue;
      }
      
      if (rule.max !== undefined && rule.type === 'number' && parseFloat(value) > rule.max) {
        result.valid = false;
        result.errors.push(`Field '${field}' must be at most ${rule.max}`);
        continue;
      }
      
      // Enum validation
      if (rule.enum && !rule.enum.includes(value)) {
        result.valid = false;
        result.errors.push(`Field '${field}' must be one of [${rule.enum.join(', ')}]`);
        continue;
      }
      
      // Custom validation
      if (rule.validator && !rule.validator(value)) {
        result.valid = false;
        result.errors.push(`Field '${field}' failed validation`);
        continue;
      }
      
      // Sanitization
      let sanitizedValue = value;
      if (rule.sanitizer) {
        sanitizedValue = rule.sanitizer(value);
      } else if (rule.type === 'string') {
        sanitizedValue = this.sanitizeString(value);
      } else if (rule.type === 'number') {
        sanitizedValue = this.sanitizeNumber(value);
      }
      
      result.sanitizedData[field] = sanitizedValue;
    }
    
    return result;
  }

  // Sanitize SQL query parameters to prevent injection
  sanitizeForSql(value) {
    if (typeof value === 'string') {
      // Escape single quotes and other SQL injection characters
      return value.replace(/'/g, "''").replace(/;/g, '');
    }
    return value;
  }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = DataValidator;
}