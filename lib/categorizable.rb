module Categorizable 
  extend ActiveSupport::Concern

  included do
    has_many :crs, as: :categorizable
    has_many :categories, through: :crs
  end

  def add_to_category(category)
    self.categoricals.create(category: category)
  end

  def remove_from_category(category)
    self.categoricals.find_by(category: category).maybe.destroy
  end

  module ClassMethods
  end
end