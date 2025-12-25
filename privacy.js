// Privacy compliance utilities
class PrivacyCompliance {
  constructor() {
    this.consentKey = 'analytics_consent';
    this.consent = this.getConsent();
  }

  // Check if user has given consent (for server-side, default to true)
  getConsent() {
    // In server-side environment, we don't have localStorage
    // Default to true for existing functionality, or implement server-side storage
    return { granted: true, timestamp: new Date().toISOString() };
  }

  // Set user consent (for server-side, this is a no-op)
  setConsent(granted, options = {}) {
    const consent = {
      granted: granted,
      timestamp: new Date().toISOString(),
      options: options
    };
    
    // In server-side environment, we don't set localStorage
    // Store in memory or implement server-side storage
    this.consent = consent;
    
    return consent;
  }

  // Show consent banner - client-side only function
  showConsentBanner() {
    // This function is for client-side only, do nothing in server-side
    return;
  }

  // Check if tracking is allowed
  canTrack() {
    // For server-side, default to true or implement server-side logic
    return true;
  }

  // Anonymize IP address
  anonymizeIp(ip) {
    try {
      // For IPv4
      if (ip.includes('.')) {
        const parts = ip.split('.');
        parts[3] = '0';
        return parts.join('.');
      }
      
      // For IPv6
      if (ip.includes(':')) {
        const parts = ip.split(':');
        for (let i = 4; i < parts.length; i++) {
          parts[i] = '0';
        }
        return parts.join(':');
      }
      
      return ip;
    } catch (e) {
      return ip;
    }
  }

  // Get data retention period in milliseconds
  getRetentionPeriod() {
    // Default to 2 years
    return 2 * 365 * 24 * 60 * 60 * 1000;
  }

  // Check if data should be retained
  shouldRetainData(timestamp) {
    const retentionPeriod = this.getRetentionPeriod();
    const now = new Date().getTime();
    const dataTime = new Date(timestamp).getTime();
    
    return (now - dataTime) < retentionPeriod;
  }

  // Delete user data by IP
  async deleteUserData(ip, supabaseClient) {
    try {
      if (!supabaseClient) {
        throw new Error('Supabase client required for data deletion');
      }

      const { error } = await supabaseClient
        .from('visitors')
        .delete()
        .eq('ip_address', ip);

      if (error) {
        throw error;
      }

      return { success: true };
    } catch (error) {
      console.error('Error deleting user data:', error);
      return { success: false, error: error.message };
    }
  }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = PrivacyCompliance;
}