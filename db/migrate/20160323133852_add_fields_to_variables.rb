class AddFieldsToVariables < ActiveRecord::Migration
  def change
    add_reference :variables, :property, index: true
    add_foreign_key :variables, :properties
  end
end