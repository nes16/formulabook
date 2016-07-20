class ChangeDeletedColumn  < ActiveRecord::Migration
  def change
    change_column :properties, :deleted, :time
    change_column :units, :deleted, :time
    change_column :globals, :deleted, :time
    change_column :formulas, :deleted, :time
    change_column :categories, :deleted, :time
    change_column :favorites, :deleted, :time
    change_column :variables, :deleted, :time
  end
end