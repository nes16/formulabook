class AddTxnfieldToVariables  < ActiveRecord::Migration
  def change
    add_column :variables, :txn, :string
    add_column :variables, :oldId, :integer
  end
end