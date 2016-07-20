define( ['require', 'jquery', 'pjs', 'base/underscoreview', 'touchtracking', 'utils/conditionalblur', 'parameters/section', 'template!new_section_view'], function(require) {
    require('loadcss!new_section_view');

    var P = require('pjs');
    var UnderscoreView = require('base/underscoreview');
    var template = require('template!new_section_view');
    var Section = require('parameters/section');

    var NewSectionView = P(UnderscoreView, function(view, _super) {

        view.template = template;

        view.init = function(listView) {
            _super.init.call(this);
            this.observe('index', this.updateIndex.bind(this));
            this.listView = listView;
        };

        view.didInsertElement = function() {
            // update the index now and observe any changes
            this.updateIndex();

            this.$('.tlab-action-newsection').on('tlab-tap', this.newSection.bind(this));
        };

        view.updateIndex = function() {
            this.$('.tlab-variable-index').text(this.index);
        };

        view.newSection = function() {
            var constructor = Section;
            var properties = {
                selected: true,
                name: 'Section1'
            };
            var obj = constructor(properties, this.listView.model);
            this.listView.model.insertItemAt(this.listView.model.getItemCount(), obj);
            this.listView.getSelectedView().addFocus();
        };

    });

    return NewSectionView;
});