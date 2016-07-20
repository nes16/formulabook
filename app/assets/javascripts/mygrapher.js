define( ['require', 'jquery', 'pjs', 'desmos'], function(require) {
    var P = require('pjs');
    var $ = require('jquery');
    //var Desmos = require('desmos');
    var Desmos = {
        Calculator:  function(){
            var _calc = {
                setExpression: function(){},
                getExpression: function(){},
                setViewport: function(){},
                getState: function(){},
                setExpression: function(){},
                createHelper: function(){},
                setState:function(){},
                screenshot:function(){},
                setBlank: function(){}
            }
            return {_calc: _calc};
        },

    }

    var MyGrapher = P(function(grapher) {
        var options = {
            keypad: false,
            graphpaper: true,
            expressions: false,
            settingsMenu: false,
            zoomButtons: true,
            expressionsTopbar: false,
            solutions: false,
            border: true,
            lockViewport: false,
            expressionsCollapsed: true
        };

        grapher.init = function(container) {
            this.grapher = Desmos.Calculator(container, options);
            this.calc = this.grapher._calc;
            this.$ = $(container);
        };

        grapher.getExpression = function(id) {

        }

        grapher.setExpression = function(state) {
            return this.calc.setExpression(state);
        }

        //bound is an array of four numbers
        grapher.setViewport = function(bounds) {
            return this.calc.setViewport(bounds);
        }

        //
        grapher.resize = function(dim) {
            return this.calc.resize(dim);
        }

        //size is an optional object with opts.width and opts.height specifying 
        //the height and width of the screenshot in pixels. 
        grapher.screenshot = function(size) {
            return this.calc.screenshot(size);
        }

        grapher.getState = function() {
            return this.calc.getState();
        }

        grapher.setState = function(obj) {
            return this.calc.setState(obj);
        }


        grapher.setBlank = function() {
            return this.calc.setBlank();
        }

        grapher.createHelper = function(latex) {
            return this.calc.HelperExpression({
                latex: latex
            });
        }
    });

    return MyGrapher;

});
