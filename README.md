# Portfolio Analytics System

A comprehensive analytics tracking system for portfolio websites with privacy compliance, security features, and real-time visitor insights.

## Features

- 📊 Real-time visitor analytics and tracking
- 🌍 Geolocation tracking and country statistics
- 🌐 Browser and device detection
- 📱 Responsive dashboard
- 🔒 Privacy-compliant data collection
- 🛡️ Advanced security middleware
- 📈 Visitor timeline and growth metrics
- 🎨 Beautiful UI with gradient animations

## Tech Stack

- **Backend:** Node.js with Express
- **Database:** Supabase (PostgreSQL)
- **Hosting:** Vercel
- **Analytics:** Custom tracking system
- **Security:** Rate limiting, input validation, XSS/SQL injection prevention

## Installation

### Prerequisites

- Node.js >= 18.0.0
- npm or yarn
- Supabase account

### Local Setup

1. Clone the repository:
```bash
git clone <repository-url>
cd portfolio-analytics
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file with your Supabase credentials:
```env
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
NODE_ENV=development
PORT=3000
```

4. Start the development server:
```bash
npm run dev
```

The application will be available at `http://localhost:3000`

## Deployment

### Deploy to Vercel

1. Push your code to GitHub
2. Connect your repository to Vercel
3. Vercel will automatically detect the `vercel.json` configuration
4. Set environment variables in Vercel dashboard:
   - `SUPABASE_URL`
   - `SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `NODE_ENV=production`

5. Deploy!

### Manual Deployment

```bash
npm run build
npm start
```

## API Endpoints

### Tracking
- `POST /api/track` - Record visitor data

### Analytics
- `GET /api/analytics` - Get overall analytics summary
- `GET /api/countries` - Get visitor statistics by country
- `GET /api/stats` - Get browser statistics
- `GET /api/devices` - Get device type statistics
- `GET /api/timeline` - Get visitor timeline data
- `GET /api/top-pages` - Get top pages visited
- `GET /api/referrers` - Get referrer statistics
- `GET /api/health` - Get system health status
- `GET /api/privacy-stats` - Get privacy compliance statistics

### Consent
- `POST /api/consent` - Manage user consent

## Project Structure

```
.
├── analytics_server.js       # Main server file
├── api/
│   └── analytics.js          # Vercel serverless function
├── dashboard.html            # Main portfolio dashboard
├── princess_dashboard.html   # Analytics dashboard
├── privacy_policy.html       # Privacy policy page
├── dashboard_backend.js      # Analytics data aggregation
├── supabase_client.js        # Supabase client initialization
├── logging.js                # Logging and error handling
├── validation.js             # Data validation and sanitization
├── security.js               # Security middleware
├── privacy.js                # Privacy compliance utilities
├── fingerprinting.js         # Browser fingerprinting
├── package.json              # Dependencies
├── vercel.json               # Vercel configuration
└── .env                      # Environment variables
```

## Security Features

- Rate limiting (100 requests per 15 minutes)
- Input validation and sanitization
- SQL injection prevention
- XSS protection
- CORS middleware
- Security headers (X-Frame-Options, X-Content-Type-Options, etc.)
- Bot detection
- IP anonymization option

## Privacy Features

- GDPR-compliant data collection
- Consent management
- IP anonymization
- Data retention policies (2 years default)
- User data deletion capability
- Privacy policy page

## Database Schema

The system uses a `visitors` table with the following columns:
- `id` - Unique identifier
- `ip_address` - Visitor IP (anonymized)
- `user_agent` - Browser user agent
- `browser_name` - Detected browser
- `browser_version` - Browser version
- `os_name` - Operating system
- `device_type` - Device type (Mobile/Tablet/Desktop)
- `screen_width`, `screen_height` - Screen resolution
- `viewport_width`, `viewport_height` - Viewport size
- `country_code`, `region`, `city` - Geolocation
- `latitude`, `longitude` - Coordinates
- `referrer` - Referrer URL
- `page_visited` - Page URL
- `canvas_fingerprint` - Canvas fingerprint
- `audio_fingerprint` - Audio fingerprint
- `webgl_renderer` - WebGL renderer info
- `timezone` - Timezone
- `consent_granted` - Privacy consent status
- `created_at` - Timestamp

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `SUPABASE_URL` | Supabase project URL | Yes |
| `SUPABASE_ANON_KEY` | Supabase anonymous key | Yes |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key | Yes |
| `NODE_ENV` | Environment (development/production) | No |
| `PORT` | Server port | No |

## Performance

- Optimized database queries with proper indexing
- Efficient data aggregation
- Caching strategies for frequently accessed data
- Minimal payload sizes
- Gzip compression support

## Monitoring

The system includes comprehensive logging:
- Request logging with duration tracking
- Error logging with stack traces
- Privacy compliance logging
- Security event logging

Logs are stored in `./logs/analytics.log` (configurable)

## Troubleshooting

### Port Already in Use
```bash
# Change PORT in .env or use:
PORT=3001 npm start
```

### Database Connection Issues
- Verify Supabase credentials in `.env`
- Check network connectivity
- Ensure Supabase project is active

### Missing Environment Variables
- Copy `.env.example` to `.env`
- Fill in all required variables
- Restart the server

## License

MIT

## Support

For issues and questions, please open an issue on GitHub or contact through the portfolio website.

## Changelog

### v1.0.0 (2025-12-25)
- Initial release
- Core analytics tracking
- Privacy compliance
- Security features
- Dashboard UI
- Vercel deployment ready
