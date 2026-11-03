class HealthController < ActionController::API
  def show
    render json: { status: "ok", service: "landed-reminders" }
  end
end
