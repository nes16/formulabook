require "staticcommon"

class Global < ActiveRecord::Base

  extend CommonClassMethods
  
  has_many :favorites, as: :favoritable
  has_many :fgs, dependent: :destroy
  before_destroy :delete_formula
  has_many :formulas, through: :fgs, dependent: :destroy


  acts_as_paranoid :column => 'deleted', :column_type => 'time'

  def delete_formula
  	formulas.each do |i|
  		i.destroy
  	end
  end


end

