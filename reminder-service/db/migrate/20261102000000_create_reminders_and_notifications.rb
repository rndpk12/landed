class CreateRemindersAndNotifications < ActiveRecord::Migration[7.1]
  def change
    enable_extension "pgcrypto" unless extension_enabled?("pgcrypto")

    create_table :reminders, id: :uuid do |t|
      t.uuid :job_application_id, null: false
      t.uuid :user_id, null: false
      t.string :message, null: false, limit: 500
      t.datetime :scheduled_at, null: false
      t.string :status, null: false, default: "scheduled", limit: 20
      t.datetime :processed_at
      t.integer :attempt_count, null: false, default: 0
      t.text :last_error
      t.timestamps null: false
    end

    add_index :reminders, %i[user_id scheduled_at]
    add_index :reminders, %i[user_id status]
    add_check_constraint :reminders, "status IN ('scheduled','processing','processed','failed','cancelled')", name: "ck_reminders_status"
    add_foreign_key :reminders, :users, column: :user_id if table_exists?(:users)
    add_foreign_key :reminders, :job_applications, column: :job_application_id if table_exists?(:job_applications)

    create_table :notifications, id: :uuid do |t|
      t.uuid :reminder_id, null: false
      t.uuid :user_id, null: false
      t.string :message, null: false, limit: 500
      t.datetime :read_at
      t.timestamps null: false
    end

    add_index :notifications, :reminder_id, unique: true
    add_index :notifications, %i[user_id created_at]
    add_foreign_key :notifications, :reminders, column: :reminder_id
    add_foreign_key :notifications, :users, column: :user_id if table_exists?(:users)
  end
end
