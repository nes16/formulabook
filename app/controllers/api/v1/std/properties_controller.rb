class Api::V1::Std::PropertiesController < ApplicationController
	respond_to :json

  #GET   /properties
  def index
    cond = getQueryCond
    @properties = Property.where(cond);
  end

  #POST  /properties
  def create
      p = params["data"]
      @property = Property.create(user_id: current_user ? current_user.id : nil, name: p[:name])
  end

  #PATCH/PUT   /properties/:id
  def update
    p = params["data"]
    @property = Property.find(p[:id])
    @property.update(name: p[:name])
  end

  
  # Optimistic locking
  # refer:https://blog.engineyard.com/2011/a-guide-to-optimistic-locking
  # class DestinationsController < ApplicationController
  #  def update
  #     # ... update code
  #  rescue ActiveRecord::StaleObjectError
  #     @destination.reload.attributes = params[:destination].reject do |attrb, value|
  #        attrb.to_sym == :lock_version
  #     end
  #     flash.now[:error] = "Another user has made a change to that record "+
  #        "since you accessed the edit form."
  #     render :edit, :status => :conflict
  #  end
  # end
  # Above method OR delegate the responsiblity to ApplicationController to take care of 
  # correct_stale_record_version
  # protected

  #  def correct_stale_record_version
  #     @destination.reload.attributes = params[:destination].reject do |attrb, value|
  #        attrb.to_sym == :lock_version
  #     end
  #  end
  
  #DELETE /properties/:id
  def destroy
    @result = 'failed'
    if Property.exists? params[:id]
      p = Property.find(params[:id])
      p.destroy
    end
    @result = 'success'
  end
end
