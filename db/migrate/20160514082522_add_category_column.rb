class AddCategoryColumn < ActiveRecord::Migration
  def change
    add_reference :formulas, :category, index: true
  	add_foreign_key :formulas, :categories
    add_reference :globals, :category, index: true
  	add_foreign_key :globals, :categories
  end
end