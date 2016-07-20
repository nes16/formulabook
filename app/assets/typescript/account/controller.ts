define( ['require', 'pjs', 'jquery', 'base/underscoremodel', 'account/backend', 'account/user'], function(require) {
    var P = require('pjs');
    var $ = require('jquery');
    var UnderscoreModel = require('base/underscoremodel');
    var backend = require('account/backend');
    var User = require('account/user');

    var UserController = P(UnderscoreModel, function(proto, _super) {
        proto.init = function(testsController) {
            _super.init.call(this);
            this.testsController = testsController;

            //log the user out if we ever make a request and get back a 401
            var self = this;
            $.ajaxSetup({
                statusCode: {
                    401: function() {
                        self.logout();
                    }
                }
            });
        };

        proto.testlabLogin = function(formData) {
            return backend.fetchUser(formData).done(
                this.completeLogin.bind(this)
            );
        };

        proto.driveCallback = function() {
            return backend.getUserInfo().then(
                this.completeLogin.bind(this),
                this.logout.bind(this)
            );
        };

        proto.createAccount = function(formData) {
            return backend.registerUser(formData).done(
                this.completeLogin.bind(this)
            ).done(function() {
            });
        };

        proto.editAccount = function(formData) {
            var currentUser = this.currentUser;
            var self = this;
            return backend.editAccount(formData).done(function(msg) {
                currentUser.setProperty('name', msg.name);
                currentUser.setProperty('email', msg.email);
                self.notifyPropertyChange('currentUser');
            });
        };

        proto.recoverPassword = function(formData) {
            return backend.recoverPassword(formData);
        };

        //called at the end of the login process
        proto.completeLogin = function(msg, source) {
            this.setProperty('currentUser', User(msg));
            this.testsController.updateTests();
        };

        proto.logout = function() {
            var self = this;
            return backend.logout().done(function() {
                self.setProperty('currentUser', null);
                self.testsController.clear();
            });
        } ;
    });

    return UserController;
});
