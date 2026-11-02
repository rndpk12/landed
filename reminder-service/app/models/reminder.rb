class Reminder < ApplicationRecord
  STATUSES = %w[scheduled processing processed failed cancelled].freeze

  enum :status, STATUSES.index_by(&:itself), validate: true

  belongs_to :user, class_name: "LegacyUser", foreign_key: :user_id, inverse_of: false
  belongs_to :job_application, class_name: "LegacyJobApplication", foreign_key: :job_application_id, inverse_of: false
  has_one :notification, dependent: :destroy

  validates :message, presence: true, length: { maximum: 500 }
  validates :scheduled_at, presence: true
  validates :status, inclusion: { in: STATUSES }
  validates :job_application_id, :user_id, presence: true
  validate :scheduled_at_must_be_future, if: -> { new_record? || will_save_change_to_scheduled_at? }
  validate :job_application_belongs_to_user

  scope :upcoming, -> { where(status: %w[scheduled processing]).where("scheduled_at >= ?", Time.current).order(:scheduled_at) }
  scope :for_user, ->(user_id) { where(user_id: user_id) }

  def schedule_dispatch!
    ReminderDispatchJob.set(wait_until: scheduled_at).perform_later(id)
  end

  private

  def scheduled_at_must_be_future
    return if scheduled_at.blank? || scheduled_at > Time.current

    errors.add(:scheduled_at, "must be in the future")
  end

  def job_application_belongs_to_user
    return if job_application_id.blank? || user_id.blank?
    return if job_application && job_application.user_id == user_id

    errors.add(:job_application_id, "does not belong to the current user")
  end
end
