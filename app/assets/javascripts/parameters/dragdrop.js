define('base/dragdrop',['require','jquery','pjs','tipsy','utils/jquery.handleevent'],function(require){
  var $ = require('jquery');
  var P = require('pjs');
  var Tipsy = require('tipsy');
  require('utils/jquery.handleevent');

  var DragDrop = P(function(dragdrop){

    // methods to be filled in by subclass
    dragdrop.toggleStyling = function(isDragging) {};
    dragdrop.onDragStart = function (evt, view) {};
    dragdrop.onDragStop = function (evt) {};
    dragdrop.commitDragState = function(dragState) {};
    dragdrop.updateScroll = function () {};
    dragdrop.computeDragPosition = function (x,y) { return {x:x, y:y} };
    dragdrop.computeDragState = function (list, dragPosition) { return {} };
    dragdrop.previewDragState = function(dragState) {};
    dragdrop.buildDragList = function () {};

    dragdrop.init = function(parameterView){
      this.parameterView = parameterView;
      this.active = false;
    };

    dragdrop.start = function(evt, view){
      if(evt.touches.length !== 1) return;
      if(evt.wasHandled('tlab-longhold')) return;
      this.active = true;
      this.parampanel = this.parameterView.$('.tlab-parampanel');

      this.setupEventListeners(evt);
      this.onDragStart(evt, view);

      this.dragList = this.buildDragList();
      this.toggleStyling(true);
      this.drag(evt.touches[0].x, evt.touches[0].y); //Do first drag

      // disable tipsy while dragging
      Tipsy.addDisableLock();
    };

    dragdrop.setupEventListeners = function(evt){
      // save the touch identifier so that multitouch doesn't mess us up. Also
      // create a function that allows us to lookup the touch we care about.
      var touch_identifier = evt.touches[0].identifier;
      function getTouch (evt) {
        for (var i=0; i < evt.touches.length; i++) {
          var touch = evt.touches[i];
          if (touch.identifier === touch_identifier) {
            return touch;
          }
        }
      }

      var self = this;

      // listen for mouse movements and tell DragDrop about them.
      $(document).on('tlab-tapmove.dragdrop', function (evt) {
        // touch must still be around
        var touch = getTouch(evt);
        if (!touch) return;
        self.drag(touch.x, touch.y);
      });

      // listen for mouse ups and tell DragDrop about them.
      $(document).on('tlab-tapend.dragdrop', function (evt) {
        // touch must not be around
        var touch = getTouch(evt);
        if (touch) return;
        self.stop();
        evt.handle('dragdrop');
      });

      //add event listener on parampanel.scroll
      this.parampanel.on('scroll.dragdrop', this.drag.bind(this));
    };

    dragdrop.stop = function(evt){
      this.active = false;

      //Clear listeners
      $(document).off('.dragdrop');

      //Commit changes to model
      this.commitDragState(this.dragState);

      //Get rid of preview styling
      this.toggleStyling(false);

      this.onDragStop(evt);

      // reenable tipsy after dragging
      Tipsy.removeDisableLock();
    };

    dragdrop.drag = function(x, y){
      if (!this.active) return;

      //Need to cache mouse position for scroll-triggered udpates
      if (typeof(x) === 'number') this.mouseX = x;
      if (typeof(y) === 'number') this.mouseY = y;

      var self = this;
      setTimeout(function() {
        self.updateScroll();
      }, 1);

      var dragPosition = this.computeDragPosition(this.mouseX, this.mouseY);
      this.dragState = this.computeDragState(this.dragList, dragPosition);
      this.previewDragState(this.dragState);
    };
  });

  // TODO - any kind of user interaction (undo, typing, etc) should call
  // finishDrag to prevent us from getting in a weird state where we're dragging
  // an expression that doesn't exist.

  return DragDrop;
});
define(['require','underscore','utils/browser','pjs','base/dragdrop','utils/conditionalblur'],function(require){
  var _ = require('underscore');
  var Browser = require('utils/browser');
  var P = require('pjs');
  var DragDrop = require('base/dragdrop');
  var conditionalBlur = require('utils/conditionalblur');

  var DragDropParameters = P(DragDrop, function(dragdrop, _super){

    dragdrop.toggleStyling = function(isDragging){
      this.parampanel.toggleClass('tlab-isDragging', isDragging);
      this.draggedView.$().toggleClass('tlab-dragging', isDragging);
      if(!isDragging){
        //Remove things that are set by preview code
        this.draggedView.$().removeClass('tlab-overFolder');
        this.parameterView.$('.tlab-parameteritem').css('transform', 'none');
      }
    };

    dragdrop.onDragStart = function (evt, view) {
      this.parameterView.model.setSelected(null);
      this.parampanel = this.parameterView.$('.tlab-parampanel');

      conditionalBlur();
      evt.preventDefault();

      this.draggedView = view;
      this.draggedViewHeight = view.$().outerHeight() - 1; //because of the negative 1 margin

      this.panelTop = this.parampanel.offset().top;
      this.panelHeight = this.parampanel.height();
      this.expressionListHeight = this.parampanel.find('.tlab-expressionlist').height();
      this.panelBottom = this.panelTop + this.panelHeight;

      this.grabOffset = view.$().offset().top - evt.touches[0].y;
      this.grabY = this.computeDragPosition(evt.touches[0].x, evt.touches[0].y).y;
      this.grabIndex = view.model.index;
      this.draggedViewCount = 1;

      if(view.model.isFolder){
        this.draggedViewCount += _.size(view.model.memberIds);
        this.dropCollapsed = view.model.collapsed; //Cache whether folder is collapsed before collapsing
        view.model.setProperty('collapsed', true);
      }
    };

    dragdrop.onDragStop = function (evt) {
      clearTimeout(this.scrollTimeout);

      //Select the expression we just dragged
      this.parameterView.model.setSelected(this.draggedView.model);
    };

    dragdrop.buildDragList = function(){
      var self = this;
      var parameter = this.parameterView.model.getItemsByIndexRange(0, Infinity);

      var list = [{
        y: -Infinity,
        index: 0,
        folder: undefined
      }];

      var lastItem = [{
        y: Infinity,
        index: 0,
        folder: undefined
      }];

      parameter.forEach(function(expression){
        if(expression.id === self.draggedView.model.id) return;
        if(expression.folder && expression.folder.collapsed) return;
        if(expression.folder && self.draggedView.model.isFolder) return;

        //Figure out which parameter are included in this drag item
        var view = self.parameterView.getItemView(expression.id);
        var belowGrabbedView = (expression.index > self.grabIndex);
        var elements = view.$();
        if (expression.isFolder && (expression.collapsed || self.draggedView.model.isFolder)){
          for (var id in expression.memberIds) {
            elements.push(self.parameterView.getItemView(id).$()[0]);
          }
        }

        //Compute dimensions of the expression(s), removing draggedView from list
        var offset = (belowGrabbedView ? -self.draggedViewHeight : 0);
        var height = view.$().height();
        var top = view.$().position().top + offset;

        //Compute indexes for before and after the expression(s)
        var indexOffset = (belowGrabbedView ? -1 : 0); //-self.draggedViewCount : 0);
        var indexBefore = expression.index + indexOffset;
        var indexAfter = indexBefore + elements.length;

        //Compute folder insertion behavior
        var topFolder, midFolder;
        if(!self.draggedView.model.isFolder){
          topFolder = expression.folder;
          midFolder = (expression.isFolder ? expression : expression.folder);
        }

        //Record what happens when dragging past the top of the expression
        list.push({
          y: top,
          index: indexBefore,
          folder: topFolder
        });

        //Record what happens when dragging past the midpoint of the expression
        list.push({
          y: top + height / 2,
          index: indexAfter,
          folder: midFolder,

          elements: elements, //TODO - should include all elements dragged past
          offset: offset
        });

        //Record what happens when dragging past the bottom of the expression
        //Only appended to list if this was the last item
        lastItem = {
          y: top + height,
          index: indexAfter,
          folder: undefined
        };

      });
      list.push(lastItem);

      return list;
    };

    // allows expression list to scroll drag above or below it
    dragdrop.updateScroll = function() {
      clearTimeout(this.scrollTimeout);
      if(!this.active) return;
      var scrollSpeed = 0;

      //Use being over top of list (into header bar) as cue to start scrolling up
      scrollSpeed = Math.min(scrollSpeed, (this.mouseY - this.panelTop));

      //Use bottom 30 pixels as cue to start scrolling down  30px is smaller than one equation,
      //But still big enough to trigger easily
      scrollSpeed = Math.max(scrollSpeed, (this.mouseY - this.panelBottom + 30));

      //Adjust the speed based on the parameter list height.
      //A 30 pixel offset should get us to the other side in about 1 second of 30hz updates
      //30 pixels * 30 updates = 900
      scrollSpeed = (scrollSpeed * this.panelHeight / 900);

      if(scrollSpeed){
        this.parampanel.scrollTop(this.parampanel.scrollTop() + scrollSpeed);
      }
    };

    //Compute position of the dragged view in terms of the scrolled list
    dragdrop.computeDragPosition = function(x, y) {
      //Clamp effective mouse position to edges of panel
      y = Math.max(y, Math.min(y, this.panelBottom), this.panelTop);

      //Make position relative to the panel
      y -= this.panelTop;

      //Add offset for where element was grabbed
      y += this.grabOffset;

      //Compensate for scrolling
      y += this.parampanel.scrollTop();

      if (y + this.draggedViewHeight >= this.expressionListHeight) {
        y = this.expressionListHeight - this.draggedViewHeight;
      }

      return {x:NaN, y: y};
    };

    //Takes a list of states, which each includes the y value at which it starts,
    //as well as the index and the folder which the dragged item would have it it
    //is dropped below that line.
    dragdrop.computeDragState = function(list, dragPosition){
      function sortMethod (item) {
        return item.y;
      }

      var index = _.sortedIndex(list, {y:dragPosition.y}, sortMethod) - 1;//See where we would be inserted
      return {
        list: list,
        index: list[index].index,
        folder: list[index].folder,
        dragY: dragPosition.y
      };
    };

    //Update model to reflect new dragState
    dragdrop.commitDragState = function(dragState){
      var self = this;
      var list = this.parameterView.model;

      list.undoRedo.oneTransaction(function(){
        var draggedModel = self.draggedView.model;

        //Update ordering
        list.moveItemsTo(self.grabIndex, dragState.index, self.draggedViewCount);

        //Update folder membership
        var newFolder = dragState.folder;
        var oldFolder = draggedModel.folder;
        if(newFolder !== oldFolder){
          if(oldFolder) oldFolder.removeItem(draggedModel);
          if(newFolder) newFolder.addItem(draggedModel);
        }

        //Restore folder collapsed state
        if(draggedModel.isFolder){
          draggedModel.setProperty('collapsed', self.dropCollapsed); //Restore collapsed state
        }
      });
    };

    //Display preview of dragState, but don't commit changes
    dragdrop.previewDragState = function(dragState){
      var self = this;

      //Preview height and folder membership of dragged item
      this.draggedView.$().css("transform", Browser.translateRule(0, dragState.dragY - this.grabY));
      this.draggedView.$().toggleClass('tlab-overFolder', !!dragState.folder);

      //Update transforms for items above and below dragged view
      _.each(dragState.list, function(item){
        if(item.elements){
          var offset = item.offset + (item.index > dragState.index ? self.draggedViewHeight : 0);
          item.elements.css('transform', Browser.translateRule(0, offset));
        }
      });
    };
  });

  return DragDropParameters;
});
