#!/usr/bin/env node

/**
 * Network Metrics Collector - Single Run
 *
 * Collects service metrics once and exits.
 * Designed for GitHub Actions, cron jobs, or scheduled tasks.
 *
 * Environment Variables Required:
 *   - CAMPUS_CONTROLLER_URL: Campus Controller API base URL
 *   - CAMPUS_CONTROLLER_USER: Username for authentication
 *   - CAMPUS_CONTROLLER_PASSWORD: Password for authentication
 *   - VITE_SUPABASE_URL: Supabase project URL
 *   - VITE_SUPABASE_ANON_KEY: Supabase anonymous/public key
 */

import { createClient } from '@supabase/supabase-js';
import https from 'https';
import http from 'http';

// Configuration
const CONFIG = {
  campusController: {
    baseUrl: process.env.CAMPUS_CONTROLLER_URL || 'https://tsophiea.ddns.net:443/management',
    userId: process.env.CAMPUS_CONTROLLER_USER,
    password: process.env.CAMPUS_CONTROLLER_PASSWORD
  },
  supabase: {
    url: process.env.VITE_SUPABASE_URL,
    anonKey: process.env.VITE_SUPABASE_ANON_KEY
  }
};

// Validate configuration
function validateConfig() {
  const errors = [];

  if (!CONFIG.campusController.userId) {
    errors.push('CAMPUS_CONTROLLER_USER is required');
  }
  if (!CONFIG.campusController.password) {
    errors.push('CAMPUS_CONTROLLER_PASSWORD is required');
  }
  if (!CONFIG.supabase.url) {
    errors.push('VITE_SUPABASE_URL is required');
  }
  if (!CONFIG.supabase.anonKey) {
    errors.push('VITE_SUPABASE_ANON_KEY is required');
  }

  if (errors.length > 0) {
    console.error('❌ Configuration errors:');
    errors.forEach(err => console.error(`   - ${err}`));
    process.exit(1);
  }
}

// Initialize Supabase client
let supabase;
try {
  supabase = createClient(CONFIG.supabase.url, CONFIG.supabase.anonKey);
} catch (error) {
  console.error('❌ Failed to initialize Supabase client:', error.message);
  process.exit(1);
}

// API Service Class
class MetricsCollector {
  constructor() {
    this.accessToken = null;
    this.refreshToken = null;
  }

  async makeRequest(url, options = {}, timeoutMs = 10000) {
    return new Promise((resolve, reject) => {
      const parsedUrl = new URL(url);
      const isHttps = parsedUrl.protocol === 'https:';
      const lib = isHttps ? https : http;

      const requestOptions = {
        method: options.method || 'GET',
        headers: options.headers || {},
        timeout: timeoutMs,
        rejectUnauthorized: false
      };

      const req = lib.request(url, requestOptions, (res) => {
        let data = '';

        res.on('data', chunk => {
          data += chunk;
        });

        res.on('end', () => {
          resolve({
            ok: res.statusCode >= 200 && res.statusCode < 300,
            status: res.statusCode,
            statusText: res.statusMessage,
            json: async () => JSON.parse(data),
            text: async () => data
          });
        });
      });

      req.on('error', reject);
      req.on('timeout', () => {
        req.destroy();
        reject(new Error('Request timeout'));
      });

      if (options.body) {
        req.write(options.body);
      }

      req.end();
    });
  }

