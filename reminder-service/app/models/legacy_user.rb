class LegacyUser < ActiveRecord::Base
  self.table_name = "users"
  self.primary_key = "id"
  self.inheritance_column = :_type_disabled

  def readonly?
    !Rails.env.test?
  end
end
