require "staticcommon"

class Formula < ActiveRecord::Base
  extend CommonClassMethods

  has_many :favorites, as: :favoritable
  has_many :variables, dependent: :destroy
  has_many :fgs
  belongs_to :property
  belongs_to :unit
  acts_as_paranoid :column => 'deleted', :column_type => 'time'
end