  async login() {
    console.log('🔐 Authenticating with Campus Controller...');

    // Try multiple authentication formats (same as frontend)
    const authFormats = [
      // Format 1: camelCase (Extreme Networks standard)
      {
        grantType: 'password',
        userId: CONFIG.campusController.userId,
        password: CONFIG.campusController.password
      },
      // Format 2: snake_case (OAuth 2.0 standard)
      {
        grant_type: 'password',
        userId: CONFIG.campusController.userId,
        password: CONFIG.campusController.password
      },
      // Format 3: username instead of userId
      {
        grantType: 'password',
        username: CONFIG.campusController.userId,
        password: CONFIG.campusController.password
      },
      // Format 4: snake_case with username
      {
        grant_type: 'password',
        username: CONFIG.campusController.userId,
        password: CONFIG.campusController.password
      }
    ];

    let lastError = null;

    for (let i = 0; i < authFormats.length; i++) {
      try {
        const response = await this.makeRequest(
          `${CONFIG.campusController.baseUrl}/v1/oauth2/token`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Accept': 'application/json'
            },
            body: JSON.stringify(authFormats[i])
          },
          10000
        );

        if (response.ok) {
          const authData = await response.json();
          this.accessToken = authData.access_token;
          this.refreshToken = authData.refresh_token;

          console.log('✅ Authentication successful');
          return true;
        } else {
          const errorText = await response.text();
          lastError = `Authentication failed (${response.status}): ${errorText}`;

          // If credentials are wrong (401), no need to try other formats
          if (response.status === 401) {
            console.error(`❌ ${lastError}`);
            console.error('   Please verify CAMPUS_CONTROLLER_USER and CAMPUS_CONTROLLER_PASSWORD are correct');
            return false;
          }
        }
      } catch (error) {
        lastError = error.message;
      }
    }

    console.error('❌ Authentication failed after trying all formats:', lastError);
    return false;
  }

  async makeAuthenticatedRequest(endpoint, options = {}, timeoutMs = 10000) {
    if (!this.accessToken) {
      throw new Error('Not authenticated');
    }

    const url = `${CONFIG.campusController.baseUrl}${endpoint}`;
    const headers = {
      'Authorization': `Bearer ${this.accessToken}`,
      'Accept': 'application/json',
      ...options.headers
    };

    return this.makeRequest(url, { ...options, headers }, timeoutMs);
  }

  async fetchServices() {
    try {
      const response = await this.makeAuthenticatedRequest('/v1/services', {}, 15000);

      if (!response.ok) {
        throw new Error(`Failed to fetch services: ${response.status}`);
      }

      const data = await response.json();
      const services = Array.isArray(data) ? data : (data.services || data.data || []);

      return services;
    } catch (error) {
      console.error('❌ Failed to fetch services:', error.message);
      return [];
    }
  }

  async fetchServiceReport(serviceId) {
    try {
      const response = await this.makeAuthenticatedRequest(
        `/v1/services/${serviceId}/report`,
        {},
        15000
      );

      if (!response.ok) {
        return null;
      }

      return await response.json();
    } catch (error) {
      return null;
    }
  }

  async fetchServiceStations(serviceId) {
    try {
      const response = await this.makeAuthenticatedRequest(
        `/v1/services/${serviceId}/stations`,
        {},
        15000
      );

      if (!response.ok) {
        return [];
      }

      const data = await response.json();
      return Array.isArray(data) ? data : (data.stations || data.clients || []);
    } catch (error) {
      return [];
    }
  }

  async saveMetrics(serviceId, serviceName, metrics) {
    try {
      const { error } = await supabase
        .from('service_metrics_snapshots')
        .insert({
          service_id: serviceId,
          service_name: serviceName,
          timestamp: new Date().toISOString(),
          metrics: metrics
        });

      if (error) {
        console.error(`   ❌ Failed to save metrics for ${serviceName}:`, error.message);
        return false;
      }

      return true;
    } catch (error) {
      console.error(`   ❌ Error saving metrics for ${serviceName}:`, error.message);
      return false;
    }
  }

  async collectAllMetrics() {
    console.log('\n📊 Starting metrics collection...');
    const timestamp = new Date().toISOString();
    console.log(`   Time: ${timestamp}`);

    const services = await this.fetchServices();

    if (services.length === 0) {
      console.log('   ⚠️  No services found');
      return { success: 0, failed: 0 };
    }

    console.log(`   Found ${services.length} services`);

    let successCount = 0;
    let failCount = 0;

    for (const service of services) {
      const serviceId = service.id;
      const serviceName = service.name || serviceId;

      try {
        const [report, stations] = await Promise.all([
          this.fetchServiceReport(serviceId),
          this.fetchServiceStations(serviceId)
        ]);

        const metrics = {
          clientCount: stations.length,
          ...(report?.metrics || {}),
          stations: stations.slice(0, 100).map(s => ({
            macAddress: s.macAddress,
            rssi: s.rssi,
            snr: s.snr
          }))
        };

        const saved = await this.saveMetrics(serviceId, serviceName, metrics);

        if (saved) {
          console.log(`   ✅ ${serviceName}: ${stations.length} clients`);
          successCount++;
        } else {
          failCount++;
        }
      } catch (error) {
        console.error(`   ❌ Failed to collect metrics for ${serviceName}:`, error.message);
        failCount++;
      }
    }

    console.log(`\n✨ Collection complete: ${successCount} success, ${failCount} failed`);
    return { success: successCount, failed: failCount };
  }
}

// Main execution
async function main() {
  console.log('╔════════════════════════════════════════════════════════════╗');
  console.log('║     Network Metrics Collector (Single Run)                ║');
  console.log('╚════════════════════════════════════════════════════════════╝\n');

  validateConfig();

  console.log('⚙️  Configuration:');
  console.log(`   Campus Controller: ${CONFIG.campusController.baseUrl}`);
  console.log(`   User: ${CONFIG.campusController.userId}`);
  console.log(`   Supabase: ${CONFIG.supabase.url}\n`);

  const collector = new MetricsCollector();

  // Authenticate
  const authenticated = await collector.login();
  if (!authenticated) {
    console.error('❌ Failed to authenticate. Exiting.');
    process.exit(1);
  }

  // Test Supabase connection
  console.log('\n🔍 Testing Supabase connection...');
  try {
    const { error } = await supabase.from('service_metrics_snapshots').select('count').limit(1);
    if (error) throw error;
    console.log('✅ Supabase connection successful\n');
  } catch (error) {
    console.error('❌ Supabase connection failed:', error.message);
    console.error('   Make sure you have run the database schema (supabase-schema.sql)');
    process.exit(1);
  }

  // Collect metrics
  const result = await collector.collectAllMetrics();

  // Exit with appropriate code
  if (result.failed > 0) {
    console.log(`\n⚠️  Completed with ${result.failed} failures`);
    process.exit(1);
  } else {
    console.log('\n✅ All metrics collected successfully');
    process.exit(0);
  }
}

// Start
main().catch(error => {
  console.error('💥 Fatal error:', error);
  process.exit(1);
});
