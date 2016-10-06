class Category < ActiveRecord::Base
  has_many :crs
  validates :name, uniqueness: { case_sensitive: false }, presence: true
  acts_as_tree order: "name"
  acts_as_paranoid :column => 'deleted', :column_type => 'time'
end