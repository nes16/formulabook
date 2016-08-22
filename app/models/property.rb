class Property < ActiveRecord::Base
  acts_as_paranoid :column => 'deleted', :column_type => 'time'
  after_destroy :destroy_child
  has_many :favorites, as: :favoritable
  has_many :units, -> (object){ where.not symbol: ['_','', nil]}, :inverse_of => :property
  has_one :default_unit, -> (object){ where factor: '1'}, class_name: "Unit"
  has_many :formulas
  has_many :validates

  validates :name, uniqueness: { case_sensitive: false }, presence: true, length: { minimum: 2, maximum: 30 }
  
  def test
  	k = {a:[10,11,12]}
  	iter = k[:a].map
  	iter.each do |i|
  		puts i
  	end
  end

  def destroy_child
  	units.each do |u|
  		u.really_destroy!
  	end
  end
end
