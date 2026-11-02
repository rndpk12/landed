Rails.application.config.middleware.insert_before 0, Rack::Cors do
  allow do
    origins(*ENV.fetch("CORS_ALLOWED_ORIGINS", "http://localhost:3000").split(",").map(&:strip))
    resource "*", headers: :any, methods: %i[get post patch put delete options head], expose: %w[Content-Type], max_age: 600
  end
end
