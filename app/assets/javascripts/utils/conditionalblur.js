define( ['require', 'jquery'], function(require) {
    var $ = require('jquery');

    return function() {
        if (document.activeElement === document.body) return;
        $(document.activeElement).blur();
    };
});