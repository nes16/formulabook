class CreateFormulas < ActiveRecord::Migration
  def change
    create_table :formulas, id: :uuid  do |t|
      t.string :name
      t.string :symbol
  	  t.string :latex
  	  t.uuid :unit_id
  	  t.uuid :property_id
      
      t.boolean :shared
	    t.belongs_to  :user, index: true

      t.datetime :deleted, index: true
      t.integer :lock_version, default: 0, null: false

      t.timestamps null: false
    end
  end
end
