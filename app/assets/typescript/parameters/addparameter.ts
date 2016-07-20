define(['require','loadcss!add_parameter','jquery','pjs','base/popoverview', './item'
  ,'template!add_parameter','./folder','utils/browser','i18n','utils/conditionalblur'],function(require){
  require('loadcss!add_parameter');

  var $ = require('jquery');
  var P = require('pjs');
  var PopoverView = require('base/popoverview');
  var template = require('template!add_parameter');
  var ParameterObject = require('./item');
  var FolderObject = require('./folder');
  var Browser = require('utils/browser');
  var i18n = require('i18n');
  var conditionalBlur = require('utils/conditionalblur');

  var UPLOAD_SUPPORTED = !!window.FileReader;
  var isShittyIos8 = (
    Browser.IS_IPAD &&
    Browser.IOS_VERSION &&
    Browser.IOS_VERSION[0] === 8 &&
    Browser.IOS_VERSION[1] === 0 &&
    Browser.IOS_VERSION[2] === 0
  );
  var AddParameterView = P(PopoverView, function(view, _super){

    view.template = template;
    view.direction = 'bottom';

    view.init = function (listView, $root, graphSettings, toastView) {
      _super.init.call(this);

      this.$root = $root;
      this.listView = listView;
      this.list = listView.model;
      this.graphSettings = graphSettings;
      this.toastView = toastView;
    };

    view.getTemplateParams = function(){
      var params = _super.getTemplateParams();

      params.parameters = true;
      params.texts = false;
      params.tables = false;
      params.folders = true;
      params.images = false;

      return params;
    };

    view.didCreateElement = function () {
      _super.didCreateElement.call(this);

      if (Browser.IS_IPAD && Browser.IS_IN_IFRAME) {
        // prevents mobile safari from getting into a bad
        // state where the next tap on the screen defocuses
        // whatever is selected.
        // see #3106
        this.$().on('tlab-tapstart', function (evt) {
          evt.preventDefault();
        });
      }

      this.$('.tlab-action-newparameter').on('tlab-tap', this.newParameter.bind(this));
      this.$('.tlab-action-newfolder').on('tlab-tap', this.newFolder.bind(this));

      // prevent dropping file from changing url. Also enables the drop event.
      $(document).on('dragstart drag dragend dragenter dragover dragleave drop', function (evt) {
        evt.preventDefault();
        evt.stopPropagation();
      });

      var $root = this.$root;

      var collection = $();
      function removeFileDraggedClass () {
        $root.removeClass('tlab-filedraggedover');
        collection = $();
        $root.off('.filedraggedover');
      }

      $root.on('dragenter', function (evt) {
        if (collection.size() === 0) {
          $root.addClass('tlab-filedraggedover');
          $root.on('tlab-tapstart.filedraggedover', removeFileDraggedClass);
        }
        collection = collection.add(evt.target);
      }).on('dragleave', function (evt) {
          collection = collection.not(evt.target);
          if (collection.size() === 0) {
            removeFileDraggedClass();
          }
      }).on('drop', removeFileDraggedClass);

      var self = this;
      this.listView.$().on('drop', function (evt) {
        var files = evt.originalEvent.dataTransfer && evt.originalEvent.dataTransfer.files;
        if (files) {
          for (var i=0; i<files.length; i++) {
            self.insertFile(files[i]);
          }
        }
      });
    };


    view.renderIsVisible = function () {
      if (this.isVisible) {
        if (this.direction === 'bottom' && this.listView.calcIsNarrow) {
          this.direction = 'right';
          this.$().addClass('tlab-right').removeClass('tlab-bottom');
        } else if (this.direction !== 'bottom' && !this.listView.calcIsNarrow) {
          this.direction = 'bottom';
          this.$().addClass('tlab-bottom').removeClass('tlab-right');
        }
      }
      _super.renderIsVisible.call(this);
    };


    view.newParameter = function() {
      this.insertItem(ParameterObject({selected: true, latex: ''}, this.list));
    };


    view.newFolder = function () {
      this.insertItem(FolderObject({selected: true}, this.list));
    };


    //rules for insertItem (the + button at the top)
    //
    // overarching:
    //  (1) pressing that button should always have a visible result (i.e. never a no-op)
    //  (2) a folder can never be inserted inside of another folder
    //  (3) if an item's is a blank parameter convert instead of creating a new one (unless that violates #1 or #2)
    //      (unless that violates 1 or 2)
    //  (4) insert below current parameter where that's possible (below the folder where necessary)
    //  (5) insert at the highest visible point that's not in a folder

    view.insertItem = function(obj){
      /* jshint maxcomplexity:15 */

      // close the popover
      this.setProperty('isVisible', false);

      //collect up some useful globals
      var list = this.list;
      var item = list.getSelected();

      //case 1: current empty parameter needs to be replaced and is outside a folder
      //  only applies if:
      //  item.isParameter and item is empty
      //  obj is not an parameter

      if (item && item.isParameter && !item.latex && !item.folder && !obj.isParameter) {
        list.insertItemAt(item.index + 1, obj);
        list.removeItemAt(item.index);

        if (obj.selected) this.listView.getSelectedView().addFocus();
        return;
      }

      //case 2: current empty parameter needs to be replaced and is inside a folder
      // only applies if:
      // item.isParameter and item is empty
      // obj is not an parameter, obj is not a folder

      if (item && item.isParameter && !item.latex && item.folder && !obj.isParameter && !obj.isFolder) {
        
        list.insertItemAt(item.index + 1, obj);
        item.folder.addItem(obj);
        list.removeItemAt(item.index);
      
        if (obj.selected) this.listView.getSelectedView().addFocus();
        return;
      }

      //case 3: current is outside of a folder: insert right below where we are,
      // no funny business
      if (item && !item.folder && !item.isFolder) {
        this.list.insertItemAt(item.index + 1, obj);
        if (obj.selected) this.listView.getSelectedView().addFocus();
        return;
      }

      //case 4: current item is inside a folder, and we're not inserting a new folder
      // insert right below us, but inside of the folder
      if (item && item.folder && !obj.isFolder) {

      
        list.insertItemAt(item.index + 1, obj);
        item.folder.addItem(obj);
      
        if (obj.selected) this.listView.getSelectedView().addFocus();
        return;
      }

      //case 5: insert into an existing folder
      if (item && item.isFolder && !item.collapsed && !obj.isFolder) {
      
        list.insertItemAt(item.index + 1, obj);
        item.addItem(obj);
      
        if (obj.selected) this.listView.getSelectedView().addFocus();
        return;
      }

      //case 5: we need to seek downward from here and insert when we're ready.
      //this is either because nothing is selected, or because we're a folder
      //inside of a folder. in either case, seek downward until the first chance
      //that we have that's not inside of a folder.

      if (!item) item = this.listView.getFirstVisibleItem();
      // can't insert a folder right after the starting folder
      //(fixes problem if you try to insert a folder while in a folder)
      if (item.isFolder) item = this.list.getItemByIndex(item.index + 1);
      //after this, we search for the first non-foldered item, and insert right before it.
      while(item && item.folder) {
        item = this.list.getItemByIndex(item.index + 1);
      }

      var index = (item ? item.index : this.list.getItemCount());
      this.list.insertItemAt(index, obj);
      if (obj.selected) this.listView.getSelectedView().addFocus();
    };

  });

  return AddParameterView;
});
