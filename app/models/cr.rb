class Cr < ActiveRecord::Base
    belongs_to :category
    belongs_to :categorizable, polymorphic: true

    validates_presence_of :category, :categorizable
    acts_as_paranoid :column => 'deleted', :column_type => 'time'
end