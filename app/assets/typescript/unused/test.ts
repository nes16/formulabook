define(['require', 'pjs', 'base/underscoremodel', 'underscore', 'parameters/section', 'units/controller', 'units/model'], function(require) {
    var P = require('pjs');
    var UnderscoreModel = require('base/underscoremodel');
    var UnitController = require('units/controller');
    var UnitModel = require('units/model');
    var Section = require('parameters/section');
    var _ = require('underscore');

    var Test = P(UnderscoreModel, function(test, _super) {

        var autoNameIndex = 0;
        var autoNamePrefix = 'Param';

        test.init = function() {
            //initialize all units
            this.unitController = UnitController();
            this.unitModel = UnitModel(this.unitController);
            this.sections = {};

            //Global collections of all parameters
            this.names = {};
            this.symbols = {};
        };

        test.getUniqueParamName = function() {
            return autoNamePrefix + (autoNameIndex++).toString();
        };

        test.getUniqueParamName = function(param) {
            var parts = param.name.split(' ');
            var s = parts[0][0] + '_';
            parts.slice(0, 1);
            _.each(parts, function(p) {
                s += p[0]
            });
            return s;
        };

        test.getState = function() {
            var sections = [];
            var self = this;
            _.each(self.sections, function(s) {
                sections.push(s.getState());
            });

            return {
                sections: sections
            };
        };



        test.batchEvaluation = function(fn) {
            fn();
        };

        test.triggerSetState = function(itemsState) {};

        test.setState = function(state) {
            var i;
            var obj;

            this.names = {};
            this.symbols = {};
            if(state.sections){
                for (i = 0; i < state.sections.length; i++) {
                    var s = state.sections[i];

                    // Start rendering UI as shell until we know if it's on screen
                    s.renderShell = true;

                    obj = this.fromState(s);

                    if (!obj) continue;

                    this.addSection(obj);
                }
            }


            // allow the view to tap into this
            this.triggerSetState(state);

        };

        // Factory method for making a single expression object of the appropriate
        // type from a serialized state.
        test.fromState = function(state) {
            if (state.type === 'section') {
                return Section(state, this);
            }
        };

        test.findParamBySymbol = function(sym) {
            return this.symbols[sym] || null;
        };

        test.findParamByName = function(name) {
            return this.names[name] || null;
        };


        test.addSection = function(section) {
            this.sections[section.name] = section;
            section.onAddedToList();
        };

        test.removeSection = function(name) {
            var s = this.sections[name];
            delete this.sections[name];
            s.onRemovedFromList();
        };

        test.addParameter = function(param) {
            this.names[param.name] = param;
            if (param.symbol)
                this.symbols[param.symbol] = param;
        };

        test.removeParameter = function(param) {
            delete this.names[param.name];
            if (param.symbol)
                delete this.symbols[param.symbol];
        };


    });

    return Test;


});






















