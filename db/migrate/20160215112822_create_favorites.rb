class CreateFavorites < ActiveRecord::Migration
  def change 
  	create_table :favorites do |t|
      t.belongs_to  :user, index: true
      t.uuid :favoritable_id
      t.string  :favoritable_type

      t.datetime :deleted, index: true
      
      t.timestamps null: false
    end
    add_index :favorites, [:user_id, :favoritable_id, :favoritable_type], unique: true, name:'user_id_type' 

  end
end