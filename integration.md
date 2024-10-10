# ErrorBot API Integration Guide

This guide provides detailed information on how to integrate ErrorBot's error reporting API into your application.

## API Endpoint

- **URL**: `https://errorbot.fyi/api/v1/report`
- **Method**: POST

## Authentication

All requests to the ErrorBot API must include an API key in the `X-API-Key` header.

## Request Headers

- `Content-Type: application/json`
- `X-API-Key: YOUR_API_KEY_HERE`

Replace `YOUR_API_KEY_HERE` with your actual ErrorBot API key.

## Request Body

The request body should be a JSON object with the following properties:

| Property | Type   | Required | Description                                                                           |
|----------|--------|----------|---------------------------------------------------------------------------------------|
| message  | string | Yes      | The error message to report. Maximum length is 200 characters.                        |
| type     | string | No       | The type of the error. Must be 'error', 'warning', or 'silent'. Defaults to 'error'.  |
| project  | string | No       | The name of the project where the error occurred.                                     |

## Response

The API will respond with a JSON object containing:

- `success`: A boolean indicating whether the error was successfully reported.
- `message`: A success message if the error was reported successfully.
- `error`: An error message if the request failed.
- `data`: The error object as stored in the database (if successful).

## Error Codes

| HTTP Status Code | Description                               |
|------------------|-------------------------------------------|
| 200              | Success                                   |
| 400              | Bad Request (invalid parameters)          |
| 401              | Unauthorized (invalid or missing API key) |
| 429              | Rate Limit Exceeded                       |
| 500              | Internal Server Error                     |

## Possible Error Messages

- **Missing API key**: The X-API-Key header is missing.
- **Invalid or inactive API key**: The provided API key is not valid or has been deactivated.
- **Missing error message**: The 'message' field is missing from the request body.
- **Error message exceeds maximum length of 200 characters**: The provided error message is too long.
- **Invalid error type**: The 'type' field must be 'error', 'warning', or 'silent'.
- **Failed to save error**: An internal server error occurred while saving the error.
- **An unexpected error occurred**: A generic error message for any other unexpected errors.

## Example Usage

Here are examples of how to use the ErrorBot API in different programming languages:

### Python
import requests
import json

def report_error(message, error_type='error', project=None):
    url = 'https://errorbot.fyi/api/v1/report'
    headers = {
        'Content-Type': 'application/json',
        'X-API-Key': 'YOUR_API_KEY_HERE'
    }
    data = {
        'message': message,
        'type': error_type,
        'project': project
    }

    try:
        response = requests.post(url, headers=headers, json=data)
        response.raise_for_status()
        result = response.json()
        if result['success']:
            print(f"Error reported successfully: {result['message']}")
            print(f"Error details: {json.dumps(result['data'], indent=2)}")
        else:
            print(f"Failed to report error: {result.get('error', 'Unknown error')}")
    except requests.exceptions.RequestException as e:
        print(f"An error occurred while reporting the error: {e}")

# Example usage
report_error("Division by zero error occurred", error_type='error', project='Calculator App')
report_error("User attempted to access restricted area", error_type='warning', project='Auth Service')

### Node.js
// Node.js example using axios
const axios = require('axios');

async function reportError(message, errorType = 'error', project = null) {
  const url = 'https://errorbot.fyi/api/v1/report';
  const headers = {
    'Content-Type': 'application/json',
    'X-API-Key': 'YOUR_API_KEY_HERE'
  };
  const data = {
    message,
    type: errorType,
    project
  };

  try {
    const response = await axios.post(url, data, { headers });
    if (response.data.success) {
      console.log(`Error reported successfully: ${response.data.message}`);
      console.log('Error details:', JSON.stringify(response.data.data, null, 2));
    } else {
      console.error(`Failed to report error: ${response.data.error || 'Unknown error'}`);
    }
  } catch (error) {
    console.error('An error occurred while reporting the error:', error.message);
    if (error.response) {
      console.error('Error response:', error.response.data);
    }
  }
}

### Frontend JavaScript

