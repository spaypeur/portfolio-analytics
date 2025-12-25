// Analytics dashboard backend with data aggregation functions
const { supabase } = require('./supabase_client');
const { Logger, ErrorHandler } = require('./logging');
const DataValidator = require('./validation');

class DashboardBackend {
  constructor() {
    this.logger = new Logger({ logLevel: 'info', logToFile: true });
    this.errorHandler = new ErrorHandler(this.logger);
    this.validator = new DataValidator();
  }

  // Get overall analytics summary
  async getAnalyticsSummary() {
    try {
      // Get basic analytics data
      const { data: basicData, error: basicError } = await supabase
        .from('visitors')
        .select(`
          count(*) as total_visitors,
          count(DISTINCT ip_address) as unique_visitors
        `)
        .gt('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString());

      if (basicError) {
        throw basicError;
      }

      // Get visitors in last 24 hours
      const { data: data24h, error: error24h } = await supabase
        .from('visitors')
        .select('count(DISTINCT ip_address) as visitors_24h')
        .gt('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString());

      // Get visitors in last 7 days
      const { data: data7d, error: error7d } = await supabase
        .from('visitors')
        .select('count(DISTINCT ip_address) as visitors_7d')
        .gt('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString());

      // Get visitors in last 30 days
      const { data: data30d, error: error30d } = await supabase
        .from('visitors')
        .select('count(DISTINCT ip_address) as visitors_30d')
        .gt('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString());

      // Calculate growth rate
      const { data: prevData, error: prevError } = await supabase
        .from('visitors')
        .select('count(DISTINCT ip_address) as prev_visitors')
        .gte('created_at', new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString())
        .lt('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString());

      const currentVisitors = parseInt(data7d[0]?.visitors_7d || 0);
      const previousVisitors = parseInt(prevData[0]?.prev_visitors || 0);
      const growthRate = previousVisitors > 0 
        ? ((currentVisitors - previousVisitors) / previousVisitors) * 100 
        : currentVisitors > 0 ? 100 : 0;

      return {
        totalVisitors: parseInt(basicData[0]?.total_visitors || 0),
        uniqueVisitors: parseInt(basicData[0]?.unique_visitors || 0),
        visitors24h: parseInt(data24h[0]?.visitors_24h || 0),
        visitors7d: parseInt(data7d[0]?.visitors_7d || 0),
        visitors30d: parseInt(data30d[0]?.visitors_30d || 0),
        growthRate: parseFloat(growthRate.toFixed(2)),
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      this.logger.error('Error fetching analytics summary', {
        error: error.message,
        stack: error.stack
      });
      throw error;
    }
  }

  // Get visitor statistics by browser
  async getBrowserStats() {
    try {
      const { data, error } = await supabase
        .from('visitors')
        .select('browser_name, count(*) as count')
        .gt('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())
        .order('count', { ascending: false })
        .limit(10);

      if (error) {
        throw error;
      }

      return data || [];
    } catch (error) {
      this.logger.error('Error fetching browser stats', {
        error: error.message,
        stack: error.stack
      });
      throw error;
    }
  }

  // Get visitor statistics by device type
  async getDeviceStats() {
    try {
      const { data, error } = await supabase
        .from('visitors')
        .select('device_type, count(*) as count')
        .gt('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())
        .order('count', { ascending: false });

      if (error) {
        throw error;
      }

      return data || [];
    } catch (error) {
      this.logger.error('Error fetching device stats', {
        error: error.message,
        stack: error.stack
      });
      throw error;
    }
  }

  // Get visitor statistics by country
  async getCountryStats() {
    try {
      const { data, error } = await supabase
        .from('visitors')
        .select('country_code, count(*) as count')
        .not('country_code', 'is', null)
        .gt('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())
        .order('count', { ascending: false })
        .limit(10);

      if (error) {
        throw error;
      }

      return data || [];
    } catch (error) {
      this.logger.error('Error fetching country stats', {
        error: error.message,
        stack: error.stack
      });
      throw error;
    }
  }

  // Get visitor timeline data (for charts)
  async getVisitorTimeline(days = 30) {
    try {
      // Get daily visitor counts
      const { data, error } = await supabase
        .from('visitors')
        .select(`
          date_trunc('day', created_at) as date,
          count(*) as visitors,
          count(DISTINCT ip_address) as unique_visitors
        `)
        .gt('created_at', new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString())
        .group('date')
        .order('date', { ascending: true });

      if (error) {
        throw error;
      }

      // Format the data for the chart
      return data.map(row => ({
        date: new Date(row.date).toISOString().split('T')[0],
        visitors: parseInt(row.visitors),
        uniqueVisitors: parseInt(row.unique_visitors)
      }));
    } catch (error) {
      this.logger.error('Error fetching visitor timeline', {
        error: error.message,
        stack: error.stack
      });
      throw error;
    }
  }

  // Get top pages visited
  async getTopPages(limit = 10) {
    try {
      const { data, error } = await supabase
        .from('visitors')
        .select('page_visited, count(*) as visits')
        .not('page_visited', 'is', null)
        .gt('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())
        .order('visits', { ascending: false })
        .limit(limit);

      if (error) {
        throw error;
      }

      return data || [];
    } catch (error) {
      this.logger.error('Error fetching top pages', {
        error: error.message,
        stack: error.stack
      });
      throw error;
    }
  }

  // Get referrer statistics
  async getReferrerStats(limit = 10) {
    try {
      const { data, error } = await supabase
        .from('visitors')
        .select('referrer, count(*) as visits')
        .gt('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())
        .order('visits', { ascending: false })
        .limit(limit);

      if (error) {
        throw error;
      }

      return data || [];
    } catch (error) {
      this.logger.error('Error fetching referrer stats', {
        error: error.message,
        stack: error.stack
      });
      throw error;
    }
  }

  // Get system health status
  async getSystemHealth() {
    try {
      // Test database connection
      const { data, error } = await supabase
        .from('visitors')
        .select('count(*)', { head: true, count: 'exact' })
        .limit(1);

      const dbStatus = !error ? 'healthy' : 'unhealthy';

      // Get recent visitor count
      const { data: recentData, error: recentError } = await supabase
        .from('visitors')
        .select('count(*)', { head: true, count: 'exact' })
        .gt('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString());

      return {
        status: dbStatus,
        database: dbStatus,
        recentVisitors: recentError ? 0 : parseInt(recentData[0]?.count || 0),
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      this.logger.error('Error checking system health', {
        error: error.message,
        stack: error.stack
      });
      return {
        status: 'unhealthy',
        database: 'unhealthy',
        error: error.message,
        timestamp: new Date().toISOString()
      };
    }
  }

  // Get privacy compliance data
  async getPrivacyComplianceStats() {
    try {
      const { data, error } = await supabase
        .from('visitors')
        .select(`
          count(*) as total_records,
          count(CASE WHEN consent_granted = true THEN 1 END) as consented_records,
          count(CASE WHEN consent_granted = false THEN 1 END) as non_consented_records
        `);

      if (error) {
        throw error;
      }

      const total = parseInt(data[0]?.total_records || 0);
      const consented = parseInt(data[0]?.consented_records || 0);

      return {
        totalRecords: total,
        consentedRecords: consented,
        nonConsentedRecords: parseInt(data[0]?.non_consented_records || 0),
        consentRate: total > 0 ? parseFloat(((consented / total) * 100).toFixed(2)) : 0
      };
    } catch (error) {
      this.logger.error('Error fetching privacy compliance stats', {
        error: error.message,
        stack: error.stack
      });
      throw error;
    }
  }
}

module.exports = DashboardBackend;