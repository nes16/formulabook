class Api::V1::FormulasController < ApplicationController
	respond_to :json
	skip_before_action :verify_authenticity_token 

  #GET   /formulas
  def index
    if params[:search]
      return search
    end
    
    cond = getQueryCond
    @formulas = Formula.where(cond);
  end

  def search
      key= params[:search];
      if current_user
        @formulas = Formula.where('deleted IS ? AND (user_id IS ? OR user_id = ? OR shared = ?) AND (name like ? OR symbol like ?)', nil, nil, current_user.id, true, "%#{key}%", "%#{key}%")
      else
        @formulas = Formula.where('deleted IS ? AND (user_id IS ? OR shared = ?) AND (name like ? OR symbol like ?)', nil, nil, true, "%#{key}%", "%#{key}%")
      end
  end

  #POST /formulas
  def create
    formula = params[:formula]
    user_id = current_user ? current_user.id : nil
    @formula = Formula.create(
      user_id: user_id,
      name: formula[:name],
      property_id: formula[:property_id],
      unit_id: formula[:unit_id],
      latex: formula[:latex],
      symbol: formula[:symbol],
    )
  end

  #PATCH/PUT /formulas/:id
  def update
    @result = 'failed'
    formula = params[:formula]
    @formula = Formula.find(params[:id])
    @formula.update(
      name: formula[:name],
      property_id: formula[:property_id],
      unit_id: formula[:unit_id],
      latex: formula[:latex],
      symbol: formula[:symbol],
    )
    @result = 'success'
  end

  #DELETE /formulas/:id
  def destroy
    @result = 'failed'
    @formula = Formula.find(params[:id])
    @formula.update(deleted: true)
    @result = 'success'
  end
 
end
