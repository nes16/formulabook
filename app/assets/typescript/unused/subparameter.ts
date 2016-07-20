define( ['require', 'pjs', 'utils/colors'], function(require) {
    var P = require('pjs');
    var Parameter = require('parameters/item');
    var Colors = require('utils/colors');

    var SubParameter = P(Parameter, function(subparam, _super) {

        subparam.isSubParam = true;

        subparam.init = function(state, list) {
            _super.init.call(this, state);

        };

    });

    return SubParameter;
});