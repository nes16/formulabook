require "staticcommon"

class Property < ActiveRecord::Base
  extend CommonClassMethods
  
  has_many :favorites, as: :favoritable
  has_many :units, -> (object){ where.not symbol: ['_','', nil]}, dependent: :destroy
  has_many :property_aliases, dependent: :destroy
  has_one :default_unit, -> (object){ where factor: '1'}, dependent: :destroy, class_name: "Unit"
  acts_as_paranoid :column => 'deleted', :column_type => 'time'
  validates :name,  presence: true, length: { maximum: 50 }
end
