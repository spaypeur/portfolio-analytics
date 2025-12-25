require('dotenv').config();
const express = require('express');
const geoip = require('geoip-lite');
const fs = require('fs');
const path = require('path');
const { supabase } = require('../supabase_client');

const app = express();
app.use(express.json({ limit: '10mb' }));

// Serve static files (images)
app.use(express.static(path.join(__dirname, '..')));

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

// Serve image
app.get('/470606673_18027556940622246_493275031728217966_n.jpg', (req, res) => {
  const imagePath = path.join(__dirname, '..', '470606673_18027556940622246_493275031728217966_n.jpg');
  res.sendFile(imagePath, (err) => {
    if (err) {
      res.status(404).send('Image not found');
    }
  });
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
        .avatar-wrapper { margin-bottom: 40px; animation: bounceIn 1s ease-out 0.2s both; }
        @keyframes bounceIn { 0% { opacity: 0; transform: scale(0.3); } 50% { opacity: 1; } 100% { opacity: 1; transform: scale(1); } }
        .avatar-img { width: 200px; height: 200px; border-radius: 50%; border: 8px solid #ff69b4; object-fit: cover; display: block; margin: 0 auto; box-shadow: 0 10px 40px rgba(255, 20, 147, 0.5); transition: transform 0.3s ease, box-shadow 0.3s ease; }
        .avatar-img:hover { transform: scale(1.1); box-shadow: 0 15px 50px rgba(255, 20, 147, 0.7); }
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
        <div class="avatar-wrapper">
            <img src="/470606673_18027556940622246_493275031728217966_n.jpg" alt="Allison" class="avatar-img" onerror="this.style.display='none'">
        </div>
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
        <div class="buttons">
            <a href="https://www.instagram.com/allisonamberhage/" target="_blank" class="btn">📸 Follow on Instagram</a>
            <a href="/privacy-policy" class="btn">🔒 Privacy Policy</a>
        </div>
    </div>
    <script>
        // Analytics tracking - sends visitor data to server
        async function trackVisitor() {
            try {
                await fetch('/api/track', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        userAgent: navigator.userAgent,
                        browserName: 'Unknown',
                        osName: 'Unknown',
                        deviceType: 'Desktop',
                        screenWidth: window.screen.width,
                        screenHeight: window.screen.height,
                        language: navigator.language,
                        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
                    })
                });
            } catch (error) {
                console.log('Tracking sent');
            }
        }
        document.addEventListener('DOMContentLoaded', trackVisitor);
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
    // Get total visitors count
    const { count: totalCount, error: totalError } = await supabase
      .from('visitors')
      .select('*', { count: 'exact', head: true });

    if (totalError) throw totalError;

    res.status(200).json({
      totalVisitors: totalCount || 0,
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
      .select('country_code')
      .not('country_code', 'is', null)
      .order('created_at', { ascending: false })
      .limit(100);

    if (error) throw error;

    // Count occurrences
    const countMap = {};
    data.forEach(row => {
      countMap[row.country_code] = (countMap[row.country_code] || 0) + 1;
    });

    const result = Object.entries(countMap)
      .map(([country_code, count]) => ({ country_code, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    res.status(200).json(result);
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
      .select('browser_name')
      .not('browser_name', 'is', null)
      .order('created_at', { ascending: false })
      .limit(100);

    if (error) throw error;

    // Count occurrences
    const countMap = {};
    data.forEach(row => {
      countMap[row.browser_name] = (countMap[row.browser_name] || 0) + 1;
    });

    const result = Object.entries(countMap)
      .map(([browser_name, count]) => ({ browser_name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    res.status(200).json(result);
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
      .select('device_type')
      .not('device_type', 'is', null)
      .order('created_at', { ascending: false })
      .limit(100);

    if (error) throw error;

    // Count occurrences
    const countMap = {};
    data.forEach(row => {
      countMap[row.device_type] = (countMap[row.device_type] || 0) + 1;
    });

    const result = Object.entries(countMap)
      .map(([device_type, count]) => ({ device_type, count }))
      .sort((a, b) => b.count - a.count);

    res.status(200).json(result);
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
    console.log('Health check - SUPABASE_URL:', process.env.SUPABASE_URL ? 'SET' : 'NOT SET');
    console.log('Health check - SUPABASE_SERVICE_ROLE_KEY:', process.env.SUPABASE_SERVICE_ROLE_KEY ? 'SET' : 'NOT SET');
    
    const { data, error } = await supabase
      .from('visitors')
      .select('count(*)', { head: true, count: 'exact' });

    if (error) {
      console.error('Supabase error:', error);
      throw error;
    }

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
    const { data, error, count } = await supabase
      .from('visitors')
      .select('*', { count: 'exact', head: true });

    if (error) throw error;

    res.status(200).json({
      totalRecords: count || 0,
      consentedRecords: count || 0,
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

// ============ COMPREHENSIVE ANALYTICS ENDPOINTS ============

// Get top pages
app.get('/api/top-pages', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    const { data, error } = await supabase
      .from('visitors')
      .select('page_visited')
      .not('page_visited', 'is', null)
      .order('created_at', { ascending: false })
      .limit(100);

    if (error) throw error;

    const countMap = {};
    data.forEach(row => {
      countMap[row.page_visited] = (countMap[row.page_visited] || 0) + 1;
    });

    const result = Object.entries(countMap)
      .map(([page_visited, count]) => ({ page_visited, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, limit);

    res.status(200).json(result);
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
      .select('referrer')
      .not('referrer', 'is', null)
      .order('created_at', { ascending: false })
      .limit(100);

    if (error) throw error;

    const countMap = {};
    data.forEach(row => {
      countMap[row.referrer] = (countMap[row.referrer] || 0) + 1;
    });

    const result = Object.entries(countMap)
      .map(([referrer, count]) => ({ referrer, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, limit);

    res.status(200).json(result);
  } catch (error) {
    console.error('Error fetching referrers:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch referrer stats' });
  }
});

// Get OS statistics
app.get('/api/os-stats', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('visitors')
      .select('os_name')
      .not('os_name', 'is', null)
      .order('created_at', { ascending: false })
      .limit(100);

    if (error) throw error;

    const countMap = {};
    data.forEach(row => {
      countMap[row.os_name] = (countMap[row.os_name] || 0) + 1;
    });

    const result = Object.entries(countMap)
      .map(([os_name, count]) => ({ os_name, count }))
      .sort((a, b) => b.count - a.count);

    res.status(200).json(result);
  } catch (error) {
    console.error('Error fetching OS stats:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch OS stats' });
  }
});

// Get screen resolutions
app.get('/api/screen-resolutions', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('visitors')
      .select('screen_width, screen_height')
      .not('screen_width', 'is', null)
      .order('created_at', { ascending: false })
      .limit(100);

    if (error) throw error;

    const countMap = {};
    data.forEach(row => {
      const res = `${row.screen_width}x${row.screen_height}`;
      countMap[res] = (countMap[res] || 0) + 1;
    });

    const result = Object.entries(countMap)
      .map(([resolution, count]) => ({ resolution, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    res.status(200).json(result);
  } catch (error) {
    console.error('Error fetching screen resolutions:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch screen resolutions' });
  }
});

// Get languages
app.get('/api/languages', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('visitors')
      .select('language')
      .not('language', 'is', null)
      .order('created_at', { ascending: false })
      .limit(100);

    if (error) throw error;

    const countMap = {};
    data.forEach(row => {
      countMap[row.language] = (countMap[row.language] || 0) + 1;
    });

    const result = Object.entries(countMap)
      .map(([language, count]) => ({ language, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    res.status(200).json(result);
  } catch (error) {
    console.error('Error fetching languages:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch languages' });
  }
});

// Get visitor timeline (hourly)
app.get('/api/timeline', async (req, res) => {
  try {
    const days = parseInt(req.query.days) || 7;
    const { data, error } = await supabase
      .from('visitors')
      .select('created_at')
      .gte('created_at', new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString())
      .order('created_at', { ascending: true });

    if (error) throw error;

    // Group by day
    const dayMap = {};
    data.forEach(row => {
      const date = new Date(row.created_at).toISOString().split('T')[0];
      dayMap[date] = (dayMap[date] || 0) + 1;
    });

    const result = Object.entries(dayMap)
      .map(([date, count]) => ({ date, visitors: count }))
      .sort((a, b) => a.date.localeCompare(b.date));

    res.status(200).json(result);
  } catch (error) {
    console.error('Error fetching timeline:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch timeline' });
  }
});

// Get geographic heatmap data
app.get('/api/geo-heatmap', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('visitors')
      .select('latitude, longitude, country_code, city')
      .not('latitude', 'is', null)
      .not('longitude', 'is', null)
      .order('created_at', { ascending: false })
      .limit(1000);

    if (error) throw error;

    res.status(200).json(data || []);
  } catch (error) {
    console.error('Error fetching geo heatmap:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch geo heatmap' });
  }
});

// Get detailed visitor info
app.get('/api/visitors-detailed', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 50;
    const { data, error } = await supabase
      .from('visitors')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;

    res.status(200).json(data || []);
  } catch (error) {
    console.error('Error fetching detailed visitors:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch visitor details' });
  }
});

// Get browser versions
app.get('/api/browser-versions', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('visitors')
      .select('browser_name, browser_version')
      .not('browser_name', 'is', null)
      .order('created_at', { ascending: false })
      .limit(100);

    if (error) throw error;

    const countMap = {};
    data.forEach(row => {
      const key = `${row.browser_name} ${row.browser_version || 'Unknown'}`;
      countMap[key] = (countMap[key] || 0) + 1;
    });

    const result = Object.entries(countMap)
      .map(([browser, count]) => ({ browser, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 20);

    res.status(200).json(result);
  } catch (error) {
    console.error('Error fetching browser versions:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch browser versions' });
  }
});

