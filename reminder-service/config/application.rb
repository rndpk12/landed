require_relative "boot"

require "rails/all"

Bundler.require(*Rails.groups)

module LandedReminders
  class Application < Rails::Application
    config.load_defaults 7.1
    config.api_only = true
    config.eager_load = ENV.fetch("RAILS_EAGER_LOAD", "false") == "true"
    config.time_zone = "UTC"
    config.active_record.schema_format = :sql
    config.autoload_paths << Rails.root.join("app/services")
    config.generators.system_tests = nil
  end
end
