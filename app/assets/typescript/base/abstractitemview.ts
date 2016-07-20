define(['require','pjs','jquery','base/underscoreview','utils/conditionalblur'],function(require) {
  var P = require('pjs');
  var $ = require('jquery');
  var UnderscoreView = require('base/underscoreview');
  var conditionalBlur = require('utils/conditionalblur');

  var AbstractItemView = P(UnderscoreView, function (view, _super) {
    view.init = function (model, listView) {
      _super.init.call(this);

      this.model = model;
      this.listView = listView;

      // do this now instead of letting renderSelected do this. If we wait
      // for renderSelected to do it, we'll end up calling rerender within a
      // already started render loop. That'll cause events to get bound twice
      // and other weird stuff will happen.
      if (this.model.selected) {
        this.model.renderShell = false;
      }
      //always render the first 15 equations (unless they're in folders)
      if (this.model.index < 15 && !this.model.inCollapsedFolder) {
        this.model.renderShell = false;
      }


      this.model.observe('index.itemview', this.renderIndex.bind(this));
      this.model.observe('selected.itemview', this.renderSelected.bind(this));
      this.model.observe('renderShell.itemview', this.rerender.bind(this));
      this.model.observe('renderShell.itemview', this.setMinWidth.bind(this));
      this.model.observe('folder.itemview', this.renderFolder.bind(this));
      this.model.observe('inCollapsedFolder.itemview', this.renderCollapsedFolder.bind(this));
    };

    //clear focus at the list level if the list has focus
    view.clearListFocus = function () {
      if (this.listView && this.listView.model) {
        this.listView.model.setSelected(null);
      }
    };

    //triggered from list_view when projector mode is changed
    //override from the different item type views. right now, just text_view overrides
    view.onProjectorModeChange = function() {};

    view.destruct = function () {
      this.model.unobserve('.itemview');
      this.setProperty('transient', false);
    };

    view.getTemplateParams = function () {
      return {
        renderShell: this.model.renderShell,
        inCollapsedFolder: this.model.inCollapsedFolder
      };
    };

    //this is called before the animation begins. The goal:
    // if an animation is in process (i.e. tlab-do-animate class is present)
    //   get out of here
    // otherwise, set the height to where it's supposed to start then wait
    // a frame and add tlab-do-animate class. Subsequent calls to set the height
    // will animate through css
    view.setInitialAnimationHeight = function(height) {
      if (this.$templateBottomContainer.hasClass('tlab-do-animate')) return;

      this.$templateBottomContainer.css('height', height);
      var self = this;
      setTimeout(function() {
        self.$templateBottomContainer.addClass('tlab-do-animate');
      });
    };

    //this is called once an animation is already in process, to animate
    //the height of the template bottom
    view.animateHeightTimeout = null;
    view.clearHeightTimeout = null;
    view.animateHeightTo = function (height) {
      var self = this;

      //step 1: animate to the new height. add the faded-in / faded-out class
      // this is in a timeout so that rapid typing doesn't make the bottom see-saw
      clearTimeout(this.animateHeightTimeout);
      this.animateHeightTimeout = setTimeout(function() {
        self.$templateBottomContainer.css('height', height);
        self.$templateBottom.toggleClass('tlab-faded-in', (height > 0));
      }, 250);

      //step 2: wait for the last possible animation to have finished (250ms + time for the animation to run)
      //then remove the animation class and remove the fixed height.
      //this means that subsequent changes to the size of the bottom of the expression will just let the page
      //reflow normally
      clearTimeout(this.clearHeightTimeout);
      this.clearHeightTimeout = setTimeout(function() {
        self.$templateBottomContainer.css('height', 'auto');
        self.$templateBottomContainer.removeClass('tlab-do-animate');
      }, 550);
    };

    view.templateBottomItems = 0;

    view.addViewToBottom = function (view) {
      //TODO: this is for api usage with expressions: false.
      //Ideally, this method should never be reached if we have no expression views
      if (!this.$templateBottom) return;

      this.templateBottomItems++;
      //short-circuit if we're not animating
      //
      //this also shortcuts the case where another bottom item is present
      //this can happen if this new bottom item is added before an existing one is removed.
      //for example: a*b, add sliders for both. then delete the slider for b.
      //The "add sliders:" option is added before the evaluation is removed
      //between this and the above, we just swap out this item.

      if (!this.doAnimate || this.templateBottomItems > 1) {
        this.$templateBottom.addClass('tlab-faded-in');
        view.appendTo(this.$templateBottom);
        return;
      }

      //set the height to zero
      this.setInitialAnimationHeight(0);
      //append the view
      view.appendTo(this.$templateBottom);
      //update the height of the bottom region
      this.animateHeightTo(view.$().height());
    };

    view.removeViewFromBottom = function (view) {
      //TODO: this is for api usage with expressions: false.
      //Ideally, this method should never be reached if we have no expression views
      if (!this.$templateBottom) return;

      this.templateBottomItems--;

      //second half of the shortcutted logic if we're swapping in a bottom element
      if (this.templateBottomItems > 0) {
        view.remove();
        return;
      }

      //short circuit if we're not animating
      if (!this.doAnimate) {
        this.$templateBottom.removeClass('tlab-faded-in');
        view.remove();
        return;
      }

      //set the initial animation height to the full height of the bottom
      this.setInitialAnimationHeight(this.$templateBottom.height());
      //remove the view
      view.remove();
      //animate to zero
      this.animateHeightTo(0);
    };

    view.renderIndex = function () {
      var index = this.model.index;
      this.$().attr('index', index);
      this.$('.tlab-variable-index').text(index+1);
    };

    view.renderFolder = function () {
      this.$().toggleClass('tlab-inFolder', !!this.model.folder);
    };

    view.renderCollapsedFolder = function(){
      this.$().toggleClass('tlab-inCollapsedFolder', !!this.model.inCollapsedFolder);
    };

    view.renderSelected = function () {
      if (this.model.selected) {
        if (this.model.renderShell) {
          this.model.setProperty('renderShell', false);
        }
      }

      this.$().toggleClass('tlab-selected', !!this.model.selected);
    };

    view.setMinWidth = function () {
      this.$('.tlab-fixed-width-element').css('width', this.listView.minWidth - this.listView.scrollbarWidth);
    };

    view.didCreateElement = function () {
      this.setMinWidth();
      this.$templateBottom = this.$('.tlab-template-bottom');
      this.$templateBottomContainer = this.$('.tlab-template-bottom-container');
    };

    view.didInsertElement = function () {
      _super.didInsertElement.call(this);

      var self = this;
      this.$().on('tlab-tap tlab-tapstart', function (evt) {
        // when using mouse, fire on 'tlab-tapstart' and when on touch we
        // fire on the 'tlab-tap' event.
        if (evt.type === 'tlab-tap' && evt.device === 'mouse') return;
        if (evt.type === 'tlab-tapstart' && evt.device === 'touch') return;

        self.onMouseSelect(evt);
      });

      this.$('.tlab-action-drag').on('tlab-tapstart', this.onDragPending.bind(this));
      this.$('.tlab-action-delete').on('tlab-tap', this.onDelete.bind(this));

      this.$().attr('expr-id', this.model.id);
      this.renderIndex();
      this.renderSelected();
      this.renderFolder();
      this.renderCollapsedFolder();
    };

    view.triggerDelete = function () {};
    view.triggerEnterPressed = function () {};
    view.triggerUpPressed = function () {};
    view.triggerDownPressed = function () {};
    view.triggerBackspacePressed = function () {};
    view.triggerDelPressed = function () {};
    view.onMouseSelect = function () {};

    view.sendTapToMathQuill = function(evt, mq) {
      // stop the mathquill from losing focus immediately. Only do this when
      // using mouse. When on ipad, this stops you from being able to put
      // cursor. And when on ipad, focus doesn't get lost anyways.
      if (evt.device === 'mouse') {
        evt.preventDefault();
      }

      /*
      * This will simualte a mousedown on the mathquill itself so that
      * you can start a mouse selection from outside of mathquill. But,
      * this doesn't make much sense for ipad because we don't do selection on
      * mousedown for ipad, we do it on click. That's because we want scroll
      * to work. We also don't want to pass the event into mathquill if it
      * originally started in mathquill.
      */
      if (evt.device === 'mouse') {
        // let mathquill handle the event
        if ($.contains(mq[0], evt.target)) return;

        // the event we're looking at is of type 'tlab-tapstart' and that means
        // nothing to mathquill. We need to turn this back into a 'mousedown'
        // so that it can handle it normally.
        var fakeEvent = $.event.fix(evt.originalEvent);

        // pass into mathquill so it can act like it happened within mathquill
        mq.triggerHandler(fakeEvent);
      }

      // on ipad, use MathQuill API
      else {
        var touch = evt.originalEvent.changedTouches[0];
        mq.mathquill('touchtap', touch.target, touch.clientX, touch.clientY)
                      .mathquill('ignoreNextMousedown', 1000);
      }
    };

    view.onDelete = function() {
      this.triggerDelete();
    };

    view.convertTo = function (cls, state) {

      var obj = cls(state);
      var index = this.model.index;
      var list = this.model.list;
      var folder = this.model.folder;

      obj.setProperty('list', list);

      list.undoRedo.oneTransaction(function(){
        list.removeItemAt(index);
        list.insertItemAt(index, obj);
        if (folder) folder.addItem(obj);
      });

      return obj;
    };

    view.getBounds = function () {
      var dom = this.$();
      var offset = dom.offset();
      if (!offset) return null;

      var top = offset.top;
      var height = dom.height();

      return {
        top: top,
        bottom: top + height
      };
    };

    // override in subclass
    view.allowDragDrop = function () {
      return true;
    };

    view.onDragPending = function(evt) {
      // clear focus when clicking expression handle
      conditionalBlur();

      // don't start dragging if we're not allowed to
      if (!this.allowDragDrop()) return;
      var self = this;
      this.mouseMovedTo = null;

      //if timeout happens or mouse moves sufficiently far, we will start dragging
      //if mouseup, then this was a tlab-tap, and we should let it do its thing

      //Start after 500ms
      var dragStartTimeout = setTimeout(function(){
        $(document).off('.dragpending');
        self.onDragStart(evt);
      }, 500);

      //Start after moving
      $(document).on('tlab-tapmove.dragpending', function(new_evt){
        // mouse has moved since tlab-tapstart. record this in case we actually do start dragging
        self.mouseMovedTo = new_evt.touches[0];

        var dx = evt.touches[0].x - self.mouseMovedTo.x;
        var dy = evt.touches[0].y - self.mouseMovedTo.y;

        // must have moved more than 3px away from tlab-tapstart position to immediately trigger drag
        if (Math.sqrt(dx*dx+dy*dy) > 3) {
          clearTimeout(dragStartTimeout);
          $(document).off('.dragpending');
          self.onDragStart(evt);
        }
      });

      //Cancel on mouseup
      $(document).on('tlab-tapend.dragpending', function(new_evt){
        clearTimeout(dragStartTimeout);
        $(document).off('.dragpending');
      });
    };

    view.onDragStart = function(evt) {
      // don't start dragging if we're not allowed to
      if (!this.allowDragDrop()) return;
      this.listView.dragdrop_expressions.start(evt, this);

      // we've moved our mouse since the initial tlab-tapstart. drag the expression to that point
      if (this.mouseMovedTo) {
        this.hideContextMenu();
        this.listView.dragdrop_expressions.drag(this.mouseMovedTo.x, this.mouseMovedTo.y);
      }
    };

    view.hideContextMenu = function () {
      this.triggerEvent('hideContextMenu');
    };

    view.processMissedKeyEvent = function (evt) {};
    view.addFocus = function (where) {};
    view.isFocused = function () {return false};
  });

  return AbstractItemView;
});
