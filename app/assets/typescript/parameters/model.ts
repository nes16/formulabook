define(['require','pjs','underscore','base/underscoremodel','./item','./folder'
  ,'lib/rounding'],function(require) {
  var P = require('pjs');
  var _ = require('underscore');
  var UnderscoreModel = require('base/underscoremodel');
  var ParameterObject = require('./item');
  var FolderObject = require('./folder');
  var Rounding = require('lib/rounding');

  var ParameterListModel = P(UnderscoreModel, function (model, _super) {

    model.init = function () {
      _super.init.call(this);
      var self = this;

      this.__items = [];
      this.__itemIds = {};
      this.__helperItemIds = {};
      this.drawOrder = [];

      // an optimization so that we don't compare entire items when changing
      // selectedItem property.
      this.setPropertyComparator('selectedItem', function (a,b) {
        return a === b;
      });


      // keep stepping sliders ever 40ms
      this.stepHz = 25;
      var stepSliders = function () {
        self.batchEvaluation(function () {
          self.notifyPropertyChange('playStep');
        });

        setTimeout(function () {
          stepSliders();
        }, 1000/self.stepHz);
      };
      stepSliders();
    };

    model.getItemByIndex = function (index) {
      return this.__items[index] || null;
    };

    model.getItemsByIndexRange = function (min, max) {
      min = Math.max(0, min);
      max = Math.min(this.getItemCount()-1 , max);

      var arr=[];
      for (var i=min; i<=max; i++) {
        arr.push(this.getItemByIndex(i));
      }
      return arr;
    };

    model.eachLatex = function (fn) {
      for (var i = 0; i < this.__items.length; i++) {
        this.__items[i].eachLatex(fn);
      }
    };

  
   model.onChange = function(changes) {
      var id, parameter, formula;

      for (id in changes) {
        if (!changes.hasOwnProperty(id)) continue;

        parameter = this.getItemById(id);
        formula = changes[id];
        if (!expression) continue;
        parameter.setProperty('loading', false);
        parameter.setProperty('formula', formula);
      }
    };

    model.onGraphComputed = function (id, graphData) {
      var item = this.getItemById(id);
      if (!item) return;

      var branchResolved = function (branch) {
        if (!branch.hasOwnProperty('resolved')) return true;
        return branch.resolved;
      };

      var unresolved = !graphData.every(branchResolved);
      item.setProperty('unresolved', unresolved);
    };

    model.updateDrawOrder = function () {
      var drawOrder = [];
      var listItems = _.sortBy(this.__itemIds, function (item) {return item.index});
      _.each(listItems, function(item) {
        if (item.hasOwnProperty('columns')) {
          _.each(item.columns, function (column) {
            drawOrder.push(column.id);
          });
        } else {
          drawOrder.push(item.id);
        }
      });
      this.setProperty('drawOrder', drawOrder);
    };

    model.getItemById = function(id) {
      return this.__itemIds[id] || this.__helperItemIds[id];
    };

    model._insertItemAt = function (index, item) {
      var item_id = String(item.id);
      if (this.__itemIds.hasOwnProperty(item_id)) {
        throw Error('Item with id \'' + item_id + '\' is already in list');
      }

      // add item to list
      this.__itemIds[item_id] = item;
      this.__items.splice(index, 0, item);

      item.index = index;

      if (item.selected) {
        this.handleSelectionChange(item);
      }

      // request thataluated
      item.onAddedToList();
    };

    model.handleSelectionChange = function (item) {
      var selected = item.selected;
      if(!selected && this.selectedItem === item){
        this.setProperty('selectedItem', null);
      } else if (selected && !this.selectedItem) {
        this.setProperty('selectedItem', item);
      } else if (selected && this.selectedItem !== item) {
        this.selectedItem.setProperty('selected', false);
        this.setProperty('selectedItem', item);
      }
    };

    model.triggerItemInserted = function (index, item) {};
    model.insertItemAt = function (index, item) {

      // insert item
      this._insertItemAt(index, item);

      // allow view to tap into this
      this.triggerItemInserted(index, item);

  
      this.updateDrawOrder();
    };

    // Helper items are invisible items.
    model.addHelperItem = function (obj) {
      this.__helperItemIds[obj.id] = obj;
      obj.onAddedToList();
    };

    model.removeHelperItem = function (id) {
      var item = this.__helperItemIds[id];
      if (!item) return;

      item.onRemovedFromList();
      delete this.__helperItemIds[id];
    };

    model.addItem = function (obj) {
      var lastObject = this.getItemByIndex(this.getItemCount() - 1);
      // Replace empty expressions
      if (
        lastObject &&
        //TODO - remove headings after DB updated
        !(lastObject.text || lastObject.columns || lastObject.headings) &&
        lastObject.latex === ''
      ) {
        this.removeItemAt(this.getItemCount()-1); //pop off last
      }

      this.insertItemAt(this.getItemCount(), obj); //push to end
    };

    model.updateItemById = function (id, properties) {
      this.getItemById(id).setProperties(properties);
      this.updateDrawOrder();
    };

    model._removeItemAt = function (index) {
      var item = this.__items[index];
      if (!item) {
        return;
      }

      if (this.selectedItem === item) {
        this.setProperty('selectedItem', null);
      }

      var self = this;
      if (item.isFolder) {
        for (var id in item.memberIds) {
          self.removeItemAt(self.getItemById(id).index);
        }
      }

      this.__items.splice(index, 1);

      for (var i = 0; i < this.__items.length; i++) {
        this.__items[i].setProperty('index', i);
      }

      var item_id = String(item.id);
      delete this.__itemIds[item_id];

      item.onRemovedFromList();

      return item;
    };

    model._removeAllItems = function () {
      for (var i=0; i<this.__items.length; i++) {
        this.__items[i].onRemovedFromList();
      }

      for (var id in this.__helperItemIds) {
        if (this.__helperItemIds.hasOwnProperty(id)) {
          this.__helperItemIds[id].onRemovedFromList();
        }
      }

      this.__items = [];
      this.__itemIds = {};
      this.__helperItemIds = {};
      this.setProperty('selectedItem', false);
    };


    model.triggerItemRemoved = function (index, item) {};
    model.removeItemAt = function (index) {
      var self = this;
      var item = this._removeItemAt(index);
      if (!item) return;

      // allow a view to tap into this
      this.triggerItemRemoved(index, item);

  
      this.updateDrawOrder();
    };

    model.removeItemById = function (id) {
      var expression = this.getItemById(id);
      if (!expression) return;
      this.removeItemAt(expression.index);
    };

    model.triggerItemMoved = function (from, to){};
    model.moveItemTo = function(a, b) {
      var self = this;

      var manipulator = function (from, to) {
        if (from === to) return;

        var len = self.getItemCount();
        var item = self.__items[from];

        // check that the numbers are within range
        if (from < 0 || to < 0 || from >= len || to >= len) return;

        // remove from items
        self.__items.splice(from , 1);

        // insert back in correct spot
        self.__items.splice(to, 0, item);

        // allow a view to tap into this
        self.triggerItemMoved(from, to);

        self.updateDrawOrder();
      };

          manipulator(b, a);
    };
    model.moveItemsTo = function(a, b, n){
      var self = this;

      var i;
      if (b >= a && b < a+n) return;
      if(a < b){
        for(i = 0; i < n; i++){
          self.moveItemTo(a, b);
        }
      } else{
        for(i = 0; i < n; i++){
          self.moveItemTo(a + i, b + i);
        }
      }
  };

    model.getItemCount = function () {
      return this.__items.length;
    };

    model.getAllSliders = function () {
      var sliders = [];

      for (var i=0; i<this.__items.length; i++) {
        var item = this.__items[i];
        if (item.slider) {
          sliders.push(item.slider);
        }
      }

      return sliders;
    };

    model.getSelected = function() {
      return this.selectedItem;
    };

    model.setSelected = function(i) {
      var nextSelected = i;

      if (typeof i === 'number')  nextSelected = this.getItemByIndex(i);
      if (nextSelected) {
        nextSelected.setProperty('selected', true);
      } else {
        var selected = this.getSelected();
        if (selected) selected.setProperty('selected', false);
      }
    };

 
 
    model.isEmpty = function() {
      var len = this.getItemCount();
      if ( len === 0) return true;
      if ( len > 1) return false;

      // TODO - maybe this should be this.getItemByIndex(0).isEmpty(). Only
      // problem I see there is that tables aren't ever considered empty. Not
      // sure if we considerpty if it only contains an
      // empty text.
      return this.getItemByIndex(0).latex === '';
    };

    model.getState = function() {
      var list_state = [];
      var len = this.getItemCount();

      for (var i=0; i<len; i++) {
        list_state.push(this.getItemByIndex(i).getState());
      }

      return {list: list_state};
    };

    model.batchEvaluation = function(fn){
      fn();
    };
    model.triggerSetState = function (list) {};
    model.setState = function(state) {
      var i;
      var list_content = [];
      var folders = [];
      var obj;

      for (i=0; i<state.list.length; i++) {
        var expState = state.list[i];

        // Start rendering UI as shell until we know if it's on screen
        expState.renderShell = true;

        obj = this.fromState(expState);

        if (!obj) continue;

        if (obj.isFolder) folders.push(obj);

        list_content.push(obj);
      }

      // remove all items and then add the new ones in a single batch
      var self = this;
      this.batchEvaluation(function () {
        self._removeAllItems();

        for (i=0; i<list_content.length; i++) {
          self._insertItemAt(i, list_content[i]);
        }
      });

      // Telltheir parent folders.
      folders.forEach(function (folder) {
        for (var id in folder.memberIds) {
          // defensive programming. see #3920 where memberIds contained a missing id
          var item = self.getItemById(id);
          if (item) {
            item.setProperty('folder', folder);
          } else {
            delete folder.memberIds[id];
          }
        }
      });

      // allow the view to tap into this
      this.triggerSetState(list_content);

      this.updateDrawOrder();
    };

    // Factory method for making a singleof the appropriate
    // type from a serialized state.
    model.fromState = function(itemState) {
      if (itemState.text !== undefined) {
        return TextObject(itemState, this);
      }
      if (itemState.columns !== undefined || itemState.headings !== undefined ) {
        // TODO - remove headings after DB updated
        return TableObject(itemState, this);
      }

      if (itemState.type === 'folder') return FolderObject(itemState, this);
      if (itemState.type === 'image') return ImageObject(itemState, this);

      // Handle legacy data about whether anbe hidden
      if (!itemState.hasOwnProperty('hidden')) {
        if (itemState.hasOwnProperty('graphed')) {
          itemState.hidden = !itemState.graphed;
        } else if (itemState.hasOwnProperty('userRequestedGraphing')) {
          itemState.hidden = (itemState.userRequestedGraphing === 'never');
        }
      }

      return ParameterObject(itemState, this);
    };

    model.triggerRemoveParams = function () {};
    model.triggerRemoveParam = function () {};
    model.triggerAddParam = function () {};
  });


  return ParameterListModel;
});
