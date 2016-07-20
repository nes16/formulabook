class AddIndexDeletedColumn  < ActiveRecord::Migration
  def change
    add_index :properties, :deleted
    add_index :units, :deleted
    add_index :globals, :deleted
    add_index :formulas, :deleted
    add_index :categories, :deleted
    add_index :favorites, :deleted
    add_index :variables, :deleted
  end
end