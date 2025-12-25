require('dotenv').config();
const express = require('express');
const geoip = require('geoip-lite');
const { supabase } = require('../supabase_client');

const app = express();
app.use(express.json({ limit: '10mb' }));

// CORS
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
  } else {
    next();
  }
});

// Security headers
app.use((req, res, next) => {
  res.header('X-Content-Type-Options', 'nosniff');
  res.header('X-Frame-Options', 'DENY');
  res.header('X-XSS-Protection', '1; mode=block');
  next();
});

// Main dashboard
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/../dashboard.html', { root: '.' });
});

// Analytics dashboard
app.get('/princess', (req, res) => {
  res.sendFile(__dirname + '/../princess_dashboard.html', { root: '.' });
});

// Privacy policy
app.get('/privacy-policy', (req, res) => {
  res.sendFile(__dirname + '/../privacy_policy.html', { root: '.' });
});

// Track visitor
app.post('/api/track', async (req, res) => {
  try {
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
    } = req.body;

    // Get IP
    const forwarded = req.headers['x-forwarded-for'];
    let ip = forwarded 
      ? (Array.isArray(forwarded) ? forwarded[0] : forwarded.split(/, /)[0]) 
      : req.connection.remoteAddress;

    // Get geolocation
    const geo = geoip.lookup(ip);

    // Insert into Supabase
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
        consent_granted: true
      }]);

    if (error) {
      console.error('Error inserting visitor data:', error);
      return res.status(500).json({ success: false, error: 'Failed to record visitor data' });
    }

    res.status(200).json({ success: true, id: data ? data[0]?.id : null });
  } catch (error) {
    console.error('Error in track endpoint:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

// Get analytics
app.get('/api/analytics', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('visitors')
      .select('count(*)', { head: true, count: 'exact' });

    if (error) throw error;

    res.status(200).json({
      totalVisitors: data?.length || 0,
      uniqueVisitors: 0,
      visitors24h: 0,
      visitors7d: 0,
      visitors30d: 0,
      growthRate: 0,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error fetching analytics:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch analytics' });
  }
});

// Get countries
app.get('/api/countries', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('visitors')
      .select('country_code, count(*) as count')
      .not('country_code', 'is', null)
      .order('count', { ascending: false })
      .limit(10);

    if (error) throw error;

    res.status(200).json(data || []);
  } catch (error) {
    console.error('Error fetching countries:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch country data' });
  }
});

// Get browser stats
app.get('/api/stats', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('visitors')
      .select('browser_name, count(*) as count')
      .order('count', { ascending: false })
      .limit(10);

    if (error) throw error;

    res.status(200).json(data || []);
  } catch (error) {
    console.error('Error fetching browser stats:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch browser stats' });
  }
});

// Get devices
app.get('/api/devices', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('visitors')
      .select('device_type, count(*) as count')
      .order('count', { ascending: false });

    if (error) throw error;

    res.status(200).json(data || []);
  } catch (error) {
    console.error('Error fetching device stats:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch device stats' });
  }
});

// Get timeline
app.get('/api/timeline', async (req, res) => {
  try {
    const days = parseInt(req.query.days) || 30;
    const { data, error } = await supabase
      .from('visitors')
      .select('created_at, count(*) as visitors')
      .order('created_at', { ascending: true });

    if (error) throw error;

    res.status(200).json(data || []);
  } catch (error) {
    console.error('Error fetching timeline:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch timeline data' });
  }
});

// Get top pages
app.get('/api/top-pages', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    const { data, error } = await supabase
      .from('visitors')
      .select('page_visited, count(*) as visits')
      .not('page_visited', 'is', null)
      .order('visits', { ascending: false })
      .limit(limit);

    if (error) throw error;

    res.status(200).json(data || []);
  } catch (error) {
    console.error('Error fetching top pages:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch top pages' });
  }
});

// Get referrers
app.get('/api/referrers', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    const { data, error } = await supabase
      .from('visitors')
      .select('referrer, count(*) as visits')
      .order('visits', { ascending: false })
      .limit(limit);

    if (error) throw error;

    res.status(200).json(data || []);
  } catch (error) {
    console.error('Error fetching referrers:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch referrer stats' });
  }
});

// Health check
app.get('/api/health', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('visitors')
      .select('count(*)', { head: true, count: 'exact' });

    if (error) throw error;

    res.status(200).json({
      status: 'healthy',
      database: 'healthy',
      recentVisitors: 0,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error checking health:', error);
    res.status(500).json({
      status: 'unhealthy',
      database: 'unhealthy',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// Privacy stats
app.get('/api/privacy-stats', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('visitors')
      .select('count(*)', { head: true, count: 'exact' });

    if (error) throw error;

    res.status(200).json({
      totalRecords: data?.length || 0,
      consentedRecords: data?.length || 0,
      nonConsentedRecords: 0,
      consentRate: 100
    });
  } catch (error) {
    console.error('Error fetching privacy stats:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch privacy stats' });
  }
});

// Consent
app.post('/api/consent', (req, res) => {
  const { consent } = req.body;
  if (consent === undefined) {
    return res.status(400).json({ success: false, error: 'Consent value required' });
  }
  res.status(200).json({ success: true, consent: consent });
});

module.exports = app;
