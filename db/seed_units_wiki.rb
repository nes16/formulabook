require 'rexml/document'

def readUnitFile
   arr = IO.readlines("./vendor/assets/reference/Units_wiki")
end


def initPropertyAndUnits(verify)
   
   if !verify
      Unit.destroy_all
      Property.destroy_all
      
      ActiveRecord::Base.connection.execute("TRUNCATE TABLE properties RESTART IDENTITY;")
      ActiveRecord::Base.connection.execute("TRUNCATE TABLE units RESTART IDENTITY;")
   end
   
   arr = readUnitFile();
   
   p = nil
   arr.each do |l|
      l.strip!
      if l.length == 0 || l[0] == '*'
         next
      end
      a1 = l.split ':'
      if a1.length != 1 && a1.length != 6
         puts 'Erro:Invalid format!!' + l
         next
      end
      
      if a1.length == 1
         p = Property.new
         parts = a1[0].split 'dims-' 
         p.name = parts[0].rstrip.lstrip
         if parts.length == 2
            p.dims = parts[1].rstrip.lstrip
         end
         if !verify
            p.save
         end
      else
         setUnit a1, p, verify         
      end
   end
end

def setUnit(parts, p, verify)
   

   
   names = parts[0].split(',')
   symbols = parts[2].split(',')
   puts parts[0]
   puts parts[2]
   
   names.each do |name|
      u = Unit.new
   
      #property
      u.property_id = p.id;
      
      #name
      u.name = name.rstrip.lstrip
      
      
      #system
      if parts[1].include? "SI"
         u.system = "SI"
      else
         u.system = "Others"
      end
      
      
      
      symbol = symbols[names.index name]
      
      if !symbol or symbol == '-'
         symbol = ''
      end
      
      #symbol, prefix, extend 
      subparts = symbol.scan(/\[[a-zA-Z^\]]*\]/)
      if subparts.length > 0
         subparts.each do |sp|
            if sp == '[extend]'
               u.extend = true
            else
               u.prefix = sp.delete("[]")
            end
            symbol.sub!(sp, '')
         end
         u.symbol = symbol.rstrip.lstrip
      else
         u.symbol = symbol.rstrip.lstrip
      end
      
      
      
      #description
      if parts[4] == "_"
         u.description = p.name + ":" + u.name
      else
         u.description = parts[4]
      end
      
      if parts[5] == "_"
         u.factor = ""
      else
         fi = parts[5]
         if parts[5].include? 'approx,'
            u.approx = true
            fi = parts[5].sub 'approx,', ''
         end
         temp = fi.split(',')
         u.factor = temp[0]
      end
      if !verify && u.symbol.length > 0 && u.symbol.length > 0
         u.save
         puts u.errors.to_json
         puts "Name:#{u.name}, symbol:#{u.symbol}, factor:#{u.factor}"
      end
   end
end

initPropertyAndUnits false

   
      

