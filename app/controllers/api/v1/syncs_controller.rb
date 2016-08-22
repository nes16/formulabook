class Api::V1::SyncsController < ApplicationController
	skip_before_filter :verify_authenticity_token
	respond_to :json
 
  @@app_models = Property.app_model_info

  @@error_codes = {
      success:0,
      validation_error:1,
      item_not_found:2,
      stale_object:3,
      unknown_error:100
  }
    
  #POST formulas/:formula_id/variables
  def sync
    @info = params[:data][:syncInfo]
    @resources = @info[:resources]
    
    puts @info

    
    #initialize array variable if they are given nil value
    #rails assign nil value instead of empty array for
    #json object in request parameter
    @info[:tables].each do |t|
      t[:o]=@@app_models[t[:name]]
      t[:added] ||= []
      t[:updated] ||= []
      t[:deleted] ||= []
    end

    tables = @info[:tables].map
    #Delete items 
    tables.each do |t|
      t[:deleted].each do |id|
        model = t[:o][:classA]  
        if model.exists? id
          item = model.find id
          res = item.destroy
          @resources[id]={item:item}
        end
      end
    end
    
    #new items
    tables.each do |t|
      t[:added].each do |id|
        model = t[:o][:classA]  
        citem = @resources[id]    #client side item
        newItem = model.new citem
        model.assign newItem, citem
        makeAssociation newItem, citem, t[:o][:references]      
        success = newItem.save
        @resources[id] = {error_messages: newItem.errors.messages, item:newItem}
      end
    end   

    #Updated items
    tables.each do |t|
      t[:updated].each do |id|
        model = t[:o][:classA]
        if model.exists? id
          item = model.find id
          citem = @resources[id]             #client side item
          model.assign item, citem
          makeAssociation item, citem, t[:o][:references]        
          success = item.save;
          @resources[id] = {error_messages: item.errors.messages, item:item}
        end
      end
    end
    success = true;
    @resources.keys.each do |id|
      if @resources[id][:item][:error_messages].keys.length > 0
        success = false;
        break
      end
    end

    if success
      added = @resources.keys.select {|id| @resources[id][:item][:id] != id}
      tables.each do |t|
        skipIds = t[:added].map {|id| @resources[id][:item][:id] }
        skipIds.concat t[:deleted]
        skipIds.concat t[:updated]
        o[:classA].after t[:lastSync] skipIds, t
        t[:lastSync] = Time.now.to_json;
      end
    else

    end
    render json: {data: @info}
  end #def


  def makeAssociation(item, citem, references)
    #make association
    references.each do |ref|
      plu = ActiveSupport::Inflector.pluralize ref
      ref_id = citem[@@app_models[plu][:idColumn]]
      if @resources[ref_id] && @resources[ref_id].item
        item[ref] = @resources[ref_id].item
      else
        if item.new_record?
          newItem[ref] = model.find ref_id
        end
      end
    end
  end

end
