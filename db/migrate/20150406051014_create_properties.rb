class CreateProperties < ActiveRecord::Migration
  def change
   
    create_table :properties, id: :uuid  do |t|
      t.string :name
      t.string :dims
      
      t.belongs_to  :user, index: true
      t.boolean :shared
      
      t.datetime :deleted, index: true
      t.integer :lock_version, default: 0, null: false
      
      t.timestamps null: false
    end
  end
end
