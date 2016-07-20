define(['require','loadcss!folder','pjs','underscore','base/abstractitem'],function (require) {
  require('loadcss!folder');
  var P = require('pjs');
  var _ = require('underscore');
  var AbstractItemModel = require('base/abstractitem');

  var FolderObject = P(AbstractItemModel, function(model, _super) {
    model.isFolder = true;

    model.init = function (state, list) {
      _super.init.call(this, state, list);

      if (!this.title) this.title = '';

      if (!this.memberIds) this.memberIds = {};
      this.hidden = !!this.hidden;
      this.collapsed = !!this.collapsed;

      this.updateCount();

      this.observe('selected collapsed', this.updateSelectedHiddenChild.bind(this));
      this.observe('title hidden', this.onStateDidChange.bind(this));
    };

    model.updateCount = function () {
      this.setProperty('count', _.size(this.memberIds));
    };

    model.getState = function () {
      return {
        id: this.id,
        type: 'folder',
        title: this.title,
        memberIds: this.memberIds,
        hidden: this.hidden,
        collapsed: this.collapsed
      };
    };

    model._addItem = function(itemId) {
      var list = this.list;
      var item = list.getItemById(itemId);

      this.memberIds[itemId] = true;
      if (item) item.setProperty('folder', this);

      this.updateCount();
    };

    model._removeItem = function(itemId) {
      var list = this.list;
      var item = list.getItemById(itemId);

      if (item) item.setProperty('folder', undefined);
      if (this.memberIds.hasOwnProperty(itemId)) {
        delete this.memberIds[itemId];
      }
      this.updateCount();
    };

    model.addItem = function (item) {
      var list = this.list;
      var id = this.id;
      var itemId = item.id;
      list.getItemById(id)._addItem(itemId);
    };

    model.removeItem = function (item) {
      var list = this.list;
      var id = this.id;
      var itemId = item.id;
      list.getItemById(id)._removeItem(itemId);
    };
    
    model.updateSelectedHiddenChild = function () {
      var selectedItem = this.list.getSelected();

      if (this.collapsed) {
        // we are collapsed, and the selectedItem is a child ==> It's our selectedHiddenChild
        if (selectedItem && this.memberIds.hasOwnProperty(selectedItem.id)) {
          this.setProperty('selectedHiddenChild', selectedItem);
          this.setProperty('selected', true);
        }
    
        // we are collapsed, and we are not selected ==> We have no selectedHiddenChild
        else if (selectedItem !== this) {
          this.setProperty('selectedHiddenChild', null);
        }
      } else {
        // we are not collapsed, and we are selected, and we have a selectedHiddenChild ==> select it
        if (selectedItem === this && this.selectedHiddenChild) {
          this.selectedHiddenChild.setProperty('selected', true);
        }
    
        // no children are hidden
        this.setProperty('selectedHiddenChild', null);
      }
    };
  });

  return FolderObject;
});
