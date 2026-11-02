ENV["RAILS_ENV"] ||= "test"
ENV["JWT_SECRET"] ||= Base64.strict_encode64("r" * 32)

require File.expand_path("../config/environment", __dir__)
abort("The Rails environment is running in production mode!") if Rails.env.production?
require "rspec/rails"
require "sidekiq/testing"
Dir[File.expand_path("support/**/*.rb", __dir__)].sort.each { |file| require file }
Dir[File.expand_path("factories/**/*.rb", __dir__)].sort.each { |file| require file }

RSpec.configure do |config|
  config.include FactoryBot::Syntax::Methods
  config.use_transactional_fixtures = true
  config.infer_spec_type_from_file_location!
  config.filter_rails_from_backtrace!
end
