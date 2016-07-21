class Time
  def to_milliseconds
    (self.to_f * 1000.0).to_i
  end
end

module CommonClassMethods

  def after lastSync
    if  lastSync && lastSync != "" && lastSync != "\"\""
      lastSync = Time.parse(lastSync).to_json
      puts lastSync
      lastSync = lastSync.sub 'T', ' '
      puts lastSync
  
      with_deleted.all.where("updated_at > TIMESTAMP \'#{lastSync}\'")
    else
      all().order :updated_at
    end
  end

  def lastSync
    a = with_deleted.all.order("updated_at DESC")
    if a.empty?
     Time.now
     
    else
      with_deleted.all.order("updated_at DESC").first[:updated_at]
    end
  end

  def assign obj, state
	keys = state.keys
	dbkeys = ["id", "updated_at", "deleted", "lock_version", "created_at", "syncState", "oldId"]
	keys.each do |k|
		if obj.has_attribute?(k) && (dbkeys.index(k) == nil)
			obj[k] = state[k]
		end
  	end
  end

#Testing functions
  def T_addProperty name, uname, factor, symbol
    p = self.new({name: name})
    p.units << Unit.new({name: uname, factor:factor, symbol:symbol})
    p.save
  end

  def T_destroyProperty name
    where("name == \"#{name}\"").each do |i|
      i.destroy
    end
  end

  def T_cleanAll
    with_deleted.all.each do |i|
      i.really_destroy!
    end
    Unit.with_deleted.all.each do |i|
      i.really_destroy!
    end

    Global.with_deleted.all.each do |i|
      i.really_destroy!
    end
    Formula.with_deleted.all.each do |i|
      i.really_destroy!
    end
  end

  
end