
class Global < ActiveRecord::Base
  acts_as_paranoid :column => 'deleted', :column_type => 'time'
  
  has_many :favorites, as: :favoritable
  has_many :fgs

  validates :name, uniqueness: { case_sensitive: false }, presence: true, length: { minimum: 5, maximum: 30 }
  validates :symbol, uniqueness: true, presence: true, length: { minimum: 1, maximum: 3 }
  validates :value,  presence: true, format: { with: /\A([+-]?\d+(\.\d+(e[+-]\d+)?)?(e[+-]\d+)?)$\z/}
end

