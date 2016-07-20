class AddLockVersionColumn  < ActiveRecord::Migration
  def change
    add_column :properties, :lock_version, :integer
    add_column :units, :lock_version, :integer
    add_column :globals, :lock_version, :integer
    add_column :formulas, :lock_version, :integer
    add_column :categories, :lock_version, :integer
    add_column :favorites, :lock_version, :integer
    add_column :variables, :lock_version, :integer
  end
end