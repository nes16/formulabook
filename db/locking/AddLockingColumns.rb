class AddLockingColumns < ActiveRecord::Migration
   def self.up
      add_column :destinations, :lock_version, :integer
   end

   def self.down
      remove_column :destinations, :lock_version
   end
end