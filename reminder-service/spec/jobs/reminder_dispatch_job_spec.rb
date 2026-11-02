require "rails_helper"

RSpec.describe ReminderDispatchJob, type: :job do
  it "creates one notification and marks a reminder processed" do
    reminder = create(:reminder)

    described_class.perform_now(reminder.id)
    described_class.perform_now(reminder.id)

    expect(reminder.reload.status).to eq("processed")
    expect(reminder.processed_at).to be_present
    expect(Notification.where(reminder_id: reminder.id).count).to eq(1)
  end

  it "does not process a cancelled reminder" do
    reminder = create(:reminder, status: "cancelled")

    described_class.perform_now(reminder.id)

    expect(reminder.reload.status).to eq("cancelled")
    expect(Notification.where(reminder_id: reminder.id)).to be_empty
  end
end
