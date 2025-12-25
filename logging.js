// Comprehensive error handling and logging system
const fs = require('fs');
const path = require('path');

class Logger {
  constructor(options = {}) {
    this.logLevel = options.logLevel || 'info';
    this.logToFile = options.logToFile || false;
    this.logFilePath = options.logFilePath || './logs/analytics.log';
    this.maxLogSize = options.maxLogSize || 10 * 1024 * 1024; // 10MB
    this.logToConsole = options.logToConsole !== false; // Default to true
    
    // Create logs directory if it doesn't exist
    if (this.logToFile) {
      const logDir = path.dirname(this.logFilePath);
      if (!fs.existsSync(logDir)) {
        fs.mkdirSync(logDir, { recursive: true });
      }
    }
    
    // Set up log levels
    this.levels = {
      error: 0,
      warn: 1,
      info: 2,
      debug: 3
    };
  }

  // Check if log level should be output
  shouldLog(level) {
    return this.levels[level] <= this.levels[this.logLevel];
  }

  // Format log message
  formatMessage(level, message, meta = {}) {
    const timestamp = new Date().toISOString();
    const logEntry = {
      timestamp,
      level,
      message,
      ...meta
    };
    
    return JSON.stringify(logEntry);
  }

  // Log to file
  _logToFile(message) {
    if (!this.logToFile) return;
    
    try {
      // Check file size and rotate if necessary
      if (fs.existsSync(this.logFilePath)) {
        const stats = fs.statSync(this.logFilePath);
        if (stats.size > this.maxLogSize) {
          const oldPath = this.logFilePath.replace(/\.log$/, `_${Date.now()}.log`);
          fs.renameSync(this.logFilePath, oldPath);
        }
      }
      
      fs.appendFileSync(this.logFilePath, message + '\n');
    } catch (error) {
      console.error('Error writing to log file:', error);
    }
  }

  // Log method
  log(level, message, meta = {}) {
    if (!this.shouldLog(level)) return;
    
    const formattedMessage = this.formatMessage(level, message, meta);
    
    if (this.logToConsole) {
      const consoleMessage = `[${level.toUpperCase()}] ${new Date().toISOString()} - ${message}`;
      if (level === 'error') {
        console.error(consoleMessage);
      } else if (level === 'warn') {
        console.warn(consoleMessage);
      } else {
        console.log(consoleMessage);
      }
      
      if (Object.keys(meta).length > 0) {
        console.log('Metadata:', meta);
      }
    }
    
    this._logToFile(formattedMessage);
  }

  // Convenience methods
  error(message, meta = {}) {
    this.log('error', message, meta);
  }

  warn(message, meta = {}) {
    this.log('warn', message, meta);
  }

  info(message, meta = {}) {
    this.log('info', message, meta);
  }

  debug(message, meta = {}) {
    this.log('debug', message, meta);
  }
}

// Error handler middleware
class ErrorHandler {
  constructor(logger) {
    this.logger = logger || new Logger();
  }

  // Express error handling middleware
  middleware(err, req, res, next) {
    // Log the error
    this.logger.error('Express error occurred', {
      error: err.message,
      stack: err.stack,
      url: req.url,
      method: req.method,
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      timestamp: new Date().toISOString()
    });

    // Determine status code
    const statusCode = err.status || err.statusCode || 500;

    // Send appropriate response
    if (statusCode === 500) {
      // For 500 errors, don't expose internal details
      res.status(statusCode).json({
        success: false,
        error: 'Internal server error'
      });
    } else {
      res.status(statusCode).json({
        success: false,
        error: err.message || 'An error occurred'
      });
    }
  }

  // Handle uncaught exceptions
  handleUncaughtExceptions() {
    process.on('uncaughtException', (error) => {
      this.logger.error('Uncaught Exception', {
        error: error.message,
        stack: error.stack,
        timestamp: new Date().toISOString()
      });
      
      // Attempt graceful shutdown
      process.exit(1);
    });
  }

  // Handle unhandled promise rejections
  handleUnhandledRejections() {
    process.on('unhandledRejection', (reason, promise) => {
      this.logger.error('Unhandled Promise Rejection', {
        reason: reason instanceof Error ? reason.message : reason,
        stack: reason instanceof Error ? reason.stack : null,
        promise: promise,
        timestamp: new Date().toISOString()
      });
    });
  }

  // Log API requests
  logRequest(req, res, next) {
    const startTime = Date.now();
    const logger = this.logger;
    
    // Capture response end to log completion
    const originalSend = res.send;
    res.send = function(data) {
      const duration = Date.now() - startTime;
      
      // Log request details
      logger.info('API Request', {
        method: req.method,
        url: req.url,
        statusCode: res.statusCode,
        duration: `${duration}ms`,
        ip: req.ip,
        userAgent: req.get('User-Agent'),
        timestamp: new Date().toISOString()
      });
      
      return originalSend.call(this, data);
    };
    
    next();
  }

  // Create error from message
  createError(statusCode, message, customProps = {}) {
    const error = new Error(message);
    error.status = statusCode;
    
    // Add custom properties
    Object.assign(error, customProps);
    
    return error;
  }

  // Validation error
  validationError(message, field = null) {
    const error = this.createError(400, message);
    error.type = 'validation';
    error.field = field;
    return error;
  }

  // Authentication error
  authError(message = 'Authentication required') {
    return this.createError(401, message, { type: 'auth' });
  }

  // Authorization error
  authorizationError(message = 'Access denied') {
    return this.createError(403, message, { type: 'authorization' });
  }

  // Not found error
  notFoundError(message = 'Resource not found') {
    return this.createError(404, message, { type: 'not_found' });
  }

  // Rate limit error
  rateLimitError(message = 'Rate limit exceeded') {
    return this.createError(429, message, { type: 'rate_limit' });
  }
}

// Export both classes
module.exports = { Logger, ErrorHandler };