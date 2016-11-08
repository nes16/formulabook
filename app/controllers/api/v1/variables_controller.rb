class Api::V1::VariablesController < ApplicationController
	respond_to :json
	skip_before_action :verify_authenticity_token 

  
  #GET   formulas/:formula_id/variables
  def index
    @variables = Formula.find(params[:formula_id]).variables;
  end

  #POST formulas/:formula_id/variables
  def create
    v = params[:variable]
    formula = Formula.find(params[:formula_id])
    @variable =  Variable.create(name: v[:name], symbol: v[:symbol], unit_id: v[:unit_id], property_id:  v[:property_id])
    formula.variables << @variable
  end

  #PATCH/PUT formulas/:formula_id/variables/:id
  def update
    v = params[:variable]
    formula = Formula.find(params[:formula_id])
    @variable = formula.variables.find(params[:id]);
    @variable.update(
      name:  v[:name],
      symbol:  v[:symbol],
      unit_id:  v[:unit_id],
      property_id:  v[:property_id]
    )
  end

  #DELETE formulas/:formula_id/variables/:id
  def destroy
    @result = 'failed'
    formula = Formula.find(params[:formula_id])
    formula.variables.find(params[:id]).update(deleted: true)
    @result = 'success'
  end
end
