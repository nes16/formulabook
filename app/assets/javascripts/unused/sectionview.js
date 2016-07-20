define(['require', 'jquery', 'pjs', 'parameters/abstractitem_view', 'template!text', 'parameters/smart_textarea', 'utils/jquery.handleevent'], function(require) {
    var $ = require('jquery');
    var P = require('pjs');
    var AbstractItemView = require('parameters/abstractitem_view');
    var template = require('template!section_view');
    var SmartTextarea = require('parameters/smart_textarea');
    require('utils/jquery.handleevent');

    var SectioView = P(AbstractItemView, function(view, _super) {
        view.template = template;

        view.init = function(model, listView) {
            _super.init.call(this, model, listView);

            this.model.observe('selected.textview', this.onSelectedChange.bind(this));

            //sync up smart_textarea and this.model
            this.smartTextarea = SmartTextarea(this.model.text);
            this.model.observe('text.textview', function() {
                this.smartTextarea.setProperty('text', this.model.text);
            }.bind(this));
            this.smartTextarea.observe('text', function() {
                this.model.setProperty('text', this.smartTextarea.text);
            }.bind(this));
        };

        view.destruct = function() {
            this.model.unobserve('.textview');
            this.smartTextarea.destruct();
        };

        view.onProjectorModeChange = function() {
            this.smartTextarea.fitText();
        };

        view.didInsertElement = function() {
            _super.didInsertElement.call(this);

            if (this.model.renderShell) return;
            this.smartTextarea.replace(this.$('.tlab-smart-textarea-placeholder'));

            this.smartTextarea.observe('focused', function() {
                if (this.smartTextarea.focused) this.model.setProperty('selected', true);
            }.bind(this));

            this.smartTextarea.observeEvent('enterPressed', this.triggerEnterPressed.bind(this));
            this.smartTextarea.observeEvent('upPressed', this.triggerUpPressed.bind(this));
            this.smartTextarea.observeEvent('downPressed', this.triggerDownPressed.bind(this));
            this.smartTextarea.observeEvent('backspacePressed', this.triggerBackspacePressed.bind(this));
            this.smartTextarea.observeEvent('delPressed', this.triggerDelPressed.bind(this));
            //need to include smart-textarea in minWidth
            this.setMinWidth();
        };

        view.onSelectedChange = function() {
            if (!this.model.selected) {
                this.smartTextarea.blur();
            }
        };

        view.onMouseSelect = function(evt) {
            if (evt.wasHandled()) return;
            evt.handle();

            this.model.setProperty('selected', true);
        };

        view.isFocused = function() {
            return $(document.activeElement).closest(this.$()).length !== 0;
        };

        view.addFocus = function(where) {
            this.smartTextarea.addFocus(where);
        };
    });

    return SectionView;
});