class ChangeLockVersionColumn  < ActiveRecord::Migration
  def change
    change_column :properties, :lock_version, :integer, default: 0, null: false
    change_column :units, :lock_version, :integer, default: 0, null: false
    change_column :globals, :lock_version, :integer, default: 0, null: false
    change_column :formulas, :lock_version, :integer, default: 0, null: false
    change_column :categories, :lock_version, :integer, default: 0, null: false
    change_column :favorites, :lock_version, :integer, default: 0, null: false
    change_column :variables, :lock_version, :integer, default: 0, null: false
  end
end