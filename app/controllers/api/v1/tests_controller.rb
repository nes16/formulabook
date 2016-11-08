class Api::V1::TestsController < ApplicationController
	respond_to :json
	skip_before_action :verify_authenticity_token 

	def clean
		Property.T_cleanAll
		render json: {data: {status:'success'}}
	end
end