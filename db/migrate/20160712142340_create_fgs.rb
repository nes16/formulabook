class CreateFgs < ActiveRecord::Migration
  def change
    create_table :fgs do |t|
      t.uuid :formula_id, index: true
      t.uuid :global_id, index: true

      t.datetime :deleted, index: true
      t.integer :lock_version, default: 0, null: false

      t.timestamps null: false
    end
    add_index :fgs, [:formula_id, :global_id], unique: true
  end
end