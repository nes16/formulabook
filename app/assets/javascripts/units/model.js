define( ['require', 'pjs', 'base/underscoremodel', 'underscore', 'units/property', 'units/prefixes'], function(require) {
    var P = require('pjs');
    var _ = require('underscore');
    var UnderscoreModel = require('base/underscoremodel');
    var Property = require('units/property');
    var prefixes = require('units/prefixes');

    var UnitsModel = P(UnderscoreModel, function(model, _super) {

        model.init = function(unitController) {
            _super.init();
            this.unitController = unitController;
            this.properties = {};
            this.all_units = {};
            this.si_units = {};

            var self = this;
            this.unitController.observeEvent('LoadSuccess', function() {
                self.setProperty('isSpinning', false);
                self.unitController.content.forEach(function(property, i) {
                    var propertyItem = Property(property, self);
                    self.properties[propertyItem.name] = propertyItem;
                });
            });
            this.unitController.observeEvent('LoadError',function() {
                self.setProperty('isSpinning', false);
            });

        };

        model.findUnitBySymbol = function(sym) {

            //check H20,Hg in symbol

            var len = sym.length;

            if (!len)
                return null;

            //check any match available in the all units
            var result = this.all_units[sym];

            if (result) {
                return result;
            }


            var prefix = null;
            if (len > 2)
                prefix = prefixes[sym.substr(0, 2)];
            if (!prefix && len > 1)
                prefix = prefixes[sym[0]];;


            if (prefix) {
                //without prefix in symbol compare units
                var sym_np = sym.substr(prefix[1].length);
                result = this.si_units[sym_np];

                return result;
            }

            return null;
        }


    });

    return UnitsModel;
});