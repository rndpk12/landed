require "rails_helper"

RSpec.describe Reminder, type: :model do
  it "requires a future schedule and a message" do
    reminder = build(:reminder, message: "", scheduled_at: 1.minute.ago)

    expect(reminder).not_to be_valid
    expect(reminder.errors[:message]).to include("can't be blank")
    expect(reminder.errors[:scheduled_at]).to include("must be in the future")
  end

  it "rejects applications owned by a different user" do
    owner = create(:legacy_user)
    other_user = create(:legacy_user)
    application = create(:legacy_job_application, user: owner)
    reminder = build(:reminder, user: other_user, job_application: application)

    expect(reminder).not_to be_valid
    expect(reminder.errors[:job_application_id]).to include("does not belong to the current user")
  end

  it "accepts the supported processing states" do
    expect(build(:reminder, status: "scheduled")).to be_valid
    expect(build(:reminder, status: "processed")).to be_valid
    expect(build(:reminder, status: "unknown")).not_to be_valid
  end
end
