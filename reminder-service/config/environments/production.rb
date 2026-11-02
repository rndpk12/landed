Rails.application.configure do
  config.cache_classes = true
  config.eager_load = true
  config.consider_all_requests_local = false
  config.active_record.dump_schema_after_migration = false
  config.force_ssl = ENV.fetch("FORCE_SSL", "false") == "true"
end
