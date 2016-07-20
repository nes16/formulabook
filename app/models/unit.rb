require "staticcommon"

class Unit < ActiveRecord::Base
  extend CommonClassMethods
  
  has_many :favorites, as: :favoritable
  has_many :variables
  has_many :globals
  has_many :formulas
  belongs_to :property
  acts_as_paranoid :column => 'deleted', :column_type => 'time'
  validates :name,  presence: true, length: { maximum: 50 }
  #Returns formulas based on this unit

	def addGlobal name, val, symbol
	  globals << Global.new({name:name, value:val, symbol:symbol})
	  save
	end

	def addFormula name, latex, symbol
	  formulas << Formula.new({name:name, latex:latex, symbol:symbol})
	  save
	end

	def addVariable name,  symbol
	  variables << Variable.new({name:name, symbol:symbol})
	  save
	end
end
