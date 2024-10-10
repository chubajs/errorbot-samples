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
| message  | string | Yes      | The error message to report. Maximum length is 1000 characters.                       |
| type     | string | No       | The type of the error. Must be 'error', 'warning', or 'silent'. Defaults to 'error'.  |
| project  | string | No       | The name of the project where the error occurred.                                     |

## Response

The API will respond with a JSON object containing:

- `success`: A boolean value indicating whether the request was successful.
- `error`: An object containing error details (only present if `success` is `false`):
  - `code`: A string representing the error code.
  - `message`: A string describing the error.

## Error Codes and Messages

| Error Code                | Description                                                                    |
|---------------------------|--------------------------------------------------------------------------------|
| ERR_MISSING_API_KEY       | The X-API-Key header is missing.                                               |
| ERR_INVALID_API_KEY       | The provided API key is not valid or has been deactivated.                     |
| ERR_RATE_LIMIT_EXCEEDED   | The number of requests has exceeded the allowed limit.                         |
| ERR_MISSING_ERROR_MESSAGE | The 'message' field is missing from the request body.                        |
| ERR_INVALID_ERROR_TYPE    | The 'type' field must be 'error', 'warning', or 'silent'.                      |
| ERR_MESSAGE_TOO_LONG      | The provided error message exceeds the maximum length of 1000 characters.      |
| ERR_FAILED_TO_SAVE        | An internal server error occurred while saving the error.                      |
| ERR_UNEXPECTED            | An unexpected error occurred.                                                  |

## Example Error Response

```json
{
  "success": false,
  "error": {
    "code": "ERR_INVALID_API_KEY",
    "message": "The provided API key is not valid or has been deactivated."
  }
}
```

## Integration Examples

### Python

```python
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
            print(f"Error reported successfully")
        else:
            print(f"Failed to report error: {result['error']['message']}")
    except requests.exceptions.RequestException as e:
        print(f"An error occurred while reporting the error: {e}")

# Example usage
report_error("Division by zero error occurred", error_type='error', project='Calculator App')
report_error("User attempted to access restricted area", error_type='warning', project='Auth Service')
```

### JavaScript (Node.js)

```javascript
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
            console.log('Error reported successfully');
        } else {
            console.error(`Failed to report error: ${response.data.error.message}`);
        }
    } catch (error) {
        console.error('An error occurred while reporting the error:', error.message);
        if (error.response) {
            console.error('Error response:', error.response.data);
        }
    }
}

// Example usage
reportError('User form submission failed', 'error', 'User Management');
reportError('High server load detected', 'warning', 'Server Monitoring');
```

### JavaScript (Browser)

```javascript
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
            console.log('Error reported successfully');
        } else {
            console.error(`Failed to report error: ${result.error.message}`);
        }
    } catch (error) {
        console.error('An error occurred while reporting the error:', error.message);
    }
}

// Example usage
reportError('User form submission failed', 'error', 'User Management');
reportError('High server load detected', 'warning', 'Server Monitoring');
```

## Tips and Tricks for Integrating ErrorBot in Small Private Projects

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

### 5. Implement Rate Limiting

Prevent flooding ErrorBot with duplicate errors by implementing rate limiting or deduplication logic.

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

### 8. Categorize Errors Effectively

Use the `type` field to categorize errors, which can help in filtering and prioritizing issues.

### 9. Monitor and Act on Reports

Regularly review the error reports from ErrorBot and establish a process for addressing them.

### 10. Keep the ErrorBot API Key Secure

Protect your API key to prevent unauthorized use.

### 11. Handle Network Failures Gracefully

Ensure that your application handles cases where ErrorBot's API might be unreachable.

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

### 13. Optimize for Performance

Ensure that error reporting does not significantly impact your application's performance.

### 14. Provide User Feedback When Appropriate

In user-facing applications, consider informing users when an error has occurred.

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

---

**Note**: Replace `'YOUR_API_KEY_HERE'` and `'Your Project Name'` with your actual API key and project name, respectively, in all code examples.