class CreateTableFgs < ActiveRecord::Migration
  def change
    create_table :fgs do |t|
      t.belongs_to :formula, index: true
      t.belongs_to :global, index: true
      t.integer  :lock_version, default: 0, null:false
      t.time :deleted

      t.timestamps null: false
    end
    add_index :fgs, [:formula_id, :global_id], unique: true
    add_index :fgs, :deleted
  end
end