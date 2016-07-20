class Testlab::TestStatesController < ApplicationController
  respond_to :json

  def show
  	byebug
  	stateRecord = TestState.find_by(testHash: params[:testHash])
 	@state = {};
  	@state[:testHash] = stateRecord.testHash;
  	@state[:testState] =  JSON.parse(stateRecord.testState);
 end

 end