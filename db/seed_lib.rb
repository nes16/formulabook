def find_property name
	p = Property.find_by name: name
end

def find_unit sym
	u = Unit.find_by symbol: sym
end

def find_unit_property sym
	u = find_unit  sym
	Property.find u.property_id
end

def add_favorite user_id, type, id
	begin
		Favorite.create user_id: user_id, favoritable_type: type, favoritable_id: id
		rescue Exception
	end
end

def find_user email
	u = User.find_by email: email
end
