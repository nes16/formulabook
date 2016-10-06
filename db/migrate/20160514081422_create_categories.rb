class CreateCategories < ActiveRecord::Migration
  def change
    create_table :categories, id: :uuid do |t|
      t.string :name
      t.integer :code
      t.references :parent
			t.boolean :shared
			t.belongs_to  :user, index: true

			t.datetime :deleted, index: true
			t.integer :lock_version, default: 0, null: false

      t.timestamps null: false
    end
  end
end