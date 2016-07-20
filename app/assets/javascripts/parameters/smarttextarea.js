define( ['require', 'loadcss!parameters', 'loadcss!smart_textarea', 'jquery', 'pjs', 'base/underscoreview', 'utils/browser'
    , 'utils/jquery.handleevent', 'keys', 'utils/conditionalblur', 'template!smart_textarea'], function(require) {
    require('loadcss!smart_textarea');
    var $ = require('jquery');
    var P = require('pjs');
    var UnderscoreView = require('base/underscoreview');
    var Browser = require('utils/browser');
    require('utils/jquery.handleevent');
    var Keys = require('keys');
    var conditionalBlur = require('utils/conditionalblur');

    var template = require('template!smart_textarea');

    var SmartTextarea = P(UnderscoreView, function(view, _super) {
        view.template = template;
        view.init = function(text, placeholder) {
            _super.init.call(this);
            this.placeholder = placeholder;
            this.$textarea = null;
            this.$displayText = null;
            this.setProperty('text', text || '');
        };

        view.didCreateElement = function() {
            _super.didCreateElement.call(this);

            this.$textarea = this.$('.tlab-smart-textarea');
            this.$displayText = this.$('.tlab-displayTextarea');
            this.observe('text', this.renderText.bind(this));

            this.$textarea.on('input propertychange change', function(evt) {
                this.setProperty('text', this.$textarea.val());
            }.bind(this));
            this.$textarea.on('keydown', this.onKeydownEvent.bind(this));

            this.$displayText.on('touchend', function(evt) {
                evt.preventDefault();
            });

            // We are going to stop clicks on links and let the rest filter through to the focus() handler below.
            this.$displayText.on('tlab-tap tlab-tapstart', 'a', function(evt) {
                evt.handle();
            });

            // FF has an issue where focus is lost of we change the '.selected' class while clicking. Instead of
            // allowing the "onMouseSelect" code to run, we just expect that the expression will get focus. And that
            // will also cause this to become selected. The difference is that by doing "evt.handle()" here we focus
            // then select (rather than select then focus). FF simply prefers it that way.
            this.$textarea.on('tlab-tapstart', function(evt) {
                evt.handle();
            }.bind(this));

            this.$textarea.focus(function() {
                this.setProperty('focused', true);
            }.bind(this));
            this.$textarea.blur(function() {
                this.setProperty('focused', false);
            }.bind(this));
        };

        view.didInsertElement = function() {
            _super.didInsertElement.call(this);
            this.renderText();
        };
        
        view.getTemplateParams = function() {
            return {
              placeholder: this.placeholder
            };
        };

        view.onKeydownEvent = function(evt) {
            /* jshint maxcomplexity:12 */
            if (!this.$textarea) return;

            var ta = this.$textarea[0];
            var key = Keys.lookup(evt);

            // pressing enter inside textarea creates a new expression underneath
            if (key === Keys.ENTER) {
                evt.preventDefault();
                this.triggerEvent('enterPressed');
                // pressing escape removes focus
            } else if (key === Keys.ESCAPE) {
                conditionalBlur();
                // pressing up while at start of textarea selects expression above
            } else if (key === Keys.UP) {
                if (ta.selectionStart === 0 && ta.selectionEnd === 0) {
                    evt.preventDefault();
                    this.triggerEvent('upPressed');
                }
                // pressing down while at end of textarea selects expression below
            } else if (key === Keys.DOWN) {
                if (ta.selectionStart === ta.value.length && ta.selectionEnd === ta.value.length) {
                    evt.preventDefault();
                    this.triggerEvent('downPressed');
                }
                // pressing backspace when completely empty should delete textarea
            } else if (key === Keys.BACKSPACE) {
                if (ta.value.length === 0) {
                    evt.preventDefault();
                    this.triggerEvent('backspacePressed');
                }
                // pressing delete when completely empty should delete textarea
            } else if (key === Keys.DELETE) {
                if (ta.value.length === 0) {
                    evt.preventDefault();
                    this.triggerEvent('delPressed');
                }
            }
        };

        view.destruct = function() {
            this.blur();
        };

        view.markedUpText = function() {
            var marked_up_text = this.text || '';
            // converts '<' and '>' to html entity
            marked_up_text = marked_up_text.replace(/</g, '&lt;').replace(/>/g, '&gt;');

            // wraps links in <a> tags
            var exp = /(\b(https?|ftp):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/ig;
            marked_up_text = marked_up_text.replace(exp, "<a href='$1' target ='_blank'>$1</a>");

            return marked_up_text;
        };

        view.renderText = function() {
            if (!this.$textarea) return;

            this.$textarea.val(this.text);
            this.$displayText.html(this.markedUpText());
            this.fitText();
            this.$textarea.toggleClass('tlab-empty', !this.text);
            setTimeout(this.fitText.bind(this), 1); //TODO - do we still need this?
        };

        view.fitText = function() {
            if (!this.$displayText) return;

            var height = this.$displayText.outerHeight();
            if (height > 0) this.$textarea.css('height', height);
        };

        view.isFocused = function() {
            return $(document.activeElement).closest(this.$()).length !== 0;
        };

        view.blur = function() {
            if (this.$textarea) this.$textarea.blur();
        };

        view.addFocus = function(where) {
            // Can't reliably focus textarea programatically from within iframe on ipad
            // see #3106
            if (Browser.IS_IPAD && Browser.IS_IN_IFRAME) {
                return;
            }
            var textarea = this.$textarea[0];
            textarea.focus();
            if (where === 'end') {
                textarea.selectionStart = textarea.selectionEnd = textarea.value.length;
            } else if (where === 'start') {
                textarea.selectionStart = textarea.selectionEnd = 0;
            }
        };
    });

    return SmartTextarea;
});