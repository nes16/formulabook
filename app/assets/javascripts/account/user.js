define(['require', 'pjs', 'base/underscoremodel'], function(require) {
    var P = require('pjs');
    var UnderscoreModel = require('base/underscoremodel');

    var User = P(UnderscoreModel, function(proto, _super) {
        var properties = ['name', 'email'];

        proto.init = function(obj) {
            _super.init.call(this);
            var self = this;

            if (obj) {
                properties.forEach(function(p) {
                    if (obj.hasOwnProperty(p)) self.setProperty(p, obj[p]);
                });
            }
        };

        //this is sort of copied from account_email.py for guessing what people's first name is
        //we use this as the display name in header_desktop.js
        proto.firstName = function() {
            if (!this.name) return null;

            //regex for their inclusion of weird characters in their name -- that means it's probably
            //like an e-mail address, or a username or "Mr. blah"
            if (this.name.match(/[\d@_&\.\']/)) return this.name;

            var pieces = this.name.split(' ');
            if (pieces[0].length >= 3) return pieces[0];

            return this.name;
        };

    });

    return User;
});
