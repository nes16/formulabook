class Fg < ActiveRecord::Base
  belongs_to :formula
  belongs_to :global
  validates_presence_of :formula
  validates_presence_of :global
end