class Api::V1::FavoritesController < ApplicationController
	skip_before_filter :verify_authenticity_token
	respond_to :json

  
  #GET   /favorites
  def index
    if current_user
      @favorites = current_user.favorites;
    end
  end

  #POST /favourites
  def create
    byebug
    favorite = params[:favorite]
    @favorite = current_user.favorites.create(
        favoritable_id: favorite[:favoritable_id], favoritable_type: favorite[:favoritable_type]
      )
  end

  #DELETE /favorites/:id
  def destroy
    @result = 'failed'
    @favorite = Favorite.find(params[:id])
    @favorite.update(deleted: true)
    @result = 'success'
  end
end
