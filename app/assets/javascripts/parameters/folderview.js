define(['require','pjs','base/abstractitemview','template!folder','./smarttextarea'
  ,'utils/jquery.handleevent'],function (require) {
  var P = require('pjs');
  var AbstractItemView = require('base/abstractitemview');
  var template = require('template!folder');
  var SmartTextarea = require('./smarttextarea');
  require('utils/jquery.handleevent');

  var FolderView = P(AbstractItemView, function(view, _super) {
    view.template = template;

    view.init = function (model, listView) {
      _super.init.call(this, model, listView);
      this.model = model;
      model.observe('hidden.folderView', this.onHiddenChanged.bind(this));
      model.observe('collapsed.folderView', this.onCollapsedChanged.bind(this));
      model.observe('selected.folderView', this.onSelectedChange.bind(this));
      model.observe('count.folderView', this.onMemberIdsChange.bind(this));

      this.smartTextarea = SmartTextarea(this.model.title);
      this.model.observe('title.folderView', function() {
        this.smartTextarea.setProperty('text', this.model.title);
      }.bind(this));
      this.smartTextarea.observe('text', function() {
        this.model.setProperty('title', this.smartTextarea.text);
      }.bind(this));
    };

    view.destruct = function () {
      this.model.unobserve('.folderView');
      this.smartTextarea.destruct();
    };

    view.didInsertElement = function () {
      _super.didInsertElement.call(this);
      if (this.model.renderShell) return;

      this.smartTextarea.replace(this.$('.tlab-smart-textarea-placeholder'));

      this.smartTextarea.observe('focused', function () {
        if (this.smartTextarea.focused) this.model.setProperty('selected', true);
      }.bind(this));
      this.smartTextarea.observeEvent('enterPressed', this.triggerEnterPressed.bind(this));
      this.smartTextarea.observeEvent('upPressed', this.triggerUpPressed.bind(this));
      this.smartTextarea.observeEvent('downPressed', this.triggerDownPressed.bind(this));
      this.smartTextarea.observeEvent('backspacePressed', this.triggerBackspacePressed.bind(this));
      this.smartTextarea.observeEvent('delPressed', this.triggerDelPressed.bind(this));
      //need to include smart-textarea in minWidth
      this.setMinWidth();

      this.$('.tlab-action-toggle-folder-collapsed').on(
        'tlab-tap',
        this.toggleCollapsed.bind(this)
      );
      this.$('.tlab-action-toggle-folder-hidden').on(
        'tlab-tap',
        this.toggleHidden.bind(this)
      );

      this.onCollapsedChanged();
      this.onHiddenChanged();
      this.onMemberIdsChange();
    };

    view.onSelectedChange = function () {
      if (!this.selected && this.$title) {
        this.smartTextarea.blur();
      }
    };

    view.onMemberIdsChange = function () {
      this.$().toggleClass('tlab-has-items', this.model.count > 0);
    };

    view.onProjectorModeChange = function() {
      this.smartTextarea.fitText();
    };

    view.onMouseSelect = function(evt) {
      if (evt.wasHandled()) return;
      evt.handle();

      this.model.setProperty('selected', true);
    };

    view.toggleHidden = function () {
      this.model.setProperty('hidden', !this.model.hidden);
    };

    view.toggleCollapsed = function () {
      this.model.setProperty('collapsed', !this.model.collapsed);
    };

    view.onHiddenChanged = function () {
      this.$().toggleClass('tlab-hidden', !!this.model.hidden);
    };

    view.onCollapsedChanged = function () {
      this.$().toggleClass('tlab-collapsed', !!this.model.collapsed);

      if (!this.model.collapsed) {
        this.listView.triggerFolderOpened();
      }
    };

    view.addFocus = function (where) {
      this.smartTextarea.addFocus();
    };
  });

  return FolderView;
});
