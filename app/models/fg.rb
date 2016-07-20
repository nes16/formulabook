require "staticcommon"

class Fg < ActiveRecord::Base
  extend CommonClassMethods
  belongs_to :formula
  belongs_to :global
  acts_as_paranoid :column => 'deleted', :column_type => 'time'
end
