// ErrorBot integration for Node.js

const https = require('https');

class ErrorBot {
  constructor(apiKey, projectName) {
    this.apiKey = apiKey;
    this.projectName = projectName;
    this.endpoint = 'https://errorbot.fyi/v1/errors';
  }

  init() {
    process.on('uncaughtException', (err) => {
      this.reportError(`Unhandled exception: ${err.message}`, 'error');
      process.exit(1);
    });

    process.on('unhandledRejection', (reason, promise) => {
      this.reportError(`Unhandled rejection at ${promise}: ${reason}`, 'error');
    });
  }

  reportError(message, type = 'error') {
    const errorData = {
      message,
      type,
      project: this.projectName,
      timestamp: new Date().toISOString(),
      node_version: process.version,
    };

    const options = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.apiKey}`
      }
    };

    const req = https.request(this.endpoint, options, (res) => {
      if (res.statusCode !== 200) {
        console.error(`Failed to report error to ErrorBot: HTTP ${res.statusCode}`);
      }
    });

    req.on('error', (error) => {
      console.error('Failed to report error to ErrorBot:', error);
    });

    req.write(JSON.stringify(errorData));
    req.end();
  }
}

// Usage
const errorBot = new ErrorBot('YOUR_API_KEY_HERE', 'Your Project Name');
errorBot.init();

// To manually report an error
// errorBot.reportError('Something went wrong', 'warning');

module.exports = errorBot;