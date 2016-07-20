class CreateTestStates < ActiveRecord::Migration
  def change
    create_table :test_states do |t|
      t.string :testHash
      t.string :testState


      t.timestamps null: false
    end
  end
end