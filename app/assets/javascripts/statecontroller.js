define( ['require', 'jquery', 'pjs'], function(require) {

    var P = require('pjs');
    var $ = require('jquery');

    var StateController = P(function(proto) {

        var BLANK_STATE = {
            'graph': {
                'viewport': {
                    'xmin': -10,
                    'xmax': 10,
                    'ymin': -10,
                    'ymax': 10
                },
                'xAxisArrows': 'none',
                'yAxisArrows': 'none',
                'xAxisLabel': '',
                'yAxisLabel': '',
                'xAxisStep': 0,
                'yAxisStep': 0,
                'xAxisNumbers': true,
                'yAxisNumbers': true,
                'polarNumbers': true,
                'showXAxis': true,
                'showYAxis': true,

                'showGrid': true,
                'squareAxes': true,
                'labelXMode': '',
                'labelYMode': ''
            },
            'test': {
                'list': [{
                    'id': 1,
                    'latex': ''
                }]
            }
        };

        proto.init = function(grapher, testModel, testSettings) {
            this.grapher = grapher;
            this.testModel = testModel;
            this.testSettings = testSettings;
            this.isFirstSetState = true;
        };

        proto.triggerSetState = function() {};

        proto.getState = function() {
            return {
                graph: this.grapher.getState(),
                test: this.testModel.getState()
            };
        };

        proto.setState = function(state) {
            var self = this;
            if (!state) state = BLANK_STATE;

            if (typeof state === 'string') state = JSON.parse(state);

            if ('test' in state) {
                self.testModel.setState(state.test);
            }

            //self.testModel.setSelected(null);
            //self.grapher.clear();
            //self.grapher.redrawGraphsLayer();
            // if ('graph' in state) {
            //     self.grapher.setState(state.graph);
            // }

        }

        proto.setBlank = function() {
            this.setState(BLANK_STATE);
        };

        proto.setStateFromURL = function(url) {
            return $.getJSON(url).done(function(msg) {
                this.setState(msg.state);
            }.bind(this));
        };

    });

    return StateController;

});
