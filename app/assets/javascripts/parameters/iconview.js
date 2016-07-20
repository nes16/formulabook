
define('base/abstracticon',['require','jquery','base/underscoreview','pjs','keys','i18n'],function(require){
  var $ = require('jquery');
  var UnderscoreView = require('base/underscoreview');
  var P = require('pjs');
  var Keys = require('keys');
  var i18n = require('i18n');

  var icon_count = 0;

  var AbstractIconView = P(UnderscoreView, function (view, _super) {

    view.init = function (parentView) {
      this.parentView = parentView;
      this.model = parentView.model;

      _super.init.call(this);
      this.optionsmenu_guid = (++icon_count);

      // model.error is a message; this.error is boolean whether we care about
      // the error. One time we don't care is if the model is empty.
      this.model.observe('error.iconview', this.renderErrorTooltip.bind(this));
      this.observe('error', this.renderErrorTooltip.bind(this));

      this.observe('error errorStable', this.computeErrorShown.bind(this));
      this.observe('errorShown', this.renderErrorShown.bind(this));
    };

    view.destruct = function () {
      this.model.unobserve('.iconview');
    };

    view.computeErrorShown = function () {
      this.setProperty('errorShown', this.error && this.errorStable);
    };

    view.renderErrorTooltip = function () {
      var error = this.error ? i18n.unpack(this.model.error) : '';
      this.$().closest('.tlab-variable-errortooltip').attr('tooltip', error);
    };

    view.renderErrorShown = function () {
      this.$().toggleClass('tlab-error', !!this.errorShown);
    };

    view.didInsertElement = function () {
      this.renderErrorShown();
      this.renderErrorTooltip();
    };

    // defined in subclass
    view.createOptionsMenuView = function () {};

    view.toggleOptions = function() {
      if (this.error) {
        this.hideOptions();
        return;
      }
      if (this.optionsShown) {
        this.hideOptions();
        return;
      }

      this.optionsShown = true;


      // Add options menu to .tlab-main. workaround bug with "-webkit-scrolling-overflow: touch" and child "position:
      // relative" elements not respecting z-index
      // see: "-webkit-overflow-scrolling: touch is messing up z-index stacking"
      // [http://code.google.com/p/chromium/issues/detail?id=128325]
      this.optionsMenu = this.createOptionsMenuView(); //defined in subclass

      var id = this.optionsmenu_guid;

      // ipad sends out a scroll event when you tlab-tapstart on the button that
      // opens the context menu. We want that first scroll event to be
      // ignored, so we add the listener after a slight timeout to give the
      // first scroll event time to pass through.
      setTimeout(function(){
        //make sure options menu hasn't closed before the timeout fires
        if (this.optionsShown) {
          this.getListView$().on("scroll.options-menu-" + id, function(evt) {
            this.hideOptions();
          }.bind(this));
        }
      }.bind(this), 0);

      $(document).on("keydown.options-menu-" + id, function (e) {
        if (Keys.lookup(e) === Keys.ESCAPE) {
          this.hideOptions();
        }
      }.bind(this));

      $(document).on("tlab-tapstart.options-menu-" + id, function (e) {

        // close this unless:
        // * we click on the icon again (will handle that separately)
        // * we click insde the context-menu (that's been moved to the body)

        // we click inside the context menu (but not on the "close" button)
        if ($(e.target).closest('.tlab-options-menu').length) return;

        // we click within this view again
        if ( $(e.target).closest(this.$()).length) return;

        this.hideOptions();

      }.bind(this));
    };

    view.getListView$ = function () {
      return this.$().closest('.tlab-tap-container').find('.tlab-exppanel');
    };

    view.hideOptions = function() {
      if (!this.optionsShown && !this.optionsMenu) return;
      this.optionsShown = false;

      var id = this.optionsmenu_guid;
      $(document).off("tlab-tapstart.options-menu-" + id);
      $(document).off("keydown.options-menu-" + id);
      this.getListView$().off("scroll.options-menu-" + id);

      if (this.optionsMenu) {
        this.optionsMenu.remove();
        this.optionsMenu = null;
      }
    },

    view.onDisplayChange = function () {
      var error = this.model.error ? true : false;
      if (this.model.isEmpty()) error = false;

      //next sequence of code will only add the errorStable property
      //if the error value hasn't changed within the last 500ms
      if (error !== this.error) {
        this.setProperty('errorStable',false);
        this.__errorTime = new Date().getTime();
        setTimeout(this.onDisplayChange.bind(this), 100);
      } else if (this.__errorTime + 500 < new Date().getTime()) {
        this.setProperty('errorStable', true);
      } else if (!this.errorStable) {
        setTimeout(this.onDisplayChange.bind(this), 100);
      }

      this.setProperty('error', error);
    };

  });

  return AbstractIconView;
});