// Frontend JavaScript example using fetch
async function reportError(message, errorType = 'error', project = null) {
  const url = 'https://errorbot.fyi/api/v1/report';
  const headers = {
    'Content-Type': 'application/json',
    'X-API-Key': 'YOUR_API_KEY_HERE'
  };
  const data = {
    message,
    type: errorType,
    project
  };

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: headers,
      body: JSON.stringify(data)
    });
    const result = await response.json();
    if (result.success) {
      console.log(`Error reported successfully: ${result.message}`);
      console.log('Error details:', JSON.stringify(result.data, null, 2));
    } else {
      console.error(`Failed to report error: ${result.error || 'Unknown error'}`);
    }
  } catch (error) {
    console.error('An error occurred while reporting the error:', error.message);
  }
}

// Example usage
reportError('User form submission failed', 'error', 'User Management');
reportError('High server load detected', 'warning', 'Server Monitoring');


## Tips and Tricks for Integrating ErrorBot in Small Private Projects

Integrating ErrorBot into your small private projects can significantly enhance your ability to detect, diagnose, and resolve errors quickly. Here are some best practices to help you make the most out of ErrorBot in Python, Node.js, and JavaScript applications.

### 1. Automatically Capture Unhandled Exceptions

Implement global error handlers to catch unhandled exceptions and report them to ErrorBot.

- **Python**

  ```python
  import sys

  def handle_exception(exc_type, exc_value, exc_traceback):
      if issubclass(exc_type, KeyboardInterrupt):
          sys.__excepthook__(exc_type, exc_value, exc_traceback)
          return
      error_message = f"Unhandled exception: {exc_value}"
      report_error(error_message, error_type='error', project='Your Project Name')

  sys.excepthook = handle_exception
  ```

- **Node.js**

  ```javascript
  process.on('uncaughtException', (err) => {
    const errorMessage = `Unhandled exception: ${err.message}`;
    reportError(errorMessage, 'error', 'Your Project Name');
    // Optional: Exit the process after handling the error
    process.exit(1);
  });

  process.on('unhandledRejection', (reason, promise) => {
    const errorMessage = `Unhandled rejection at ${promise}: ${reason}`;
    reportError(errorMessage, 'error', 'Your Project Name');
  });
  ```

- **Frontend JavaScript**

  ```javascript
  window.onerror = function (message, source, lineno, colno, error) {
    const errorMessage = `Unhandled error: ${message} at ${source}:${lineno}:${colno}`;
    reportError(errorMessage, 'error', 'Your Project Name');
  };

  window.onunhandledrejection = function (event) {
    const errorMessage = `Unhandled rejection: ${event.reason}`;
    reportError(errorMessage, 'error', 'Your Project Name');
  };
  ```

### 2. Integrate with Logging Libraries

Leverage existing logging frameworks to send error logs to ErrorBot.

- **Python (using the `logging` module)**

  ```python
  import logging

  class ErrorBotHandler(logging.Handler):
      def emit(self, record):
          if record.levelname == 'ERROR':
              log_entry = self.format(record)
              report_error(log_entry, error_type='error', project='Your Project Name')

  logger = logging.getLogger(__name__)
  errorbot_handler = ErrorBotHandler()
  logger.addHandler(errorbot_handler)

  logger.error("This error will be sent to ErrorBot")
  logger.info("This info message will NOT be sent to ErrorBot")
  ```

- **Node.js (using `winston` logger)**

  ```javascript
  const winston = require('winston');

  const errorBotTransport = new winston.transports.Console({
    level: 'error',
    handleExceptions: true,
    format: winston.format.printf(({ level, message }) => {
      if (level === 'error') {
        reportError(message, 'error', 'Your Project Name');
      }
      return message;
    }),
  });

  const logger = winston.createLogger({
    transports: [errorBotTransport],
  });

  logger.error("This error will be sent to ErrorBot");
  logger.info("This info message will NOT be sent to ErrorBot");
  ```

### 3. Use Try-Catch Blocks Strategically

Wrap critical sections of your code with try-catch blocks to handle and report exceptions gracefully.

- **Python**

  ```python
  try:
      # Critical code that might raise an exception
      risky_operation()
  except Exception as e:
      report_error(f"An error occurred: {e}", error_type='error', project='Your Project Name')
  ```

- **JavaScript**

  ```javascript
  try {
    // Critical code that might throw an error
    riskyOperation();
  } catch (error) {
    reportError(`An error occurred: ${error.message}`, 'error', 'Your Project Name');
  }
  ```

### 4. Avoid Sending Sensitive Information

