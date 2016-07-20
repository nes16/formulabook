json.data do
	json.array!(@properties) do |property|
	  json.id property.id
	  json.name property.name
	end 
end