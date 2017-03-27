class Fg < ActiveRecord::Base
  acts_as_paranoid :column => 'deleted', :column_type => 'time'
  
  belongs_to :formula
  belongs_to :global
  validates_presence_of :formula
  validates_presence_of :global
end