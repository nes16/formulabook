module ActiveRecordExtension

extend ActiveSupport::Concern


def to_json(options={})
    options[:except] ||= [:updated_at, :created_at, :deleted, :id, :dim, :shared]
    super(options)
end

def belongs_to_property_or_unit
  if property.present? && unit.present?
    errors.add(:property, "Invalid measurement")
  end
end

class_methods do

  def app_model_info
    #static table describe different models and
    #its associated models
    {
      "properties":{idColumn: :property_id, classA:Property, references:[]},
      "units":{idColumn: :unit_id, classA:Unit,  references:[:properties]},
      "globals":{idColumn: :global_id, classA:Global,  references:[:units]},
      "formulas":{idColumn: :formula_id, classA:Formula,  references:[:units, :properties]},
      #this table polymorphic col favouritable_type and favouritable_id
      "favorites":{idColumn: :favorite_id, classA:Favorite, notShared:true, references:[], multiRef:[:favoritable_type, :favoritable_id]},
      "categories":{idColumn: :category_id, classA:Category, notShared:true, references:[]},
      "crs":{idColumn: :cr_id, classA:Cr,  references:[], multiRef:[:categorizable_id, :categorizable_type]},
    }
  end

  def after ids, lastSync, user_id, lastSyncShared
    puts table_name
    notShared = app_model_info()[table_name.to_sym][:notShared]
    if table_name == 'categories' || table_name == 'crs' || table_name == 'fgs' || table_name == 'variables'
      user_param = "(1 = 1)"
      shared_param = "(1 = 1)"
    else
      if user_id
        user_param = "(USER_ID =  #{user_id} OR USER_ID IS NULL)"
      else
        user_param = "USER_ID IS NULL"
      end
    end
    
    if lastSyncShared == nil || user_id == nil || notShared #only share with authenticated user
      puts 'Inside shared nil'
      list1 = [];
    else
      if lastSyncShared != "" && lastSyncShared != "\"\""
        lastSyncShared = getTimeStr lastSyncShared
        shared_param ||= "NOT(#{user_param}) AND (shared = TRUE) AND (((updated_at > TIMESTAMP \'#{lastSyncShared}\') OR (deleted > TIMESTAMP \'#{lastSyncShared}\' ))"
        list1 = with_deleted.all.where("#{shared_param}")
      else
        shared_param ||= "shared = TRUE"
        list1 = all.where("NOT(#{user_param}) AND #{shared_param}") 
      end
    end

    if  lastSync && lastSync != "" && lastSync != "\"\""
      getTimeStr lastSync
      list2 = with_deleted.all.where.not(id: ids).where("((updated_at > TIMESTAMP \'#{lastSync}\') OR (deleted > TIMESTAMP \'#{lastSync}\' )) AND #{user_param}")
    else
      list2 = all.where.not(id: ids).where("#{user_param}")
    end
    list1.concat list2

    #filter out fgs of other user
    if table_name == 'fgs' || table_name == 'variables'
      list1 = list1.select {|item| item.formula.user_id == user_id || user_id == nil || item.formula.shared} 
    end
    list1
  end

  def afterSharedChanged ids, lastSync, user_id, lastSyncShared
    puts table_name
    list1 = []
    notShared = app_model_info()[table_name.to_sym][:notShared]
    if table_name == 'categories' || table_name == 'crs' || lastSyncShared == nil || user_id == nil || notShared
      return list1
    else
      if lastSyncShared != "" && lastSyncShared != "\"\""
        lastSyncShared = getTimeStr lastSyncShared
        shared_param ||= "NOT(#{user_param}) AND (shared = FALSE) AND (shared_changed = TRUE) AND (((updated_at > TIMESTAMP \'#{lastSyncShared}\') OR (deleted > TIMESTAMP \'#{lastSyncShared}\' ))"
        list1 = with_deleted.all.where("#{shared_param}")
      end
    end
    
    list1
  end

  def getTimeStr(str)
    lastSync = Time.parse(str).to_json
    puts lastSync
    lastSync = lastSync.sub 'T', ' '
    puts lastSync
    lastSync
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
  notShared = app_model_info()[table_name.to_sym][:notShared]
	dbkeys = ["id", "updated_at", "deleted", "created_at", "shared_changed"]
	keys.each do |k|
		if obj.has_attribute?(k) && (dbkeys.index(k) == nil)
			#keep shared change a note
      if(!(notShared && notShared == 'false'))
        id(state[:shared] && obj.shared != state[:shared])
          obj.shared_changed = true
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
        return nil
    end
  end

  def sync_autoid_with_client(id)
    auto = get_autoincrement 
    if auto
      auto = auto[0]["nextval"].to_i
      if id > auto
        reset_autoincrement({to: id})
      else
        reset_autoincrement({to: auto})
      end
    end
    return nil
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

  def unique? (col, val, id, user_id)
    if id
      if exists?(id: id)
        obj = find(id)
        obj[col] = val
        obj.user_id = user_id
        obj.valid?
        puts obj.errors.to_json
       return !(obj.errors.messages[col.to_sym] && obj.errors.messages[col.to_sym].index("has already been taken"))
      end
    end
    obj = new ()
    obj[col] = val;
    obj.user_id = user_id
    obj.valid?
    puts obj.errors.to_json
    !(obj.errors.messages[col.to_sym] && obj.errors.messages[col.to_sym].index("has already been taken"))
  end

  def AddMultipleObject
    p1 = Property.new({name:'Property1'})
    u1 = Unit.new({name:'Units1', symbol:'u1', description:'Units1', factor:'1', system:'SI'})
    p1.units << u1;
    u1.save
    puts '---------------------------------------------'
    puts p1.to_json
    puts u1.to_json
    puts '---------------------------------------------'
    g1 = Global.new({name:'Global1', symbol:'g1', value:10})
    u1.globals << g1;
    u1.save
    puts '-------Unit saved--------------------------------------'
    puts u1.to_json
    puts g1.to_json
    puts '---------------------------------------------'
    g1.save
    puts '--------Global saved-------------------------------------'
    puts u1.to_json
    puts g1.to_json
    puts '---------------------------------------------'
    f1 = Formula.new({name:'Formula1', symbol:'f1', latex:'x+1'})
    v1 = Variable.new({name:'Variable1', symbol:'v1'})
    f1.variables << v1
    p1.formulas << f1;
    u1.variables << v1;
    p1.save
    puts '--------Property saved-------------------------------------'
    puts f1.to_json
    puts v1.to_json
    puts '---------------------------------------------'
    
    u1.save  
    puts '--------Unit saved-------------------------------------'
    puts f1.to_json
    puts v1.to_json
    puts '---------------------------------------------'
    
    p1.really_destroy!
    g1.really_destroy!
    f1.really_destroy!
  end

  def crateTestSyncInfo
    info={}
    ActiveRecord::Ac begin
      p1 = Property.T_addProperty "Property1","Unit1", "1", "s2"
      resources[p1.id]=p1
      resources[p1.units[0].id]=p1.units[0]
      
    rescue Exception => e
      
    end

  end


end

  
end



# include the extension 
ActiveRecord::Base.send(:include, ActiveRecordExtension)