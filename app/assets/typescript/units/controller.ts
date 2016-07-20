define(['require', 'jquery', 'pjs', 'base/underscoremodel', 'underscore', 'backend'], function(require) {
    var P = require('pjs');
    var $ = require('jquery');
    var _ = require('underscore');
    var UnderscoreModel = require('base/underscoremodel');
    var backend = require('backend');


    var UnitController = P(UnderscoreModel, function(uc, _super) {
        uc.init = function() {
            //initialize object level members
            this.content = null;

        };

        uc.loadData = function() {
            var self = this;
            backend.getUnits().done(function(msg) {
                if (msg.properties) self.content = msg.properties;
                self.triggerEvent('LoadSuccess');
            }).fail(function() {
                self.triggerEvent('LoadError');;
            });
        };

    });

    return UnitController;

})