class Api::V1::CategoriesController < ApplicationController
	respond_to :json
	skip_before_action :verify_authenticity_token 

  
  #GET   categories
  def index
    t = params["last_synced"]
    if t
      time = Time.at( t.to_i / 1000.0 ).to_s
      cond1 = "(updated_at > \"#{time}\") "
    else
      cond1 = '(deleted IS NULL) '
    end
    
    if current_user
      cond2 = "user_id IS \"#{current_user.id}\" OR"
    else
      cond2 = ''
    end
    
    cond = cond1 + ' (user_id IS NULL OR ' +  cond2 + " shared = \"t\")"
    
    @categories = Category.where(cond)
  end
  
  def create
    @category = Category.Create(
      parent_id = params[:id],
      name = params[:name]
    )
  end

  #DELETE /categories/:id
  def destroy
    @result = 'failed'
    @category = Category.find(params[:id])
    @category.update(deleted: true)
    @result = 'success'
  end
   
end
