class Api::V1::TestsController < ApplicationController
	skip_before_filter :verify_authenticity_token
	respond_to :json

	def clean
		Property.T_cleanAll
		render json: {data: {status:'success'}}
	end
end