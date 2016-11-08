# This file should contain all the record creation needed to seed the database with its default values.
# The data can then be loaded with the rake db:seed (or created alongside the db with db:setup).
#
# Examples:
#
#   cities = City.create([{ name: 'Chicago' }, { name: 'Copenhagen' }])
#   Mayor.create(name: 'Emanuel', city: cities.first)
User.delete_all

user = User.create! :name => 'TestAdmin', :email => 'testadmin@sangamsofech.com', :password => 'rs#123456', :password_confirmation => 'rs#123456'


5.times do |n|
  name  = "TestUser#{n+1}"
  email = "testuser#{n+1}@sangamsoftech.com"
  password = "rs#123456"
  User.create(:name => name, :email => email, :password => password, :password_confirmation => password)
end

require "./db/seed_units_wiki.rb";
require "./db/seed_formulas.rb";




