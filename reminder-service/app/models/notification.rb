class Notification < ApplicationRecord
  belongs_to :reminder
  belongs_to :user, class_name: "LegacyUser", foreign_key: :user_id, inverse_of: false

  validates :message, presence: true, length: { maximum: 500 }
  validates :reminder_id, uniqueness: true
end