// Get regions by country
app.get('/api/regions/:country', async (req, res) => {
  try {
    const { country } = req.params;
    const { data, error } = await supabase
      .from('visitors')
      .select('region')
      .eq('country_code', country.toUpperCase())
      .not('region', 'is', null)
      .order('created_at', { ascending: false })
      .limit(100);

    if (error) throw error;

    const countMap = {};
    data.forEach(row => {
      countMap[row.region] = (countMap[row.region] || 0) + 1;
    });

    const result = Object.entries(countMap)
      .map(([region, count]) => ({ region, count }))
      .sort((a, b) => b.count - a.count);

    res.status(200).json(result);
  } catch (error) {
    console.error('Error fetching regions:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch regions' });
  }
});

// Get cities by country
app.get('/api/cities/:country', async (req, res) => {
  try {
    const { country } = req.params;
    const { data, error } = await supabase
      .from('visitors')
      .select('city')
      .eq('country_code', country.toUpperCase())
      .not('city', 'is', null)
      .order('created_at', { ascending: false })
      .limit(100);

    if (error) throw error;

    const countMap = {};
    data.forEach(row => {
      countMap[row.city] = (countMap[row.city] || 0) + 1;
    });

    const result = Object.entries(countMap)
      .map(([city, count]) => ({ city, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 20);

    res.status(200).json(result);
  } catch (error) {
    console.error('Error fetching cities:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch cities' });
  }
});

// Get device brands
app.get('/api/device-brands', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('visitors')
      .select('device_brand')
      .not('device_brand', 'is', null)
      .order('created_at', { ascending: false })
      .limit(100);

    if (error) throw error;

    const countMap = {};
    data.forEach(row => {
      countMap[row.device_brand] = (countMap[row.device_brand] || 0) + 1;
    });

    const result = Object.entries(countMap)
      .map(([device_brand, count]) => ({ device_brand, count }))
      .sort((a, b) => b.count - a.count);

    res.status(200).json(result);
  } catch (error) {
    console.error('Error fetching device brands:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch device brands' });
  }
});

// Get summary statistics
app.get('/api/summary', async (req, res) => {
  try {
    const { count: totalCount } = await supabase
      .from('visitors')
      .select('*', { count: 'exact', head: true });

    const { count: todayCount } = await supabase
      .from('visitors')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString());

    const { count: weekCount } = await supabase
      .from('visitors')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString());

    const { count: monthCount } = await supabase
      .from('visitors')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString());

    res.status(200).json({
      totalVisitors: totalCount || 0,
      visitorsToday: todayCount || 0,
      visitorsThisWeek: weekCount || 0,
      visitorsThisMonth: monthCount || 0,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error fetching summary:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch summary' });
  }
});

module.exports = app;
