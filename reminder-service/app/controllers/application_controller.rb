class ApplicationController < ActionController::API
  include Authentication

  rescue_from ActiveRecord::RecordNotFound do |error|
    render_error("not_found", error.message, :not_found)
  end

  rescue_from ActiveRecord::RecordInvalid do |error|
    render_error("validation_error", "The request is invalid.", :unprocessable_entity, details: error.record.errors.to_hash)
  end

  rescue_from ActionController::ParameterMissing do |error|
    render_error("invalid_request", error.message, :bad_request)
  end

  private

  def render_error(code, message, status, details: nil)
    body = { error: { code: code, message: message } }
    body[:error][:details] = details if details
    render json: body, status: status
  end
end
