Rails.application.configure do
  config.cache_classes = false
  config.eager_load = false
  config.consider_all_requests_local = true
  config.active_record.verbose_query_logs = true
  config.action_controller.perform_caching = false
end
