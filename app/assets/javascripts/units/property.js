define( ['require', 'pjs', 'base/underscoremodel', 'underscore', 'units/unit'], function(require) {
    var P = require('pjs');
    var _ = require('underscore');
    var UnderscoreModel = require('base/underscoremodel');
    var Unit = require('units/unit');

    var Property = P(UnderscoreModel, function(prop, _super) {

        prop.init = function(state, model) {
            _super.init.call(this);
            this.model = model;
            this.name = state.name;
            this.units_by_symbol = {};
            this.units_by_name = {};

            _.each(state.units, function(u, i) {
                var unit = Unit(u, this);
                this.units_by_name[unit.name] = unit;
                this.unitsS_by_symbol[unit.symbol] = unit;
            }, this);
        };

    });

    return Property;


});