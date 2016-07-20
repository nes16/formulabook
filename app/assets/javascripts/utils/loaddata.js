define( ['require', 'jquery'], function(require) {
    var $ = require('jquery');
    var loaddata = $('body').data('load-data');
    return loaddata;
});
