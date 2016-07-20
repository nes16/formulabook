define(['require', 'jquery', 'pjs', 'base/underscoreview', 'utils/conditionalblur'], function(require) {
    var $ = require('jquery');
    var P = require('pjs');
    var UnderscoreView = require('base/underscoreview');
    var conditionalBlur = require('utils/conditionalblur');

    var allPopovers = [];

    function handleIsVisibleChange(changedPopover) {
        // hide all other popovers when this one becomes visible
        if (changedPopover.isVisible) {
            allPopovers.forEach(function(popover) {
                if (popover !== changedPopover) {
                    popover.closePopover();
                }
            });

            $(document).on('tlab-tapstart.popover-' + changedPopover.popoverNumber, function(evt) {
                changedPopover.setProperty('isVisible', !changedPopover.eventShouldClosePopover(evt));
            });
        } else {
            $(document).off('tlab-tapstart.popover-' + changedPopover.popoverNumber);
        }
    }

    var PopoverView = P(UnderscoreView, function(view, _super) {

        view.init = function() {
            _super.init.call(this);
            this.isVisible = false;

            allPopovers.push(this);

            this.popoverNumber = allPopovers.length;

            this.observe('isVisible', function() {
                handleIsVisibleChange(this);
                this.renderIsVisible();
            }.bind(this));
        };

        //jquery selector for where the arrow head should point
        view.setPointTo = function(el) {
            this.pointTo = el;
        };

        view.alignArrow = function() {
            if (!this.isVisible) return;
            var cont = this.$();
            if (!this.pointTo.length || !cont.length) return;

            var offset = this.pointTo.offset().left + 0.5 * this.pointTo.width() - cont.offset().left;

            this.$('.tlab-arrow').css('left', offset);
        };

        view.setupOpenButton = function(openButton, on) {
            this.openButton = openButton;
            this.openButton.on(on, this.onBtnPressed.bind(this));
        };

        view.didInsertElement = function() {
            this.renderIsVisible();
        };

        view.renderIsVisible = function() {
            this.$().toggle(this.isVisible);
            if (this.openButton) this.openButton.toggleClass('tlab-active', this.isVisible);
            if (this.pointTo) this.alignArrow();
        };

        // don't do anything if we're inside the popover or if we're inside the openButton
        view.eventShouldClosePopover = function(evt) {
            return !this.eventIsWithinPopover(evt);
        };

        view.eventIsWithinPopover = function(evt) {
            var $target = $(evt.target);
            return $target.closest(this.$()).length || $target.closest(this.openButton).length;
        };

        view.onBtnPressed = function(evt) {
            //for touch devices
            conditionalBlur();

            var $target = $(evt.target);

            // this is a popover whose built inside of the button. act like we didn't
            // press the button
            if ($target.closest('.tlab-popover').length) {
                return;
            }

            // pressed the open/close button
            if ($target.closest(this.openButton).length) {
                this.togglePopover();
                return;
            }
        };

        view.togglePopover = function() {
            this.setProperty('isVisible', !this.isVisible);
        };

        view.closePopover = function() {
            this.setProperty('isVisible', false);
        };
    });

    return PopoverView;
});