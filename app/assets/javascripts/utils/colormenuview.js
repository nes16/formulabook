define(['require','loadcss!color_menu','jquery','pjs','base/underscoreview','utils/colors'
  ,'template!color_menu'],function(require){
  require('loadcss!color_menu');

  var $ = require('jquery');
  var P = require('pjs');
  var UnderscoreView = require('base/underscoreview');
  var Colors = require('utils/colors');

  var template = require('template!color_menu');

  var ParameterColorsView = P(UnderscoreView, function (view, _super) {
    view.template = template,

    view.init = function (parameter) {
      _super.init.call(this);
      this.parameter = parameter;
      this.parameter.observe('color.colorview', this.renderSelectedColor.bind(this));
      this.parameter.observe('hidden.colorview', this.renderSelectedColor.bind(this));
    };

    view.destruct = function () {
      this.parameter.unobserve('.colorview');
    };

    view.renderSelectedColor = function () {
      var color = this.parameter.color;
      this.$('.tlab-color-option').removeClass('tlab-selected');
      this.$('.tlab-color-option[color="'+color+'"]').addClass('tlab-selected');
    };

    view.didInsertElement = function () {
      this.$().on('tlab-tap tlab-tapstart', '.tlab-color-option', this.onSelectColor.bind(this));
      this.renderSelectedColor();
    };

    view.getTemplateParams = function () {
      return {
        colors: Colors.all
      };
    };

    view.onSelectColor = function (evt) {
      // when using mouse, fire on 'tlab-tapstart' and when on touch we
      // fire on the 'tlab-tap' event.
      if (evt.type === 'tlab-tap' && evt.device === 'mouse') return;
      if (evt.type === 'tlab-tapstart' && evt.device === 'touch') return;
      var color = $(evt.target).closest('.tlab-color-option').attr('color');
      this.parameter.setProperty('color', color);

      //show parameter (and its folder) if it was hidden
      this.parameter.setProperty('hidden', false);
      if (this.parameter.folder) this.parameter.folder.setProperty('hidden', false);
    };

  });

  return ParameterColorsView;
});
