# ErrorBot integration for Ruby on Rails

require 'net/http'
require 'json'

class ErrorBot
  def self.setup
    api_key = 'YOUR_API_KEY_HERE'
    project_name = 'Your Project Name'
    endpoint = 'https://errorbot.fyi/api/v1/report'

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
      project: Rails.application.config.exception_notification[:error_bot][:project]
    }

    uri = URI(Rails.application.config.exception_notification[:error_bot][:endpoint])
    http = Net::HTTP.new(uri.host, uri.port)
    http.use_ssl = (uri.scheme == 'https')

    request = Net::HTTP::Post.new(uri.path, {
      'Content-Type' => 'application/json',
      'X-API-Key' => Rails.application.config.exception_notification[:error_bot][:api_key]
    })
    request.body = error_data.to_json

    response = http.request(request)
    
    if response.is_a?(Net::HTTPSuccess)
      result = JSON.parse(response.body)
      if result['success']
        Rails.logger.info "Error reported successfully to ErrorBot"
      else
        Rails.logger.error "Failed to report error to ErrorBot: #{result['error']['message']}"
      end
    else
      Rails.logger.error "Failed to report error to ErrorBot: HTTP #{response.code}"
    end
  end
end

ErrorBot.setup