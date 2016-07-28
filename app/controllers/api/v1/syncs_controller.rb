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
    response_objs = {}
    info[:tables].each do |t|
      t[:deletedItems] = t[:deletedItems]?t[:deletedItems]:[]
      t[:resources] = t[:resources]?t[:resources]:[]
      responce_objs[t]=({name: t, resources:[], deletedItems:[], ids:[]})
    end


    #Delete remotely deleted items 
    torders.each do |o|
      info[:tables].each do |t|
        if t[:name] == o[:name]
          response_obj = responce_objs[t];
          t[:deletedItems].each do |i|
            response_obj.ids.push i.id
            if o[:classA].exists? i[:id]
              item = o[:classA].find i[:id]
              res = item.destroy
              if res
                response_obj.deletedItems.push {id:i.id, status:"success"}
              else
                response_obj.deletedItems.push {id:i.id, status:"failed"}
              end  
            else
              response_obj.deletedItems.push[{id:i.id, status:"item not found"}]  
            end
          end
        end
      end
    end

    #create, update new items
    ActiveRecord::Base.transaction do
      #New items
      torders.each do |o|
        info[:tables].each do |t|
          if t[:name] == o[:name]
            response_obj = response_obs[t]
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

                success = newItem.save;
                if !success
                  response_obj[:resources].push {id: i[:id], syncState: 1, status:"failed", errors: newItem.errors.messages}
                else
                  response_obj.ids.push newItem.id
                  response_obj[:resources].push {id: newItem.Id, oldId: i[:id], syncState: 1, status:"success"}
                end

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
            response_obj = response_obs[t]
            t[:resources].each do |i|
              #items only updated in remote client
              if i[:syncState] & 2 > 0
                i[:syncState] = 0
                
                if o[:classA].exists? i[:id]
                  item = o[:classA].find i[:id]
                  o[:classA].assign item, i
                  
                  success = item.save;
                  if !success
                    response_obj[:resources].push {id: i[:id], syncState: 2, status:"failed", errors: item.errors.messages}
                  else
                    response_obj.ids.push item.id
                    response_obj[:resources].push {id: i[:id], syncState: 2, status:"success"}
                  end
                else
                  response_obj[:resources].push {id: i[:id], syncState:2, status:"item not found"}
                end
              end
            end


            response_obj[:lastSync] = Time.now.to_json;
            fetched_data = o[:classA].after response_obj[:affected_ids], t[:lastSync];
            deletedItems = fetched_data.select {|i| i[:deleted] != null}

            #Seperate deleted items
            deletedItems.each do |i|
              response_obj[:deletedItems].push({id: i[:id]})
              fetched_data.delete i
            end

            #append the fetched item to the response packet
            response_obj[:resources].concat fetched_data

          end
        end
      end
    end #transaction 

    response_array = [];
    info[:tables].each do |t|
      response_array.push response_obs[t]
    end
    
    render json: {data: response_array}
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
