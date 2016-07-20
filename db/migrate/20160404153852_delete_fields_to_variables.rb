class DeleteFieldsToVariables < ActiveRecord::Migration
  def change
  	remove_column :variables, :lhs, :boolean 
  end
end