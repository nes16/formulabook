class Api::V1::TestsController < ApplicationController
	respond_to :json

	def clean
		Property.T_cleanAll
		render json: {data: {status:'success'}}
	end
end