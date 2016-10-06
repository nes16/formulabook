require 'categorizable.rb'

class Global < ActiveRecord::Base
  include Categorizable

  acts_as_paranoid :column => 'deleted', :column_type => 'time'
  
  has_many :favorites, as: :favoritable
  has_many :fgs
  



  validates :name, uniqueness: { case_sensitive: false }, presence: true, length: { minimum: 2, maximum: 30 }
  validates :symbol, uniqueness: true, presence: true, length: { minimum: 1, maximum: 10 }
  validates :value,  presence: true, format: { with: /\A([+-]?\d+(\.\d+(e[+-]\d+)?)?(e[+-]\d+)?)$\z/}
end

