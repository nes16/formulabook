class Api::V1::Std::UnitsController < ApplicationController
	skip_before_filter :verify_authenticity_token
	respond_to :json

  #GET   /properties/:property_id/units
  def index
    
    cond = getQueryCond
    if params[:property_id]
          @units = Property.find(params[:property_id]).units.where(cond)
    else
          @units = Unit.where(cond)
    end
  end

  def search
      key= params[:search];
      
      cond1 = '(deleted IS NULL) AND '
      
      if current_user
        cond2 = "user_id IS \"#{current_user.id}\" OR"
      else
        cond2 = ''
      end

      cond = cond1 + ' (user_id IS NULL OR ' +  cond2 + " shared = \"t\") AND (name like %#{key}% OR symbol like %#{key}%)"

      @units = Unit.where(cond)
  end

  #POST /properties/:property_id/units
  def create
    byebug
    unit = params[:data]
    prop = Property.find(unit[:property_id])
    user_id = current_user ? current_user.id : nil
    @unit = prop.units.create(
      user_id: user_id,
      name: unit[:name],
      system: unit[:system],
      baseunit: unit[:baseunit],
      symbol: unit[:symbol],
      prefix: unit[:prefix],
      extend: unit[:extend],
      definition: unit[:definition],
      description: unit[:description],
      approx: unit[:approx],
      factor: unit[:factor],
      repeat: unit[:repeat]
    )

    render json: {data: {id:@unit.id}}
  end

  #PATCH/PUT /properties/:property_id/units/:id
  def update
    @result = 'failed'
    unit = params[:data]
    u = Property.find(unit[:property_id]).units.find(unit[:id])
    u.update(
      name: unit[:name],
      system: unit[:system],
      baseunit: unit[:baseunit],
      symbol: unit[:symbol],
      prefix: unit[:prefix],
      extend: unit[:extend],
      definition: unit[:definition],
      description: unit[:description],
      approx: unit[:approx],
      factor: unit[:factor],
      repeat: unit[:repeat]
    )
    @result = 'success'
  end

  #DELETE /properties/:property_id/units/:id
  def destroy
    @result = 'failed'
    u = Property.find(params[:property_id]).units.find(params[:id])
    u.destroy
    @result = 'success'
  end
end