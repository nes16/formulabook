class AddUserColumnAll < ActiveRecord::Migration
  def change 
  	add_reference :formulas, :user, index: true
  	add_foreign_key :formulas, :users
  	add_reference :globals, :user, index: true
  	add_foreign_key :globals, :users
  end
end