class CreateFavorites < ActiveRecord::Migration
  def change 
  	
  	create_table :favorites do |t|
		t.belongs_to  :user, index: true
		t.integer :favoritable_id
		t.string  :favoritable_type
		t.timestamps null: false
  	end

  	create_table :variable_attributes do |t|
		t.string  :name

		t.timestamps null: false
  	end


  	create_table :attribute_values do |t|
		t.belongs_to  :variable, index: true
		t.belongs_to  :variable_attribute
		t.string	  :attval

		t.timestamps null: false
  	end

  	create_table :property_aliases do |t|
		t.belongs_to  :property, index: true
		t.string  :name

		t.timestamps null: false
  	end


  	add_index :favorites, [:favoritable_id, :favoritable_type], unique: true
  end
end