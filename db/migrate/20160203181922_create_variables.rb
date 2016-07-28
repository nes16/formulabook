class CreateVariables < ActiveRecord::Migration
  def change
    create_table :variables do |t|
      t.string :name
      t.string :symbol
      t.belongs_to :unit
      t.belongs_to :property
      t.belongs_to :formula, index: true
      
      t.time :deleted, index: true
      t.integer :lock_version, default: 0, null: false

      t.timestamps null: false
    end
  end
end