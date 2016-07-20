class CreateUnit < ActiveRecord::Migration
  def change
    create_table :units do |t|
      t.belongs_to :property, index: true
      t.string :name
      t.string :system
      t.boolean :baseunit
      t.string :symbol
      t.string :prefix
      t.string :extend
      t.string :definition
      t.string :description
      t.boolean :approx
      t.string :factor
      t.integer :repeat

      t.timestamps null: false
    end
  end
end
