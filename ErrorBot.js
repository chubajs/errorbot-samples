// ErrorBot integration for Node.js

const https = require('https');
const url = require('url');

class ErrorBot {
  constructor(apiKey, projectName) {
    this.apiKey = apiKey;
    this.projectName = projectName;
    this.endpoint = 'https://errorbot.fyi/api/v1/report';
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
      project: this.projectName
    };

    const parsedUrl = url.parse(this.endpoint);
    const options = {
      method: 'POST',
      hostname: parsedUrl.hostname,
      path: parsedUrl.path,
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': this.apiKey
      }
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        try {
          const result = JSON.parse(data);
          if (result.success) {
            console.log('Error reported successfully');
          } else {
            console.error(`Failed to report error: ${result.error.message}`);
          }
        } catch (e) {
          console.error('Failed to parse ErrorBot response:', e);
        }
      });
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