define('base/tests/itemview', ['require','pjs','base/underscoreview'],function(require) {
  var P = require('pjs');
  var UnderscoreView = require('base/underscoreview');
  
  var ItemView = P(UnderscoreView, function (view, _super) {
  
    view.init = function (model) {
      _super.init.call(this);
      this.model = model;
      this.model.observe('visible.' + this.guid, this.renderVisible.bind(this));
      this.model.observe('selected.' + this.guid, this.renderSelected.bind(this));
    };
  
    view.destruct = function () {
      this.model.unobserve('.' + this.guid);
    };
  
    view.renderSelected = function () {
      this.$().toggleClass('tlab-selected', this.model.selected);
    };
  
    view.renderVisible = function () {
      this.$().toggle(this.model.visible);
    };
  
    view.didCreateElement = function () {
      this.renderSelected();
      this.renderVisible();
    };
  });
  
  return ItemView;
});


define('base/tests/testview', ['require','pjs','base/tests/itemview','utils/jquery.handleevent'],function(require) {
  var P = require('pjs');
  var ItemView = require('base/tests/itemview');
  require('utils/jquery.handleevent');

  var TestView = P(ItemView, function (view, _super) {
    view.isTestView = true;

    view.getTemplateParams = function () {
      return JSON.parse(JSON.stringify(this.model.test));
    };

    view.didCreateElement = function () {
      _super.didCreateElement.call(this);

      var self = this;
      this.$().on('tlab-tap', function (evt) {
        if (evt.wasHandled()) return;

        if (self.model.selected) {
          self.model.setProperty('selected', false);
        } else if (self.model.selectable) {
          self.model.setProperty('selected', true);
        }
      });
    };
  });

  return TestView;
});


define(['require','pjs','base/tests/testview','template!tests_file_view'],function(require) {
  var P = require('pjs');
  var AbstractFileView = require('base/tests/testview');
  var template = require('template!tests_file_view');

  var FileView = P(AbstractFileView, function (view, _super) {
    view.template = template;
    view.isFileView = true;

    view.init = function (model) {
      _super.init.call(this, model);
      this.deleting = false;

      this.model.test.observe('displayDate', this.renderDisplayDate.bind(this));
      this.model.observe('visible', this.computeSelectable.bind(this));
      this.observe('deleting', this.computeSelectable.bind(this));
      this.observe('deleting', this.renderDeleting.bind(this));

      this.computeSelectable();
    };

    view.computeSelectable = function () {
      this.model.setProperty('selectable', !this.deleting && this.model.visible);
    };

    view.didCreateElement = function () {
      _super.didCreateElement.call(this);
      this.renderDisplayDate();
      this.renderDeleting();

      this.$('.tlab-action-removetest').on('tlab-tap', this.startDeleting.bind(this));
      this.$('.tlab-action-cancelremovetest').on('tlab-tap', this.cancelDelete.bind(this));
    };

    view.destruct = function () {
      this.cancelDelete();
    };

    view.startDeleting = function () {
      this.setProperty('deleting', true);

      var self = this;
      this.deleteTimeout = setTimeout(function () {
        self.$('a').addClass('inactive');
        self.$().slideUp('fast');

        //rerender the preview arrow
        setTimeout(function() {
          self.model.mytests_list.testsController.remove(self.model.test);
        }, 300);

      }, 3000);
    };

    view.cancelDelete = function () {
      this.setProperty('deleting', false);
      clearTimeout(this.deleteTimeout);
    };

    view.renderDeleting = function () {
      this.$().toggleClass('deleting', !!this.deleting);
    };

    view.renderDisplayDate = function () {
      var displayDate = this.model.test.displayDate;
      if (displayDate !== this.lastDisplayDate) {
        this.lastDisplayDate = displayDate;
        this.$('.tlab-variable-date').text(displayDate);
      }
    };
  });

  return FileView;
});