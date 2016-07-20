class CreateVariables < ActiveRecord::Migration
  def change
    create_table :variables do |t|
	  t.string :symbol
      t.string :name
      t.boolean :lhs
      t.belongs_to :unit, index: true
      t.belongs_to :formula, index: true
      
      t.timestamps null: false
    end
  end
end