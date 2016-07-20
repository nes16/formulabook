json.data do
	json.id @variable.id
	json.formula_id @variable.formula_id
	json.unit_id = @variable.unit_id
	json.property_id = @variable.property_id
	json.symbol = @variable.symbol
end