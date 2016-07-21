class AddDeletedColumn < ActiveRecord::Migration
  def change
    add_column :properties, :deleted, :time
    add_column :units, :deleted, :time
    add_column :globals, :deleted, :time
    add_column :formulas, :deleted, :time
    add_column :categories, :deleted, :time
    add_column :favorites, :deleted, :time
    add_column :variables, :deleted, :time
  end
end