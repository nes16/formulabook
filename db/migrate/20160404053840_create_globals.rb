class CreateGlobals < ActiveRecord::Migration
  def change
    create_table :globals do |t|
		t.string :symbol
		t.string :name
		t.belongs_to :unit
		t.string :value

      	t.timestamps null: false
    end
  end
end