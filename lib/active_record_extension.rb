module ActiveRecordExtension

extend ActiveSupport::Concern


def to_json(options={})
    options[:except] ||= [:updated_at, :created_at]
    super(options)
end

def belongs_to_property_or_unit
  if property.present? && unit.present?
    errors.add(:property, "Invalid measurement")
  end
end

class_methods do

  def after ids, lastSync
    if  lastSync && lastSync != "" && lastSync != "\"\""
      lastSync = Time.parse(lastSync).to_json
      puts lastSync
      lastSync = lastSync.sub 'T', ' '
      puts lastSync
      if Rails.env.production?
          with_deleted.all.where.not(id: ids).where("updated_at > TIMESTAMP \'#{lastSync}\'")
      else
          with_deleted.all.where.not(id: ids).where("updated_at > #{lastSync}")
      end

    else
      all.where.not(id: ids).order :updated_at
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
	dbkeys = ["id", "updated_at", "deleted", "created_at", "syncState", "tempId"]
	keys.each do |k|
		if obj.has_attribute?(k) && (dbkeys.index(k) == nil)
			obj[k] = state[k]
		end
  	end
  end

#Testing functions
  def T_addProperty name, uname, factor, symbol
    p = self.new({name: name})
    p.units << Unit.new({name: uname, factor:factor, description:uname, system:"SI", symbol:symbol})
    p.save
    r = p
  end

  def T_destroyProperty name
    where("name == \"#{name}\"").each do |i|
      i.destroy
    end
  end

  def T_addTestRows
    (1..5).each do |i|
      p = Property.T_addProperty  "Property"+i.to_s, "Unit"+i.to_s, "1", "u"+i.to_s
      g=Global.new({name:'Gloabl'+i.to_s, symbol:'g'+i.to_s, value:i.to_s})
      g.valid?
      puts g.errors.to_json
      g.save
      f=Formula.new({name:'Formula'+i.to_s, symbol:'f'+i.to_s, latex:'g1+v1+5'})
      f.variables << Variable.new({name:"variable1", symbol:"v1"});
      f.fgs << Fg.new({global:Global.first})
      f.valid?
      puts f.errors.to_json
      f.save
    end
  end

  def reset_autoincrement(options={})
      options[:to] ||= 1
      case connection.adapter_name
        when 'MySQL'
          connection.execute "ALTER TABLE #{table_name} AUTO_INCREMENT=#{options[:to]}"
        when 'PostgreSQL'
          connection.execute "ALTER SEQUENCE #{table_name}_id_seq RESTART WITH #{options[:to]};"
        when 'SQLite'
          connection.execute "UPDATE sqlite_sequence SET seq=#{options[:to]} WHERE name='#{table_name}';"
        else
      end
  end

  def get_autoincrement
    if connection.adapter_name == 'PostgreSQL'
        connection.execute("SELECT nextval('#{table_name}_id_seq')")
    else
        return null
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
  
end

# include the extension 
ActiveRecord::Base.send(:include, ActiveRecordExtension)