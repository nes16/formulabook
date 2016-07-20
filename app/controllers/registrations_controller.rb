# Sample json request from client for sign_up
# var request = new XMLHttpRequest();
# request.open("POST", "http://localhost:4000/account/register");
# request.setRequestHeader("Content-Type", "application/json");
# request.overrideMimeType("text/plain");
# request.setRequestHeader("Accept", "application/json");
# request.onload = function()
# {
#     alert("Response received: " + request.responseText);
# };
# request.send(JSON.stringify({user: { name:'senthil', email: "senthil8@gmail.com", password: "password",password_confirmation: "password"}}));


class RegistrationsController < Devise::RegistrationsController 
	skip_before_action :verify_authenticity_token 
    #clear_respond_to
    respond_to :json

   def sign_up_params
    params.require(:user).permit(:name, :email, :password, :password_confirmation)
  end

  def account_update_params
    params.require(:user).permit(:name, :email, :password, :password_confirmation, :current_password)
  end

  def getuserinfo
  	
  end
end