class CreateCrs < ActiveRecord::Migration
  def change
    create_table :crs do |t|
      t.uuid :category_id, index: true
      t.uuid :categorizable_id, index: true
      t.string :categorizable_type

      t.datetime :deleted, index: true
      t.integer :lock_version, default: 0, null: false

      t.timestamps null: false
    end
    add_index :crs, [:category_id, :categorizable_id], unique: true
  end
end