define(['require','loadcss!new_parameter','pjs','base/underscoreview','template!new_parameter','./item'],function(require){
  require('loadcss!new_parameter');

  var P = require('pjs');
  var UnderscoreView = require('base/underscoreview');
  var template = require('template!new_parameter');
  var ParameterObject = require('./item');

  var NewParameterView = P(UnderscoreView, function(view, _super){

    view.template = template;

    view.init = function (listView) {
      _super.init.call(this);
      this.observe('index', this.updateIndex.bind(this));
      this.listView = listView;
    };

    view.didInsertElement = function() {
      // update the index now and observe any changes
      this.updateIndex();

      this.$('.tlab-action-newmath').on('tlab-tap', this.newMath.bind(this));
    };

    view.updateIndex = function () {
      this.$('.tlab-variable-index').text(this.index);
    };

    view.newMath = function() {
      var constructor = ParameterObject;
      var properties = {selected:true, latex:''};
      var obj = constructor(properties, this.listView.model);
      this.listView.model.insertItemAt(this.listView.model.getItemCount(), obj);
      this.listView.getSelectedView().addFocus();
    };

  });

  return NewParameterView;
});
