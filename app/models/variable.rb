require "staticcommon"

class Variable < ActiveRecord::Base
  extend CommonClassMethods

  belongs_to :formula
  has_many :attribute_values
  acts_as_paranoid :column => 'deleted', :column_type => 'time'
end
