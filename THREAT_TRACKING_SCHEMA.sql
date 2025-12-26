-- Threat Detection and OSINT Tables

-- Threat assessments table
CREATE TABLE IF NOT EXISTS threat_assessments (
  id BIGSERIAL PRIMARY KEY,
  
  visitor_id BIGINT REFERENCES visitors(id) ON DELETE CASCADE,
  ip_address VARCHAR(45),
  
  -- Risk Scoring
  overall_risk_score DECIMAL(5, 2),
  overall_risk_level VARCHAR(20), -- 'low', 'medium', 'high', 'critical'
  
  -- Component Scores
  user_agent_risk DECIMAL(5, 2),
  ip_risk DECIMAL(5, 2),
  pattern_risk DECIMAL(5, 2),
  fingerprint_risk DECIMAL(5, 2),
  
  -- Threat Details
  threats JSONB,
  threat_count INTEGER DEFAULT 0,
  
  -- Classification
  is_bot BOOLEAN DEFAULT false,
  is_vpn BOOLEAN DEFAULT false,
  is_proxy BOOLEAN DEFAULT false,
  is_datacenter BOOLEAN DEFAULT false,
  is_tor BOOLEAN DEFAULT false,
  is_malicious BOOLEAN DEFAULT false,
  
  -- Investigation Data
  investigation_notes TEXT,
  investigated_by VARCHAR(100),
  
  -- Timestamps
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_threat_assessments_ip ON threat_assessments(ip_address);
CREATE INDEX IF NOT EXISTS idx_threat_assessments_risk_level ON threat_assessments(overall_risk_level);
CREATE INDEX IF NOT EXISTS idx_threat_assessments_created_at ON threat_assessments(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_threat_assessments_is_malicious ON threat_assessments(is_malicious);

-- IP reputation table
CREATE TABLE IF NOT EXISTS ip_reputation (
  id BIGSERIAL PRIMARY KEY,
  
  ip_address VARCHAR(45) UNIQUE NOT NULL,
  
  -- Reputation Metrics
  reputation_score DECIMAL(5, 2), -- 0-100, lower is worse
  abuse_reports INTEGER DEFAULT 0,
  malware_detections INTEGER DEFAULT 0,
  spam_reports INTEGER DEFAULT 0,
  
  -- Classification
  ip_type VARCHAR(50), -- 'residential', 'datacenter', 'vpn', 'proxy', 'tor', 'unknown'
  isp_name VARCHAR(200),
  organization VARCHAR(200),
  
  -- Geolocation (more accurate than geoip-lite)
  country_code VARCHAR(2),
  country_name VARCHAR(100),
  region VARCHAR(100),
  city VARCHAR(100),
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  
  -- Threat Intelligence
  is_blacklisted BOOLEAN DEFAULT false,
  blacklist_sources JSONB,
  last_seen_malicious TIMESTAMP,
  
  -- Timestamps
  first_seen TIMESTAMP DEFAULT NOW(),
  last_updated TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_ip_reputation_ip ON ip_reputation(ip_address);
CREATE INDEX IF NOT EXISTS idx_ip_reputation_reputation_score ON ip_reputation(reputation_score);
CREATE INDEX IF NOT EXISTS idx_ip_reputation_is_blacklisted ON ip_reputation(is_blacklisted);
CREATE INDEX IF NOT EXISTS idx_ip_reputation_country ON ip_reputation(country_code);

-- Attack patterns table
CREATE TABLE IF NOT EXISTS attack_patterns (
  id BIGSERIAL PRIMARY KEY,
  
  -- Pattern Information
  pattern_type VARCHAR(50), -- 'sql_injection', 'xss', 'path_traversal', 'brute_force', 'ddos', 'scraping'
  pattern_name VARCHAR(100),
  pattern_signature VARCHAR(500),
  
  -- Detection
  detection_count INTEGER DEFAULT 0,
  first_detected TIMESTAMP DEFAULT NOW(),
  last_detected TIMESTAMP DEFAULT NOW(),
  
  -- Severity
  severity VARCHAR(20), -- 'low', 'medium', 'high', 'critical'
  
  -- Response
  auto_block BOOLEAN DEFAULT false,
  block_duration_minutes INTEGER,
  
  -- Metadata
  description TEXT,
  mitigation_steps TEXT,
  
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_attack_patterns_type ON attack_patterns(pattern_type);
CREATE INDEX IF NOT EXISTS idx_attack_patterns_severity ON attack_patterns(severity);

-- Blocked IPs table
CREATE TABLE IF NOT EXISTS blocked_ips (
  id BIGSERIAL PRIMARY KEY,
  
  ip_address VARCHAR(45) UNIQUE NOT NULL,
  
  -- Block Information
  block_reason VARCHAR(200),
  block_type VARCHAR(50), -- 'temporary', 'permanent', 'manual'
  
  -- Timing
  blocked_at TIMESTAMP DEFAULT NOW(),
  unblock_at TIMESTAMP,
  
  -- Details
  threat_level VARCHAR(20),
  attack_count INTEGER DEFAULT 0,
  
  -- Admin Info
  blocked_by VARCHAR(100),
  notes TEXT,
  
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_blocked_ips_ip ON blocked_ips(ip_address);
CREATE INDEX IF NOT EXISTS idx_blocked_ips_blocked_at ON blocked_ips(blocked_at DESC);
CREATE INDEX IF NOT EXISTS idx_blocked_ips_unblock_at ON blocked_ips(unblock_at);

-- Suspicious activity log
CREATE TABLE IF NOT EXISTS suspicious_activity_log (
  id BIGSERIAL PRIMARY KEY,
  
  visitor_id BIGINT REFERENCES visitors(id) ON DELETE CASCADE,
  ip_address VARCHAR(45),
  
  -- Activity Details
  activity_type VARCHAR(50), -- 'rapid_requests', 'unusual_pattern', 'known_attack', 'anomaly'
  activity_description TEXT,
  
  -- Metrics
  request_count INTEGER,
  time_window_seconds INTEGER,
  
  -- Response
  action_taken VARCHAR(100), -- 'logged', 'rate_limited', 'blocked', 'flagged'
  
  -- Investigation
  is_investigated BOOLEAN DEFAULT false,
  investigation_result VARCHAR(100),
  
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_suspicious_activity_ip ON suspicious_activity_log(ip_address);
CREATE INDEX IF NOT EXISTS idx_suspicious_activity_type ON suspicious_activity_log(activity_type);
CREATE INDEX IF NOT EXISTS idx_suspicious_activity_created_at ON suspicious_activity_log(created_at DESC);

-- Fingerprint analysis table
CREATE TABLE IF NOT EXISTS fingerprint_analysis (
  id BIGSERIAL PRIMARY KEY,
  
  visitor_id BIGINT REFERENCES visitors(id) ON DELETE CASCADE,
  
  -- Fingerprint Components
  canvas_fingerprint VARCHAR(1000),
  audio_fingerprint VARCHAR(1000),
  webgl_fingerprint VARCHAR(1000),
  font_fingerprint JSONB,
  
  -- Analysis
  fingerprint_consistency DECIMAL(5, 2), -- 0-100, how consistent across visits
  spoofing_detected BOOLEAN DEFAULT false,
  spoofing_confidence DECIMAL(5, 2),
  
  -- Matching
  matches_known_fingerprints INTEGER DEFAULT 0,
  is_unique BOOLEAN DEFAULT true,
  
  -- Timestamps
  first_seen TIMESTAMP DEFAULT NOW(),
  last_seen TIMESTAMP DEFAULT NOW(),
  
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_fingerprint_analysis_visitor ON fingerprint_analysis(visitor_id);
CREATE INDEX IF NOT EXISTS idx_fingerprint_analysis_spoofing ON fingerprint_analysis(spoofing_detected);

-- Enable RLS
ALTER TABLE threat_assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE ip_reputation ENABLE ROW LEVEL SECURITY;
ALTER TABLE attack_patterns ENABLE ROW LEVEL SECURITY;
ALTER TABLE blocked_ips ENABLE ROW LEVEL SECURITY;
ALTER TABLE suspicious_activity_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE fingerprint_analysis ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Allow public read on threat_assessments" ON threat_assessments FOR SELECT USING (true);
CREATE POLICY "Allow public insert on threat_assessments" ON threat_assessments FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public read on ip_reputation" ON ip_reputation FOR SELECT USING (true);
CREATE POLICY "Allow public insert on ip_reputation" ON ip_reputation FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public read on attack_patterns" ON attack_patterns FOR SELECT USING (true);
CREATE POLICY "Allow public read on blocked_ips" ON blocked_ips FOR SELECT USING (true);
CREATE POLICY "Allow public read on suspicious_activity_log" ON suspicious_activity_log FOR SELECT USING (true);
CREATE POLICY "Allow public read on fingerprint_analysis" ON fingerprint_analysis FOR SELECT USING (true);
