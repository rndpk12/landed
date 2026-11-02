class ReminderDispatchJob < ApplicationJob
  queue_as :reminders

  retry_on StandardError, wait: :polynomially_longer, attempts: 5

  def perform(reminder_id)
    reminder = Reminder.find_by(id: reminder_id)
    return unless reminder

    Reminder.transaction do
      reminder.lock!
      return if reminder.processed? || reminder.cancelled?

      reminder.update!(status: "processing", attempt_count: reminder.attempt_count + 1)
      Notification.create!(reminder_id: reminder.id, user_id: reminder.user_id, message: reminder.message) unless Notification.exists?(reminder_id: reminder.id)
      reminder.update!(status: "processed", processed_at: Time.current, last_error: nil)
    end
  rescue ActiveRecord::RecordNotUnique
    reminder&.update_columns(status: "processed", processed_at: Time.current, last_error: nil)
  rescue StandardError => error
    reminder&.update_columns(status: "failed", last_error: error.message, updated_at: Time.current)
    raise
  end
end
