define( ['require', 'pjs', 'underscore', 'base/abstractitem', 'parameters/item'], function(require) {
    var P = require('pjs');
    var _ = require('underscore');
    var AbstractItem = require('base/abstractitem');
    var Parameter = require('parameters/item');


    var Section = P(AbstractItem, function(section, _super) {

        section.init = function(state, list) {
            this.params = {};

            _super.init.call(this, state, list);
            if (state.params) {
                for (var i = 0, len = state.itemsState.length; i < len; i++) {
                    var param = Parameter(state.itemsState[i], this);
                    this.addParameter(param);
                }
            }
        };

        section.onAddedToList = function() {};

        section.onRemovedFromList = function() {};


        section.getState = function() {
            var state = [];

            _.each(this.params, function(p) {
                state.push(p.getState());
            });

            return {
                name: this.name,
                params: state
            };
        };


        section.deleteParameter = function(name) {
            var param = this.params[name];
            this.list.removeParameter(param);
            delete this.params[name];
            param.onRemovedFromList();
        };

        section.addParameter = function(p) {
            this.params[p.name] = p;
            this.list.addParameter(p);
            p.onAddedToList();
        };

    });

    return Section;
});