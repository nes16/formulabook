class AddFieldsToFormulas < ActiveRecord::Migration
  def change
  	add_column :formulas, :symbol, :string 
    add_reference :formulas, :unit, index: true
    add_foreign_key :formulas, :units
    add_reference :formulas, :property, index: true
    add_foreign_key :formulas, :properties
  end
end