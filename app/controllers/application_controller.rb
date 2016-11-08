class ApplicationController < ActionController::Base
  include DeviseTokenAuth::Concerns::SetUserByToken
  skip_before_action :verify_authenticity_token
  # Prevent CSRF attacks by raising an exception.
  # For APIs, you may want to use :null_session instead.
  # protect_from_forgery with: :null_session
  protect_from_forgery with: :exception


  def getQueryCond
  	t1 = params["last_synced"]
  	t2 = params["current_sync"]
  	if t1 && t2
  	  time1 = Time.at( t1.to_i / 1000.0 ).to_s
  	  time2 = Time.at( t2.to_i / 1000.0 ).to_s
  	  cond1 = "(updated_at >= \"#{time1}\") AND (updated_at < \"#{time2}\") AND "
  	else 
  	  if t2
  	    time2 = Time.at( t2.to_i / 1000.0 ).to_s
  	    cond1 = "(deleted IS NULL) AND (updated_at < \"#{time2}\") AND "
  	  else
  	    cond1 = '(deleted IS NULL) AND '
  	  end
  	end
  	
  	if current_user
  	  cond2 = "user_id IS \"#{current_user.id}\" OR"
  	else
  	  cond2 = ''
  	end
  	
  	cond = cond1 + ' (user_id IS NULL OR ' +  cond2 + " shared = true)"
  	
  	return cond
  end


  # rescue_from ActiveRecord::StaleObjectError do |exception|
  #     respond_to do |format|
  #        format.html {
  #           correct_stale_record_version
  #           stale_record_recovery_action
  #       }
  #       format.xml  { head :conflict }
  #       format.json { head :conflict }
  #    end
  # end      

  #  protected   

  #  def stale_record_recovery_action
  #     flash.now[:error] = "Another user has made a change to that record "+
  #        "since you accessed the edit form."
  #     render :edit, :status => :conflict
  #  end
end

