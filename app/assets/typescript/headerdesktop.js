/*
 * this is the row of buttons above the calc on desktop
 */
define(['require', 'jquery', 'pjs', 'base/underscoreview', 'tipsy', 'i18n', 'utils/console', 'utils/browser', 'account/dropdown', 'tests/model', 'tests/folderview', 'template!headerdesktop', 'loadcss!headerdesktop'], function (require) {
    var console = require('utils/console');
    require('loadcss!headerdesktop');
    var $ = require('jquery');
    var UnderscoreView = require('base/underscoreview');
    var P = require('pjs');
    var Browser = require('utils/browser');
    var i18n = require('i18n');
    var AccountView = require('account/dropdown');
    var TestsModel = require('tests/model');
    var TestsFolderView = require('tests/folderview');
    require('tipsy');
    var template = require('template!headerdesktop');
    var HeaderView = P(UnderscoreView, function (view, _super) {
        view.template = template;
        view.$saveBtn = null;
        view.init = function (userController, testsController, TLab, modals) {
            _super.init.call(this);
            this.userController = userController;
            this.testsController = testsController;
            this.TLab = TLab;
            this.modals = modals;
            this.testsModel = TestsModel(testsController, userController);
            this.testsFolderView = TestsFolderView(this.testsModel, TLab, modals);
            //needs helpview to be able to open up the feedback box
            this.accountView = AccountView(userController, modals);
            this.childViews = [
                this.accountView
            ];
        };
        view.didCreateElement = function () {
            var self = this;
            this.$saveBtn = this.$('.tlab-action-save');
            this.$().tipsy({
                fade: 'fast',
                title: 'tooltip',
                wait: 500,
                delegate: '.tlab-tooltip'
            });
            //a few need extra offset
            this.$().tipsy({
                fade: 'fast',
                title: 'tooltip',
                wait: 500,
                offset: 7,
                delegate: '.tooltip-offset'
            });
            this.childViews.forEach(function (view) {
                view.setPointTo(self.$(view.pointToSelector));
                view.appendTo('.tlab-sliding-interior');
            });
            this.testsFolderView.appendTo('body');
            //bind to events in the tests controller
            this.testsController.observeEvent('StartSave', this.saveStart.bind(this));
            this.testsController.observeEvent('SaveSuccess', this.saveSuccess.bind(this));
            this.testsController.observeEvent('SaveError', this.saveFailure.bind(this));
            this.accountView.setupOpenButton(this.$('.tlab-account-link'), 'tlab-tap');
            this.$('.tlab-action-opendrawer').on('tlab-tap', this.openDrawer.bind(this));
            this.$('.tlab-action-savedialog').on('tlab-tap', this.saveDialog.bind(this));
            this.$saveBtn.on('tlab-tap', this.simpleSave.bind(this));
            this.$('.tlab-action-print').on('tlab-tap', this.print.bind(this));
            this.$('.tlab-action-login').on('tlab-tap', this.login.bind(this));
            this.$('.tlab-action-createaccount').on('tlab-tap', this.createAccount.bind(this));
            this.updateTitle();
            this.testsController.observe('currentTest', function () {
                self.updateTitle();
            });
            this.userController.observe('currentUser', this.rerender.bind(this));
            this.observe('testChanged', this.renderTestChanged.bind(this));
            this.renderTestChanged();
        };
        view.renderTestChanged = function () {
            var hasChanges = !!this.testChanged;
            this.$('.save-btn').attr('tooltip', (hasChanges ? i18n.t("Save Changes (ctrl+s)") : i18n.t("No Unsaved Changes")));
            this.$('.title-div').toggleClass('has-changes', hasChanges);
        };
        view.openDrawer = function () {
            this.testsFolderView.toggleVisible();
        };
        view.getTemplateParams = function () {
            var name = (this.userController.currentUser ? this.userController.currentUser.firstName() : null);
            return {
                IS_ANDROID: Browser.IS_ANDROID,
                user: this.userController.currentUser,
                name: name,
                maintenance: false,
                previewMode: false,
                previewFeedbackUrl: false,
                previewMessage: false
            };
        };
        view.updateTitle = function () {
            var test = this.testsController.currentTest;
            var title = (test && test.title ? test.title : i18n.t('Untitled Test'));
            this.$('.tlab-variable-title').text(title);
        };
        //this can be called by ctrl-S or by clicking the save icon
        //it executes the save, but doesn't pop up the dialog unless it's your first save
        view.simpleSave = function () {
            if (this.userController.currentUser &&
                this.testsController.currentTest.hasOwnProperty('title')) {
                // Already saved, so don't bother with the dialog
                //TODO is there a better way of detecting this?
                this.testsController.save(this.testsController.currentTest);
            }
            else {
                this.saveDialog();
            }
        };
        // TODO - switch from keyCode to something that identifies which keys we're talking about.
        view.handleKeydown = function (evt) {
            if (evt.ctrlKey || evt.metaKey) {
                if (evt.keyCode == 83) {
                    evt.preventDefault();
                    if (evt.shiftKey) {
                        this.saveDialog();
                    }
                    else {
                        this.simpleSave();
                    }
                }
                else if (evt.keyCode == 79) {
                    //power user feature: focus search box when you press ctrl-o or cmd-o
                    evt.preventDefault();
                    this.openDrawer();
                    var self = this;
                    if ($('body').hasClass('resources-open')) {
                        setTimeout(function () {
                            self.testsFolderView.focusSearchBar();
                        }, 1);
                    }
                }
            }
        };
        view.saveDialog = function () {
            if (this.userController.currentUser) {
                this.modals.saveDialog.show();
            }
            else {
                this.modals.createAccountDialog.showThenSave();
            }
        };
        view.saveStart = function () {
            this.$saveBtn.addClass('saving');
            console.log("start saving animation");
        };
        view.saveSuccess = function () {
            this.$saveBtn.removeClass('saving').addClass('success');
            var self = this;
            setTimeout(function () {
                self.$saveBtn.removeClass('success');
            }, 2000);
        };
        view.saveFailure = function () {
            this.$saveBtn.removeClass('saving').addClass('failure');
            var self = this;
            setTimeout(function () {
                self.$saveBtn.removeClass('failure');
            }, 2000);
        };
        view.print = function (evt) {
            //execute a window.print
            window.print();
            return;
        };
        //
        // right hand tools
        //
        view.login = function () {
            this.modals.loginDialog.show();
        };
        view.createAccount = function () {
            this.modals.createAccountDialog.show();
        };
    });
    return HeaderView;
});
