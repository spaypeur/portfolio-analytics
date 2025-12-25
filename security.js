// Security middleware for analytics system
const rateLimit = require('express-rate-limit');

class SecurityMiddleware {
  constructor() {
    // API key storage (in production, this should be in a secure database)
    this.apiKeys = new Map();
  }

  // Create rate limiter
  createRateLimiter() {
    return rateLimit({
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 100, // limit each IP to 100 requests per windowMs
      message: {
        success: false,
        error: 'Too many requests, please try again later.'
      },
      standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
      legacyHeaders: false, // Disable the `X-RateLimit-*` headers
    });
  }

  // Enhanced rate limiter for more sensitive endpoints
  createEnhancedRateLimiter() {
    return rateLimit({
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 10, // limit each IP to 10 requests per windowMs for sensitive endpoints
      message: {
        success: false,
        error: 'Too many requests to sensitive endpoint, please try again later.'
      },
      standardHeaders: true,
      legacyHeaders: false,
    });
  }

  // API key validation middleware
  validateApiKey(req, res, next) {
    const apiKey = req.headers['x-api-key'] || req.query.api_key;
    
    if (!apiKey) {
      return res.status(401).json({
        success: false,
        error: 'API key is required'
      });
    }
    
    // In a real application, you'd check against a database of valid API keys
    // For now, we'll just check if it's in our map or matches a pattern
    if (this.isValidApiKey(apiKey)) {
      req.apiKey = apiKey;
      next();
    } else {
      res.status(401).json({
        success: false,
        error: 'Invalid API key'
      });
    }
  }

  // Check if API key is valid
  isValidApiKey(apiKey) {
    // In production, this would query a database
    // For now, we'll just return true to allow basic functionality
    // You can add specific API key validation logic here
    return typeof apiKey === 'string' && apiKey.length >= 10;
  }

  // Add a new API key
  addApiKey(key, metadata = {}) {
    this.apiKeys.set(key, {
      ...metadata,
      createdAt: new Date(),
      active: true
    });
  }

  // IP blocking middleware
  createIpBlocker(blockedIps = []) {
    return (req, res, next) => {
      const forwarded = req.headers['x-forwarded-for'];
      const ip = forwarded 
        ? (Array.isArray(forwarded) ? forwarded[0] : forwarded.split(/, /)[0]) 
        : req.connection.remoteAddress;

      if (blockedIps.includes(ip)) {
        return res.status(403).json({
          success: false,
          error: 'Your IP address has been blocked'
        });
      }
      
      next();
    };
  }

  // Request validation middleware
  validateRequest(req, res, next) {
    // Check for common attack patterns in request body
    if (req.body) {
      const bodyStr = JSON.stringify(req.body);
      
      // Check for potential SQL injection patterns
      const sqlPatterns = [
        /(\b(union|select|insert|delete|update|drop|create|alter|exec|execute)\b)/i,
        /(;|--|\/\*|\*\/|xp_|sp_|sysobjects|syscolumns)/i
      ];
      
      for (const pattern of sqlPatterns) {
        if (pattern.test(bodyStr)) {
          return res.status(400).json({
            success: false,
            error: 'Request contains potentially malicious content'
          });
        }
      }
      
      // Check for potential XSS patterns
      const xssPatterns = [
        /<script/i,
        /javascript:/i,
        /vbscript:/i,
        /on\w+\s*=/i
      ];
      
      for (const pattern of xssPatterns) {
        if (pattern.test(bodyStr)) {
          return res.status(400).json({
            success: false,
            error: 'Request contains potentially malicious content'
          });
        }
      }
    }
    
    next();
  }

  // CORS middleware
  corsMiddleware(req, res, next) {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-API-Key');
    
    if (req.method === 'OPTIONS') {
      res.sendStatus(200);
    } else {
      next();
    }
  }

  // Security headers middleware
  securityHeaders(req, res, next) {
    // Prevent MIME type sniffing
    res.header('X-Content-Type-Options', 'nosniff');
    
    // Prevent clickjacking
    res.header('X-Frame-Options', 'DENY');
    
    // Enable XSS protection
    res.header('X-XSS-Protection', '1; mode=block');
    
    // Force HTTPS in production
    if (process.env.NODE_ENV === 'production') {
      res.header('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
    }
    
    next();
  }

  // Bot detection middleware
  botDetection(req, res, next) {
    const userAgent = req.headers['user-agent'];
    
    if (!userAgent) {
      return next();
    }
    
    // Common bot/user-agent patterns
    const botPatterns = [
      /bot/i,
      /crawler/i,
      /spider/i,
      /slurp/i,
      /wget/i,
      /curl/i,
      /scrapy/i,
      /python/i,
      /selenium/i,
      /phantomjs/i,
      /headless/i
    ];
    
    for (const pattern of botPatterns) {
      if (pattern.test(userAgent)) {
        // Log bot request but don't block it
        console.log(`Bot detected: ${userAgent}`);
        break;
      }
    }
    
    next();
  }
}

module.exports = SecurityMiddleware;