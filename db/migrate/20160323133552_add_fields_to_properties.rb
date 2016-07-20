class AddFieldsToProperties < ActiveRecord::Migration
  def change
    add_column :properties, :dims, :string
  end
end