module AuthHelpers
  def auth_headers(user)
    token = JWT.encode({ "sub" => user.id.to_s, "exp" => 1.hour.from_now.to_i }, Base64.decode64(ENV.fetch("JWT_SECRET")), "HS256")
    { "Authorization" => "Bearer #{token}", "CONTENT_TYPE" => "application/json" }
  end
end

RSpec.configure { |config| config.include AuthHelpers, type: :request }
