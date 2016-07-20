
define(['require','pjs','./underscoremodel'],function(require) {
  var P = require('pjs');
  var UnderscoreModel = require('./underscoremodel');

  var AbstractItemModel = P(UnderscoreModel, function (model, _super) {

    var nextItemId = 1;

    model.init = function (state, list) {
      _super.init.call(this);

      // TODO - these belong on view, not the model
      this.index = -1;
      this.selected = false;
      this.list = list;

      // Normalize ids to strings. Note that some legacy states are stored with integer ids.
      for (var property in state) {
        if (state.hasOwnProperty(property)) {
          if (property === 'id') {
            this[property] = '' + state[property];
          } else {
            this[property] = state[property];
          }
        }
      }

      if (!this.hasOwnProperty('id')) {
        this.id = '' + nextItemId++;
      } else if (parseInt(this.id, 10) >= nextItemId) {
        nextItemId = parseInt(this.id, 10) + 1;
      }

      this.observe('folder', this.updateFolder.bind(this));
      this.observe('selected', this.__onSelectedChange.bind(this));
    };

    model.eachLatex = function (fn) {}; // Not implemented

    model.onAddedToList = function () {};
    model.onRemovedFromList = function () {};

    // Record change for undo-redo
    model.onStateDidChange = function(prop) {
      var id = this.id;
      var oldValue = this.getOldProperty(prop);
      var newValue = this.getProperty(prop);

      var list = this.list;

 
    };

    model.updateCollapsed = function () {
      this.setProperty(
        'inCollapsedFolder',
        this.folder ? this.folder.collapsed : false
      );
    };

    model.updateFolder = function () {
      if (this.getOldProperty('folder')) {
        this.getOldProperty('folder').unobserve('.' + this.id);
      }
      if (this.folder) {
        this.folder.observe(
          'collapsed.' + this.id,
          this.updateCollapsed.bind(this)
        );
      }
      this.updateCollapsed();
    };

    // selecting an expression within a collapsed folder expands the folder.
    // this can happen by clicking the curve on the graphpaper
    model.__onSelectedChange = function () {
      // notify the list that the selectedItem has potentially changed. Putting this
      // as the very first handler to a selection change so that any calls (within this stack) to
      // list.getSelected() returns the correct thing.
      if (this.list) this.list.handleSelectionChange(this);

      // TODO - ideally the folder would be listening for this event on each of it's children, but the folder
      // doesn't have a reference to it's children. We should change that, but it's a potentially dangerous refactor.
      if (this.selected && this.inCollapsedFolder) {
        this.folder.updateSelectedHiddenChild();
      }
    };

  });

  return AbstractItemModel;
});
