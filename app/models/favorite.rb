class Favorite < ActiveRecord::Base
  acts_as_paranoid :column => 'deleted', :column_type => 'time'
  belongs_to :favoritable, polymorphic: true
  belongs_to :user, inverse_of: :favorites
  

  validates :user_id, uniqueness: { 
    scope: [ :favoritable_id, :favoritable_type],
    message: 'can only favorite an item once'
  }


end