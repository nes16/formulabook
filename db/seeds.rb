# This file should contain all the record creation needed to seed the database with its default values.
# The data can then be loaded with the rake db:seed (or created alongside the db with db:setup).
#
# Examples:
#
#   cities = City.create([{ name: 'Chicago' }, { name: 'Copenhagen' }])
#   Mayor.create(name: 'Emanuel', city: cities.first)
User.delete_all

user = User.create! :name => 'John Doe', :email => 'john@sangamsoftech.org', :password => 'topsecret', :password_confirmation => 'topsecret'

10.times do |n|
  name  = Faker::Name.name
  email = "user#{n+1}@a.com"
  password = "password"
  User.create(:name => name, :email => email, :password => password, :password_confirmation => password)
end

require "./db/seed_units_wiki.rb";
require "./db/seed_formulas.rb";




