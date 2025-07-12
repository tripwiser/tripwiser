/**
 * Keep-Alive Script for Render
 * 
 * This script can be used with external ping services to keep your Render app alive.
 * 
 * Usage:
 * 1. Deploy this with your app
 * 2. Set up an external ping service (UptimeRobot, cron-job.org, etc.)
 * 3. Point it to: https://your-app.onrender.com/ping
 * 
 * Or run this locally to ping your deployed app:
 * node keep-alive.js https://your-app.onrender.com
 */

const axios = require('axios');

const PING_INTERVAL = 10 * 60 * 1000; // 10 minutes
const TIMEOUT = 10000; // 10 seconds

class KeepAlivePinger {
  constructor(baseUrl) {
    this.baseUrl = baseUrl;
    this.pingUrl = `${baseUrl}/ping`;
    this.isRunning = false;
    this.pingCount = 0;
  }

  async ping() {
    try {
      const response = await axios.get(this.pingUrl, { timeout: TIMEOUT });
      this.pingCount++;
      console.log(`✅ Ping #${this.pingCount} successful: ${response.data.status} at ${response.data.timestamp}`);
      console.log(`   Uptime: ${Math.floor(response.data.uptime / 60)} minutes`);
      return true;
    } catch (error) {
      console.error(`❌ Ping #${this.pingCount + 1} failed:`, error.message);
      return false;
    }
  }

  start() {
    if (this.isRunning) {
      console.log('Pinger is already running');
      return;
    }

    this.isRunning = true;
    console.log(`🚀 Starting keep-alive pinger for: ${this.baseUrl}`);
    console.log(`⏰ Pinging every ${PING_INTERVAL / 60000} minutes`);

    // Initial ping
    this.ping();

    // Set up interval
    this.interval = setInterval(() => {
      this.ping();
    }, PING_INTERVAL);
  }

  stop() {
    if (!this.isRunning) {
      console.log('Pinger is not running');
      return;
    }

    this.isRunning = false;
    if (this.interval) {
      clearInterval(this.interval);
    }
    console.log('🛑 Keep-alive pinger stopped');
  }

  getStats() {
    return {
      isRunning: this.isRunning,
      pingCount: this.pingCount,
      baseUrl: this.baseUrl
    };
  }
}

// CLI usage
if (require.main === module) {
  const baseUrl = process.argv[2];
  
  if (!baseUrl) {
    console.log('Usage: node keep-alive.js <your-app-url>');
    console.log('Example: node keep-alive.js https://tripwiser-backend.onrender.com');
    process.exit(1);
  }

  const pinger = new KeepAlivePinger(baseUrl);
  
  // Handle graceful shutdown
  process.on('SIGINT', () => {
    console.log('\n🛑 Received SIGINT, shutting down...');
    pinger.stop();
    process.exit(0);
  });

  process.on('SIGTERM', () => {
    console.log('\n🛑 Received SIGTERM, shutting down...');
    pinger.stop();
    process.exit(0);
  });

  // Start pinging
  pinger.start();
}

module.exports = KeepAlivePinger; 