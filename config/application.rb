require File.expand_path('../boot', __FILE__)

require 'rails/all'

# Require the gems listed in Gemfile, including any gems
# you've limited to :test, :development, or :production.
Bundler.require(*Rails.groups)

module TestLab
  class Application < Rails::Application
    # Settings in config/environments/* take precedence over those specified here.
    # Application configuration should go into files in config/initializers
    # -- all .rb files in that directory are automatically loaded.

    # Set Time.zone default to the specified zone and make Active Record auto-convert to this zone.
    # Run "rake -D time" for a list of tasks for finding time zone names. Default is UTC.
    # config.time_zone = 'Central Time (US & Canada)'

    # The default locale is :en and all translations from config/locales/*.rb,yml are auto loaded.
    # config.i18n.load_path += Dir[Rails.root.join('my', 'locales', '*.{rb,yml}').to_s]
    # config.i18n.default_locale = :de

    # Do not swallow errors in after_commit/after_rollback callbacks.
    #hack
    config.active_record.raise_in_transactional_callbacks = false
    
    # Include the authenticity token in remote forms.
    #hack
    config.action_view.embed_authenticity_token_in_remote_forms = false
    #config.requirejs.loader = :almond
    
    config.requirejs.logical_asset_filter += [/\.us$/]

    config.web_console.whitelisted_ips = '172.17.42.1'

    config.active_record.schema_format =

    config.middleware.use Rack::Cors do
          allow do
            origins '*'
            resource '*',
              :headers => :any,
              :expose  => ['access-token', 'expiry', 'token-type', 'uid', 'client'],
              :methods => [:get, :post, :options, :delete, :put]
          end
        end
  end
end