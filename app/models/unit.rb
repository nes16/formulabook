class Unit < ActiveRecord::Base
  include ActiveUUID::UUID
	acts_as_paranoid :column => 'deleted', :column_type => 'time'

	has_many :favorites, as: :favoritable
	has_many :variables
	has_many :globals
	has_many :formulas
	belongs_to :property, :inverse_of => :units

  validates :name, uniqueness: { case_sensitive: false }, presence: true, length: { minimum: 2, maximum: 30 }
	validates :description,  length: { minimum: 5, maximum: 50 }, :allow_nil => true
	validates :symbol, uniqueness: { case_sensitive: true }, presence: true, length: { minimum: 1, maximum: 10 }
  validates :factor,  presence: true, format: { with: /\A([+-]?\d+(\.\d+(e[+-]\d+)?)?(e[+-]\d+)?)$\z/}, if: :factor_number?
  validates :system, inclusion: { in: %w(SI Others), message: "%{value} is not a valid system" }
	validates_presence_of :property
  #Returns formulas based on this unit

  def factor_number?
    if (factor && factor.index("x"))
      return false;
    else
      return true;
    end
  end


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
