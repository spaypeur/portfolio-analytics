require('dotenv').config();
const express = require('express');
const { Pool } = require('pg');
const geoip = require('geoip-lite');
const rateLimit = require('express-rate-limit');
const { supabase } = require('./supabase_client');
const { Logger, ErrorHandler } = require('./logging');
const DataValidator = require('./validation');
const SecurityMiddleware = require('./security');
const PrivacyCompliance = require('./privacy');
const DashboardBackend = require('./dashboard_backend');
const AdvancedFingerprinting = require('./fingerprinting');

const app = express();

// Initialize components
const logger = new Logger({ logLevel: 'info', logToFile: true, logToConsole: true });
const errorHandler = new ErrorHandler(logger);
const validator = new DataValidator();
const security = new SecurityMiddleware();
const privacy = new PrivacyCompliance();
const dashboard = new DashboardBackend();

// Enhanced security middleware
app.use(security.securityHeaders);
app.use(security.corsMiddleware);
app.use(security.botDetection);
app.use(security.validateRequest);

// Rate limiting
const limiter = security.createRateLimiter();
app.use(limiter);

// Enhanced logging middleware
app.use(errorHandler.logRequest.bind(errorHandler));

// Middleware
app.use(express.json({ limit: '10mb' }));

// Serve static files (images, etc)
app.use(express.static(__dirname));

// Endpoint to collect visitor data with comprehensive validation
app.post('/api/track', async (req, res) => {
  try {
    // Validate request data
    const validation = validator.validateAndSanitize(req.body);
    if (!validation.valid) {
      logger.warn('Invalid tracking data received', {
        errors: validation.errors,
        ip: req.ip,
        userAgent: req.get('User-Agent')
      });
      return res.status(400).json({ 
        success: false, 
        error: 'Validation failed', 
        details: validation.errors 
      });
    }

    const sanitizedData = validation.sanitizedData;

    // Check privacy consent
    if (!privacy.canTrack()) {
      logger.info('Tracking blocked due to privacy consent', { ip: req.ip });
      return res.status(200).json({ success: true, message: 'Tracking consent not granted' });
    }

    const {
      userAgent,
      browserName,
      browserVersion,
      osName,
      deviceType,
      screenWidth,
      screenHeight,
      viewportWidth,
      viewportHeight,
      timezoneOffset,
      language,
      referrer,
      pageVisited,
      canvasFingerprint,
      audioFingerprint,
      webglRenderer,
      touchSupport,
      hardwareConcurrency,
      colorDepth,
      timezone,
      userLanguage,
      platform
    } = sanitizedData;

    // Get client IP address (prioritizing X-Forwarded-For if behind proxy)
    const forwarded = req.headers['x-forwarded-for'];
    let ip = forwarded 
      ? (Array.isArray(forwarded) ? forwarded[0] : forwarded.split(/, /)[0]) 
      : req.connection.remoteAddress;

    // Anonymize IP if required by privacy settings
    ip = privacy.anonymizeIp(ip);

    // Get geolocation data
    const geo = geoip.lookup(ip);

    // Insert visitor data into Supabase
    const { data, error } = await supabase
      .from('visitors')
      .insert([{
        ip_address: ip,
        user_agent: userAgent,
        browser_name: browserName,
        browser_version: browserVersion,
        os_name: osName,
        device_type: deviceType,
        screen_width: screenWidth || null,
        screen_height: screenHeight || null,
        viewport_width: viewportWidth || null,
        viewport_height: viewportHeight || null,
        timezone_offset: timezoneOffset || null,
        language: language || null,
        referrer: referrer || null,
        page_visited: pageVisited || null,
        country_code: geo ? geo.country : null,
        region: geo ? geo.region : null,
        city: geo ? geo.city : null,
        latitude: geo && geo.ll ? geo.ll[0] : null,
        longitude: geo && geo.ll ? geo.ll[1] : null,
        canvas_fingerprint: canvasFingerprint || null,
        audio_fingerprint: audioFingerprint || null,
        webgl_renderer: webglRenderer || null,
        touch_support: touchSupport || null,
        hardware_concurrency: hardwareConcurrency || null,
        color_depth: colorDepth || null,
        timezone: timezone || null,
        user_language: userLanguage || null,
        platform: platform || null,
        consent_granted: privacy.getConsent()?.granted || true
      }]);

    if (error) {
      logger.error('Error inserting visitor data', {
        error: error.message,
        ip: ip,
        userAgent: userAgent
      });
      return res.status(500).json({ success: false, error: 'Failed to record visitor data' });
    }

    logger.info('Visitor data recorded successfully', { 
      ip: ip, 
      id: data ? data[0]?.id : null,
      userAgent: userAgent
    });

    res.status(200).json({ success: true, id: data ? data[0]?.id : null });
  } catch (error) {
    logger.error('Error in track endpoint', {
      error: error.message,
      stack: error.stack,
      ip: req.ip
    });
    
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

// Endpoint to get analytics summary
app.get('/api/analytics', async (req, res) => {
  try {
    const summary = await dashboard.getAnalyticsSummary();
    res.status(200).json(summary);
  } catch (error) {
    logger.error('Error fetching analytics', {
      error: error.message,
      stack: error.stack,
      ip: req.ip
    });
    res.status(500).json({ success: false, error: 'Failed to fetch analytics' });
  }
});

// Endpoint to get visitor statistics by country
app.get('/api/countries', async (req, res) => {
  try {
    const data = await dashboard.getCountryStats();
    res.status(200).json(data);
  } catch (error) {
    logger.error('Error fetching country data', {
      error: error.message,
      stack: error.stack,
      ip: req.ip
    });
    res.status(500).json({ success: false, error: 'Failed to fetch country data' });
  }
});

// Endpoint to get browser/device statistics
app.get('/api/stats', async (req, res) => {
  try {
    const data = await dashboard.getBrowserStats();
    res.status(200).json(data);
  } catch (error) {
    logger.error('Error fetching browser stats', {
      error: error.message,
      stack: error.stack,
      ip: req.ip
    });
    res.status(500).json({ success: false, error: 'Failed to fetch browser stats' });
  }
});

// Endpoint to get device statistics
app.get('/api/devices', async (req, res) => {
  try {
    const data = await dashboard.getDeviceStats();
    res.status(200).json(data);
  } catch (error) {
    logger.error('Error fetching device stats', {
      error: error.message,
      stack: error.stack,
      ip: req.ip
    });
    res.status(500).json({ success: false, error: 'Failed to fetch device stats' });
  }
});

// Endpoint to get visitor timeline
app.get('/api/timeline', async (req, res) => {
  try {
    const days = parseInt(req.query.days) || 30;
    const data = await dashboard.getVisitorTimeline(days);
    res.status(200).json(data);
  } catch (error) {
    logger.error('Error fetching timeline data', {
      error: error.message,
      stack: error.stack,
      ip: req.ip
    });
    res.status(500).json({ success: false, error: 'Failed to fetch timeline data' });
  }
});

// Endpoint to get top pages
app.get('/api/top-pages', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    const data = await dashboard.getTopPages(limit);
    res.status(200).json(data);
  } catch (error) {
    logger.error('Error fetching top pages', {
      error: error.message,
      stack: error.stack,
      ip: req.ip
    });
    res.status(500).json({ success: false, error: 'Failed to fetch top pages' });
  }
});

// Endpoint to get referrer stats
app.get('/api/referrers', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    const data = await dashboard.getReferrerStats(limit);
    res.status(200).json(data);
  } catch (error) {
    logger.error('Error fetching referrer stats', {
      error: error.message,
      stack: error.stack,
      ip: req.ip
    });
    res.status(500).json({ success: false, error: 'Failed to fetch referrer stats' });
  }
});

