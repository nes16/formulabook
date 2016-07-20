define(['require','pjs','base/underscoremodel'],function(require){
  var P = require('pjs');
  var UnderscoreModel = require('base/underscoremodel');

  /*
  * test settings
  */

  var TestSettings = P(UnderscoreModel, function (settings, _super) {

    //these are user-defined properties and can be saved in the state
    settings.init = function () {
      _super.init.call(this);
      this.stateProperties = [];

      //config holds properties of the individual API instance that
      //shouldn't be cloned (e.g. keyboardVisible). It has setProperty & getProperty
      //like any other underscore model
      this.config = new UnderscoreModel();

      // stored in state
      this.addStateProperty('showGrid', true);
      this.addStateProperty('polarMode', false);
      this.addStateProperty('showXAxis', true);
      this.addStateProperty('showYAxis', true);
      this.addStateProperty('xAxisStep', 0);
      this.addStateProperty('yAxisStep', 0);
      this.addStateProperty('degreeMode', false);
      this.addStateProperty('xAxisArrows', 'none');
      this.addStateProperty('yAxisArrows', 'none');
      this.addStateProperty('xAxisLabel', '');
      this.addStateProperty('yAxisLabel', '');
      this.addStateProperty('xAxisNumbers', true);
      this.addStateProperty('yAxisNumbers', true);
      this.addStateProperty('polarNumbers', true);
      this.addStateProperty('projectorMode', false);
      this.addStateProperty('squareAxes', true);
      
      // not stored in state
      this.computedStepSizes = {};
      this.squareAxes = true;
      
      //non computed -- these are the same for projectorMode and non-projector Mode
      this.labelHangingColor = 'rgba(150,150,150,1)';
      this.labelNormalColor = 'rgba(0,0,0,1)';

      //non-computed and not-stored in state. Just used for squaring Axes
      this.lastChangedAxis = 'x';

      // below here are properties that *are not* stored in the state and can,
      // right now, only be changed by toggling 'projectorMode'
      var self = this;
      function createProjectorProperty (property, offValue, onValue) {
        
        function computeProperty() {
          self.setProperty(property, self.projectorMode ? onValue : offValue);
        }
        
        self.observe('projectorMode', computeProperty);
        computeProperty();
      }
      
      function createHighlightProperty (property, off_off, off_on, on_off, on_on) {
        function computeProperty() {
          var value;
          if (self.projectorMode) {
            value = self.highlight ? on_on : on_off;
          } else {
            value = self.highlight ? off_on : off_off;
          }
          
          self.setProperty(property, value);
        }
        
        self.observe('highlight', computeProperty);
        computeProperty();
      }
          
      //font size of labels
      createProjectorProperty('labelSize', 12, 16);
      //darker grid lines
      createProjectorProperty('majorAxisOpacity', 0.3, 0.5);
      
      //lighter grid lines
      createProjectorProperty('minorAxisOpacity', 0.12, 0.15);
      
      //main axes
      createProjectorProperty('axisOpacity', 0.7, 0.9);
      
      createProjectorProperty('axisLineWidth', 1, 2);

      //for antialiasing axes
      createProjectorProperty('axisLineOffset', 0.5, 0);
      
      //minimum separation between major axis lines
      createProjectorProperty('pixelsPerLabel', 70, 100);
      
      //line width for graphs
      createHighlightProperty('graphLineWidth', 2, 3, 6, 9);

      //line width for points
      createHighlightProperty('pointLineWidth', 7, 11, 15, 22);
    };
    
    settings.addStateProperty = function (prop, defaultValue) {
      this[prop] = defaultValue;
      this.stateProperties.push(prop);
    };
    
    settings.clone = function () {
      var newSettings = TestSettings(this.grapher);
        
      var self = this;
      this.stateProperties.forEach(function (prop) {
        newSettings.setProperty(prop, self[prop]);
      });
        
      newSettings.setProperty('squareAxes', this.squareAxes);
        
      return newSettings;
    };
    
    settings.registerCallbacks = function (grapher, expressionsView, $rootElement) {
      
      var self = this;
      
      this.stateProperties.forEach(function (prop) {
        self.observe(prop, function () {
          grapher.redrawGridLayer();
        });
      });
      
      this.observe('squareAxes', function() {
        grapher.viewportController.enforceSquareAxes();
      });


    };
  });

  return TestSettings;
});