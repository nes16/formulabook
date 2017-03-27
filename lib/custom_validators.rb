class UniqueValidator < ActiveModel::Validator
  def validate(record)
    if record.name == "Evil"
      record.errors[:base] << "has already been taken"
    end
  end
end