// Endpoint to get system health
app.get('/api/health', async (req, res) => {
  try {
    const health = await dashboard.getSystemHealth();
    res.status(200).json(health);
  } catch (error) {
    logger.error('Error checking system health', {
      error: error.message,
      stack: error.stack,
      ip: req.ip
    });
    res.status(500).json({ 
      status: 'unhealthy', 
      error: 'Health check failed',
      timestamp: new Date().toISOString()
    });
  }
});

// Endpoint to get privacy compliance stats
app.get('/api/privacy-stats', async (req, res) => {
  try {
    const stats = await dashboard.getPrivacyComplianceStats();
    res.status(200).json(stats);
  } catch (error) {
    logger.error('Error fetching privacy stats', {
      error: error.message,
      stack: error.stack,
      ip: req.ip
    });
    res.status(500).json({ success: false, error: 'Failed to fetch privacy stats' });
  }
});

// Endpoint to handle consent management
app.post('/api/consent', async (req, res) => {
  try {
    const { consent } = req.body;
    if (consent === undefined) {
      return res.status(400).json({ success: false, error: 'Consent value required' });
    }
    
    privacy.setConsent(consent);
    res.status(200).json({ success: true, consent: consent });
  } catch (error) {
    logger.error('Error handling consent', {
      error: error.message,
      stack: error.stack,
      ip: req.ip
    });
    res.status(500).json({ success: false, error: 'Failed to handle consent' });
  }
});

// Serve dashboard
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/dashboard.html');
});

// Serve princess dashboard
app.get('/princess', (req, res) => {
  res.sendFile(__dirname + '/princess_dashboard.html');
});

// Serve privacy policy
app.get('/privacy-policy', (req, res) => {
  res.sendFile(__dirname + '/privacy_policy.html');
});

// Error handling middleware
app.use(errorHandler.middleware.bind(errorHandler));

// Handle uncaught exceptions and rejections
errorHandler.handleUncaughtExceptions();
errorHandler.handleUnhandledRejections();

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  logger.info(`Analytics server running on port ${PORT}`, {
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

module.exports = app;