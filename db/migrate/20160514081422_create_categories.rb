class CreateCategories < ActiveRecord::Migration
  def change
    create_table :categories do |t|
      t.string :name
      t.references :parent
 
			t.boolean :shared
			t.belongs_to  :user, index: true

			t.time :deleted, index: true
			t.integer :lock_version, default: 0, null: false

      t.timestamps null: false
    end
  end
end