Ensure that error messages do not contain sensitive data such as passwords, API keys, or personal user information.

- **Best Practice**
  - Sanitize error messages before sending.
  - Use generic messages if necessary.
  - Review error logs regularly to ensure compliance.

### 5. Implement Rate Limiting

Prevent flooding ErrorBot with duplicate errors by implementing rate limiting or deduplication logic.

- **Example**

  ```javascript
  let errorCache = new Set();

  function reportErrorWithRateLimiting(message, type, project) {
    if (!errorCache.has(message)) {
      errorCache.add(message);
      reportError(message, type, project);
      setTimeout(() => errorCache.delete(message), 60000); // Clear after 1 minute
    }
  }
  ```

### 6. Include Contextual Information

Enhance error reports with additional context to make debugging easier.

- **Include**
  - Environment details (development, staging, production)
  - User ID or session ID (if applicable and compliant with privacy laws)
  - Timestamp of the error occurrence
  - Module or function name where the error occurred

- **Example**

  ```python
  import platform
  import datetime

  def report_error(message, error_type='error', project=None):
      context = {
          'timestamp': datetime.datetime.utcnow().isoformat(),
          'environment': 'production',
          'platform': platform.platform(),
      }
      full_message = f"{message} | Context: {context}"
      # Proceed to send the error report as before
  ```

### 7. Test Your Integration

Regularly test your error reporting setup to ensure that errors are being captured and reported as expected.

- **Testing Tips**
  - Intentionally trigger errors in a controlled environment.
  - Verify that the errors appear in ErrorBot with correct details.
  - Check for any missing or incorrect information.

### 8. Categorize Errors Effectively

Use the `type` field to categorize errors, which can help in filtering and prioritizing issues.

- **Types**
  - `error`: For critical issues that need immediate attention.
  - `warning`: For non-critical issues that should be monitored.
  - `silent`: For informational purposes without alerting.

### 9. Monitor and Act on Reports

Regularly review the error reports from ErrorBot and establish a process for addressing them.

- **Best Practices**
  - Set up notifications or alerts for new errors.
  - Assign responsibility for monitoring error reports.
  - Create a feedback loop to fix reported issues promptly.

### 10. Keep the ErrorBot API Key Secure

Protect your API key to prevent unauthorized use.

- **Security Tips**
  - Do not hard-code the API key in your codebase.
  - Use environment variables or secure key management services.
  - Avoid exposing the API key in client-side code (e.g., frontend JavaScript).

### 11. Handle Network Failures Gracefully

Ensure that your application handles cases where ErrorBot's API might be unreachable.

- **Example**

  ```python
  try:
      # Attempt to report the error
      report_error("An error occurred")
  except requests.exceptions.RequestException as e:
      # Log locally or take alternative actions
      print(f"Failed to report error to ErrorBot: {e}")
  ```

### 12. Stay Updated with ErrorBot's API Changes

Keep an eye on any updates or changes to the ErrorBot API to maintain compatibility.

- **Action Items**
  - Subscribe to ErrorBot's developer newsletter or RSS feed.
  - Regularly review the API documentation for updates.
  - Update your integration code as needed.

### 13. Optimize for Performance

Ensure that error reporting does not significantly impact your application's performance.

- **Performance Tips**
  - Use asynchronous calls to report errors without blocking the main thread.
  - Batch multiple errors together if appropriate.
  - Monitor the overhead introduced by error reporting.

### 14. Provide User Feedback When Appropriate

In user-facing applications, consider informing users when an error has occurred.

- **Example**

  ```javascript
  try {
    // Code that may throw an error
  } catch (error) {
    reportError(error.message, 'error', 'Your Project Name');
    alert('An unexpected error occurred. Please try again later.');
  }
  ```

### 15. Customize Error Messages

Make error messages as informative as possible without exposing sensitive details.

- **Tips**
  - Include error codes or identifiers.
  - Provide suggestions for possible fixes if applicable.
  - Avoid technical jargon that may not be helpful.

By following these best practices, you can efficiently integrate ErrorBot into your projects and maintain a robust error monitoring system that helps you improve your application's reliability and user experience.

---

**Note**: Replace `'YOUR_API_KEY_HERE'` and `'Your Project Name'` with your actual API key and project name, respectively, in all code examples.