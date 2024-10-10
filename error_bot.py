# ErrorBot integration for Python

import sys
import requests
from datetime import datetime

class ErrorBot:
    def __init__(self, api_key, project_name):
        self.api_key = api_key
        self.project_name = project_name
        self.endpoint = 'https://errorbot.fyi/api/v1/report'

    def init(self):
        sys.excepthook = self.handle_exception

    def handle_exception(self, exc_type, exc_value, exc_traceback):
        if issubclass(exc_type, KeyboardInterrupt):
            sys.__excepthook__(exc_type, exc_value, exc_traceback)
            return

        error_message = f"Unhandled exception: {exc_value}"
        self.report_error(error_message)

    def report_error(self, message, error_type='error'):
        error_data = {
            'message': message,
            'type': error_type,
            'project': self.project_name
        }

        try:
            response = requests.post(
                self.endpoint,
                json=error_data,
                headers={
                    'Content-Type': 'application/json',
                    'X-API-Key': self.api_key
                }
            )
            response.raise_for_status()
            result = response.json()
            if result['success']:
                print("Error reported successfully")
            else:
                print(f"Failed to report error: {result['error']['message']}")
        except requests.RequestException as e:
            print(f"Failed to report error to ErrorBot: {e}", file=sys.stderr)

# Usage
error_bot = ErrorBot('YOUR_API_KEY_HERE', 'Your Project Name')
error_bot.init()

# To manually report an error
# error_bot.report_error('Something went wrong', 'warning')