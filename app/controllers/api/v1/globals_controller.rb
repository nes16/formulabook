class Api::V1::GlobalsController < ApplicationController
	respond_to :json
  

  #GET   /globals
  def index
    if params[:search]
      return search
    end
    
    cond = getQueryCond
    @globals = Global.where(cond)
  end

  def search
      key= params[:search];
      if current_user
        @globals = Global.where('deleted IS ? AND (user_id IS ? OR user_id = ? OR shared = ?) AND (name like ? OR symbol like ?)', nil, nil, current_user.id, true, "%#{key}%", "%#{key}%")
      else
        @globals = Global.where('deleted IS ? AND (user_id IS ? OR shared = ?) AND (name like ? OR symbol like ?)', nil, nil, true, "%#{key}%", "%#{key}%")
      end
  end

  #POST /globals
  def create
    global = params[:global]
    user_id = current_user ? current_user.id : nil
    @global = Global.create(
      user_id: user_id,
      name: global[:name],
      value: global[:value],
      symbol: global[:symbol],
      unit_id: global[:unit_id],
    )
  end

  #PATCH/PUT /globals/:id
  def update
    @result = 'failed'
    global = params[:global]
    @global = Global.find(params[:id]).update(
      name: global[:name],
      value: global[:value],
      unit_id: global[:unit_id],
      symbol: global[:symbol],
    )
    @result = 'success'
  end

  #DELETE /globals/:id
  def destroy
    @result = 'failed'
    if params[:formula_id]
        global = Global.find(params[:id])
        Formula.find(params[:formula_id]).globals.delete(global)
    else
      @result = 'failed'
      global = Global.find(params[:id])
      global.update(deleted: true)
      @result = 'success'
    end
  end
end
