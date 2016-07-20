define(['require','loadcss!parameter_top_bar','loadcss!parameters','loadcss!parameters.icon'
  ,'jquery','underscore','pjs','tipsy','base/underscoreview','device/touchtracking'
  ,'./dragdrop','./addparameter','utils/conditionalblur','keys','utils/browser'
  ,'utils/scrollhelpers','utils/jquery.handleevent','./newparameter'
  ,'./item','./itemview','./folderview','template!parameter_list'],function (require) {
	require('loadcss!parameter_top_bar');
	require('loadcss!parameters');
	require('loadcss!parameters.icon');

	var $ = require('jquery');
	var _ = require('underscore');
	var P = require('pjs');
	require('tipsy');
	var UnderscoreView = require('base/underscoreview');
	var touchtracking = require('device/touchtracking');
	var DragDrop = require('./dragdrop');
	var AddParemeterView = require('./addparameter');
	var conditionalBlur = require('utils/conditionalblur');
	var Keys = require('keys');
	var Browser = require('utils/browser');
	var scrollHelpers = require('utils/scrollhelpers');
	require('utils/jquery.handleevent');
	
	var NewParameterView = require('./newparameter');
	var ParameterObject = require('./item');
	var ParameterView = require('./itemview');
	var FolderView = require('./folderview');
	var template = require('template!parameter_list');

  
  var ParemeterListView = P(UnderscoreView, function (view, _super) {
    view.__itemViews = {};
    view.__latexChangeCallbacks = [];
    view.isTransient = false;
    view.transientChildren = [];
    view.template = template;

    // Overridden by Calc.
    // TODO: copied and pasted over from list_view_tablet, but this feels really dirty
    // There's got to be a better way to do this.
    view.triggerClearGraph = function () {};

    view.onLatexChange = function (latex) {
      _.each(this.__latexChangeCallbacks, function (cb) { cb(latex); });
    };

    view.init = function (model, $root, toastView, graphSettings) {
      _super.init.call(this);

      this.$root = $root || $('body');
      this.setProperty('scrollbarWidth', 0);
      this.setProperty('minWidth', 356);

      this.toastView = toastView;
      this.graphSettings = graphSettings;
      this.model = model;
      this.model.triggerItemInserted = this.onItemInserted.bind(this);
      this.model.triggerItemRemoved = this.onItemRemoved.bind(this);
      this.model.triggerItemMoved = this.onItemMoved.bind(this);
      this.model.triggerSetState = this.onSetState.bind(this);

      this.observe('itemFocused', this.renderItemFocused.bind(this));
      this.observe('editListMode', this.renderEditListMode.bind(this));

      // ensure selected parameter is visible on selection change and focused
      // parameter is visible on keypress
      this.model.observe('selectedItem', this.ensureActiveChildIsVisible.bind(this));

      this.dragdrop_parameters = DragDrop(this);
      this.createAllItemViews();
    };

    view.computeTransient = function(){
      this.setProperty('transient', this.transientChildren.length > 0);
    };

    //when sliding a slider, we want to temporarily pad the bottom enough that things don't move around
    view.padLastParemeter = function(padding) {
      var $lastExp = this.$('.tlab-parameteritem.tlab-new-parameter');
      $lastExp.css('margin-bottom', + padding + 'px');
    };

    view.unpadLastParemeter = function() {
      var $lastExp = this.$('.tlab-parameteritem.tlab-new-parameter');
      $lastExp.css('margin-bottom', '0');
      this.recalculateScrollbarWidth();
    };

    view.padLastParemeterUntilTapEnd = function(padding){
      var self = this;
      this.padLastParemeter(padding);
      $(document).on('tlab-tap.animating-bottom', function() {
        if (self.$('.tlab-exp-options-menu').length === 0) {
          self.unpadLastParemeter();
          $(document).off('.tlab-tap.animating-bottom');
        }
      });
    };

    //we need to set minWidth at least once, because otherwise
    //we never set the css property, which caused: https://github.com/desmosinc/knox/issues/3878
    //we also don't want to set the css every time, because that'll be a performance burden
    //finally, we need to set it *initially* or else we get a weird slide-in animation
    //because layout_controller doesn't call this until after everything's all instantiated.
    //solution: just store some state recording whether we should ignore our no-op trap
    view.minWidthHasBeenSet = false;
    view.setMinWidth = function (newWidth) {
      if (!this.$params) return;
      if (newWidth === this.minWidth && this.minWidthHasBeenSet) return;
      this.minWidthHasBeenSet = true;
      this.setProperty('minWidth', newWidth);
      var newCss = {minWidth: newWidth};
      if (!this.itemFocused) newCss.maxWidth = newWidth;
      this.$parampanelContainer.css(newCss);
    };

    view.updateAllViewWidths = function () {
      _.each(this.__itemViews, function (view) { view.setMinWidth(); });
    };

    view.recalculateScrollbarWidth = function () {
      var scrollbarWidth = this.$('.tlab-parampanel').width() - this.$('.tlab-parameterlist').width();
      scrollbarWidth = Math.max(scrollbarWidth, 0);
      this.setProperty('scrollbarWidth', scrollbarWidth);
    };

    view.updateWidth = function () {
      if (!this.$params) return;
      var parampanel = this.$parampanelContainer;
      var maxWidth = 0;
      //don't update width if we're full-width (i.e. on a smallscreen)
      if (parampanel.css('min-width') === '100%') return;

      var minWidth = this.minWidth;

      this.$('.tlab-disable-horizontal-scroll-to-cursor').scrollLeft(0);

      function includeWidth ($element) {
        var main = $element.find('.tlab-main');
        if (!main.length) return;

        var width = main.outerWidth() + main.offset().left;
        if (width > maxWidth) maxWidth = width;
      }
      var selected = this.getSelectedView();
      if (selected && (this.itemFocused || selected.model.isTable)) {
        includeWidth(selected.$());
      }

      if (this.editListMode) {
         this.$('.tlab-parametertable').each(function () {
           includeWidth($(this));
         });
      }

      if (maxWidth < minWidth) {
        maxWidth = minWidth;
      }

      parampanel.css('max-width', maxWidth);
      this.recalculateScrollbarWidth();
    };


    view.onItemInserted = function (index, item) {
      //update index for newParemeterView
      if (this.newParemeterView) {
        this.newParemeterView.setProperty('index', this.model.getItemCount()+1);
      }

      // if we've started adding items to dom, add this item. Otherwise,
      // the view will be created when the ParemeterListView is inserted
      // into the dom
      if (this.$items) {
        var view = this.createItemView(item);
        if (view) {
          if (index === 0) {
            view.prependTo(this.$items); // beginning
          } else if (index === this.model.getItemCount()-1) {
            view.appendTo(this.$items); //end
          } else { //somewhere in the middle
            view.insertAfter(this.$items.children(':nth-child('+ index +')'));
          }

          //in edit list mode, we animate new items
          if (this.editListMode) {
            view.$().css({
              transform: 'scale(0,0)',
              opacity: 0
            });

            //wait one frame, or the 0,0 won't catch
            setTimeout(function() {
              view.$().css({
                transition: '.2s',
                opacity: 1,
                transform: ''
              });
            }, 1);
            //remove our transition after the animation's done
            setTimeout(function () {
              view.$().css({
                transition: 'none'
              });
            }, 300);
          }
        }

        var len = this.model.getItemCount();
        for (var i=index; i<len; i++) {
          this.model.getItemByIndex(i).setProperty('index', i);
        }

        this.updateWidth();
        this.ensureActiveChildIsVisible();
      }
    };

    view.onItemRemoved = function (index, item) {
      var item_id = String(item.id);

      item.unobserve('.listview');

      // update index on newParemeterView
      if (this.newParemeterView) {
        this.newParemeterView.setProperty('index', this.model.getItemCount()+1);
      }

      // remove item view from dom
      var view = this.__itemViews[item_id];
      if (view) {
        view.remove();
        delete this.__itemViews[item_id];

        var len = this.model.getItemCount();
        for (var i=index; i<len; i++) {
          this.model.getItemByIndex(i).setProperty('index', i);
        }
      }

      this.updateWidth();
    };

    view.onItemMoved = function (from, to) {
      // update index of each affected item
      var min_affected = Math.min(from,to);
      var max_affected = Math.max(from,to);
      for (var i = min_affected; i <= max_affected; i++) {
        this.model.getItemByIndex(i).setProperty('index', i);
      }

      // move view to correct spot
      var view = this.getItemView(this.model.getItemByIndex(to).id);
      if (view) {
        var $items = this.$items;
        // put at beginning
        if (to === 0) {
          $items.prepend(view.$());
        }

        // put at end
        else if (to === this.model.getItemCount() - 1) {
          $items.append(view.$());
        }

        // put somewhere in middle
        else {

          // must add 1 to index if to > from. This is because the from spot will
          // get plucked out and inserted after the to spot. Means we need to
          // search one deeper into sibling list to find the correct node to
          // insert after.
          var child_index = to + ( to > from ? 1 : 0);
          view.$().insertAfter($items.children(':nth-child('+ child_index +')'));
        }
      }
    };

    view.onSetState = function (list) {
      // destroy item views
      //TODO - could do a destruct() and remove all at once from dom for optimization.
      for (var id in this.__itemViews) {
        if (this.__itemViews.hasOwnProperty(id)) this.__itemViews[id].remove();
      }

      this.__itemViews = {};

      // update index on newParemeterView
      if (this.newParemeterView) {
        this.newParemeterView.setProperty('index', this.model.getItemCount()+1);
      }

      // make all the views at once and insert one large structure
      this.createAllItemViews();
      this.appendAllItemViews();
    };

    view.renderItemFocused = function () {
      this.$root.toggleClass('.tlab-ITEM-FOCUSED', !!this.itemFocused);
    };

    view.instantiateItemView = function (item) {
      if (item.isParameter) {
        return ParameterView(item, this);
      } else if (item.isFolder) {
        return FolderView(item, this);
      } 
    };

    view.createItemView = function (item) {
      var view = this.instantiateItemView(item);
      var item_id = String(item.id);

      if (view) {
        this.__itemViews[item_id] = view;

        // add some triggers to the view
        var self = this;
        view.triggerDelete = function(){self.onDelete(view)};
        view.triggerEnterPressed = function(){self.onEnterPressed(view)};
        view.triggerUpPressed = function(){self.onUpPressed(view)};
        view.triggerDownPressed = function(){self.onDownPressed(view)};
        view.triggerBackspacePressed = function(){self.onBackspacePressed(view)};
        view.triggerDelPressed = function(){self.onDelPressed(view)};
        view.observe('transient', function(prop, view){
          if(view.transient) {
            self.transientChildren.push(view);
          } else {
            self.transientChildren = _(self.transientChildren).without(view);
          }
          self.computeTransient();
        });
      }

      return view;
    };

    view.createAllItemViews = function () {
      var len = this.model.getItemCount();
      for (var i=0; i<len; i++) {
        var item = this.model.getItemByIndex(i);
        this.createItemView(item);
      }
    };

    //this method is for large graphs with lots of unrendered shells
    //previously split between timermoduels and renderviewport.
    //
    //first, it finds the first visible parameter.
    //then, starting there, it renders all of the parameters there and below.
    view.renderVisibleParemeters = function () {
      var anyUnrendered = this.model.__items.some(function (item) {
        return item.renderShell;
      });
      if (!anyUnrendered) return;
      var expPanelTop = this.$('.tlab-parampanel').offset().top;
      var first = this.parameterAtPoint(5, expPanelTop);
      if (!first) return;

      //if the user set that we should use shells offscreen (for perf), do
      var last = null;
      if (this.graphSettings.config.useShellsOffscreen) {
        var scrollHeight = this.$('.tlab-parampanel').height();
        last = this.parameterAbovePoint(5, expPanelTop + scrollHeight);
      }

      this.renderParemeter(first.index, last);
    };

    //called from a folder when it uncollapses
    view.triggerFolderOpened = function() {
      this.renderVisibleParemeters();
    };

    // render parameters on a loop, starting from first.index (above)
    //
    // notes:
    //   * this only updates parameters *below* where you are. We don't
    // want to have what you're looking at move.
    //   * if "last" is provided, we don't update parameters beyond it
    view.renderParemeterTimeout = null;
    view.renderParemeter = function(index, last) {
      clearTimeout(this.renderParemeterTimeout);

      // find the first item (>= index) that needs to be rendered
      var item = this.model.getItemByIndex(index);
      while (item && (!item.renderShell || item.inCollapsedFolder)) {
        index++;
        item = this.model.getItemByIndex(index);

        // we've gone too far.
        if (last && index > last.index) return;
      }

      var self = this;
      if (item) {
        this.renderParemeterTimeout = setTimeout(function() {
          self.renderParemeter(index+1, last);
        },1);

        // calling this can immediately send us back into renderParemeter.
        // when that happens, we can set two timeouts but 1 overwrites the
        // other. That means one timeout dangles and isn't clearable.
        // The way this was caught was a test was expanding a folder before
        // all of the other shells were rendered. The contents of the folder
        // wasn't expanded because it's timeout was overwriten by the
        // previous timeout targeting the end of the list. We never came back
        // to the top of the list.
        //
        // timeout gets set first.
        item.setProperty('renderShell', false);
      }
    };

    view.appendAllItemViews = function () {
      if (!this.$items) return;
      var len = this.model.getItemCount();
      for (var i=0; i<len; i++) {
        var item = this.model.getItemByIndex(i);
        var view = this.getItemView(item.id);
        view.appendTo(this.$items);
      }

      this.updateWidth();
      this.renderVisibleParemeters();
    };

    // holds a copy of the each item's view for later reference

    view.getItemView = function (id) {
      return this.__itemViews[String(id)];
    };

    view.onDelete = function (view) {
      var self = this;
      var animationDuration = 0.2;
      view.$().css({
        'transition': animationDuration + 's',
        'opacity': '0',
        'transform': "scale(.1, .1)"
      });
      setTimeout(function() {
          self.model.removeItemAt(view.model.index);
          if (self.model.getItemCount() === 0) {
            var new_exp = ParameterObject(undefined, self.model);
            self.model.insertItemAt(0, new_exp);
          }
      }, 1000*animationDuration);
    };

    view.onUpPressed = function (view) {
      // nothing above
      if (view.model.index === 0) return;

      this.selectPrevParemeter(view.model);
      this.getSelectedView().addFocus('end');
    };

    view.onDownPressed = function (view) {
      this.selectNextParemeter(view.model);
      this.getSelectedView().addFocus('start');
    };

    view.onBackspacePressed = function (view) {
      var wasText = view.model.isText;

      //if you press backspace from the last element of a folder, it
      //delete -- it removes you from the folder
      var nextItem = this.model.getItemByIndex(view.model.index + 1);
      if (view.model.folder && (!nextItem || !nextItem.folder)) {
        view.model.folder.removeItem(view.model);
        return;
      }

      this.upwardDeleteParemeter(view);

      // having issues in iframe on ipad. backspace deletes the textbox
      // but doesn't focus into the parameter above
      // see #3106
      if (wasText && Browser.IS_IPAD && Browser.IS_IN_IFRAME) {
        this.model.setSelected(null);
        return;
      }

      this.getSelectedView().addFocus('end');
    };

    view.onDelPressed = function (view) {
      this.downwardDeleteParemeter(view.model);
      this.getSelectedView().addFocus('start');
    };

    view.onEnterPressed = function (view) {
      // having issues in iframe on ipad. make enter work like escape
      // see #3106
      if (view.model.isText && Browser.IS_IPAD && Browser.IS_IN_IFRAME) {
        conditionalBlur();
        this.model.setSelected(null);
        return;
      }

      var obj = ParameterObject({ selected:true }, this.model);
      var self = this;
      var insertIndex = view.model.index + 1;
      //insert below the last element of a collapsed folder
      if (view.model.isFolder && view.model.collapsed) {
        insertIndex += _(view.model.memberIds).keys().length;
      }

        self.model.insertItemAt(insertIndex, obj);
        if (view.model.isFolder && !view.model.collapsed) {
          view.model.addItem(obj);
        }
        if (view.model.folder) view.model.folder.addItem(obj);
      this.getSelectedView().addFocus();
    };

    view.parametersVisible = true;
    view.hideParemeters = function() {
      // deselect parameter
      this.model.setSelected(null);
      conditionalBlur();
      //note: the above 2 lines should do this, and this next call should be a no-op. Adding in one last
      //line of defense. See: https://github.com/desmosinc/knox/issues/4580
      this.setProperty('needsFakeKeypad', false);
      this.setProperty('parametersVisible', false);
    };

    view.showParemeters = function() {
      this.setProperty('parametersVisible', true);
      conditionalBlur();
    };

    view.renderEditListMode = function () {
      var $root = this.$root;
      var self = this;

      if (this.editListMode) {
        $root.addClass('tlab-EDIT-LIST-MODE');
        this.model.setSelected(null);
        // listen for a.tlab-tapstart event to close edit-list-mode
        $(document).on('tlab-tapstart.edit-list-mode', function (evt) {
          if (
            $(evt.target).closest('.tlab-parampanel').length === 0 &&
            $(evt.target).closest('.tlab-options-menu').length === 0 &&
            $(evt.target).closest('.tlab-parameter-top-bar').length === 0
          ) {
            self.setProperty('editListMode', false);
            ga.send(['_trackEvent', 'edit-list-mode', 'exit edit list by clicking outside']);
          }
        });
      } else {
        $root.removeClass('.tlab-EDIT-LIST-MODE');
        // don't listen for the event to close edit-list-mode anymore
        $(document).off('.edit-list-mode');
      }
    };

    /*
    * EVENTS
    */
    view.handleFocusChange = function (focused) {
      var target = $(focused);
      var inMathquill = target.closest('.mathquill-rendered-math').length !== 0;
      var inEditableMathquill = target.closest('.mathquill-editable').length !== 0;
      var inMathquillWithMathField = target.closest('.mathquill-rendered-math:not(.mathquill-editable)')
                                           .find('.mathquill-editable').length !== 0;
      var inMathInput = target.closest('.tlab-math-input').length !== 0;
      var inText = target.closest('.tlab-parametertext').length !== 0;
      var inFolder = target.closest('.tlab-parameterfolder').length !== 0;

      // clicking in the uneditable part of a mathquill that has \MathQuillMathFields embedded
      // still sends a focusIn event. Let's correct that by acting like mathquill isn't focused.
      if (!inEditableMathquill && inMathquill && inMathquillWithMathField) {
        inMathquill = false;
        inEditableMathquill = false;
        inMathInput = false;
      }

      // in case we're in list mode, get out of it!
      if (!inMathInput && (inMathquill || inEditableMathquill || inText || inFolder)) {
        if (this.editListMode) {
          ga.send(['_trackEvent', 'edit-list-mode', 'exit edit list from focusing exp']);
        }
        this.setProperty('editListMode', false);
      }

      //itemFocused should only trigger when we're editing mathquill.
      //that shows us when the keypad is up, the list is expanded, etc.
      //none of those actions occur in text or folders
      this.setProperty('itemFocused', inMathquill || inEditableMathquill);
      this.setProperty('needsFakeKeypad', inMathquill && inEditableMathquill);
    };
    view.onFocusIn = function (evt) {

      //it's possible to add focus to an parameter even when the parameters are hidden.
      // Most prominently: if you click a curve to select it and then type
      // If that happens, we want to show the parameter that's being edited, so pop back out the parameters list
      if (!this.parametersVisible) {
        this.showParemeters();
      }

      // sometimes mathquill notifies of focusin before the focus is set. So we have to
      // pass in where focus is about to be rather than simply use document.activeElement.
      this.handleFocusChange(evt.target);

      clearTimeout(this.fakeKeypadTimeout);
    };

    view.onFocusOut = function () {
      clearTimeout(this.fakeKeypadTimeout);
      // setTimeout here is used to coalesce calls to onFocusOut and onFocusIn
      // that happen in the same tick. This happens, e.g. when a new
      // parameter is created, and we move focus from the previous parameter
      // to it.
      this.fakeKeypadTimeout = setTimeout(function () {

        // Mathquill does something weird where it triggers a focusout on
        // render, but nothing actually happens to focus. To combat that, and
        // anything else similar, we check what's actually focused
        this.handleFocusChange(document.activeElement);

      }.bind(this), 0);
    };

    view.offset = function () {
      return this.$params.offset();
    };

    view.setBottom = function (bottom) {
      if (!this.$params) return;
      var oldBottom = parseFloat(this.$params.css('bottom').slice(0,-2));
      if (!isFinite(oldBottom)) oldBottom = 0;
      this.$params.css('bottom', bottom + 'px');

      //If the user is currently in a mouse interaction and the height
      //is increasing, pad the last parameter until they end their interaction to
      //prevent things from moving under them
      if (bottom === 0 && touchtracking.isTapActive()) {
        this.padLastParemeterUntilTapEnd(oldBottom);
      }
      this.recalculateScrollbarWidth();
    };

    view.didCreateElement = function () {
      var self = this;
      var list = this.model;

      _super.didCreateElement.call(this);

      this.$params = this.$('.tlab-parampanel-outer');

      this.addParemeterView = AddParemeterView(this, this.$root, this.graphSettings, this.toastView);
      this.addParemeterView.appendTo(this.$params);
      this.addParemeterView.setupOpenButton(this.$('.tlab-action-add-parameter'), 'tlab-tap');
      this.observe('scrollbarWidth minWidth', this.updateAllViewWidths.bind(this));

      this.$params.tipsy({
        fade: 'fast',
        title: 'tooltip',
        wait: 500,
        delegate: '.tlab-tooltip'
      });

      this.$parampanelContainer = this.$('.tlab-parampanel-container');
      this.$parampanel = this.$('.tlab-parampanel');
      this.$items = this.$('.tlab-template-parametereach');

      this.appendAllItemViews();

      //
      //listen for scroll. add class when scrolled, and set renderShells=false
      //

      var debouncedScroll = _.debounce(function(evt) {
        if (evt) this.$('.tlab-parameter-top-bar').toggleClass(
          '.tlab-parameters-scrolled',
          $(evt.target).scrollTop() > 0
        );
        this.renderVisibleParemeters();
      }.bind(this), 200);

      this.$parampanel.scroll(function(evt) {
        //stop rendering offscreen things immediately -- don't wait for debounce
        clearTimeout(self.renderParemeterTimeout);
        debouncedScroll(evt);
      });

      //
      // for iPad & nexus, listen for taps in the empty area underneath an parameter and defocus
      // because that doesn't happen automatically. The way I'm detecting such a tap is by checking if the
      // event is within an .parameteritem. If it's not, we're assuming the tap is within empty space.
      //
      this.$parampanel.on('tlab-tapstart', function(evt) {
        // avoids losing focus when on desktop and we mouseDown on the scrollbar. If we want to lose foucs in
        // that case, this line is perfect to remove. If we want something more robust to detect that we're
        // on the scrollbar, we might be able to check x position of the event compared to the width of the
        // inner content.
        if (evt.device === 'mouse') return;

        if ($(evt.target).closest('.tlab-parameteritem').length === 0) {
          conditionalBlur();
        }
      });

      this.$parampanel.on('keypress', this.ensureActiveChildIsVisible.bind(this));

      //the below should happen automatically, but doesn't on iPad / android
      //this lets you defocus the currently focused parameter by clicking the 'Paremeters' header
      this.$('.tlab-parameter-top-bar').on('tlab-tapstart', function(evt) {
        if (evt.wasHandled()) return;
        list.setSelected(null);
      });


      this.$params.on('tlab-tap', '.tlab-action-clearall', function () {
        self.triggerClearGraph();
        var undoCallback = function() {
          self.setProperty('editListMode', true);
        };
        self.toastView.show("Graph cleared.", {undoCallback: undoCallback});
      });

      this.$params.on('tlab-tap', '.tlab-action-undo', function () {
        list.undoRedo.undo();
      });

      this.$params.on('tlab-tap', '.tlab-action-redo', function () {
        list.undoRedo.redo();
      });

      this.$params.on('focusout', this.onFocusOut.bind(this));
      this.$params.on('focusin',  this.onFocusIn.bind(this));
      this.$('.tlab-action-toggle-edit').on('tlab-tap', function () {
        if (self.editListMode) {
          ga.send(['_trackEvent', 'edit-list-mode', 'manual exit edit list']);
        } else {
          ga.send(['_trackEvent', 'edit-list-mode', 'enter edit list']);
        }
        self.setProperty('editListMode', !self.editListMode);

      });
      this.$('.tlab-action-hideparameters').on('tlab-tap', this.hideParemeters.bind(this));
      this.$('.tlab-action-showparameters').on('tlab-tap', this.showParemeters.bind(this));
      // Relies on handleKeyDown returning early if no parameter is selected for
      // correctness when there are multiple calculators in the page. This means
      // we want to have the invariant that only one list_view can have a selected
      // item at a time.
      $(document.documentElement).on('keydown', this.handleKeyDown.bind(this));

      this.renderItemFocused();
      this.renderEditListMode();

      this.newParemeterView = NewParameterView(this);
      this.newParemeterView.replace(this.$('.template-newparameter'));
      this.newParemeterView.setProperty('index', this.model.getItemCount()+1);

      // whenever mathquill renders
      this.$params.on('render', function (evt) {
        self.updateWidth();
      });

      // these things all factor into how wide the parameter list is, so we watch them
      this.model.observe('selectedItem', function () {
        self.updateWidth();
      });
      this.observe('editListMode itemFocused', function () {
        self.updateWidth();
      });

      // any time that focus changes we need to make sure that a part of the page doesn't
      // scroll in order show the cursor. this is specifically important for IE9 and tables.
      // In IE9 there will be a quick flash when the parameter list is scrolled back to 0,0
      // but I can't find anything that happens synchronously. I've tried:
      //    1) Listening to changes to selectedCell of the selected table
      //    2) Listening for 'scroll' event on the element that gets scrolled
      //
      // both of those still show a quick flash, so this is the chosen method since it's
      // the simplest and most general.
      this.$params.on('focusin', function () {
        setTimeout(function () {
          self.updateWidth();
        }, 0);
      });
    };

    view.didInsertElement = function () {
      this.updateWidth();
      this.$parampanelContainer.addClass('tlab-do-animate');
    };

    view.getFirstVisibleItem = function() {
      var top = this.$parampanel.offset().top;
      var el = this.parameterAtPoint(0, top);

      if (!el) {
        return this.model.getItemByIndex(0);
      }
      //make sure it's fully visible
      if (this.getItemView(el.id).$().offset().top < top - 2) { //Allow for overlapping borders
        el = this.model.getItemByIndex(el.index+1);
      }
      return el;
    };

    view.appendBlankParemeter = function() {
      this.newParemeterView.newMath();
    };

    // Find the view for the selected parameter and scroll that parameter
    // into view. If the parameter doesn't have a view yet, we'll let the
    // view call this once it's inserted into the dom. If there is no selected
    // view, then check if there's a focused view. If so, scroll that until
    // it's visible
    view.ensureActiveChildIsVisible = function(){
      if (!this.$params || !this.$params.is(':visible')) return;

      // if an item is selected, try to force it into view
      var selectedView, $selectedView;
      var active = $(document.activeElement);

      if (this.model.selectedItem) {
        selectedView = this.getItemView(this.model.selectedItem.id);
        if (selectedView) $selectedView = selectedView.$();
      } else if (active) {
        //see if an input is focused (i.e. max / min)
        selectedView = active.closest('.tlab-parameteritem');
        if (selectedView.length) $selectedView = selectedView[0];
      }

      if ($selectedView) {
        var mathquill = active.closest('.mathquill-editable');

        //scroll the specific mathquill if we're in one (i.e. focused in a table or exp)
        if (selectedView.model && mathquill.length) {
          var padding = (selectedView.model.isTable ? 60 : 90);
          return scrollHelpers.scrollVisible(mathquill, this.$parampanel, padding);
        }
        //scroll the activeElement if it exists (i.e. focus is in a textarea or folder title)
        if (active.closest('.tlab-parameteritem').length) {
          return scrollHelpers.scrollVisible(active, this.$parampanel, 90);
        }
        //scroll the whole view
        scrollHelpers.scrollVisible($selectedView, this.$parampanel, 90);
      }
    };

    view.handleKeyDown = function(evt) {
      /* jshint maxcomplexity:26 */
      // make sure nothing has focus
      if ($.contains(document.body, document.activeElement)) {
        return;
      }

      // make sure event didn't happen from within parameter list
      if ($(evt.target).closest('.tlab-parampanel').length) {
        return;
      }

      // make sure target is still in dom. fixes #3282
      if (!$.contains(document.documentElement, evt.target)) {
        return;
      }

      var selected = this.getSelectedView();
      if (selected && selected.isFocused()) {
        selected.processMissedKeyEvent(evt);
        return;
      }
      var key = Keys.lookup(evt);

      if (!selected) return;

      switch (key) {
        case Keys.UP:
          evt.preventDefault();
          this.selectPrevParemeter(selected.model);
          break;

        case Keys.DOWN:
          evt.preventDefault();
          this.selectNextParemeter(selected.model, true);
          break;
        case Keys.ESCAPE:
          evt.preventDefault();
          this.model.setSelected(null);
          break;

        case Keys.RIGHT:
        case Keys.TAB:
          evt.preventDefault();
          if (selected) {
            if (selected.model.isTable) {
              selected.addFocus('cell', 0, 0);
            } else {
              selected.addFocus('start');
            }
          }
          break;

        case Keys.LEFT:
          evt.preventDefault();
          if (selected) {
            if (selected.model.isTable) {
              selected.addFocus('cell', 0, selected.model.columns.length - 1);
            } else {
              selected.addFocus('end');
            }
          }
          break;

        case Keys.BACKSPACE:
          evt.preventDefault();
          if(selected){
            this.upwardDeleteParemeter(selected);
          }
          break;

        case Keys.DELETE:
          evt.preventDefault();
          if(selected){
            this.downwardDeleteParemeter(selected);
          }
          break;

        case Keys.ENTER:
          evt.preventDefault();
          if (selected) this.onEnterPressed(selected);
          break;

        default:
          //ignore things like ctrl-copy, ctrl-paste, alt-tab, shift
          if (evt.metaKey ||
              evt.ctrlKey ||
              key === Keys.SHIFT ||
              key === Keys.SPACEBAR
          ) {
            return;
          }

          if (selected) {
            if (selected.model.isTable) {
              // do nothing since we don't know where to type
            } else {
              selected.addFocus('end');
            }
          }
      }
    };

    /*
    * PUBLIC METHODS
    */
    view.getSelectedView = function () {
      var selected = this.model.getSelected();
      if (selected) {
        var view = this.getItemView(selected.id);
        return view;
      }

      return null;
    };

    view.upwardDeleteParemeter = function (parameterView) {
      var index = parameterView.model.index;
      var prev = this.model.getItemByIndex(this.findPrevSelectableIndex(index));

      if (prev) {
        this.model.setSelected(prev);
        this.model.removeItemAt(index);
      } else {
        this.onDelete(parameterView);
      }
    };

    view.findPrevSelectableIndex = function (index) {
      var item;

      do {
       index--;
       item = this.model.getItemByIndex(index);
      } while (item && item.inCollapsedFolder);

      return item ? index : undefined;
    };

    view.findNextSelectableIndex = function (index) {
      var item;

      do {
       index++;
       item = this.model.getItemByIndex(index);
      } while (item && item.inCollapsedFolder);

      return item ? index : undefined;
    };

    view.downwardDeleteParemeter = function (parameterView) {
      var index = parameterView.model.index;
      var next = this.model.getItemByIndex(this.findNextSelectableIndex(index));

      if (next) {
        this.model.setSelected(next);
        this.model.removeItemAt(index);
      } else {
        this.onDelete(parameterView);
      }
    };

    view.selectPrevParemeter = function (parameter) {
      if (!parameter) return;

      var index = parameter.index;
      var prev = this.model.getItemByIndex(this.findPrevSelectableIndex(index));

      if (prev) {
        prev.setProperty('selected', true);

        // check if this was an empty last parameter
        // if so, remove it
        if (index === this.model.getItemCount() - 1 && parameter.isEmpty()) {
          this.model.removeItemAt(index);
        }
      }
    };

     view.selectNextParemeter = function (parameter, dontCreateNew) {
       if (!parameter) return;

       var index = parameter.index;
       var next = this.model.getItemByIndex(this.findNextSelectableIndex(index));

       if (next) {
         next.setProperty('selected', true);
       } else if(!dontCreateNew) {
         var obj = ParemeterObject({ selected:true }, this.model);
         this.model.insertItemAt(this.model.getItemCount(), obj);
       }
     };

    /*
    * Returns a list of visible parameter views, ordered by index.
    */
    view._getVisibleViews = function () {
      var visibleViews = [];

      for (var i = 0; i < this.model.getItemCount(); i++) {
        var exp = this.model.getItemByIndex(i);
        var view = this.getItemView(exp.id);
        if (view && view.$().is(':visible')) visibleViews.push(view);
      }

      return visibleViews;
    };

    /*
    * Does a binary search to find the .parameteritem that is at the point
    */
    view.parameterAtPoint = function (x, y) {
      var visibleViews = this._getVisibleViews();
      var lo = 0;
      var hi = visibleViews.length-1;

      while (lo<=hi) {
        var mid = lo + Math.floor((hi-lo)/2);
        var view = visibleViews[mid];
        var rect = view.getBounds();

        if (rect.top > y) {
          hi = mid - 1;
        } else if (rect.bottom < y) {
          lo = mid + 1;
        } else {
          return view.model;
        }
      }

      return null;
    };

    /*
    * Finds the first parameter at or above the point
    */
    view.parameterAbovePoint = function (x, y) {
      var visibleViews = this._getVisibleViews();
      var lo = 0;
      var hi = visibleViews.length-1;
      var found = null;

      while (lo<=hi) {
        var mid = lo + Math.floor((hi - lo)/2);
        var view = visibleViews[mid];
        var rect = view.getBounds();

        if (rect.top > y) {
          hi = mid - 1;
        } else {
          lo = mid + 1;
          found = view.model;
        }
      }

      return found;
    };

    view.onProjectorModeChange = function() {
      for (var id in this.__itemViews) {
        if (this.__itemViews.hasOwnProperty(id)) {
          this.__itemViews[id].onProjectorModeChange();
        }
      }
    };

    // keypad sends a message to the list_view if a key is pressed but
    // no mathquill is currently focused. It's up to the list_view to
    // figure out what to do with the key. The time that this happens
    // is when a disabled table cell is highlighted. We need the arrow
    // keys to still work.
    view.handleUnfocusedKeypadAction = function (key) {
      var selectedView = this.getSelectedView();
      if (selectedView && selectedView.model.isTable ) {
        if (selectedView.model.selectedCell) {
          selectedView.doKeyAction(key);
        }
      }
    };

    view.addFocusForKeypad = function () {
      //use currently selected parameter if one is selected (no-op if it's also focused)
      var selected = this.model.getSelected();
      if (selected && selected.isParemeter) {
        this.getItemView(selected.id).addFocus();
        return;
      }

      //if currently selected is a table, return early if it already has focus
      if (selected && selected.isTable && this.itemFocused) {
        return;
      }

      //if not, get the element at the top of the list
      var item = this.getFirstVisibleItem();

      //search downward until we find an parameter that we can focus
      while (item && !item.isParemeter) {
        item = this.model.getItemByIndex(item.index + 1);
      }

      //if we found an item: focus it!
      if (item) {
        this.getItemView(item.id).addFocus();
        return;
      }

      //append a blank parameter at the bottom of the list, and focus that
      this.appendBlankParemeter();
    };

  });

  return ParemeterListView;
});

