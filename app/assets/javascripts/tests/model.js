define(['require','pjs','base/underscoremodel','./itemmodel'],function(require) {

  var P = require('pjs');
  var UnderscoreModel = require('base/underscoremodel');
  var ItemModel = require('./itemmodel');

  var MyTestsModel = P(UnderscoreModel, function (model, _super) {

    //note: userController can be null, in which case we don't render the login box (logic controlled by view)
    model.init = function (testsController, userController) {
      _super.init.call(this);
      var self = this;

      this.testsController = testsController;
      this.userController = userController;
      this.__items = [];
      this.__selectedItem = null;
      this.filteredItemCount = 0;

      
      this.setProperty('isSpinning', false);
      this.setProperty('searchQuery', '');
      this.observe('searchQuery', this.filterAllTests.bind(this));

      this.myEvents = ['itemAdded', 'itemRemoved'];
      //note: on iPad, we'd expect that none of these triggers would be called
      //this is the less pretty way of doing this.testsController.testAddedCallbacks?.push ...
      if (!this.testsController.hasEvent('testAdded')) return;

      // this.testsController.testAddedCallbacks.push(function (index) {
      this.testsController.observeEvent('testAdded', function (evt, data) {
        var test = self.testsController.content[data.index];
        var testItem = ItemModel(test);
        self.__addItemAt(testItem, data.index);
      });

      this.testsController.observeEvent('testRemoved', function (evt, data) {
        self.__removeItemAt(data.index);
      });

      this.testsController.observeEvent('startUpdating', function () {
        self.setProperty('isSpinning', true);
        self.__clearSavedTests();
      });
      this.testsController.observeEvent('updateTestsSuccess', function () {
        self.setProperty('isSpinning', false);
        self.testsController.content.forEach(function (savedTest, i) {
          var item = ItemModel(savedTest);
          self.__addItemAt(item, i);
        });
      });
      this.testsController.observeEvent('updateTestsError', function () {
        self.setProperty('isSpinning', false);
        // TODO error view not implemented. Might be nice to have a "try again"
        // button.
      });
      this.testsController.observeEvent('clear', function () {
        self.setProperty('isSpinning', true);
        self.__clearSavedTests();
      });
    };

    model.updateDisplayDates = function() {
      //note: on iPad, we'd expect that testsController.content is an empty array
      this.testsController.content.forEach(function (test) {
        test.updateDisplayDate();
      });
    };

    // TODO - optimize if need be to not call this when a single test is deleted or
    // or added. But, I suspect that a single deletion or addition shouldn't be a bottleneck
    // as long as a complete refresh (login or logout) isn't a terrible bottleneck.
    model.filterAllTests = function () {
      var i;

      if (this.searchQuery) {
        var filteredItemCount = 0;
        for (i=0; i<this.__items.length; i++) {
          var item = this.__items[i];
          if (item.matchesQuery(this.searchQuery)) {
            filteredItemCount++;
            item.setProperty('visible', true);
          } else {
            item.setProperty('visible', false);
          }
        }
        this.setProperty('filteredItemCount', filteredItemCount);
      } else {
        for (i=0; i<this.__items.length; i++) {
          this.__items[i].setProperty('visible', true);
        }
        this.setProperty('filteredItemCount', this.__items.length);
      }
    };

    model.triggerItemAdded = function (item, index) {};
    model.__initItem = function (item) {
      item.mytests_list = this;
      item.observe('selected.' + this.guid, this.onSelectionChange.bind(this));
    };
    model.__addItemAt = function (item, index) {
      this.__items.splice(index, 0, item);
      this.__initItem(item);

      this.filterAllTests();
      this.triggerEvent('itemAdded', {item: item, index: index});
    };

    model.triggerItemRemoved = function (item) {};
    model.__destructItem = function (item) {
      item.mytests_list = null;
      item.unobserve('.' + this.guid);
    };
    model.__removeItemAt = function (index) {
      var item = this.__items[index];

      if (!item) {
        return;
      }

      this.__items.splice(index, 1);
      this.__destructItem(item);

      this.filterAllTests();
      this.triggerEvent('itemRemoved', {item: item});
    };

    model.__clearSavedTests = function () {
      var oldItems = this.__items;
      this.__items = [];

      for (var i=0; i<oldItems.length; i++) {
        var item = oldItems[i];
        if (item.isSavedTest) {
          // TODO - could save these up and remove all at once by adding a
          // "triggerItemsRemoved([item1, item2, etc]) method"
          this.__destructItem(item);
          this.triggerEvent('itemRemoved', {item: item});
        } else {
          this.__items.push(item);
        }
      }

      this.filterAllTests();
    };

    model.getItems = function () {
      return this.__items;
    };

    model.getSelectedIndex = function () {
      if (!this.selectedItem) return -1;

      return this.__items.indexOf(this.selectedItem);
    };

    model.onSelectionChange = function (property, item) {

      if (item.selected) {
        // only 1 item can be selected at a time
        var cachedItem = this.selectedItem;
        this.setProperty('selectedItem', item);
        if (cachedItem) cachedItem.setProperty('selected', false);
      } else if (this.selectedItem === item) {
        this.setProperty('selectedItem', null);
      }
    };

    model.selectPrev = function () {
      var selectedIndex = this.getSelectedIndex();
      if (selectedIndex === -1) return;

      for (var i = selectedIndex - 1; i>=0; i--) {
        var item = this.__items[i];
        if (item.selectable) {
          item.setProperty('selected', true);
          return true;
        }
      }

      return false;
    };

    model.selectNext = function (evt) {
      var selectedIndex = this.getSelectedIndex();
      var i, item;
      // nothing is selected, so select the first item that is selectable and has a test. This
      // skips over the "new blank test" option
      if (selectedIndex === -1) {
        for (i = 0; i < this.__items.length; i++) {
          item = this.__items[i];
          if (item.selectable && item.test) {
            item.setProperty('selected', true);
            return true;
          }
        }
      }

      for (i = selectedIndex + 1; i < this.__items.length ; i++) {
        item = this.__items[i];
        if (item.selectable) {
          item.setProperty('selected', true);
          return true;
        }
      }

      return false;
    };
  });

  return MyTestsModel;
});
