define(['require', 'jquery'], function(require) {
    var $ = require('jquery');

    var accountBackend = {

        //User related
        logout: function () { return $.ajax({url:'/account/logout', type:'DELETE'}); },

        fetchUser: function (formData) {
          var login = function () {
            return $.post('/account/login', formData);
          };

          // do a logout before a login so that cookies are set correctly
          return this.logout().then(login, login).then(this.getUserInfo);
        },

        getUserInfo: function () { return $.getJSON('/account/getuserinfo'); },

        registerUser: function (formData) {
          return $.post('/account/register', formData).then(this.getUserInfo);
        },

        editAccount: function (formData) {
          return $.ajax({url:'/account/register', type:'PATCH', data:formData}).then(
            this.getUserInfo
          );
        },

        recoverPassword: function (formData) {
          return $.post('/account/recoverpwd', formData);
        }
    };
    return accountBackend;
});
