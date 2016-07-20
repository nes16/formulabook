class SessionsController < DeviseTokenAuth::SessionsController  
    skip_before_action :verify_authenticity_token 
    #clear_respond_to
    respond_to :json
    def logoutxhr
    	
    end

end  