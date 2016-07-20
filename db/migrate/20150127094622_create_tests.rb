class CreateTests < ActiveRecord::Migration
  def change
    create_table :tests do |t|
      t.belongs_to :user, index: true
      t.string :title
      t.string :tester
      t.string :testHash
      t.string :parentHash
      t.string :access
      t.string :stateURL

      t.timestamps null: false
    end
  end
end
