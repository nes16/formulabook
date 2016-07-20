json.data do
	json.array!(@variables) do |v|
		json.id v.id
		json.name v.name
		json.unit_id = v.unit_id
		json.property_id = v.property_id
		json.symbol = v.symbol
	end
end