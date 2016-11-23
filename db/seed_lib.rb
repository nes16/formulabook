def find_unit_property sym
	u = find_unit  sym
	Property.find u.property_id
end

def add_favorite user_id, type, id
	Favorite.create user_id: user_id, favoritable_type: type, favoritable_id: id
end
