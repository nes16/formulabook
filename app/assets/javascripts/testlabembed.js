define( ['require', 'jquery', 'pjs', 'toast', 'mygrapher', 'parameters/model', 'parameters/view',
 'statecontroller', 'testsettings', 'layoutcontroller'], function(require) {
    
    var $ = require('jquery');
    var P = require('pjs');

    var MyGrapher = require('mygrapher');
    var ParametersModel = require('parameters/model');
    var ParametersView = require('parameters/view');
    var StateController = require('statecontroller');
    var TestSettings = require('testsettings');
    var LayoutController = require('layoutcontroller');
    var i18n = require('i18n');
    
    var ToastView = require('toast');

    var TestLab = P(function(proto) {
        proto.init = function(elt, config) {

            var testSettings = TestSettings();
            //populate graphSettings config
            for (var key in config) {
              testSettings.config.setProperty(key, config[key]);
            }

            var containerClasses = ['tlab-container', 'tlab-tap-container'];
            var $embedContainer = $('<div class="' + containerClasses.join(' ') + '">');
            var $my_graphpaper = $('<div class="tlab-grapher">');

            var paramsModel = ParametersModel();
            var paramsView;

            paramsView = ParametersView(paramsModel, $embedContainer);




            $my_graphpaper.appendTo($embedContainer);
            paramsView.appendTo($embedContainer);

            $embedContainer.appendTo(elt);
            var myGrapher = new MyGrapher($my_graphpaper);


            var stateController = StateController(
                myGrapher,
                paramsModel);


            this.setState = stateController.setState.bind(stateController);
            this.setBlank = stateController.setBlank.bind(stateController);
            this.getState = stateController.getState.bind(stateController);

            this.setViewport = function (bounds) {
              // grapher.viewportController.setViewport(new Viewport(
              //   bounds[0], bounds[1], bounds[2], bounds[3]
              // ));
            };
            this.resize = function () {
              // layoutController.resize();
            };

            this.addFocus = function () {
              // if (!expressionsView) return;
              // expressionsModel.setSelected(0);
              // expressionsView.getSelectedView().addFocus();
            };

            var layoutController = LayoutController(
              {
                paramsView: paramsView,
                keypadView: null,
                pillboxView: null,
                grapher: myGrapher
              },
              $embedContainer,
              testSettings
            );
            this.paramsModel = paramsModel;
            this.paramsView = paramsView;
            this.myGrapher = myGrapher;
            this.stateController = stateController;
            this.onChangeCallbacks = [];
        }


        proto.notifyChange = function() {
            for (var i = 0; i < this.onChangeCallbacks.length; i++) {
                this.onChangeCallbacks[i]();
            }
        };
        proto.addChangeCallback = function(cb) {
            this.onChangeCallbacks.push(cb);
        };
    });

    return TestLab;
});
