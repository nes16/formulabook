class SyncInfo
	def last_sync(tablename, time)
		table = get_table tablename
		table[:lastSync] = time
	end

	def item(op, tablename, r)
		table = get_table tablename
		table[op].push r[:id]
		if(op != :deleted)
			@info[:resources][r[:id]]=r
		end
	end

	def get_table(name)
		table = @info[:tables].find {|t| t[:name] == name}
		if !table
			table = {name:name, added:[], updated:[], deleted:[], lastSync:nil}
			@info[:tables].push table
		end
		return table
	end

	def simulate
		@info = {resources:{}, tables:[]}
		##Client changes items
		urandom = SecureRandom.random_number 10000
		pupdated = Property.second
		pupdated.name = "Property"+urandom.to_s;
	    pdeleted = Property.first
	    udeleted = pupdated.units[0]
	    pthird = Property.third
	    pfourth = Property.fourth
		

		lastSync=Time.now
		
		sleep 2
		##Server side changes

		Property.T_addProperty "Property10", "Unit10", "1", "s10"
		pthird.destroy
		pfourth.units[0].destroy
		
		##client changes
		ActiveRecord::Base.transaction do
			arandom = SecureRandom.random_number 10000
			p1 = Property.T_addProperty "Property"+arandom.to_s, "Unit"+arandom.to_s, "1", "k1"
			last_sync "properties", lastSync
			last_sync "units", lastSync
			item(:added, "properties", p1)
			item(:added, "units", p1.units[0])
			item(:updated, "properties", pupdated)
			item(:deleted, "properties", pdeleted)
			item(:deleted, "units", udeleted)
			raise ActiveRecord::Rollback
		end
		JSON.parse(@info.to_json)
	end

	def test
		puts 'success'
	end
end
