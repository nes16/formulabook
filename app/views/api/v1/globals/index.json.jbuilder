json.data do
	json.array!(@globals) do |g|
		json.id g.id
		json.name g.name
		json.value = g.value
		json.unit_id = g.unit_id
	end
end