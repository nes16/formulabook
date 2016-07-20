class CreateFormulas < ActiveRecord::Migration
  def change
    create_table :formulas do |t|
	  t.string :latex
      t.string :name
      t.timestamps null: false
    end
  end
end