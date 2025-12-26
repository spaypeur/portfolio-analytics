# Advanced Security & OSINT Tracking Guide

## Overview

This guide covers the sophisticated threat detection, OSINT analysis, and attacker investigation capabilities built into your analytics system.

## Key Features

### 1. Threat Assessment System

**Risk Scoring (0-100):**
- **0-30:** Low risk (legitimate users)
- **31-60:** Medium risk (suspicious patterns)
- **61-85:** High risk (likely malicious)
- **86-100:** Critical risk (confirmed threats)

**Components Analyzed:**
- User Agent Analysis
- IP Reputation
- Behavioral Patterns
- Fingerprint Consistency
- Geolocation Anomalies

### 2. Threat Detection Categories

#### A. User Agent Analysis
Detects:
- Automated tools (curl, wget, scrapy)
- Known attack frameworks (sqlmap, nikto, metasploit)
- Headless browsers (Selenium, Puppeteer)
- Non-standard clients
- Missing standard headers

#### B. IP Analysis
Detects:
- Datacenter/VPS IPs
- VPN/Proxy usage
- Tor exit nodes
- Private IP ranges
- Known malicious IPs

#### C. Pattern Detection
Detects:
- SQL injection attempts
- XSS payloads
- Path traversal attacks
- Command injection
- Suspicious request patterns

#### D. Fingerprint Analysis
Detects:
- Canvas fingerprint spoofing
- WebGL spoofing
- Font enumeration attacks
- Inconsistent fingerprints
- Known malicious fingerprints

### 3. Database Tables for Investigation

#### threat_assessments
Stores comprehensive threat analysis for each visitor:
```sql
SELECT * FROM threat_assessments 
WHERE overall_risk_level = 'high' 
ORDER BY created_at DESC;
```

#### ip_reputation
Maintains IP reputation database:
```sql
SELECT * FROM ip_reputation 
WHERE is_blacklisted = true 
ORDER BY reputation_score ASC;
```

#### attack_patterns
Tracks detected attack patterns:
```sql
SELECT pattern_type, COUNT(*) as count 
FROM attack_patterns 
GROUP BY pattern_type 
ORDER BY count DESC;
```

#### blocked_ips
Manages blocked IP addresses:
```sql
SELECT * FROM blocked_ips 
WHERE unblock_at IS NULL 
ORDER BY blocked_at DESC;
```

#### suspicious_activity_log
Real-time suspicious activity tracking:
```sql
SELECT * FROM suspicious_activity_log 
WHERE is_investigated = false 
ORDER BY created_at DESC;
```

#### fingerprint_analysis
Analyzes browser fingerprints:
```sql
SELECT * FROM fingerprint_analysis 
WHERE spoofing_detected = true;
```

## API Endpoints for Investigation

### Threat Analysis Endpoints

#### Get Threat Assessment
```
GET /api/threat-assessment/:visitor_id
```
Returns comprehensive threat analysis for a specific visitor.

#### Get High-Risk Visitors
```
GET /api/threats/high-risk?limit=50
```
Returns visitors with high threat scores.

#### Get Attack Patterns
```
GET /api/threats/patterns
```
Returns detected attack patterns and their frequency.

#### Get Blocked IPs
```
GET /api/threats/blocked-ips
```
Returns list of blocked IP addresses.

#### Get Suspicious Activity
```
GET /api/threats/suspicious-activity?hours=24
```
Returns suspicious activity from last N hours.

#### Get IP Reputation
```
GET /api/ip-reputation/:ip_address
```
Returns reputation data for specific IP.

#### Get Fingerprint Analysis
```
GET /api/fingerprint-analysis/:visitor_id
```
Returns fingerprint analysis and spoofing detection.

## Investigation Procedures

### Procedure 1: Identify Attacker

1. **Check Threat Assessments**
   ```sql
   SELECT * FROM threat_assessments 
   WHERE overall_risk_level = 'critical' 
   LIMIT 10;
   ```

2. **Analyze IP Reputation**
   ```sql
   SELECT * FROM ip_reputation 
   WHERE ip_address = '102.159.241.207';
   ```

3. **Review Attack Patterns**
   ```sql
   SELECT * FROM attack_patterns 
   WHERE detection_count > 5;
   ```

4. **Check Blocked IPs**
   ```sql
   SELECT * FROM blocked_ips 
   WHERE ip_address = '102.159.241.207';
   ```

### Procedure 2: Trace Attack Campaign

1. **Find Related IPs**
   ```sql
   SELECT DISTINCT ip_address FROM visitors 
   WHERE user_agent LIKE '%sqlmap%' 
   OR user_agent LIKE '%nikto%';
   ```

