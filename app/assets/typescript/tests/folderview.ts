define( ['require', 'jquery', 'pjs', 'i18n', 'keys', 'config', 'base/underscoreview', 'tests/itemview', 'template!testsfolderview', 'utils/scrollhelpers', 'utils/jquery.html5placeholdershim', 'loadcss!tests', 'loadcss!testsfolderview'], function(require) {
    require('loadcss!testsfolderview');
    var $ = require('jquery');
    var _ = require('underscore');
    var P = require('pjs');
    var i18n = require('i18n');
    var Keys = require('keys');
    var Config = require('config');
    var UnderscoreView = require('base/underscoreview');
    var TestView = require('tests/itemview');
    var template = require('template!testsfolderview');
    var scrollHelpers = require('utils/scrollhelpers');

    require('utils/jquery.html5placeholdershim');

    var TestsFolderView = P(UnderscoreView, function(view, _super) {
        view.template = template;

        view.init = function(model, TLab, modals) {
            _super.init.call(this);
            this.model = model;
            this.Tlab = TLab;


            this.modals = modals;
            this.itemViews = {};

            this.model.observeEvent('itemAdded', this.onItemAdded.bind(this));
            this.model.observeEvent('itemRemoved', this.onItemRemoved.bind(this));
            this.model.observe('selectedItem', this.onSelectedItemChange.bind(this));
            this.model.observe('searchQuery', this.onSearchQueryChange.bind(this));

            this.accountsEnabled = !!this.model.userController;

            if (this.accountsEnabled) {
                this.model.userController.observe('currentUser', this.renderLayout.bind(this));
            }

            this.model.observe('isSpinning searchQuery filteredItemCount', this.renderLayout.bind(this));

            this.observe('isOpen', this.renderIsOpen.bind(this));
        };

        view.getTemplateParams = function() {
            return {
                maintenance: false,
                previewMode: false,
                previewFeedbackUrl: false,
                previewMessage: false,
                accountsEnabled: true
            };
        };

        view.createItemView = function(itemModel) {
            return TestView(itemModel);
        };

        view.onItemAdded = function(evt, data) {
            var itemModel = data.item;
            var index = data.index;

            if (!this.$()[0]) return; // don't do anything if not in dom

            var itemView = this.createItemView(itemModel);
            this.__itemViews[itemModel.guid] = itemView;

            if (index === 0) {
                itemView.prependTo(this.$('.template-list'));
            } else {
                itemView.insertAfter(this.$('.template-list > :nth-child(' + index + ')'));
            }
        };

        view.onItemRemoved = function(evt, data) {
            var itemModel = data.item;
            if (!this.$()[0]) return; // don't do anything if not in dom

            var itemView = this.__itemViews[itemModel.guid];
            delete this.__itemViews[itemModel.guid];

            itemView.remove();
        };

        view.getViewFromModel = function(itemModel) {
            return itemModel ? this.__itemViews[itemModel.guid] : null;
        };

        view.getSelectedView = function() {
            return this.getViewFromModel(this.model.selectedItem);
        };

        view.getSelectedTest = function() {
            var selectedItemModel = this.model.selectedItem;
            if (!selectedItemModel) return null;

            return selectedItemModel.test;
        };

        view.clearSelection = function() {
            var selectedItemModel = this.model.selectedItem;
            if (selectedItemModel) {
                selectedItemModel.setProperty('selected', false);
            }
            //should be a no-op most of the time
            this.$fullscreenLoadingContainer.hide();
        };

        view.onSelectedItemChange = function() {
            if (this.getSelectedTest()) {
                this.openTest();
            }
        };

        view.focusSearchBar = function() {
            this.$('#search-tests').focus();
        };

        view.toggleVisible = function() {
            if (this.isOpen) {
                this.close();
            } else {
                this.open();
            }
        };

        view.updateSearchQuery = function(evt) {
            //escape pressed -- clear input? just bikeshedding.
            if (Keys.lookup(evt) === Keys.ESCAPE) {
                this.$('#search-tests').attr('value', '');
                this.model.setProperty('searchQuery', '');
            }

            //don't run the filter tests code on  enter, up, or down
            else if ([Keys.UP, Keys.DOWN, Keys.ENTER].indexOf(Keys.lookup(evt)) === -1) {
                this.model.setProperty('searchQuery', this.$('#search-tests').val());

                // close preview if it's open when typing in search box
                this.clearSelection();
            }

        };

        view.newBlankTest = function() {
            this.clearSelection();
            this.model.testsController.clearTest();

            var self = this;
            var undoCallback = function() {
                self.open();
            };
//          this.TLab._TLab.toast(i18n.t("New Test created."), {
//              undoCallback: undoCallback
//          });
            this.close();
        };

        view.onSearchQueryChange = function() {
            this.$('.new-blank-test').toggle(this.model.searchQuery.length === 0);
        };

        view.didCreateElement = function() {
            var self = this;

            this.$fullscreenLoadingContainer = this.$('.tlab-fullscreen-loading-container');

            //this.$('.tlab-action-try-again').on('tlab-tap', this.showPreview.bind(this));


            this.$('#search-tests').on('change keypress keyup keydown copy paste cut', this.updateSearchQuery.bind(this));


            this.$().on('click', 'a', function(evt) {
                if (!$(this).attr('href')) evt.preventDefault();
            });

            this.$().on('tlab-tap', '.tlab-action-newblanktest', this.newBlankTest.bind(this));
            this.$().on('tlab-tap', '.tlab-action-cancel', this.clearSelection.bind(this));
            this.$('.tlab-action-login').on('tlab-tap', this.login.bind(this));
            this.$('.tlab-action-createaccount').on('tlab-tap', this.createAccount.bind(this));


            //background cover
            // if clicked and a preview is open, close that preview
            // otherwise, close the resources tab
            this.$('.tlab-action-close-resources').on('tlab-tapstart', function(evt) {
                   self.close();
            });


            // add tests to dom
            var list = this.$('.template-list');
            this.__itemViews = {};
            this.model.getItems().forEach(function(itemModel) {
                var itemView = self.createItemView(itemModel);
                self.__itemViews[itemModel.guid] = itemView;

                // TODO - optimize by adding all starting items at once rather than one at a time
                itemView.appendTo(list);
            });

            this.renderLayout();
        };


        view.openTest = function() {
            var selectedTest = this.getSelectedTest();
            if (!selectedTest) return;

            var onSuccess = (function() {
                if (this.getSelectedTest() !== selectedTest) return;

                this.model.testsController.loadTest(selectedTest.copy());

                var testTitle;
                if (!selectedTest.title) {
                    testTitle = i18n.t("Untitled Test");
                } else {
                    if (selectedTest.title.length > 15) {
                        testTitle = selectedTest.title.substr(0, 15) + "...";
                    } else {
                        testTitle = selectedTest.title;
                    }
                }
                this.$fullscreenLoadingContainer.hide();
                var str = i18n.t("Opened '__testTitle__'", {
                    testTitle: testTitle
                });
                //this.Calc._calc.toast(str);
                this.close();
            }).bind(this);

            var onFailure = (function() {
                if (this.getSelectedTest() !== selectedTest) return;
                this.$fullscreenLoadingContainer.addClass('tlab-error-loading');
            }).bind(this);

            selectedTest.fetchData().then(onSuccess, onFailure);
        };


        view.renderLayout = function() {
            // exit early if the dom isn't created yet
            if (!this.$()[0]) return;

            var userIsLoggedIn = !!(this.accountsEnabled && this.model.userController.currentUser);
            var isSpinning = !!this.model.isSpinning;

            //show login options. no-op on tablet because login-reminder doesn't exist in the DOM
            this.$('.login-reminder').toggle(!userIsLoggedIn);
            // only show spinner if user is logged in
            this.$('.template-spinning').toggle(userIsLoggedIn && isSpinning);
            // only show 'no matches' if a search query is entered and the're not matches
            this.$('.no-matches').toggle(this.model.filteredItemCount === 0 && this.model.searchQuery.length !== 0);
        };

        view.selectUp = function(evt) {
            if (this.model.selectPrev()) {
                evt.preventDefault();
            }
        };

        view.selectDown = function(evt) {
            if (this.model.selectNext()) {
                evt.preventDefault();
            }
        };


        view.renderIsOpen = function() {
            $('body').toggleClass('resources-open', !!this.isOpen);
        };

        view.close = function() {
            this.setProperty('isOpen', false);
            this.clearSelection();

            this.$('#search-tests').blur().attr('value', '');
            this.model.setProperty('searchQuery', '');
            $(document).off('keydown.tests-view');

            // TODO - do we still need this lastRemoved?
            this.model.testsController.setProperty('lastRemoved', undefined);
        };

        view.open = function() {
            this.setProperty('isOpen', true);
            // update the dates and fix placeholder
            this.model.updateDisplayDates();
            if ($.placeholder) $.placeholder.shim();

            var self = this;
            //listen for arrow keys
            $(document).on('keydown.tests-view', function(evt) {
                var key = Keys.lookup(evt);

                if (key === Keys.UP) {
                    self.selectUp(evt);
                    evt.preventDefault();
                } else if (key === Keys.DOWN) {
                    self.selectDown(evt);
                    evt.preventDefault();
                } else if (key === Keys.ENTER) {
                    self.openPreview();
                } else if (key === Keys.ESCAPE) {
                    self.clearSelection();
                }
            });
        };

        view.createAccount = function () {
          this.modals.createAccountDialog.show();
        };

        view.login = function () {
          this.modals.loginDialog.show();
        };
    
    });

    return TestsFolderView;
});


