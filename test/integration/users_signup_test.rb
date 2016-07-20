require 'test_helper'

class UsersSignupTest < ActionDispatch::IntegrationTest
  # test "the truth" do
  #   assert true
  # end



  test "invalid signup information" do
      assert_no_difference 'User.count' do
        post user_registration_path, user: { name:  "",
                                 email: "user123@invalid123",
                                 password:              "foo",
                                 password_confirmation: "bar" }
      end
    end

  test "valid signup information" do
    assert_difference 'User.count', 1 do
      post user_registration_path, user: { name:  "ExampleUser",
                                            email: "user@example.com",
                                            password:              "password",
                                            password_confirmation: "password" }
      delete destroy_user_session_path

      post user_session_path, user: {email: "user@example.com", password: "password"}

      get account_getuserinfo
 
    end
  end  
end
