class Api::V1::SyncsController < ApplicationController
	skip_before_filter :verify_authenticity_token
	respond_to :json

  
  
  def updateIds (info, orders, col, oldId, id )
    orders.each do |o| 
      if o[:references].index col
        info[:tables].each do |t|
          if t[:name] == o[:name]
            t[:resources].each do |i|
              if i[col] == oldId
                i[col] = id
              end
            end
          end
        end
      end
    end
  end      


  #POST formulas/:formula_id/variables
  def sync
    maxid = 1000000;
    @res = 

    fetchDatas = {}
    info = params[:data][:syncInfo]

    puts info

    #static table describe different models and
    #its associated models
    #used for updating ids
    torders = [{name:"properties", idColumn: :property_id, classA:Property, references:[]},
             {name:"units",  idColumn: :unit_id, classA:Unit,  references:[:property_id]},
             {name:"globals",  idColumn: :global_id, classA:Global,  references:[:unit_id]},
             {name:"formulas",  idColumn: :formula_id, classA:Formula,  references:[:unit_id, :property_id]},
             {name:"fgs",  idColumn: :fg_id, classA:Fg,  references:[:formula_id, :global_id]},
            {name:"variables",  idColumn: :variable_id, classA:Variable,  references:[:unit_id, :property_id, :formula_id]}
            ]

    #initialize array variable if they are given nil value
    #rails assign nil value instead of empty array for
    #json object in request parameter
    info[:tables].each do |t|
      t[:deletedItems] = t[:deletedItems]?t[:deletedItems]:[]
      t[:resources] = t[:resources]?t[:resources]:[]
    end

    #fetch locally modified items, changed since lastsync
    #and store them in a variable

    torders.each do |o|
      info[:tables].each do |t|
        if t[:name] == o[:name]
          fetchDatas[t[:name]] = o[:classA].after t[:lastSync]
          puts 'fetch data length - ' + t[:name] + '-' + fetchDatas[t[:name]].length.to_s
        end
      end
    end

    #Delete remotely deleted items 
    torders.each do |o|
      info[:tables].each do |t|
        if t[:name] == o[:name]
          t[:deletedItems].each do |i|
            if o[:classA].exists? i[:id]
              item = o[:classA].find i[:id]
              item.destroy
            end
          end
          t[:deletedItems] = []
        end
      end
    end

    #create, update new items
    ActiveRecord::Base.transaction do
      #New items
      torders.each do |o|
        info[:tables].each do |t|
          if t[:name] == o[:name]
            t[:resources].each do |i|
              #Items created and updated in remote clients
              #Refer client code standard.ts for SyncState flags
              if i[:syncState] & 1 > 0
                i[:syncState] = 0
                i[:oldId] = i[:id]
                newItem = o[:classA].new
                o[:classA].assign newItem, i
                if newItem.has_attribute? :user_id
                  if current_user
                    newItem.user_id = current_user.id 
                  else
                    newItem.user_id = nil
                  end
                end 

                puts i.to_json
                puts newItem.to_json
                if newItem.has_attribute? :name
                  puts 'the save result - '+ newItem.name.to_json + ' - ' + newItem.save.to_s
                else
                  puts 'the save result - ' + newItem.save.to_s
                end
                i[:id]=newItem.id;

                #update the remotely assigned ids
                #in referenced objects
                updateIds info, torders, o[:idColumn], i[:oldId], i[:id]
              end
            end
          end
        end
      end    

      #Updated items
      torders.each do |o|
        info[:tables].each do |t|
          if t[:name] == o[:name]
            t[:resources].each do |i|
              #items only updated in remote client
              if i[:syncState] & 2 > 0
                i[:syncState] = 0
                
                if o[:classA].exists? i[:id]
                  item = o[:classA].find i[:id]
                  o[:classA].assign item, i
                  
                  puts 'the save result - '+ item.name + ' - ' + item.save.to_s
                end
              end
            end

            #Response back with only new items, so that id can be updated
            t[:resources] = t[:resources].select { |i| i[:oldId]?i[:oldId] > 0:false}
            #append the fetched item to the response packet
            t[:resources].concat fetchDatas[t[:name]]
            
            #delete temperory variable
            #t.delete :fetechedItems

            #set the new lastSync value to response packet
            t[:lastSync] = o[:classA].lastSync
          end
        end
      end
    end #transaction 

    
    render json: {data: info}
  end #def

  #change the ids in child resources for new ids of parent 
  def updateIds(info, torders, idColumn, oldId, newId)
    torders.each do |o|
      if o[:references].index idColumn
        info[:tables].each do |t|
          if t[:name] == o[:name]
            t[:resources].each do |i|
              if i[idColumn] == oldId
                i[idColumn] = newId
              end
            end
          end
        end
      end
    end    
  end

end
