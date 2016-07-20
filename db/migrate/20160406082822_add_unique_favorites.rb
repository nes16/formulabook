class AddUniqueFavorites < ActiveRecord::Migration
  def change 
   	remove_index :favorites, [:favoritable_id, :favoritable_type]
   	add_index :favorites, [:user_id, :favoritable_id, :favoritable_type], unique: true, name:'user_id_type' 
  end
end