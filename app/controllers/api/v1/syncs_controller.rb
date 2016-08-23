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
    
    tables = @info[:tables].map
    #initialize array variable if they are given nil value
    #rails assign nil value instead of empty array for
    #json object in request parameter
    tables.each do |t|
      puts @@app_models[t[:name].to_sym]
      t[:o]=@@app_models[t[:name].to_sym]

      t[:added] ||= []
      t[:updated] ||= []
      t[:deleted] ||= []
    end

    #Delete items 
    tables.each do |t|
      t[:deleted].each do |id|
        model = t[:o][:classA]  
        if model.exists? id
          item = model.find id
          res = item.destroy
          @resources[id]={item:item}
          @resources.delete id
        end
      end
    end
    
    #new items
    tables.each do |t|
      t[:added].each do |id|
        model = t[:o][:classA]  
        citem = @resources[id]    #client side item
        newItem = model.new
        model.assign newItem, JSON.parse(citem.to_json)
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
          model.assign item, JSON.parse(citem.to_json)
          makeAssociation item, citem, t[:o][:references]        
          success = item.save;
          @resources[id] = {error_messages: item.errors.messages, item:item}
        else
          @resources[id] = {error_messages: {}}
          puts "=============update model not found==============="
        end
      end
    end
    success = true;
    puts @resources
    @resources.keys.each do |id|
      if @resources[id][:error_messages].keys.length > 0
        success = false;
        break
      end
    end

    if success
      @info[:status]="success"
      tables.each do |t|
        skipIds = t[:added].map { |id| @resources[id][:item]?@resources[id][:item][:id]:nil } \
                  .select {|id| id != nil}
        skipIds.concat t[:deleted]
        skipIds.concat t[:updated]
        resources = t[:o][:classA].after skipIds, t[:lastSync]
        reset_info t
        resources.each do |r| 
          if r.deleted
            t[:deleted].push r.id
          else
            if r.created_at >= t[:lastSync] 
              t[:added].push r.id
            else
              t[:updated].push r.id
            end
          end
          @resources[r.id] = r
        end

        t[:lastSync] = Time.now.to_json;
      end
    else
      @info[:status]="failed"
    end
    trimResults
    puts JSON.pretty_generate(@info)
    render json: {data: @info}
  end #def

  def trimResults
    @resources.keys.each do |id|
      res = @resources[id]
      if res[:item]
        res.delete :item
      end
      if res[:error_messages] && res[:error_messages].keys.length == 0
        res.delete :error_messages
      end
    end
    @info[:tables].each do |t|
      t.delete :o
    end
  end

  def reset_info(t)
    t[:added].concat(t[:updated]).each do |id|
      @resources.delete id
    end
    t[:added]=[]
    t[:updated]=[]
    t[:deleted]=[]
  end

  def makeAssociation(item, citem, references)
    #make association
    puts item
    references.each do |ref|
      plu = ActiveSupport::Inflector.pluralize ref
      sing = ActiveSupport::Inflector.singularize  ref
      fk = ActiveSupport::Inflector.foreign_key sing
      ref_id = citem[@@app_models[plu.to_sym][:idColumn]]
      if @resources[ref_id] && @resources[ref_id][:item]
        item[fk.to_sym] = @resources[ref_id][:item][:id]
      else
        if item.new_record?
          newItem[fk.to_sym] = ref_id
        end
      end
    end
  end


end
