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
    error_codes = {};
    error_codes[:success] = 0;
    error_codes[:validation_error] = 1;
    error_codes[:item_not_found] = 2;
    error_codes[:stale_object] = 3;
    error_codes[:unknown_error] = 100;

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
      response_objs[t[:name]]=({name: t[:name], resources:[], deletedItems:[], ids:[]})
    end


    #Delete remotely deleted items 
    torders.each do |o|
      info[:tables].each do |t|
        if t[:name] == o[:name]
          response_obj = response_objs[t[:name]];
          t[:deletedItems].each do |i|
            response_obj[:ids].push i[:id]
            if o[:classA].exists? i[:id]
              item = o[:classA].find i[:id]
              res = item.destroy
              if res
                response_obj[:deletedItems].push {id:i[:id] \
                                            , error_code:error_codes[:success]}
              else
                response_obj[:deletedItems].push {id:i[:id] \
                                            , error_code:error_codes[:unknown_error]}
              end  
            else
              response_obj[:deletedItems].push[{id:i[:id] \
                                            , error_code:error_codes[:item_not_found]}]  
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
            auto = -1
            response_obj = response_objs[t[:name]]
            t[:resources].each do |i|
              #Items created and updated in remote clients
              #Refer client code standard.ts for SyncState flags
              if i[:syncState] & 1 > 0
                #in some extreme case if client id generated 
                #went past our id
                #increase our id
                if auto == -1 #once per table
                  auto = override_clientid i[:id]
                end
                i[:syncState] = 0
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
                if success
                  response_obj[:ids].push newItem.id
                  response_obj[:resources].push ({id: i[:id] \
                                        , tempId: newItem.id \
                                        , error_code:error_codes[:success]})
                  #update the remotely assigned ids
                  #in referenced objects
                  updateIds info, torders, o[:idColumn], i[:id], newItem.id
                else
                  response_obj[:resources].push ({id: i[:id] \
                                        , error_code:error_codes[:validation_error] \
                                        , error_messages: newItem.errors.messages})
                end

              end
            end
          end
        end
      end    

      #Updated items
      torders.each do |o|
        info[:tables].each do |t|
          if t[:name] == o[:name]
            response_obj = response_objs[t[:name]]
            t[:resources].each do |i|
              #items only updated in remote client
              if i[:syncState] & 2 > 0
                i[:syncState] = 0
                
                if o[:classA].exists? i[:id]
                  item = o[:classA].find i[:id]
                  response_obj[:ids].push item.id
                  if item.lock_version <= i[:lock_version]
                    o[:classA].assign item, i
                    success = item.save;
                    if success
                      response_obj[:resources].push({id: i[:id] \
                                            , error_code:error_codes[:success]})
                    else
                      response_obj[:resources].push({id: i[:id] \
                                  , error_code:error_codes[:validation_error] \
                                  , error_messages: item.errors.messages})
                    end
                  else
                    response_obj[:resources].push({id: i[:id] \
                                , remote_lock_version: item.lock_version \
                                , error_code:error_codes[:stale_object] })
                  end
                else
                  response_obj[:resources].push({id: i[:id] \
                              , error_code:error_codes[:item_not_found]})
                end
              end
            end

            response_obj[:lastSync] = Time.now.to_json;
            fetched_data = o[:classA].after response_obj[:ids], t[:lastSync];
            deletedItems = fetched_data.select {|i| i[:deleted] != nil}
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
      response_objs[t[:name]].delete :ids
      response_array.push response_objs[t[:name]]
    end
    
    info[:tables] = response_array;
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
