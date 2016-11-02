Rails.application.routes.draw do
  mount_devise_token_auth_for 'User', at: '/api/v1/auth',
  :controllers => {sessions: 'sessions'}
  # devise_for :users, path: "account", 
  #             path_names: { 
  #               sign_in: 'login',
  #               sign_out: 'logout',
  #               password: 'recoverpwd',
  #               unlock: 'unblock',
  #               registration: 'register',
  #               sign_up: 'signup' 
  #             },
  #             :controllers => {sessions: 'sessions', registrations: 'registrations'}

  # devise_scope :user do
  #   get "account/getuserinfo", to: "registrations#getuserinfo"
  # end

  root 'static_pages#formulabook'
  
  get 'about'   => 'static_pages#about'
  get 'contact' => 'static_pages#contact'
  get 'formulabook', :to => redirect('/formulabook/index.html')

  namespace :api do
    namespace :v1 do
      namespace :std do
        resources :units
        resources :properties, only: [:index, :create, :update, :destroy] do
          resources :units, only: [:index, :create, :update, :destroy]
        end
      end
      get 'sync'    => 'syncs#index'
      put 'sync'    => 'syncs#sync'
      put 'clean'    => 'test#clean'
      put 'unique'  => 'unique#unique?'
      resources :formulas do
        resources :variables
        resources :globals, only: [:index, :destroy]
      end
      resources :variables
      resources :globals
      resources :favorites
      resources :categories
    end 
  end
end
