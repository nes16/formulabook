define(['require','pjs','base/abstractitem','utils/colors'],function(require){
  var P = require('pjs');
  var AbstractItemModel = require('base/abstractitem');
  var Colors = require('utils/colors');

  var ParameterObject = P(AbstractItemModel, function(model, _super) {

    model._computeNewLatex = function(latex, newValue) {
      //we know the expression will look like:
      // a bunch of stuff (we ignore this in the regex)
      // an "=" (doesn't slide if it's < or >)
      //
      // a bunch of stuff (spaces, parens, the rest of the le, ge, etc)  ($1)
      // the number we're trying to replace ($2)
      // a bunch more stuff (spaces, parens, etc.) (we ignore this in the regex)
      var regex = /=(.*?)([-\.0-9]+)/;

      //if they're typing something crazy like y=00001, we want to not overwrite their work
      var matches = latex.match(regex);
      if (!matches) {
        return latex;
      }
      if (parseFloat(matches[2]) === newValue) return latex;

      return latex.replace(regex, "=$1" + newValue);
    };

    model.isParameter = true;

    model.init = function (state, list) {
      _super.init.call(this, state, list);

      this.loading = true;
      // Use to signifiy that a plotted expression has not been fully resolved by the plotter.
      this.unresolved = false;
      if(!this.name ) this.name= 'Parameter';
      if(!this.symbol) this.symbol = 'P';
      if(!this.property) this.property = 'None';
      if(!this.unit) this.height = 'None';
      if(!this.formula) this.formula = 'f';

      
      // fill in a color if not specified
      if (!this.color) {
        this.color = Colors.next();
      }
      // convert old style of color definition to simpler new version
      else if (typeof this.color === 'object') {
        this.color = this.color.value;
      }
      if (this.style === undefined) {
        this.style = 'normal';
      }
      if (this.hidden === undefined) {
        // Check userRequestedGraphing for legacy states
        this.hidden = (this.userRequestedGraphing === 'never');
      }


      
      this.observe('formula color hidden style name symbol property unit', this.onStateDidChange.bind(this));
      this.observe(
        'formula color style',
        this.onParameterDidChange.bind(this)
      );
      this.observe('hidden', this.computeShouldGraph.bind(this));
    };

    model.onStateDidChange = function (prop) {

      _super.onStateDidChange.call(this, prop);
    };

    model.updateFolder = function () {
      _super.updateFolder.call(this);

      // TODO namespacing with the id seems kind of gross...
      if (this.getOldProperty('folder')) {
        this.getOldProperty('folder').unobserve('.' + this.id);
      }
      if (this.folder) {
        this.folder.observe(
          'hidden.' + this.id,
          this.computeShouldGraph.bind(this)
        );
      }
      this.computeShouldGraph();
    };

    model.computeShouldGraph = function () {
      if (this.folder && this.folder.hidden) {
        this.setProperty('shouldGraph', false);
        return;
      }
      this.setProperty('shouldGraph', !this.hidden);
    };

    model.onParameterDidChange = function() {
    };

    model.eachFormula = function (fn) {
      fn(this.formula);
      if (this.residualVariable) fn(this.residualVariable);
    };

    model.getParsableObject = function () {
      //Work-around for bug in Mathquill / expression list
      // where on deletion of an expression via back-space key, Mathquill fires both an UpwardDelete
      // and a Render event.  UpwardDelete causes the expressionList to delete, and Render causes
      // expression list to fire another add request for the already deleted expression, which comes
      // in with latex === undefined.
      if(this.name === undefined){
        return undefined;
      }
      return {
        type: 'statement',
        id: this.id,
        name: this.name,
        symbol: this.symbol,
        property: this.property,
        unit: this.unit,
        formula: this.formula,
        yaxes: this.yaxes,
      };
    };

    model.requestParse = function () {
      this.list.triggerAddParam(this.getParsableObject());
    };

    model.requestUnparse = function () {
      this.list.triggerRemoveParam(this.id);
    };

    model.onAddedToList = function () {
      this.requestParse();
    };

    model.onRemovedFromList = function () {
      this.requestUnparse();
    };

    model.getState = function() {
      /* jshint maxcomplexity:11 */
      var state = {
        id: this.id,
        name: this.name,
        name: this.name,
        symbol: this.symbol,
        property: this.property,
        unit: this.unit,
        formula: this.formula,
        yaxes: this.yaxes,
      };



     return state;
    };

    model.onFormulaUpdate = function () {
      var formula = this.formula;

      this.setProperty('error', formula.error ? formula.error : '');
      this.setProperty('isGraphable', formula.is_graphable);
      this.setProperty('dependent', formula.assignment);
      this.setProperty('isTableable', formula.is_tableable);
      this.setProperty('unresolved', false);

      this.validateStyle();

    };

    model.validateStyle = function () {
      var formula = this.formula;
      if (formula.error) return;

      // When we default the style back to expression default we need the
      // onStateDidChange handler to know to not send the change to undo/redo.
      // This is part of a bigger change that'll automatically cause the style
      // to change. Without the self.style = undefined catch we'll get an
      // extra undo/redo transaction stored. That'll also mess up Toast on setState.
      var self = this;
      function defaultStyleTo (style) {
        if (self.style !== style) {
          self.style = undefined;
          self.setProperty('style', style);
        }
      }

      // If we have changed from a point to a function or vis a versa, we need to be
      // the default draw style for that type.
      if (formula.is_point_list) {
        if (!(this.style === 'point' || this.style === 'open' || this.style === 'cross')) {
          defaultStyleTo('point');
        }
      } else if (formula.is_inequality) {
        // Graphlayer will deal with making this dashed if the inequality requires it.
        defaultStyleTo('normal');
      } else {
        if (!(this.style === 'normal' || this.style === 'dashed')) {
          defaultStyleTo('normal');
        }
      }
    };


    model.isEmpty = function() {
      var latex = this.formula;
      return !latex || latex.split(" ").join("") === "";
    };
  });

  return ParameterObject;
});
