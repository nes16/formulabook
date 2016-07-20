define(['require', 'utils/console', 'jquery', 'pjs', 'base/underscoreview', 'utils/parsejsonerrors', 'keys', 'utils/conditionalblur', 'utils/jquery.html5placeholdershim', 'template!modals/unsupportedbrowser', 'template!modals/login', 'template!modals/createaccount', 'template!modals/editaccount', 'template!modals/save', 'template!modals/recoverpassword'], function (require) {
    var console = require('utils/console');
    var $ = require('jquery');
    var P = require('pjs');
    var UnderscoreView = require('base/underscoreview');
    var parseJSONErrors = require('utils/parsejsonerrors');
    var Keys = require('keys');
    var conditionalBlur = require('utils/conditionalblur');
    var i18n = require('i18n');
    require('utils/jquery.html5placeholdershim');
    var templates = {};
    templates.unsupportedbrowser = require('template!modals/unsupportedbrowser');
    templates.login = require('template!modals/login');
    templates.createaccount = require('template!modals/createaccount');
    templates.editaccount = require('template!modals/editaccount');
    templates.save = require('template!modals/save');
    templates.recoverpassword = require('template!modals/recoverpassword');
    var popupDriveLogin = function () {
        var popup_window = window.open('/drive_api/testlab/login', 'drive_window', 'width=650, height=530');
        if (!popup_window) {
            alert(i18n.t('Login window blocked. Please allow popups from testlab.com to sign in with Google.'));
        }
    };
    var ModalsController = P(function (c) {
        c.init = function (userController, testsController) {
            this.modals = {
                unsupportedBrowserDialog: UnsupportedBrowserDialog(userController, testsController, this),
                loginDialog: LoginDialog(userController, testsController, this),
                createAccountDialog: CreateAccountDialog(userController, testsController, this),
                editAccountDialog: EditAccountDialog(userController, testsController, this),
                saveDialog: SaveDialog(userController, testsController, this),
                recoverPasswordDialog: RecoverPasswordDialog(userController, testsController, this)
            };
        };
        c.ready = function () {
            this.modalElement = $('#state-modals');
            this.modalBackground = $('#modal_background');
            this.modalElement
                .find('.close-modal')
                .add(this.modalBackground)
                .on('tlab-tap', this.hide.bind(this));
        };
        c.hide = function (el) {
            try {
                //only blur if we're disappearing the focused element
                //one relevant example: feels weird to have the active mathquill blur
                //when we dismiss the "unsupported browser" modal.
                //
                //I think this is here just so that we don't end up in a weird
                //state on iPad where a focused textbox in a modal becomes hidden, but retains focus
                if ($(document.activeElement).closest(this.modalElement).length > 0)
                    conditionalBlur();
            }
            catch (e) { }
            $("input[type='password']").attr("value", "");
            //this gets called right at the beginning (complete login) before modalBackground exists
            if (this.modalBackground) {
                this.modalBackground.hide();
                this.modalElement.hide();
            }
            $(el).off('keydown');
        };
        c.show = function (el) {
            $(el).siblings('.modal_section').hide();
            $(el).show();
            this.modalBackground.show();
            this.modalElement.show();
            $(el).on('keydown', this.handleKeydown.bind(this));
        };
        c.handleKeydown = function (evt) {
            if (Keys.lookup(evt) === Keys.ESCAPE) {
                this.hide($(evt.currentTarget));
            }
        };
        c.$ = function () {
            return this.modalElement;
        };
    });
    var ModalDialogView = P(UnderscoreView, function (view, _super) {
        view.init = function (userController, testsController, modalsController) {
            _super.init.call(this);
            this.errors = [];
            this.spinning = false;
            this.saved_inputs = {};
            this.initialized = false;
            this.userController = userController;
            this.testsController = testsController;
            this.modalsController = modalsController;
        };
        view.getTemplateParams = function () {
            return {
                errors: this.errors,
                spinning: this.spinning
            };
        };
        view.show = function () {
            if (!this.initialized) {
                this.appendTo(this.modalsController.$());
                this.initialized = true;
            }
            this.errors = [];
            this.rerender();
            this.modalsController.show(this.$());
            // Focus first visible input
            this.$('input:visible, textarea:visible').first().focus();
            // Update position of placeholder shims.
            if ($.placeholder)
                $.placeholder.shim();
        };
        view.beforeRerender = function () {
            // save what the display value was for the .modal_section
            this.__$display = this.$().css('display');
            // save input values
            var self = this;
            this.$('input,textarea').each(function () {
                var name = $(this).attr('name');
                var value = $(this).val();
                self.saved_inputs[name] = value;
            });
        };
        view.afterRerender = function () {
            // must restore this if we want the modal to display. They are display:none
            // by default and that's how it'll get rerendered.
            this.$().css('display', this.__$display);
            // restore input values
            for (var name in this.saved_inputs) {
                this.$('[name="' + name + '"]').val(this.saved_inputs[name]);
            }
        };
        view.hide = function () {
            this.modalsController.hide();
        };
        view.processJSONErrors = function (jqXHR) {
            this.errors = parseJSONErrors(jqXHR);
        };
        view.startProcessingForm = function () {
            this.spinning = true;
            this.errors = [];
            this.rerender();
        };
        view.stopProcessingForm = function () {
            this.spinning = false;
            this.rerender();
        };
        view.successAnimation = function () {
            //reaches into header
            $('.tlab-edit-acct-success').show();
            setTimeout(function () {
                $('.tlab-edit-acct-success').fadeOut('fast');
            }, 800);
        };
    });
    /*
     * here are the actual modal states
     */
    var UnsupportedBrowserDialog = P(ModalDialogView, function (view) {
        view.template = templates.unsupportedbrowser;
        view.didCreateElement = function () {
            this.$('.tlab-action-hide').on('tlab-tap', this.hide.bind(this));
        };
    });
    var LoginDialog = P(ModalDialogView, function (view, _super) {
        view.template = templates.login;
        view.didCreateElement = function () {
            this.$('.tlab-action-submit').on('submit', this.testlabLogin.bind(this));
            this.$('.tlab-action-recoverpassword').on('tlab-tap', this.recoverPassword.bind(this));
            this.$('.tlab-action-createaccount').on('tlab-tap', this.createAccount.bind(this));
        };
        view.testlabLogin = function (evt) {
            //don't submit the form
            evt.preventDefault();
            var formData = $(evt.target).serialize();
            var modalsController = this.modalsController;
            this.startProcessingForm();
            this.userController.testlabLogin(formData).then(modalsController.hide.bind(modalsController), this.processJSONErrors.bind(this)).always(this.stopProcessingForm.bind(this));
        };
        view.recoverPassword = function (evt) {
            evt.preventDefault();
            this.modalsController.modals.recoverPasswordDialog.show();
        };
        view.createAccount = function (evt) {
            evt.preventDefault();
            this.modalsController.modals.createAccountDialog.show();
        };
    });
    var CreateAccountDialog = P(ModalDialogView, function (view, _super) {
        view.template = templates.createaccount;
        view.didCreateElement = function () {
            this.$('.tlab-action-submit').on('submit', this.submitCreateAccount.bind(this));
            this.$('.tlab-action-login').on('tlab-tap', this.login.bind(this));
            this.$('.tlab-action-login-then-save').on('tlab-tap', this.login.bind(this));
            this.$('.tlab-action-googlelogin').on('tlab-tap', this.googleLogin.bind(this));
        };
        view.login = function () {
            this.modalsController.modals.loginDialog.show();
        };
        view.googleLogin = function () {
            //_kmq.push([
            //  'record',
            //  'started google login',
            //  {'login location': 'create account'}]
            //);
            popupDriveLogin();
            this.modalsController.hide();
        };
        view.show = function () {
            this.saveNext = false;
            _super.show.call(this);
        };
        view.showThenSave = function () {
            this.saveNext = true;
            _super.show.call(this);
        };
        view.getTemplateParams = function () {
            var params = _super.getTemplateParams.call(this);
            params.saveNext = this.saveNext;
            return params;
        };
        view.submitCreateAccount = function (evt) {
            evt.preventDefault();
            var formData = $(evt.target).serialize();
            this.startProcessingForm();
            var modalsController = this.modalsController;
            this.userController.createAccount(formData).then(modalsController.hide.bind(modalsController), this.processJSONErrors.bind(this)).always(this.stopProcessingForm.bind(this));
        };
    });
    var EditAccountDialog = P(ModalDialogView, function (view, _super) {
        view.template = templates.editaccount;
        view.didCreateElement = function () {
            this.$('.tlab-action-submit').on('submit', this.submitEdit.bind(this));
        };
        // whenever this becomes visible, reset the name to the current user
        view.show = function () {
            _super.show.call(this);
            var params = this.getTemplateParams();
            if (params.user) {
                this.$('input[name=name]').val(params.user.name);
            }
        };
        view.getTemplateParams = function () {
            var params = _super.getTemplateParams.call(this);
            params.user = this.userController.currentUser;
            return params;
        };
        view.submitEdit = function (evt) {
            evt.preventDefault();
            var self = this;
            var formData = $(evt.target).serialize();
            this.startProcessingForm();
            this.userController.editAccount(formData).then(function () {
                self.hide();
                self.successAnimation();
            }, this.processJSONErrors.bind(this)).always(this.stopProcessingForm.bind(this));
        };
    });
    var SaveDialog = P(ModalDialogView, function (view, _super) {
        view.template = templates.save,
            view.didCreateElement = function () {
                this.$('.tlab-action-save-as').on('tlab-tap', this.saveAs.bind(this));
                this.$('.tlab-action-save').on('tlab-tap', this.save.bind(this));
                var self = this;
                this.$('.title-input').on('keypress', function (evt) {
                    if (evt.which === 13) {
                        evt.preventDefault();
                        self.saveAs();
                    }
                });
            };
        // whenever this becomes visible reset title to current test's title
        view.show = function () {
            _super.show.call(this);
            var params = this.getTemplateParams();
            this.$('input[name=title]').val(params.title).focus();
            this.baseName = params.title;
        };
        view.getTemplateParams = function () {
            var params = _super.getTemplateParams.call(this);
            params.user = null;
            params.title = '';
            var user = this.userController.currentUser;
            if (user) {
                params.user = {
                    name: user.name,
                    isDriveUser: user.isDriveUser
                };
            }
            var test = this.testsController.currentTest;
            if (test && test.title) {
                params.title = test.title;
            }
            return params;
        };
        view.save = function () {
            console.log("save");
            var test = this.testsController.currentTest.copy();
            test.title = this.$('input[name=title]').val();
            this.hide();
            this.testsController.save(test);
        };
        view.saveAs = function () {
            console.log("save As");
            var test = this.testsController.currentTest.copy();
            test.title = this.$('input[name=title]').val();
            this.hide();
            this.testsController.saveAs(test);
        };
    });
    var RecoverPasswordDialog = P(ModalDialogView, function (view, _super) {
        view.template = templates.recoverpassword;
        view.getTemplateParams = function () {
            var params = _super.getTemplateParams.call(this);
            params.sentMessage = this.sentMessage;
            return params;
        };
        // will get called multiple times so only do dom instantiation
        view.didCreateElement = function () {
            this.$('.tlab-action-submit').on('submit', this.submitRecover.bind(this));
            this.$('.tlab-action-tryagain').on('tlab-tap', this.resetAgain.bind(this));
            this.$('.tlab-action-login').on('tlab-tap', this.login.bind(this));
        };
        view.submitRecover = function (evt) {
            evt.preventDefault();
            var self = this;
            var formData = $(evt.target).serialize();
            this.startProcessingForm();
            this.userController.recoverPassword(formData).then(function () {
                self.sentMessage = true;
            }, this.processJSONErrors.bind(this)).always(this.stopProcessingForm.bind(this));
        };
        view.resetAgain = function () {
            this.sentMessage = false;
            this.rerender();
        };
        view.login = function () {
            //_kmq.push(['record', 'started login', {
            //  'login location': 'recover password'
            //}]);
            this.modalsController.modals.loginDialog.show();
        };
    });
    return ModalsController;
});
