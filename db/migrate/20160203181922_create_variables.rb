class CreateVariables < ActiveRecord::Migration
  def change
    create_table :variables, id: :uuid  do |t|
      t.string :name
      t.string :symbol
      t.uuid :unit_id
      t.uuid :property_id
      t.uuid :formula_id, index: true
      
      t.time :deleted, index: true
      t.integer :lock_version, default: 0, null: false

      t.timestamps null: false
    end
  end
end