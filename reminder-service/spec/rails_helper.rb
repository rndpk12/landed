ENV["RAILS_ENV"] ||= "test"
ENV["JWT_SECRET"] ||= Base64.strict_encode64("r" * 32)

require_relative "spec_helper"
require File.expand_path("../config/environment", __dir__)
abort("The Rails environment is running in production mode!") if Rails.env.production?
require "rspec/rails"
require "sidekiq/testing"

# Rails can load this helper more than once when request specs boot the app
# through the test environment. Keep support files and factories idempotent.
unless defined?(REMINDER_SPEC_SUPPORT_LOADED)
  Dir[File.expand_path("support/**/*.rb", __dir__)].sort.each { |file| require file }
  Dir[File.expand_path("factories/**/*.rb", __dir__)].sort.each do |file|
    require file unless FactoryBot.factories.registered?(:legacy_user)
  end
  REMINDER_SPEC_SUPPORT_LOADED = true
end

RSpec.configure do |config|
  config.include FactoryBot::Syntax::Methods
  config.use_transactional_fixtures = true
  config.infer_spec_type_from_file_location!
  config.filter_rails_from_backtrace!
end
