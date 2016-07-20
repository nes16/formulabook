json.data do
	json.array!(@favorites) do |f|
		byebug
		json.id f.favoritable_id
		json.type f.favoritable_type
	end
end