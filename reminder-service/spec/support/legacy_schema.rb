require "securerandom"

RSpec.configure do |config|
  config.before(:suite) do
    ActiveRecord::Schema.define do
      unless connection.table_exists?(:users)
        create_table :users, id: :uuid do |t|
          t.string :name, null: false
          t.string :email, null: false
          t.string :password_hash, null: false
          t.timestamps null: false
        end
      end

      unless connection.table_exists?(:job_applications)
        create_table :job_applications, id: :uuid do |t|
          t.uuid :user_id, null: false
          t.string :company, null: false
          t.string :role, null: false
          t.string :location
          t.string :job_url
          t.string :status, null: false, default: "SAVED"
          t.text :job_description
          t.text :notes
          t.date :applied_date
          t.timestamps null: false
        end
      end
    end
  end
end
