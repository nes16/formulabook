class AddSharedColumnAll < ActiveRecord::Migration
  def change 
  	add_reference :properties, :user, index: true
  	add_foreign_key :properties, :users
  	add_reference :units, :user, index: true
  	add_foreign_key :units, :users
    add_column :properties, :shared, :boolean
    add_column :units, :shared, :boolean
    add_column :formulas, :shared, :boolean
    add_column :globals, :shared, :boolean
  end
end