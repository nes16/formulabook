class CreateUnit < ActiveRecord::Migration
  def change
    create_table :units do |t|
      t.belongs_to :property, index: true
      t.string :name
      t.string :description
      t.string :system
      t.string :symbol
      t.boolean :approx
      t.string :factor
      
      t.boolean :shared
      t.belongs_to  :user, index: true

      t.time :deleted, index: true
      t.integer :lock_version, default: 0, null: false

      t.timestamps null: false
    end
  end
end
