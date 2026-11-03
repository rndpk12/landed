module Api
  class RemindersController < ApplicationController
    def index
      reminders = Reminder.for_user(current_user.id).includes(:job_application).order(scheduled_at: :asc)
      render json: reminders.map { |reminder| ReminderSerializer.new(reminder).as_json }
    end

    def show
      render json: ReminderSerializer.new(find_owned_reminder).as_json
    end

    def create
      reminder = Reminder.new(reminder_params.merge(user_id: current_user.id, status: "scheduled"))
      reminder.job_application = owned_application(reminder.job_application_id)
      reminder.save!
      reminder.schedule_dispatch!
      render json: ReminderSerializer.new(reminder).as_json, status: :created
    end

    def update
      reminder = find_owned_reminder
      reminder.assign_attributes(reminder_update_params)
      reminder.status = "scheduled" if reminder.will_save_change_to_scheduled_at? && reminder.processed_at.blank?
      reminder.save!
      reminder.schedule_dispatch! if reminder.scheduled? && reminder.scheduled_at.future?
      render json: ReminderSerializer.new(reminder).as_json
    end

    def destroy
      reminder = find_owned_reminder
      reminder.destroy!
      head :no_content
    end

    private

    def find_owned_reminder
      Reminder.for_user(current_user.id).find(params[:id])
    end

    def owned_application(id)
      application = LegacyJobApplication.where(id: id, user_id: current_user.id).first
      raise ActiveRecord::RecordNotFound, "Job application not found" unless application

      application
    end

    def reminder_params
      params.require(:reminder).permit(:job_application_id, :message, :scheduled_at)
    end

    def reminder_update_params
      params.require(:reminder).permit(:message, :scheduled_at)
    end
  end
end
