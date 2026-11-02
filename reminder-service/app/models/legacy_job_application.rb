class LegacyJobApplication < ActiveRecord::Base
  self.table_name = "job_applications"
  self.primary_key = "id"
  self.inheritance_column = :_type_disabled

  belongs_to :user, class_name: "LegacyUser", foreign_key: :user_id, inverse_of: false

  def readonly?
    true
  end
end
