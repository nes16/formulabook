define(['require','pjs','jquery','underscore','base/underscoreview','template!parameter_menu'
  ,'utils/colors','utils/colormenuview'],function(require){
  var P = require('pjs');
  var $ = require('jquery');
  var _ = require('underscore');
  var UnderscoreView = require('base/underscoreview');
  var template = require('template!parameter_menu');
  var Colors = require('utils/colors');
  var ColorMenuView = require('utils/colormenuview');

  var MenuView = P(UnderscoreView, function (view, _super) {
    view.template = template;

    view.init = function (parameter) {
      this.parameter = parameter;
      this.parameter.observe('color.colorview', this.renderSelectedColor.bind(this));
      this.parameter.observe('hidden style shouldGraph', this.renderSelectedStyle.bind(this));
    };

    view.destruct = function () {
      if (this.colorsView) {
        this.colorsView.remove();
        this.colorsView = null;
      }
    };

    view.getTemplateParams = function () {
      var params = {colors: Colors.all, styles: []};
      if (this.parameter.formula.is_point_list && !this.parameter.formula.move_ids) {
        params.styles = ['point', 'open'];
      } else if (!this.parameter.table && !this.parameter.formula.move_ids) {
        if (!this.parameter.formula.is_inequality) {
          params.styles = ['normal', 'dashed'];
        }
      }
      return params;
    };

    view.renderSelectedColor = function () {
      var color = this.parameter.color;
      _.each(this.$('.tlab-style-option'), function (option) {
        $(option).css('background', color);
      });
    };

    view.onSelectStyle = function (evt) {
      // when using mouse, fire on 'tlab-tapstart' and when on touch we
      // fire on the 'tlab-tap' event.
      if (evt.type === 'tlab-tap' && evt.device === 'mouse') return;
      if (evt.type === 'tlab-tapstart' && evt.device === 'touch') return;

      var style = $(evt.target).closest('.tlab-style-option').attr('draw-style');
      this.parameter.setProperty('hidden', false);
      this.parameter.setProperty('style', style);

      //if we're in a folder, show it.
      if (this.parameter.folder) this.parameter.folder.setProperty('hidden', false);
    };

    view.renderSelectedStyle = function () {
      var style = this.parameter.style;
      this.$('.tlab-style-option').removeClass('tlab-selected');
      if (this.parameter.shouldGraph) {
        this.$('.tlab-style-option[draw-style="'+style+'"]').addClass('tlab-selected');
      }
    };

    view.didInsertElement = function () {
      // this view has a nested template. We instantiate the color picker
      // and replace a placeholder element within the html.
      this.colorsView = ColorMenuView(this.parameter);
      this.colorsView.replace(this.$('.template-colorsview'));
      this.$().on('tlab-tap tlab-tapstart', '.tlab-style-option', this.onSelectStyle.bind(this));
      this.renderSelectedColor();
      this.renderSelectedStyle();
    };

  });

  return MenuView;
});
