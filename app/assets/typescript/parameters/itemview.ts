define(['require','jquery','pjs','./iconview', './item','i18n','utils/conditionalblur'
  ,'mathquill' ,'utils/jquery.handleevent','keys','template!parameter_item'
  , 'base/abstractitemview'],function (require) {
  var $ = require('jquery');
  var P = require('pjs');
  var ParameterIconView = require('./iconview');
  var ParameterObject = require('./item');
  var i18n = require('i18n');
  var conditionalBlur = require('utils/conditionalblur');
  
  require('mathquill');
  require('utils/jquery.handleevent');
  var Keys = require('keys');

  var template = require('template!parameter_item');

  var AbstractItemView = require('base/abstractitemview');

  var ParameterView = P(AbstractItemView, function(view, _super) {
    view.template = template;

    view.init = function (model, listView, toastView) {
      _super.init.call(this, model, listView);
      this.model = model;

      this.toastView = toastView;
      
      this.model.observe('selected.paramview', this.onSelectedChange.bind(this));
      this.model.observe('loading.paramview', this.onLoadingChange.bind(this));
    };

    view.addFocus = function (where) {
      this.$name.mathquill('focus');
    };

    view.onSelectedChange = function() {
      if (!this.model.selected ) {
        // find the focused mathquill (if there is one)
        var focused = $(document.activeElement).closest('.mathquill-editable');


        // check if the focused mathquill is within this view
        if (focused.closest(this.$()).length) {
          focused.mathquill('blur');
        }
      }
    };
    view.focusInMathquill = function(evt) {
      var input = this.$(evt.target).closest('.tlab-math-input');

      //focusin is triggered always, even when reclicking into a selected mathquill
      //we don't want to reselect in that case.
      if (!input.hasClass('tlab-focus')) {
        input.addClass('tlab-focus');
        input.triggerHandler('select_all');
        //on iPad/iPhone select_all isn't working synchronously. gross hack to make sure that we select all
        //TODO: remove this when we update mathquill, which fixes lots of focus issues
        setTimeout(function() {
          if (!input.find('.mq-selection').length) {
            input.triggerHandler('select_all');
          }
        }, 1);
      }

      this.model.setProperty('selected', true);

      //focusIn is called before focusOut, but we want this to happen after
      this.didFocusIn = true;
      this.$().addClass('tlab-input-focused');
      var self = this;
      setTimeout(function(){
        self.didFocusIn = false;
      });
    };

    view.focusOutMathquill = function(evt) {
      var input = this.$(evt.target).closest('.mathquill-editable');
      input.removeClass('tlab-focus');
      input.mathquill('clearSelection');

      if (!this.didFocusIn) this.$().removeClass('tlab-input-focused');
    };


    view.handleKeydown = function (evt) {
      var key = Keys.lookup(evt);
      if (key === Keys.ESCAPE) conditionalBlur();
    };


    // enable animations on the frame after the parameter is loaded
    view.onLoadingChange = function () {
      if (!this.model.loading) {
        var self = this;
        setTimeout(function () {
          self.setProperty('doAnimate', true);
        });
      }
    };

    view.destruct = function () {
      _super.destruct.call(this);

      this.model.unobserve('.paramview');

      this.model.unobserve('.' + this.guid);

      if (this.optionsView) {
        this.optionsView.remove();
        this.optionsView = null;
      }
      if (this.promptSliderView) {
        this.promptSliderView.remove();
        this.promptSliderView = null;
      }
      if (this.iconView) {
        this.iconView.remove();
        this.iconView = null;
      }

    };

    
    // OVERRIDE TO CREATE APPROPRIATE CHILD VIEW. IF NOT OVERRIDDEN, THE
    // VIEW WILL SIMPLY NOT BE CREATED AT RUNTIME.
    view.createIconView = function () {
      return ParameterIconView(this);
    };
    
    // NOTE: this will get called once with model.renderShell = true and once
    // with model.renderShell = false. The first time, the template will
    // shortcircuit and render the bare minimum. The second time the entire
    // dom will get destroyed and rebuilt. We don't want to add any nested
    // views when model.renderShell = false because the views' dom elements will
    // get wiped out as soon as we render with model.renderShell = false. And,
    // the whole point of renderShell=true is that we want as little as
    // possible to happen at startup as possible.
    view.didInsertElement = function () {
      
      _super.didInsertElement.call(this);
      if (this.model.renderShell)  return;

      this.iconView = this.createIconView();
      if (this.iconView) {
        this.iconView.replace(this.$('.template-paramicon'));
      }

      //need to include smart-textarea in minWidth
      this.setMinWidth();
      this.$().on('click', this.onMouseClick.bind(this));
      this.$().on('tlab-tap', this.onTab.bind(this));
      $(document).on('click', this.onDocClick.bind(this));
      var containingMathquill = this.$('.tlab-parameter-name,.tlab-parameter-property,.tlab-parameter-formula').mathquill();
      this.$name = containingMathquill.find('.tlab-parameter-input-name').attr('limit','name');
      this.$symbol = containingMathquill.find('.tlab-parameter-input-symbol').attr('limit','symbol');
      this.$property = containingMathquill.find('.tlab-parameter-input-property').attr('limit','property');
      this.$unit = containingMathquill.find('.tlab-parameter-input-unit').attr('limit','unit');
      this.$formula = containingMathquill.find('.tlab-parameter-input-formula').attr('limit','formula');


      this.$('.tlab-action-duplicate').on('tlab-tap', this.onDuplicateWithoutFocus.bind(this));
      // listen to the mathquill inputs
      var editables = containingMathquill.find('.mathquill-editable');
      var self = this;
      editables.on('focusin', this.focusInMathquill.bind(this))
               .on('focusout', this.focusOutMathquill.bind(this))
               .on('render', this.handleMathquillInput.bind(this))
               .on('keydown', this.handleKeydown.bind(this))
               .on('tlab-tap', function (evt) {
                  self.sendTapToMathQuill(evt, $(this));
               })
               .addClass('tlab-math-input');

      // add these observers after the element is fully instantiated. Only after that
      // point is the dom fully in place for these renders to work. If the model updates
      // while the shell is still visible, we'll either get an error thrown (renderInvalids)
      // or we'll miss the dom update completely (renderVariables).
      this.renderName();
      this.renderSymbol();
      this.renderProperty();
      this.renderUnit();
      this.renderLoaded();

      this.renderFormula();
      this.model.observe('loaded.' + this.guid, this.renderLoaded.bind(this));
      this.model.observe('selected.' + this.guid, this.onSelectedChange.bind(this));
      this.model.observe('name.' + this.guid, this.renderName.bind(this));
      this.model.observe('symbol.' + this.guid, this.renderSymbol.bind(this));
      this.model.observe('property.' + this.guid, this.renderProperty.bind(this));
      this.model.observe('unit.' + this.guid, this.renderUnit.bind(this));
      this.model.observe('formula.' + this.guid, this.renderFormula.bind(this));
    };

    view.onMouseClick = function() {
      alert('Mouse Clicked');
    }

    view.onTab = function() {
      alert('View Tabed');
    }

    view.onDocClick = function(evt){
      alert('Doc Clicked');
    }
    view.renderLoaded = function() {
      var loaded = this.model.loaded;
      this.$().toggleClass('tlab-loading', !loaded);

      // must redraw the mathquill when loaded because it can't render correctly when display:none
      if (loaded) {
        this.$('.tlab-parameter-name,.tlab-parameter-property,.tlab-parameter-formula').mathquill('redraw');
      }
    };
    view.renderName = function () {
      var value = this.model.name;
      if (this.$name.mathquill('latex') !== value) {
        this.$name.mathquill('latex', value);
      }
    };

    view.renderSymbol = function () {
      var value = this.model.symbol;
      if (this.$symbol.mathquill('latex') !== value) {
        this.$symbol.mathquill('latex', value);
      }
    };

    view.renderProperty = function () {
      var value = this.model.property;
      if (this.$property.mathquill('latex') !== value) {
        this.$property.mathquill('latex', value);
      }
    };

    view.renderUnit = function () {
      var value = this.model.unit;
      if (this.$unit.mathquill('latex') !== value) {
        this.$unit.mathquill('latex', value);
      }
    };

    view.renderFormula = function () {
      var value = this.model.formula;
      if (this.$formula.mathquill('latex') !== value) {
        this.$formula.mathquill('latex', value);
      }
    };


    view.onSelectedChange = function() {
      if (!this.model.selected && this.mathquill) {
        // take focus out of mathquill
        this.mathquill.mathquill('clearSelection').mathquill('blur');
      }
    };

    
    
    view.onDuplicateWithoutFocus = function() {

      ga.send(['_trackEvent', 'edit-list-mode', 'duplicate used']);

      var index = this.model.index;
      var state = this.model.getState();
      state.selected = false;
      delete state.id;

      var list = this.model.list;
      var folder = this.model.folder;
      var obj = ParameterObject(state, list);

      list.insertItemAt(index + 1, obj);
      if (folder) folder.addItem(obj);

      return obj;
    };

    view.onMouseSelect = function(evt) {
      if (this.listView.editListMode) return;

      if (evt.wasHandled()) return;
      evt.handle();

      this.model.setProperty('selected', true);

    };


    var lhs = function (formula) {
      return formula.replace(RegExp("=[^=]+$"), "=");
    };

    view.isFocused = function () {
      return $(document.activeElement).closest(this.mathquill).length !== 0;
    };

    view.addFocus = function (where) {
      if (!this.mathquill) return;

      this.mathquill.mathquill('focus');

      if (where === 'start') {
        this.mathquill.mathquill('moveStart');
      } else if (where === 'end') {
        this.mathquill.mathquill('moveEnd');
      }
    };

    // blur input when enter pressed
    view.handleMathquillInput = function(evt) {
      var input = this.$(evt.target).closest('.tlab-math-input');
      var value = input.mathquill('latex');
      var limit = input.attr('limit');
      this.model.setProperty(limit, value);
    };

  });

  return ParameterView;
});
