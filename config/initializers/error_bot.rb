# ErrorBot integration for Ruby on Rails

require 'net/http'
require 'json'

class ErrorBot
  def self.setup
    api_key = 'YOUR_API_KEY_HERE'
    project_name = 'Your Project Name'
    endpoint = 'https://errorbot.fyi/v1/errors'

    Rails.application.config.middleware.use ExceptionNotification::Rack,
      :error_bot => {
        :api_key => api_key,
        :project => project_name,
        :endpoint => endpoint
      }
  end

  def self.notify(exception, env = nil)
    error_data = {
      message: exception.message,
      type: 'error',
      project: Rails.application.config.exception_notification[:error_bot][:project],
      timestamp: Time.now.iso8601,
      ruby_version: RUBY_VERSION,
      rails_version: Rails.version,
      backtrace: exception.backtrace&.join("\n")
    }

    uri = URI(Rails.application.config.exception_notification[:error_bot][:endpoint])
    http = Net::HTTP.new(uri.host, uri.port)
    http.use_ssl = (uri.scheme == 'https')

    request = Net::HTTP::Post.new(uri.path, {
      'Content-Type' => 'application/json',
      'Authorization' => "Bearer #{Rails.application.config.exception_notification[:error_bot][:api_key]}"
    })
    request.body = error_data.to_json

    response = http.request(request)
    Rails.logger.error "Failed to report error to ErrorBot: #{response.body}" unless response.is_a?(Net::HTTPSuccess)
  end
end

ErrorBot.setup