module Authentication
  extend ActiveSupport::Concern

  included do
    before_action :authenticate_request!
    helper_method :current_user
  end

  private

  attr_reader :current_user

  def authenticate_request!
    token = request.headers["Authorization"].to_s.delete_prefix("Bearer ").strip
    return render_error("unauthorized", "A valid bearer token is required.", :unauthorized) if token.blank?

    secret = ENV["JWT_SECRET"].to_s
    return render_error("server_configuration_error", "JWT_SECRET is not configured.", :internal_server_error) if secret.blank?

    payload, = JWT.decode(token, Base64.decode64(secret), true, { algorithm: "HS256" })
    subject = payload.fetch("sub")
    @current_user = LegacyUser.find(subject)
  rescue JWT::DecodeError, KeyError, ArgumentError, ActiveRecord::RecordNotFound
    render_error("unauthorized", "The session is invalid or has expired.", :unauthorized)
  end
end
