class Variable < ActiveRecord::Base
  acts_as_paranoid :column => 'deleted', :column_type => 'time'

  belongs_to :formula
  belongs_to :unit
  belongs_to :property
  
  validates :name, uniqueness: { case_sensitive: false, scope: :formula }, presence: true, length: { minimum: 5, maximum: 30 }
  validates :symbol, uniqueness: { scope: :formula }, presence: true, length: { minimum: 1, maximum: 3 }
  validates_presence_of :formula
end
