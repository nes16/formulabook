define( ['require'], function(require) {
    var clone = function(json) {
        return JSON.parse(JSON.stringify(json));
    };
    return clone;
});