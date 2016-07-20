define( ['require', 'jquery', 'pjs', 'base/popoverview', 'template!account_dropdown', 'loadcss!help'], function(require) {
    require('loadcss!help');

    var $ = require('jquery');
    var P = require('pjs');
    var PopoverView = require('base/popoverview');
    var template = require('template!account_dropdown');

    /*
     * view for the account menu
     */

    var AccountView = P(PopoverView, function(view, _super) {
        view.template = template;
        view.pointToSelector = '.tlab-account-link .email i';

        view.init = function(userController, modals) {
            _super.init.call(this);

            //this.helpView = helpView;
            this.userController = userController;
            this.modals = modals;
        };

        view.getTemplateParams = function() {
            if (this.userController.currentUser) return {
                name: this.userController.currentUser.name,
                email: this.userController.currentUser.email
            };
            else return {
                name: null,
                email: null
            };
        };

        view.editAccount = function() {
            this.modals.editAccountDialog.show();
            this.closePopover();
        };

        view.logout = function() {
            this.userController.logout();
            this.closePopover();
        };

        view.feedback = function() {
            this.closePopover();
            //this.helpView.openFeedback();
        };

        view.eventShouldClosePopover = function(evt) {
            var $target = $(evt.target);

            if (this.eventIsWithinPopover(evt)) {
                return false;
            }

            return !$target.closest("#state-modals").length &&
                $target.attr("id") != "modal_background";
        };

        view.didCreateElement = function() {
            _super.didCreateElement.call(this);

            this.$('.tlab-action-logout').on('tlab-tap', this.logout.bind(this));
            this.$('.tlab-action-feedback').on('tlab-tap', this.feedback.bind(this));
            this.$('.tlab-action-editaccount').on('tlab-tap', this.editAccount.bind(this));

            this.userController.observe('currentUser', this.rerender.bind(this));
        };

    });

    return AccountView;
});
