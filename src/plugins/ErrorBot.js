import Vue from 'vue';

class ErrorBot {
  constructor(apiKey, projectName) {
    this.apiKey = apiKey;
    this.projectName = projectName;
    this.endpoint = 'https://errorbot.fyi/v1/errors'; // Replace with actual ErrorBot API endpoint
  }

  install(Vue) {
    Vue.config.errorHandler = (err, vm, info) => {
      this.reportError(`Vue error: ${err.toString()}\nInfo: ${info}`, 'error');
    };

    window.onerror = (message, source, lineno, colno, error) => {
      this.reportError(`Unhandled error: ${message} at ${source}:${lineno}:${colno}`, 'error');
    };

    window.onunhandledrejection = (event) => {
      this.reportError(`Unhandled rejection: ${event.reason}`, 'error');
    };

    Vue.prototype.$reportError = this.reportError.bind(this);
  }

  reportError(message, type = 'error') {
    const errorData = {
      message,
      type,
      project: this.projectName,
      timestamp: new Date().toISOString(),
      vue_version: Vue.version,
      url: window.location.href
    };

    fetch(this.endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.apiKey}`
      },
      body: JSON.stringify(errorData)
    }).catch(err => console.error('Failed to report error to ErrorBot:', err));
  }
}

export default {
  install(Vue, options) {
    const errorBot = new ErrorBot(options.apiKey, options.projectName);
    errorBot.install(Vue);
  }
};

// Usage in main.js:
// import ErrorBot from './plugins/ErrorBot';
// Vue.use(ErrorBot, { apiKey: 'YOUR_API_KEY_HERE', projectName: 'Your Project Name' });

// To manually report an error in a component:
// this.$reportError('Something went wrong', 'warning');