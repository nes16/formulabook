class AddTxnfieldToResources  < ActiveRecord::Migration
  def change
    add_column :properties, :txn, :string
    add_column :units, :txn, :string
    add_column :globals, :txn, :string
    add_column :formulas, :txn, :string
    add_column :categories, :txn, :string
    add_column :properties, :oldId, :integer
    add_column :units, :oldId, :integer
    add_column :globals, :oldId, :integer
    add_column :formulas, :oldId, :integer
    add_column :categories, :oldId, :integer
  end
end