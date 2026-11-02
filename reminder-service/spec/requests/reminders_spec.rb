require "rails_helper"

RSpec.describe "Reminders API", type: :request do
  let!(:user) { create(:legacy_user) }
  let!(:application) { create(:legacy_job_application, user: user, company: "Landed", role: "Engineer") }
  let(:headers) { auth_headers(user) }

  before { Sidekiq::Testing.fake! }

  it "requires authentication" do
    get "/api/reminders"

    expect(response).to have_http_status(:unauthorized)
    expect(response.parsed_body.dig("error", "code")).to eq("unauthorized")
  end

  it "creates and lists an owned reminder" do
    post "/api/reminders", params: { reminder: {
      job_application_id: application.id,
      message: "Prepare for the interview",
      scheduled_at: 2.hours.from_now.iso8601
    } }.to_json, headers: headers

    expect(response).to have_http_status(:created)
    reminder_id = response.parsed_body.fetch("id")
    expect(enqueued_jobs.count { |job| job[:job] == ReminderDispatchJob }).to eq(1)

    get "/api/reminders", headers: headers
    expect(response).to have_http_status(:ok)
    expect(response.parsed_body.map { |item| item["id"] }).to include(reminder_id)
    expect(response.parsed_body.first.dig("application", "company")).to eq("Landed")
  end

  it "prevents cross-user access" do
    reminder = create(:reminder, user: user, job_application: application)
    other_user = create(:legacy_user)

    get "/api/reminders/#{reminder.id}", headers: auth_headers(other_user)

    expect(response).to have_http_status(:not_found)
  end

  it "returns structured validation errors" do
    post "/api/reminders", params: { reminder: {
      job_application_id: application.id,
      message: "",
      scheduled_at: 1.minute.ago.iso8601
    } }.to_json, headers: headers

    expect(response).to have_http_status(:unprocessable_entity)
    expect(response.parsed_body.dig("error", "code")).to eq("validation_error")
    expect(response.parsed_body.dig("error", "details")).to include("message", "scheduled_at")
  end

  it "updates and deletes an owned reminder" do
    reminder = create(:reminder, user: user, job_application: application)

    patch "/api/reminders/#{reminder.id}", params: { reminder: { message: "Updated", scheduled_at: 3.hours.from_now.iso8601 } }.to_json, headers: headers
    expect(response).to have_http_status(:ok)
    expect(response.parsed_body["message"]).to eq("Updated")

    delete "/api/reminders/#{reminder.id}", headers: headers
    expect(response).to have_http_status(:no_content)
    expect(Reminder.exists?(reminder.id)).to be(false)
  end
end