2. **Identify Patterns**
   ```sql
   SELECT pattern_type, COUNT(*) 
   FROM attack_patterns 
   WHERE created_at > NOW() - INTERVAL '24 hours' 
   GROUP BY pattern_type;
   ```

3. **Timeline Analysis**
   ```sql
   SELECT created_at, COUNT(*) 
   FROM threat_assessments 
   WHERE overall_risk_level = 'high' 
   GROUP BY DATE(created_at) 
   ORDER BY created_at DESC;
   ```

### Procedure 3: Fingerprint Spoofing Detection

1. **Find Spoofed Fingerprints**
   ```sql
   SELECT * FROM fingerprint_analysis 
   WHERE spoofing_detected = true 
   ORDER BY spoofing_confidence DESC;
   ```

2. **Identify Consistent Attackers**
   ```sql
   SELECT canvas_fingerprint, COUNT(*) 
   FROM fingerprint_analysis 
   WHERE spoofing_detected = true 
   GROUP BY canvas_fingerprint 
   HAVING COUNT(*) > 1;
   ```

### Procedure 4: Geolocation Anomaly Detection

1. **Find Impossible Travel**
   ```sql
   SELECT v1.ip_address, v1.city, v1.created_at,
          v2.city, v2.created_at
   FROM visitors v1
   JOIN visitors v2 ON v1.ip_address = v2.ip_address
   WHERE v1.created_at < v2.created_at
   AND EXTRACT(EPOCH FROM (v2.created_at - v1.created_at)) < 3600
   AND v1.city != v2.city;
   ```

2. **Find Datacenter IPs**
   ```sql
   SELECT ip_address, country_code, city, COUNT(*) 
   FROM visitors 
   WHERE ip_address LIKE '102.159.%' 
   GROUP BY ip_address, country_code, city;
   ```

## Threat Response Actions

### Automatic Actions
- Rate limiting on suspicious patterns
- IP blocking for critical threats
- Session termination for confirmed attacks
- Alert generation for investigation

### Manual Actions
1. **Block IP**
   ```sql
   INSERT INTO blocked_ips (ip_address, block_reason, block_type)
   VALUES ('102.159.241.207', 'SQL injection attempts', 'permanent');
   ```

2. **Flag for Investigation**
   ```sql
   UPDATE threat_assessments 
   SET is_investigated = true, investigation_result = 'confirmed_attacker'
   WHERE ip_address = '102.159.241.207';
   ```

3. **Add to Blacklist**
   ```sql
   UPDATE ip_reputation 
   SET is_blacklisted = true, blacklist_sources = '["manual"]'
   WHERE ip_address = '102.159.241.207';
   ```

## OSINT Data Collection

### Collected Intelligence
- User agent strings
- IP addresses and geolocation
- Browser fingerprints
- Device information
- Behavioral patterns
- Attack signatures
- Timing analysis
- Referrer information

### Analysis Capabilities
- Attacker identification
- Campaign tracking
- Tool detection
- Vulnerability scanning detection
- Botnet activity
- Credential stuffing attempts
- DDoS reconnaissance

## Best Practices

1. **Regular Review**
   - Check threat assessments daily
   - Review attack patterns weekly
   - Analyze trends monthly

2. **Proactive Blocking**
   - Block known malicious IPs immediately
   - Implement rate limiting for suspicious patterns
   - Use fingerprint analysis to detect spoofing

3. **Investigation**
   - Document all findings
   - Cross-reference multiple data sources
   - Track attack campaigns
   - Share intelligence with security team

4. **Response**
   - Escalate critical threats
   - Implement countermeasures
   - Monitor for follow-up attacks
   - Update threat intelligence

## Integration with External Services

### Recommended Integrations
- **AbuseIPDB** - IP reputation checking
- **VirusTotal** - Malware detection
- **MaxMind GeoIP2** - Accurate geolocation
- **Shodan** - Device/service discovery
- **Censys** - Certificate/host data

## Limitations & Considerations

1. **Geolocation Accuracy**
   - ISP data can be inaccurate
   - Datacenter IPs show datacenter location, not user location
   - Use multiple sources for verification

2. **False Positives**
   - Legitimate tools may trigger alerts
   - VPN users may appear suspicious
   - Automated systems may be legitimate

3. **Privacy**
   - Respect user privacy
   - Follow GDPR/CCPA regulations
   - Anonymize data when possible
   - Implement data retention policies

## Conclusion

This system provides comprehensive threat detection and OSINT capabilities for identifying and investigating attackers. Use responsibly and in compliance with applicable laws and regulations.
