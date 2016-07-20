// From http://stackoverflow.com/questions/7742781/why-javascript-only-works-after-opening-developer-tools-in-ie-once
// Avoid `console` errors in browsers that lack a console.
define( ['require'], function(require) {
    var noop = function() {};
    var methods = [
        'log',
        'info',
        'warn',
        'error',
        'assert',
        'dir',
        'clear',
        'profile',
        'profileEnd'
    ];

    var console = {};

    var addMethod = function(method) {
        if ((typeof window !== 'undefined') && window.console && window.console[method]) {
            console[method] = function() {
                // Need to use apply from Function.prototype because in IE9, methods of console
                // are not actually functions, but are instead some kind of bastard callable
                // object.
                Function.prototype.apply.call(window.console[method], window.console, arguments);
            };
        } else {
            console[method] = noop;
        }
    };

    methods.forEach(addMethod);
    return console;
});







