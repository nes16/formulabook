json.data do
	json.result @result
	if @error
		json.error @error
	end
end