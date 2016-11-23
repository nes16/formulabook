require 'categorizable.rb'

class Variable  
  include ActiveModel::Validations

  validates_presence_of :name, :symbol, :unit_id

  attr_accessor :name, :symbol, :unit_id, :values
  def initialize(name, symbol, unit_id, values)
    @name, @symbol, @unit_id, = name, symbol, unit_id
    @values = []
    if values
      values.each do |v|
        @values <<  UValue.new(v[:key], v[:input], v[:unit_id])
      end
    end
  end
end  

class UValue  
  include ActiveModel::Validations

  validates_presence_of :input, :unit_id

  attr_accessor :input, :unit_id, :key
  def initialize(key, input,  unit_id)
    @input, @unit_id, @key = input, unit_id, key
  end

  
end  

class Formula < ActiveRecord::Base
  serialize :variables, JSON
	include Categorizable
  acts_as_paranoid :column => 'deleted', :column_type => 'time'
  after_destroy :destroy_child

  has_many :favorites, as: :favoritable
  belongs_to :property
  belongs_to :unit

  validates :name, uniqueness: { case_sensitive: false }, presence: true, length: { minimum: 2, maximum: 30 }
  validates :symbol, uniqueness: true, presence: true, length: { minimum: 1, maximum: 10 }
  validate :belongs_to_property_or_unit
  
  validates_each :variables, do |record, attr, value|
    symbols = value.map { |v| v.symbol }
    names = value.map { |v| v.name }
    if names.uniq.length != names.length || names.select { |n| !n || n.length == 0 }.length > 0 
      record.errors.add(attr, 'Name must not be empty and must unique')
    end
    if symbols.uniq.length != symbols.length || names.map 
      records.error.add(att, 'Symbol must not be empty and must unique')
    end
  end
  
  def addVariable symbol, unit_id, property_id, values
    v = { symbol: symbol, name: name, unit_id:unit_id, property_id:property_id  values:values}
    variables.push v; 
  end

  def addGlobals globals
    variables[:globals] = globals;
  end
end
