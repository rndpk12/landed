ENV["RAILS_ENV"] ||= "test"
ENV["JWT_SECRET"] ||= Base64.strict_encode64("r" * 32)

require "rspec/rails"
require "sidekiq/testing"

RSpec.configure do |config|
  config.use_transactional_fixtures = true
  config.infer_spec_type_from_file_location!
  config.filter_rails_from_backtrace!
end
