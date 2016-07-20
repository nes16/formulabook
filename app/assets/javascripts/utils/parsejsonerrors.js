define(['require', 'jquery'], function(require) {
    var $ = require('jquery');
    var parseJSONErrors = function(jqXHR) {
        try {
            return $.parseJSON(jqXHR.responseText).errors;
        } catch (err) {
            return [{
                message: 'Internal Server Error.'
            }];
        }
    };
    return parseJSONErrors;
});