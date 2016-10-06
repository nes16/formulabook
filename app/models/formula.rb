require 'categorizable.rb'

class Formula < ActiveRecord::Base
	include Categorizable
  acts_as_paranoid :column => 'deleted', :column_type => 'time'
  after_destroy :destroy_child

  has_many :favorites, as: :favoritable
  has_many :globals, through: :fgs
  has_many :variables
  has_many :fgs
  belongs_to :property
  belongs_to :unit

  validates :name, uniqueness: { case_sensitive: false }, presence: true, length: { minimum: 2, maximum: 30 }
  validates :symbol, uniqueness: true, presence: true, length: { minimum: 1, maximum: 10 }
  validate :belongs_to_property_or_unit
  validates_associated :variables
  validates_associated :fgs

  def destroy_child
    variables.each do |v|
      v.really_destroy!
    end
    fgs.each do |g|
      g.really_destroy!
    end
  end
end
