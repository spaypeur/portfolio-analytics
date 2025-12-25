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
  const html = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Allison Amber Hage - Portfolio</title>
    <link rel="icon" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='75' font-size='75' fill='%23ff69b4'>✨</text></svg>" type="image/svg+xml">
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: 'Arial', sans-serif; background: linear-gradient(135deg, #ff69b4 0%, #ff1493 25%, #ff69b4 50%, #da70d6 75%, #ff69b4 100%); background-size: 400% 400%; min-height: 100vh; display: flex; align-items: center; justify-content: center; padding: 20px; animation: gradientShift 8s ease infinite; }
        @keyframes gradientShift { 0% { background-position: 0% 50%; } 50% { background-position: 100% 50%; } 100% { background-position: 0% 50%; } }
        .container { background: white; border-radius: 40px; box-shadow: 0 20px 60px rgba(255, 20, 147, 0.4); padding: 60px; max-width: 900px; width: 100%; text-align: center; animation: slideUp 0.8s ease-out; }
        @keyframes slideUp { from { opacity: 0; transform: translateY(50px); } to { opacity: 1; transform: translateY(0); } }
        h1 { color: #ff1493; font-size: 2.8em; margin: 20px 0 10px 0; }
        .subtitle { color: #ff69b4; font-size: 1.3em; margin-bottom: 10px; }
        .bio { color: #666; font-size: 1em; margin-bottom: 30px; }
        .info-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 20px; margin: 40px 0; }
        .info-card { background: linear-gradient(135deg, #ff69b4, #ff1493); color: white; padding: 25px; border-radius: 20px; }
        .skills { display: flex; flex-wrap: wrap; justify-content: center; gap: 12px; margin: 40px 0; }
        .skill-tag { background: linear-gradient(135deg, #ff69b4, #ff1493); color: white; padding: 10px 20px; border-radius: 25px; font-size: 0.9em; font-weight: bold; }
        .buttons { display: flex; justify-content: center; gap: 15px; margin: 40px 0; flex-wrap: wrap; }
        .btn { background: linear-gradient(135deg, #ff69b4, #ff1493); color: white; padding: 12px 24px; border: none; border-radius: 25px; text-decoration: none; font-weight: bold; cursor: pointer; }
        .analytics { background: #fff0f5; padding: 20px; border-radius: 20px; margin: 30px 0; text-align: left; }
        .stat { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #ffb6d9; }
        @media (max-width: 768px) { .container { padding: 30px; } h1 { font-size: 2em; } .buttons { flex-direction: column; } .btn { width: 100%; } }
    </style>
</head>
<body>
    <div class="container">
        <h1>✨ Allison Amber Hage ✨</h1>
        <p class="subtitle">💕 Digital Creator & Content Enthusiast 💕</p>
        <p class="bio">Passionate about creating engaging content and connecting with amazing people around the world 💫</p>
        <div class="info-grid">
            <div class="info-card"><h3>📱 Platform</h3><p>Instagram</p></div>
            <div class="info-card"><h3>🌍 Reach</h3><p>Global</p></div>
            <div class="info-card"><h3>💡 Focus</h3><p>Content</p></div>
            <div class="info-card"><h3>⭐ Passion</h3><p>Creativity</p></div>
        </div>
        <div class="skills">
            <span class="skill-tag">✨ Content Creation</span>
            <span class="skill-tag">📸 Photography</span>
            <span class="skill-tag">💬 Social Media</span>
            <span class="skill-tag">📖 Storytelling</span>
            <span class="skill-tag">🎨 Creative Design</span>
            <span class="skill-tag">👥 Community</span>
            <span class="skill-tag">📢 Marketing</span>
            <span class="skill-tag">👑 Influencer</span>
        </div>
        <div class="analytics">
            <h3>📊 Profile Analytics</h3>
            <div class="stat"><span>Total Visitors:</span><span id="total-visitors">Loading...</span></div>
            <div class="stat"><span>Visitors Today:</span><span id="today-visitors">Loading...</span></div>
            <div class="stat"><span>Top Browser:</span><span id="top-browser">Loading...</span></div>
            <div class="stat"><span>Top Country:</span><span id="top-country">Loading...</span></div>
        </div>
        <div class="buttons">
            <a href="https://www.instagram.com/allisonamberhage/" target="_blank" class="btn">📸 Follow on Instagram</a>
            <a href="/privacy-policy" class="btn">🔒 Privacy Policy</a>
            <a href="/api/health" class="btn">💚 System Status</a>
        </div>
    </div>
    <script>
        async function loadAnalytics() {
            try {
                const response = await fetch('/api/analytics');
                const data = await response.json();
                document.getElementById('total-visitors').textContent = (data.totalVisitors || 0).toLocaleString();
                document.getElementById('today-visitors').textContent = (data.visitors24h || 0).toLocaleString();
            } catch (error) {
                document.getElementById('total-visitors').textContent = '0';
                document.getElementById('today-visitors').textContent = '0';
            }
            try {
                const browsersResponse = await fetch('/api/stats');
                const browsersData = await browsersResponse.json();
                if (browsersData && browsersData.length > 0) {
                    document.getElementById('top-browser').textContent = browsersData[0].browser_name || 'N/A';
                } else {
                    document.getElementById('top-browser').textContent = 'N/A';
                }
            } catch (error) {
                document.getElementById('top-browser').textContent = 'N/A';
            }
            try {
                const countriesResponse = await fetch('/api/countries');
                const countriesData = await countriesResponse.json();
                if (countriesData && countriesData.length > 0) {
                    document.getElementById('top-country').textContent = countriesData[0].country_code || 'N/A';
                } else {
                    document.getElementById('top-country').textContent = 'N/A';
                }
            } catch (error) {
                document.getElementById('top-country').textContent = 'N/A';
            }
        }
        document.addEventListener('DOMContentLoaded', loadAnalytics);
        setInterval(loadAnalytics, 30000);
    </script>
</body>
</html>`;
  res.setHeader('Content-Type', 'text/html');
  res.send(html);
});

// Analytics dashboard
app.get('/princess', (req, res) => {
  const html = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Analytics Dashboard - Allison Amber Hage</title>
    <link rel="icon" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='75' font-size='75' fill='%23ff69b4'>📊</text></svg>" type="image/svg+xml">
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: 'Arial', sans-serif; background: linear-gradient(135deg, #ff69b4 0%, #ff1493 25%, #ff69b4 50%, #da70d6 75%, #ff69b4 100%); background-size: 400% 400%; min-height: 100vh; padding: 20px; }
        .container { max-width: 1200px; margin: 0 auto; }
        .header { background: white; border-radius: 20px; padding: 30px; margin-bottom: 30px; box-shadow: 0 10px 30px rgba(255, 20, 147, 0.3); text-align: center; }
        .header h1 { color: #ff1493; margin-bottom: 10px; }
        .dashboard-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 20px; margin-bottom: 30px; }
        .card { background: white; border-radius: 20px; padding: 25px; box-shadow: 0 10px 30px rgba(255, 20, 147, 0.3); }
        .card h2 { color: #ff1493; margin-bottom: 15px; font-size: 1.2em; }
        .stat { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #ffb6d9; color: #333; }
        .stat-value { font-weight: bold; color: #ff1493; }
        .back-link { display: inline-block; padding: 12px 24px; background: linear-gradient(135deg, #ff69b4, #ff1493); color: white; text-decoration: none; border-radius: 20px; margin-bottom: 20px; }
    </style>
</head>
<body>
    <div class="container">
        <a href="/" class="back-link">← Back to Portfolio</a>
        <div class="header">
            <h1>📊 Analytics Dashboard</h1>
            <p>Real-time visitor analytics and insights</p>
        </div>
        <div class="dashboard-grid">
            <div class="card">
                <h2>📈 Overall Statistics</h2>
                <div class="stat"><span>Total Visitors:</span><span class="stat-value" id="total-visitors">Loading...</span></div>
                <div class="stat"><span>Visitors (24h):</span><span class="stat-value" id="visitors-24h">Loading...</span></div>
                <div class="stat"><span>Top Browser:</span><span class="stat-value" id="top-browser">Loading...</span></div>
                <div class="stat"><span>Top Country:</span><span class="stat-value" id="top-country">Loading...</span></div>
            </div>
        </div>
    </div>
    <script>
        async function loadDashboard() {
            try {
                const analyticsResponse = await fetch('/api/analytics');
                const analyticsData = await analyticsResponse.json();
                document.getElementById('total-visitors').textContent = (analyticsData.totalVisitors || 0).toLocaleString();
                document.getElementById('visitors-24h').textContent = (analyticsData.visitors24h || 0).toLocaleString();
            } catch (error) {
                console.error('Error loading analytics:', error);
            }
            try {
                const browsersResponse = await fetch('/api/stats');
                const browsersData = await browsersResponse.json();
                if (browsersData && browsersData.length > 0) {
                    document.getElementById('top-browser').textContent = browsersData[0].browser_name || 'N/A';
                } else {
                    document.getElementById('top-browser').textContent = 'N/A';
                }
            } catch (error) {
                document.getElementById('top-browser').textContent = 'N/A';
            }
            try {
                const countriesResponse = await fetch('/api/countries');
                const countriesData = await countriesResponse.json();
                if (countriesData && countriesData.length > 0) {
                    document.getElementById('top-country').textContent = countriesData[0].country_code || 'N/A';
                } else {
                    document.getElementById('top-country').textContent = 'N/A';
                }
            } catch (error) {
                document.getElementById('top-country').textContent = 'N/A';
            }
        }
        document.addEventListener('DOMContentLoaded', loadDashboard);
        setInterval(loadDashboard, 60000);
    </script>
</body>
</html>`;
  res.setHeader('Content-Type', 'text/html');
  res.send(html);
});

// Privacy policy
app.get('/privacy-policy', (req, res) => {
  const html = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Privacy Policy - Allison Amber Hage</title>
    <link rel="icon" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='75' font-size='75' fill='%23ff69b4'>🔒</text></svg>" type="image/svg+xml">
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: 'Arial', sans-serif; background: linear-gradient(135deg, #ff69b4 0%, #ff1493 25%, #ff69b4 50%, #da70d6 75%, #ff69b4 100%); background-size: 400% 400%; min-height: 100vh; padding: 40px 20px; }
        .container { background: white; border-radius: 20px; box-shadow: 0 20px 60px rgba(255, 20, 147, 0.4); padding: 40px; max-width: 900px; margin: 0 auto; }
        h1 { color: #ff1493; margin-bottom: 30px; text-align: center; }
        h2 { color: #ff69b4; margin-top: 30px; margin-bottom: 15px; }
        p { color: #333; line-height: 1.6; margin-bottom: 15px; }
        ul { color: #333; margin-left: 20px; margin-bottom: 15px; }
        li { margin-bottom: 10px; }
        .back-link { display: inline-block; margin-top: 30px; padding: 10px 20px; background: linear-gradient(135deg, #ff69b4, #ff1493); color: white; text-decoration: none; border-radius: 20px; }
    </style>
</head>
<body>
    <div class="container">
        <h1>🔒 Privacy Policy</h1>
        <h2>Introduction</h2>
        <p>Welcome to Allison Amber Hage's portfolio website. We are committed to protecting your privacy and ensuring you have a positive experience on our website.</p>
        <h2>Information We Collect</h2>
        <p>We may collect information about you in a variety of ways including:</p>
        <ul>
            <li><strong>Personal Information:</strong> Name, email address, and other details you voluntarily provide</li>
            <li><strong>Device Information:</strong> Browser type, operating system, and device type</li>
            <li><strong>Usage Information:</strong> Pages visited, time spent on pages, and referral sources</li>
            <li><strong>Location Information:</strong> General geographic location based on IP address</li>
        </ul>
        <h2>How We Use Your Information</h2>
        <p>We use the information we collect to understand how visitors use our website, improve website functionality, and analyze trends.</p>
        <h2>Data Security</h2>
        <p>We implement appropriate technical and organizational measures to protect your personal information against unauthorized access.</p>
        <h2>Your Rights</h2>
        <p>You have the right to access, correct, or request deletion of your personal information.</p>
        <a href="/" class="back-link">← Back to Portfolio</a>
    </div>
</body>
</html>`;
  res.setHeader('Content-Type', 'text/html');
  res.send(html);
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
