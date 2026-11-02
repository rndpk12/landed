class ReminderSerializer
  def initialize(reminder)
    @reminder = reminder
  end

  def as_json(*)
    {
      id: @reminder.id,
      jobApplicationId: @reminder.job_application_id,
      userId: @reminder.user_id,
      message: @reminder.message,
      scheduledAt: @reminder.scheduled_at&.iso8601,
      status: @reminder.status,
      processedAt: @reminder.processed_at&.iso8601,
      attemptCount: @reminder.attempt_count,
      createdAt: @reminder.created_at&.iso8601,
      updatedAt: @reminder.updated_at&.iso8601,
      application: application_json
    }
  end

  private

  def application_json
    application = @reminder.job_application
    return nil unless application

    { id: application.id, company: application.company, role: application.role, location: application.location }
  end
end
