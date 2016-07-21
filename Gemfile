source 'https://rubygems.org'


# Bundle edge Rails instead: gem 'rails', github: 'rails/rails'
gem 'rails', '4.2.0'

gem 'bootstrap-sass',       '3.2.0.0'

# Use SCSS for stylesheets
gem 'sass-rails', '~> 5.0'
# Use Uglifier as compressor for JavaScript assets
gem 'uglifier', '>= 1.3.0'
# See https://github.com/rails/execjs#readme for more supported runtimes
# gem 'therubyracer', platforms: :ruby

# Use jquery as the JavaScript library
gem 'jquery-rails'
# Turbolinks makes following links in your web application faster. Read more: https://github.com/rails/turbolinks
gem 'turbolinks'
# Build JSON APIs with ease. Read more: https://github.com/rails/jbuilder
gem 'jbuilder', '~> 2.0'
# bundle exec rake doc:rails generates the API under doc/api.
gem 'sdoc', '~> 0.4.0', group: :doc

#user authentication
gem 'devise'
gem 'devise_token_auth', '0.1.37.beta4'
gem 'omniauth-github',        :git => 'git://github.com/intridea/omniauth-github.git'
gem 'omniauth-facebook',      :git => 'git://github.com/mkdynamic/omniauth-facebook.git'
gem 'omniauth-google-oauth2', :git => 'git://github.com/zquestz/omniauth-google-oauth2.git'
# Application server
gem 'puma'

gem 'minitest'
gem 'mini_magick',             '3.8.0'

# Use ActiveModel has_secure_password
# gem 'bcrypt', '~> 3.1.7'

# Use Unicorn as the app server
# gem 'unicorn'

# Use Capistrano for deployment
# gem 'capistrano-rails', group: :development
gem 'requirejs-rails',         '0.9.5'
gem 'figaro', :github => "laserlemon/figaro"
gem 'rack-cors', :require => 'rack/cors'
gem "paranoia", "~> 2.0"

group :development, :test do
  # Call 'byebug' anywhere in the code to stop execution and get a debugger console
  gem 'byebug'
  # Use sqlite3 as the database for Active Record
  gem 'sqlite3'
  # create fake users
  gem 'faker',                '1.4.2'
  gem 'web-console', '2.2.1'

end

group :test do
  gem 'minitest-reporters', '1.0.5'
  gem 'mini_backtrace',     '0.1.3'
  gem 'guard-minitest',     '2.3.1'
end

group :production do
	# Use postgresql as the database for Active Record
	gem 'pg'
	gem 'rails_12factor'

end

ruby "2.2.0"