define(["require", "exports"], function (require, exports) {
    var User = (function () {
        function User() {
        }
        User.prototype.add = function () {
            var a = 5;
        };
        return User;
    })();
    exports.User = User;
});
