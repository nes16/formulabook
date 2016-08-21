class Property < ActiveRecord::Base
  acts_as_paranoid :column => 'deleted', :column_type => 'time'
  
  has_many :favorites, as: :favoritable
  has_many :units, -> (object){ where.not symbol: ['_','', nil]}, dependent: :destroy, :inverse_of => :property
  has_one :default_unit, -> (object){ where factor: '1'}, dependent: :destroy, class_name: "Unit"
  has_many :formulas
  has_many :validates

  validates :name, uniqueness: { case_sensitive: false }, presence: true, length: { minimum: 2, maximum: 30 }
  

end
