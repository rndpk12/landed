FactoryBot.define do
  factory :legacy_user, class: "LegacyUser" do
    id { SecureRandom.uuid }
    name { Faker::Name.name }
    sequence(:email) { |n| "user#{n}@example.com" }
    password_hash { "test-hash" }
  end

  factory :legacy_job_application, class: "LegacyJobApplication" do
    id { SecureRandom.uuid }
    association :user, factory: :legacy_user
    company { "Example Co" }
    role { "Software Engineer" }
    location { "Remote" }
    status { "SAVED" }
  end

  factory :reminder do
    id { SecureRandom.uuid }
    association :user, factory: :legacy_user
    association :job_application, factory: :legacy_job_application
    message { "Follow up with the recruiter" }
    scheduled_at { 1.day.from_now }
    status { "scheduled" }
  end
end