define(['require','pjs','base/abstracticon','./menuview'
  ,'math/comparators','template!parameter_icon','utils/jquery.handleevent'],function(require){
  var P = require('pjs');
  var AbstractIconView = require('base/abstracticon');
  var ParameterOptionsMenuView = require('./menuview');
  var Comparators = require('math/comparators');
  var template = require('template!parameter_icon');
  require('utils/jquery.handleevent');

  var ParameterIconView = P(AbstractIconView, function (view, _super) {
    view.template = template;

    view.init = function (parentView) {
      _super.init.call(this, parentView);
      this.parameter = this.model;

      // wait for the slider to be created. Then observe the isPlaying property on it
      this.parameter.observe('slider.iconview', function () {
        this.parameter.slider.observe('isPlaying.iconview', this.onDisplayChange.bind(this));
      }.bind(this));

      this.parameter.observe('formula.iconview', this.onDisplayChange.bind(this));
      this.parameter.observe('shouldGraph.iconview', this.onDisplayChange.bind(this));
      this.parameter.observe('isGraphable.iconview', this.renderUngraphable.bind(this));
      this.parameter.observe('loading.iconview', this.renderLoading.bind(this));
      this.parameter.observe('color.iconview', this.renderColorCSS.bind(this));
      this.parameter.observe('style.iconview', this.onDisplayChange.bind(this));

      this.parentView.observeEvent('hideContextMenu.iconview', this.hideOptions.bind(this));
    };

    view.destruct = function () {
      _super.destruct.call(this);

      this.parameter.unobserve('.iconview');
      if (this.parameter.slider) {
        this.parameter.slider.unobserve('.iconview');
      }

      this.parentView.unobserve('.iconview');
    };

    view.renderUngraphable = function () {
      this.$().toggleClass('tlab-ungraphable', !this.parameter.isGraphable);
    };

    view.renderLoading = function () {
      this.$().toggleClass('tlab-loading', !!this.parameter.loading);
    };

    view.renderColorCSS = function() {
      this.$('.tlab-variable-colorcss').css({
        'border-color' : this.parameter.color,
        'background' : this.parameter.color
      });
    };

    view.didInsertElement = function () {
      var self = this;
      _super.didInsertElement.call(this);

      this.renderLoading();
      this.renderUngraphable();
      this.renderColorCSS();
      this.onDisplayChange();

      this.$icon = this.$('.tlab-icon');

      var handleIconTapped = function(evt, device){
        if(evt.wasHandled('dragdrop')) return; //Don't toggle if we were handled by dragdrop
        if(evt.wasLongheld()) return;
        if(evt.device !== device) return;

        if (self.optionsShown) {
          self.toggleOptions();
          return false;
        }

        if (self.parentView.listView.editListMode) {
          if (self.parameter.isGraphable) {
            self.toggleOptions();
          }
        } else if (self.parameter.formula.is_animatable) {
          self.toggleSliderIsPlaying();
        } else {
          self.toggleGraphShown();
        }
      };

      var handleIconLongHold = function(evt, device) {
        if(evt.device !== device) return;
        if (!self.model.isGraphable) return;

        evt.handle('tlab-longhold');
        self.toggleOptions();
      };

      this.$().closest('.tlab-action-icon-mouse').on('tlab-tap', function(evt){
        handleIconTapped(evt, 'mouse');
      });

      this.$().closest('.tlab-action-icon-touch').on('tlab-tap', function(evt){
        handleIconTapped(evt, 'touch');
      });

      this.$().closest('.tlab-action-icon-mouse').on('tlab-longhold', function(evt){
        handleIconLongHold(evt, 'mouse');
      });

      this.$().closest('.tlab-action-icon-touch').on('tlab-longhold', function(evt){
        handleIconLongHold(evt, 'touch');
      });
    };

    view.isGraphShown = function () {
      return this.parameter.shouldGraph;
    };

    

    view.toggleGraphShown = function() {
      if (!this.model.isGraphable) return;
      if (this.errorShown) return;

      //note: if this.parameter is in a hidden folder this line will always fire, since
      //isGraphShown will be false. It'll be a no-op if the graph was shown when
      //the folder was hidden. That doesn't matter, because later on we turn on the folder
      //which will recalculate isGraphShown, so we'll recompute the icon anyway
      this.parameter.setProperty('hidden', this.isGraphShown());

      //always show the folder if we're inside one
      if (this.parameter.folder) this.parameter.folder.setProperty('hidden', false);
    };

    view.createOptionsMenuView = function () {
      var listView = this.parentView.listView;
      var optionsView = ParameterOptionsMenuView(this.parameter);
      optionsView.appendTo(listView.$());

      // putting the ParameterOptionsView at the topLeft of the .tlab-icon
      // it's up to the ParameterOptionsView's css to position it beyond that
      var placeholder = this.$('.tlab-icon');
      var placeholderOffset = placeholder.offset();
      var listViewOffset = listView.$().offset();
      optionsView.$().css({
        position: 'absolute',
        top: placeholderOffset.top - listViewOffset.top + 'px',
        left: placeholderOffset.left - listViewOffset.left + 'px',
        display: 'block' //wait until we know where it is to show it. fixes #3154
      });
      return optionsView;
    };

    view.onDisplayChange = function () {
      /* jshint maxcomplexity:20 */
      _super.onDisplayChange.call(this);
      if (!this.$icon) return;

      var formula = this.parameter.formula;
      var icon_class = '';

      if (this.error || !formula.is_graphable) {
        icon_class = '';
      } else {

        var shouldGraph = this.parameter.shouldGraph;
        var style = this.parameter.style;
        var operator = formula.operator;
        var shaded = Comparators.table[operator].direction !== 0;
        var dotted = Comparators.table[operator].inclusive === false;
        if (!shouldGraph) {
          icon_class = 'tlab-graph-hidden';
        } else if (formula.move_ids) {
          icon_class = 'tlab-graph-movable-point';
        } else if (formula.is_point_list) {
          if (style === 'open') {
            icon_class = 'tlab-graph-open';
          } else if (style === 'cross') {
            icon_class = 'tlab-graph-cross';
          } else {
            icon_class = 'tlab-graph-point';
          }
        } else if (formula.is_shade_between) {
          // TODO - missing icon for this
          icon_class = 'tlab-graph-shaded-inequality';
        } else if (!dotted && !shaded) {
          if (style === 'normal') {
            icon_class = 'tlab-graph-normal';
          } else if (style === 'dashed') {
            icon_class = 'tlab-graph-dashed';
          }
        } else if (!dotted && shaded) {
          // TODO - missing icon for this
          icon_class = 'tlab-graph-shaded-inequality';
        } else if (dotted && !shaded) {
          icon_class = 'graph-inequality';
        } else if (dotted && shaded) {
          icon_class = 'tlab-graph-shaded-inequality';
        }
      }

      // efficently changes the class of the icon
      if (this.rendered_icon_class === icon_class) return;
      if (this.rendered_icon_class) {
        this.$icon.removeClass(this.rendered_icon_class);
      }
      this.rendered_icon_class = icon_class;
      if (icon_class) {
        this.$icon.addClass(icon_class);
      }

    };
  });

  return ParameterIconView;
});
