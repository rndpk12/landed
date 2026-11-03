ENV["RAILS_ENV"] ||= "test"
ENV["JWT_SECRET"] ||= Base64.strict_encode64("r" * 32)

require "sidekiq/testing"
