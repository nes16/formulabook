define('base/tests/itemmodel',['require','pjs','base/underscoremodel'],function(require) {
  var P = require('pjs');
  var UnderscoreModel = require('base/underscoremodel');
  
  var ItemModel = P(UnderscoreModel, function (model, _super) {
    model.init = function () {
      _super.init.call(this);
    
      // TODO - not sure this belongs in the model
      this.visible = true;
      this.selected = false;
      this.selectable = true;
    
      var self = this;
      this.observe('selectable', function () {
        if (!self.selectable && self.selected) {
          self.setProperty('selected', false);
        }
      });
    };
  });
  
  return ItemModel;
});


define('base/tests/testitemmodel',['require','pjs','base/tests/itemmodel'],function(require) {
  var P = require('pjs');
  var ItemModel = require('base/tests/itemmodel');
  
  var TestItemModel = P(ItemModel, function (model, _super) {
    model.isTest = true;
  
    model.init = function (test) {
      _super.init.call(this);
      this.test = test;
    };
  
    model.matchesQuery = function (query) {
      return this.test.displayTitle.toLowerCase().indexOf(query.toLowerCase()) >= 0;
    };
  });
  
  return TestItemModel;
});




define(['require','pjs','base/tests/testitemmodel'],function(require) {
  var P = require('pjs');
  var TestItemModel = require('base/tests/testitemmodel');
  
  var ItemModel = P(TestItemModel, function (model, _super) {
    model.isSavedTest = true;
  });

  return ItemModel;
});

