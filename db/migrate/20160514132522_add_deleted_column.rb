class AddDeletedColumn < ActiveRecord::Migration
  def change
    add_column :properties, :deleted, :boolean
    add_column :units, :deleted, :boolean
    add_column :globals, :deleted, :boolean
    add_column :formulas, :deleted, :boolean
    add_column :categories, :deleted, :boolean
    add_column :favorites, :deleted, :boolean
    add_column :variables, :deleted, :boolean
  end
end