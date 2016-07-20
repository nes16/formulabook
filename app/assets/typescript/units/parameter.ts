///<reference path="d3.d.ts" />
define( ['require', 'pjs', 'underscore', 'base/abstractitem', 'formula/latex_parser', 'formula/mathnode'], function(require) {
    var P = require('pjs');
    var AbstractItem = require('base/abstractitem');
    var _ = require('underscore');

    var LatexParser = require('formula/latex_parser');
    var MathNode = require('formula/mathnode');


    var Parameter = P(AbstractItem, function(param, _super) {

        param.init = function(state, list) {
            _super.init.call(this, state, list);

            this.test = this.list.list;
            this.referers = []; //List node refering this parameters

            this.names = {};
            this.symbols = {};
            this.referers = [];
            this.nodes = [];

            this.observe('name', this.onNameChane);
            this.observe('symbol', this.onSymbolChange);
            this.observe('latex', this.onLatexChange);

            this.onRemovedFromListCallbacks = [];
            this.onAddedToListCallbacks = [];

        };

        param.setName = function(name) {
            if (this.test[name])
                return;
            this.setProperty('name', name);
        }

        param.setSymbol = function(symbol) {
            if (this.test[symbol])
                return;
            this.setProperty('symbol', symbol);
        }

        param.setUnit = function(unit) {
            this.setProperty('unit', unit);
        }

        param.setLatex = function(latex) {
            this.setProperty('latex', latex);
            this.
        }


        param.addSubParam = function(param) {

            this.names[param.name] = param;
            if (param.symbol)
                this.symbols[param.symbol] = param;
            param.parent = this;
        }


        param.removeSubParam = function(name) {

            var param = this.names[param.name];
            delete this.names[param.name];
            if (param.symbol)
                delete this.symbols[param.symbol];
        }


        param.addReferer = function(node) {
            this.referers.push(node);
        }


        param.parseLatex = function() {
            var self = this;
            self.rootNode = null;
            //Remove nodes from child param
            _.each(self.nodes, function(n) {
                n.param.referers.remove(n);
            })

            //Clear all nodes
            self.nodes = [];

            if (self.latex && self.latex.length > 0) {
                try {
                    MathNode.onVarAdded = function(node) {
                        node.parent = self;
                        node.param = self.test.findParamBySymbol(node.token);
                        if (param)
                            param.addReferer(node);
                        self.nodes.push(node);
                    };
                    self.rootNode = LatexParser.parse(self.latex);
                } catch (e) {
                    self.rootNode = null;
                }
            } else
                self.rootNode = null;

            return self.rootNode;
        }

        param.onNameChange = function(name) {
            //Set auto name index
            var i = parseInt(name.replace(this.test.autoNamePrefix, ''));
            if (i > 0 && (name == this.test.autoNamePrefix + i.toString())) {
                if (i > this.test.autoNameIndex)
                    this.test.autoNameIndex = i;
            }
        }

        param.onSymbolChange = function() {
            var self = this;
            if (this.referers) {
                var nodes = this.referers;
                var os = self.getOldProperty('symbol');
                var diff = os.length - self.symbol.length;
                _.each(nodes, function(n) {
                    n.token = self.symbol;
                    //Todo:correct replace mechanism
                    n.param.latex.replace(os, self.symbol);
                    MathNode.shiftNodes(n.param.nodes, n.start, n.end, diff);
                })
            };
        }

        param.onLatexChange = function() {
            //Set the expression in desmo  
            this.parseLatex()
        }

        param.onAddedToList = function() {
            var cbs = this.onAddedToListCallbacks;
            var self = this;
            _.each(cbs, function(cb) {
                cb(self);
            });
        };

        param.onRemovedFromList = function() {
            var cbs = this.onRemovedFromListCallbacks;
            var self = this;
            _.each(cbs, function(cb) {
                cb(self);
            });
        };


        param.getState = function() {
            var state = {
                name: this.name,
                unit: this.unit,
                latex: this.latex,
                classifier: this.classifier,
            };
            var params = [];
            var self = this;
            _.each(this.names, function(n) {
                params.push(n.getState());
            });
            state.params = params;

            return state;
        }
    });

    return Parameter;
});
