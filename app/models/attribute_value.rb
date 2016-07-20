class AttributeValue < ActiveRecord::Base
  belongs_to :variable
  belongs_to :variable_attribute
end