Rails.application.routes.draw do
  get "/health", to: "health#show"

  namespace :api do
    resources :reminders, only: %i[index show create update destroy]
    resources :notifications, only: %i[index]
  end
end
