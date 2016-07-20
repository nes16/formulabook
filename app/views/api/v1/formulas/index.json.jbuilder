json.data do
	json.array!(@formulas) do |f|
	  json.id f.id
	  json.name f.name
	  json.latex f.latex
	  json.user_id f.user_id
	  json.variables f.variables do |v|
	  	json.id v.id
	    json.name v.name
		json.symbol v.symbol
		json.unit_id v.unit_id
		json.property_id v.property_id
	  end
	end 
end