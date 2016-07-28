class Formula < ActiveRecord::Base
  acts_as_paranoid :column => 'deleted', :column_type => 'time'

  has_many :favorites, as: :favoritable
  has_many :variables, dependent: :destroy
  has_many :globals, through: :fgs
  has_many :fgs, dependent: :destroy
  belongs_to :property
  belongs_to :unit

  validates :name, uniqueness: { case_sensitive: false }, presence: true, length: { minimum: 5, maximum: 30 }
  validates :symbol, uniqueness: true, presence: true, length: { minimum: 1, maximum: 3 }
  validate :belongs_to_property_or_unit
  validates_associated :variables
  validates_associated :fgs

end
