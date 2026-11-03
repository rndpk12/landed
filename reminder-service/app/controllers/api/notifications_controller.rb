module Api
  class NotificationsController < ApplicationController
    def index
      notifications = Notification.where(user_id: current_user.id).order(created_at: :desc).limit(100)
      render json: notifications.as_json(only: %i[id reminder_id message read_at created_at])
    end
  end
end
