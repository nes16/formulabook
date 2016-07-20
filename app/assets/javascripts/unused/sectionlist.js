define(['require', 'jquery', 'pjs', 'i18n', 'keys', 'config', 'base/underscoreview', 'touchtracking', 'utils/conditionalblur', 'parameters/section', 'parameters/new_section_view', 'parameters/add_section_view', 'parameters/section_view', 'template!section_list', 'utils/scrollhelpers', 'utils/jquery.html5placeholdershim', 'loadcss!parameters'], function(require) {
    require('loadcss!parameters');
    var $ = require('jquery');
    var _ = require('underscore');
    var P = require('pjs');
    var i18n = require('i18n');
    var Keys = require('keys');
    var Config = require('config');
    var Section = require('parameters/section');
    var UnderscoreView = require('base/underscoreview');
    var SectionView = require('parameters/section_view');
    var AddSectionView = require('parameters/add_section_view');
    var template = require('template!section_list');
    var scrollHelpers = require('utils/scrollhelpers');
    var conditionalBlur = require('utils/conditionalblur');
    var touchtracking = require('touchtracking');
    var NewSectionView = require('parameters/new_section_view');

    require('utils/jquery.html5placeholdershim');

    var SectionList = P(UnderscoreView, function(view, _super) {
        view.template = template;

        view.init = function(model, root) {
            _super.init.call(this);
            this.model = model;
            this.$root = $root || $('body');
            thisthis.setProperty('scrollbarWidth', 0);
            this.setProperty('minWidth', 356);
            this.itemViews = {};

            this.model.triggerItemInserted = this.onItemInserted.bind(this);
            this.model.triggerItemRemoved = this.onItemRemoved.bind(this);
            this.model.triggerItemMoved = this.onItemMoved.bind(this);
            this.model.triggerSetState = this.onSetState.bind(this);

            this.observe('itemFocused', this.renderItemFocused.bind(this));
            this.observe('editListMode', this.renderEditListMode.bind(this));

            // ensure selected parameter is visible on selection change and focused
            // parameter is visible on keypress
            this.model.observe('selectedItem', this.ensureActiveChildIsVisible.bind(this));

            this.createAllItemViews();
        };

        view.computeTransient = function() {
            this.setProperty('transient', this.transientChildren.length > 0);
        };

        view.padLastExpression = function(padding) {
            var $lastExp = this.$('.tlab-parameteritem.tlab-new-parameter');
            $lastExp.css('margin-bottom', +padding + 'px');
        };

        view.unpadLastExpression = function() {
            var $lastExp = this.$('.tlab-parameteritem.tlab-new-parameter');
            $lastExp.css('margin-bottom', '0');
            this.recalculateScrollbarWidth();
        };

        view.padLastExpressionUntilTapEnd = function(padding) {
            var self = this;
            this.padLastExpression(padding);
            $(document).on('tlab-tap.animating-bottom', function() {
                if (self.$('.tlab-exp-options-menu').length === 0) {
                    self.unpadLastExpression();
                    $(document).off('tlab-tap.animating-bottom');
                }
            });
        };

        //we need to set minWidth at least once, because otherwise
        //we never set the css property, which caused: https://github.com/desmosinc/knox/issues/3878
        //we also don't want to set the css every time, because that'll be a performance burden
        //finally, we need to set it *initially* or else we get a weird slide-in animation
        //because layout_controller doesn't call this until after everything's all instantiated.
        //solution: just store some state recording whether we should ignore our no-op trap
        view.minWidthHasBeenSet = false;
        view.setMinWidth = function(newWidth) {
            if (!this.$exps) return;
            if (newWidth === this.minWidth && this.minWidthHasBeenSet) return;
            this.minWidthHasBeenSet = true;
            this.setProperty('minWidth', newWidth);
            var newCss = {
                minWidth: newWidth
            };
            if (!this.itemFocused) newCss.maxWidth = newWidth;
            this.$secpanelContainer.css(newCss);
        };

        view.recalculateScrollbarWidth = function() {
            var scrollbarWidth = this.$('.tlab-secpanel').width() - this.$('.tlab-sectionlist').width();
            scrollbarWidth = Math.max(scrollbarWidth, 0);
            this.setProperty('scrollbarWidth', scrollbarWidth);
        };

        view.updateWidth = function() {
            if (!this.$secs) return;
            var secpanel = this.$secpanelContainer;
            var maxWidth = 0;
            //don't update width if we're full-width (i.e. on a smallscreen)
            if (secpanel.css('min-width') === '100%') return;

            var minWidth = this.minWidth;

            this.$('.tlab-disable-horizontal-scroll-to-cursor').scrollLeft(0);

            function includeWidth($element) {
                var main = $element.find('.tlab-main');
                if (!main.length) return;

                var width = main.outerWidth() + main.offset().left;
                if (width > maxWidth) maxWidth = width;
            }
            var selected = this.getSelectedView();
            if (selected && this.itemFocused) {
                includeWidth(selected.$());
            }

            if (maxWidth < minWidth) {
                maxWidth = minWidth;
            }

            secpanel.css('max-width', maxWidth);
            this.recalculateScrollbarWidth();
        };


        view.onItemInserted = function(index, item) {
            //update index for newSectionView
            if (this.newSectionView) {
                this.newSectionView.setProperty('index', this.model.getItemCount() + 1);
            }

            // if we've started adding items to dom, add this item. Otherwise,
            // the view will be created when the ExpressionListView is inserted
            // into the dom
            if (this.$items) {
                var view = this.createItemView(item);
                if (view) {
                    if (index === 0) {
                        view.prependTo(this.$items); // beginning
                    } else if (index === this.model.getItemCount() - 1) {
                        view.appendTo(this.$items); //end
                    } else { //somewhere in the middle
                        view.insertAfter(this.$items.children(':nth-child(' + index + ')'));
                    }

                    //in edit list mode, we animate new items
                    if (this.editListMode) {
                        view.$().css({
                            transform: 'scale(0,0)',
                            opacity: 0
                        });

                        //wait one frame, or the 0,0 won't catch
                        setTimeout(function() {
                            view.$().css({
                                transition: '.2s',
                                opacity: 1,
                                transform: ''
                            });
                        }, 1);
                        //remove our transition after the animation's done
                        setTimeout(function() {
                            view.$().css({
                                transition: 'none'
                            });
                        }, 300);
                    }
                }

                var len = this.model.getItemCount();
                for (var i = index; i < len; i++) {
                    this.model.getItemByIndex(i).setProperty('index', i);
                }

                this.updateWidth();
                this.ensureActiveChildIsVisible();
            }
        };

        view.onItemRemoved = function(index, item) {
            var item_id = String(item.id);

            item.unobserve('.listview');

            // update index on newExpressionView
            if (this.newSectionView) {
                this.newSectionView.setProperty('index', this.model.getItemCount() + 1);
            }

            // remove item view from dom
            var view = this.__itemViews[item_id];
            if (view) {
                view.remove();
                delete this.__itemViews[item_id];

                var len = this.model.getItemCount();
                for (var i = index; i < len; i++) {
                    this.model.getItemByIndex(i).setProperty('index', i);
                }
            }

            this.updateWidth();
        };

        view.onSetState = function(list) {
            // destroy item views
            //TODO - could do a destruct() and remove all at once from dom for optimization.
            for (var id in this.__itemViews) {
                if (this.__itemViews.hasOwnProperty(id)) this.__itemViews[id].remove();
            }

            this.__itemViews = {};

            // update index on newSectionView
            if (this.newSectionView) {
                this.newSectionView.setProperty('index', this.model.getItemCount() + 1);
            }

            // make all the views at once and insert one large structure
            this.createAllItemViews();
            this.appendAllItemViews();
        };

        view.renderItemFocused = function() {
            this.$root.toggleClass('tlab-ITEM-FOCUSED', !!this.itemFocused);
        };

        view.instantiateItemView = function(item) {
            if (item.isSection) {
                return SectionView(item, this);
            }
        };

        view.createItemView = function(item) {
            var view = this.instantiateItemView(item);
            var item_id = String(item.id);

            if (view) {
                this.__itemViews[item_id] = view;

                // add some triggers to the view
                var self = this;
                view.triggerDelete = function() {
                    self.onDelete(view)
                };
                view.triggerEnterPressed = function() {
                    self.onEnterPressed(view)
                };
                view.triggerUpPressed = function() {
                    self.onUpPressed(view)
                };
                view.triggerDownPressed = function() {
                    self.onDownPressed(view)
                };
                view.triggerBackspacePressed = function() {
                    self.onBackspacePressed(view)
                };
                view.triggerDelPressed = function() {
                    self.onDelPressed(view)
                };
                view.observe('transient', function(prop, view) {
                    if (view.transient) {
                        self.transientChildren.push(view);
                    } else {
                        self.transientChildren = _(self.transientChildren).without(view);
                    }
                    self.computeTransient();
                });
            }

            return view;
        };

        view.createAllItemViews = function() {
            var len = this.model.getItemCount();
            for (var i = 0; i < len; i++) {
                var item = this.model.getItemByIndex(i);
                this.createItemView(item);
            }
        };


        //this method is for large graphs with lots of unrendered shells
        //previously split between timermoduels and renderviewport.
        //
        //first, it finds the first visible parameter.
        //then, starting there, it renders all of the parameters there and below.
        view.renderVisibleSection = function() {
            var anyUnrendered = this.model.__items.some(function(item) {
                return item.renderShell;
            });
            if (!anyUnrendered) return;
            var secPanelTop = this.$('.tlab-exppanel').offset().top;
            var first = this.sectionAtPoint(5, secPanelTop);
            if (!first) return;

            //if the user set that we should use shells offscreen (for perf), do
            var last = null;
            if (this.graphSettings.config.useShellsOffscreen) {
                var scrollHeight = this.$('.tlab-exppanel').height();
                last = this.sectionAbovePoint(5, secPanelTop + scrollHeight);
            }

            this.renderSection(first.index, last);
        };


        // render parameters on a loop, starting from first.index (above)
        //
        // notes:
        //   * this only updates parameters *below* where you are. We don't
        // want to have what you're looking at move.
        //   * if "last" is provided, we don't update parameters beyond it
        view.renderSectionTimeout = null;
        view.renderSection = function(index, last) {
            clearTimeout(this.renderSectionTimeout);

            // find the first item (>= index) that needs to be rendered
            var item = this.model.getItemByIndex(index);
            while (item && (!item.renderShell || item.inCollapsedFolder)) {
                index++;
                item = this.model.getItemByIndex(index);

                // we've gone too far.
                if (last && index > last.index) return;
            }

            var self = this;
            if (item) {
                this.renderSectionTimeout = setTimeout(function() {
                    self.renderSection(index + 1, last);
                }, 1);

                // calling this can immediately send us back into renderExpression.
                // when that happens, we can set two timeouts but 1 overwrites the
                // other. That means one timeout dangles and isn't clearable.
                // The way this was caught was a test was expanding a folder before
                // all of the other shells were rendered. The contents of the folder
                // wasn't expanded because it's timeout was overwriten by the
                // previous timeout targeting the end of the list. We never came back
                // to the top of the list.
                //
                // timeout gets set first.
                item.setProperty('renderShell', false);
            }
        };

        view.appendAllItemViews = function() {
            if (!this.$items) return;
            var len = this.model.getItemCount();
            for (var i = 0; i < len; i++) {
                var item = this.model.getItemByIndex(i);
                var view = this.getItemView(item.id);
                view.appendTo(this.$items);
            }

            this.updateWidth();
            this.renderVisibleSections();
        };

        // holds a copy of the each item's view for later reference

        view.getItemView = function(id) {
            return this.__itemViews[String(id)];
        };

        view.onDelete = function(view) {
            var self = this;
            var animationDuration = 0.2;
            view.$().css({
                'transition': animationDuration + 's',
                'opacity': '0',
                'transform': "scale(.1, .1)"
            });
            setTimeout(function() {
                self.model.removeItemAt(view.model.index);
                if (self.model.getItemCount() === 0) {
                    var new_sec = Section(undefined, self.model);
                    self.model.insertItemAt(0, new_sec);
                }
            }, 1000 * animationDuration);
        };

        view.onUpPressed = function(view) {
            // nothing above
            if (view.model.index === 0) return;

            this.selectPrevSection(view.model);
            this.getSelectedView().addFocus('end');
        };

        view.onDownPressed = function(view) {
            this.selectNextSection(view.model);
            this.getSelectedView().addFocus('start');
        };

        view.onBackspacePressed = function(view) {

            this.upwardDeleteSection(view);

            this.getSelectedView().addFocus('end');
        };

        view.onDelPressed = function(view) {
            this.downwardDeleteSection(view.model);
            this.getSelectedView().addFocus('start');
        };

        view.onEnterPressed = function(view) {


            var obj = Section({
                selected: true
            }, this.model);
            var self = this;
            var insertIndex = view.model.index + 1;
            //insert below the last element of a collapsed folder
            if (view.model.isFolder && view.model.collapsed) {
                insertIndex += _(view.model.memberIds).keys().length;
            }

            self.model.insertItemAt(insertIndex, obj);
            if (view.model.isFolder && !view.model.collapsed) {
                view.model.addItem(obj);
            }
            if (view.model.folder) view.model.folder.addItem(obj);

            this.getSelectedView().addFocus();
        };

        view.sectionsVisible = true;
        view.hideSections = function() {
            // deselect section
            this.model.setSelected(null);
            conditionalBlur();
            //note: the above 2 lines should do this, and this next call should be a no-op. Adding in one last
            //line of defense. See: https://github.com/desmosinc/knox/issues/4580
            this.setProperty('sectionsVisible', false);
        };

        view.showSections = function() {
            this.setProperty('sectionsVisible', true);
            conditionalBlur();
        };



        view.renderEditListMode = function() {
            var $root = this.$root;
            var self = this;

            if (this.editListMode) {
                $root.addClass('tlab-EDIT-LIST-MODE');
                this.model.setSelected(null);
                // listen for a tlab-tapstart event to close edit-list-mode
                $(document).on('tlab-tapstart.edit-list-mode', function(evt) {
                    if (
                        $(evt.target).closest('.tlab-exppanel').length === 0 &&
                        $(evt.target).closest('.tlab-options-menu').length === 0 &&
                        $(evt.target).closest('.tlab-parameter-top-bar').length === 0
                    ) {
                        self.setProperty('editListMode', false);
                    }
                });
            } else {
                $root.removeClass('tlab-EDIT-LIST-MODE');
                // don't listen for the event to close edit-list-mode anymore
                $(document).off('.edit-list-mode');
            }
        };

        /*
         * EVENTS
         */
        view.handleFocusChange = function(focused) {
            var target = $(focused);

        };

        view.onFocusIn = function(evt) {

            //it's possible to add focus to an section even when the sections are hidden.
            // Most prominently: if you click a curve to select it and then type
            // If that happens, we want to show the section that's being edited, so pop back out the sections list
            if (!this.sectionsVisible) {
                this.showSections();
            }

            // sometimes mathquill notifies of focusin before the focus is set. So we have to
            // pass in where focus is about to be rather than simply use document.activeElement.
            this.handleFocusChange(evt.target);

            clearTimeout(this.fakeKeypadTimeout);
        };

        view.onFocusOut = function() {
            clearTimeout(this.fakeKeypadTimeout);
            // setTimeout here is used to coalesce calls to onFocusOut and onFocusIn
            // that happen in the same tick. This happens, e.g. when a new
            // parameter is created, and we move focus from the previous parameter
            // to it.
            this.fakeKeypadTimeout = setTimeout(function() {

                // Mathquill does something weird where it triggers a focusout on
                // render, but nothing actually happens to focus. To combat that, and
                // anything else similar, we check what's actually focused
                this.handleFocusChange(document.activeElement);

            }.bind(this), 0);
        };

        view.offset = function() {
            return this.$secs.offset();
        };

        view.setBottom = function(bottom) {
            if (!this.$secs) return;
            var oldBottom = parseFloat(this.$secs.css('bottom').slice(0, -2));
            if (!isFinite(oldBottom)) oldBottom = 0;
            this.$secs.css('bottom', bottom + 'px');

            //If the user is currently in a mouse interaction and the height
            //is increasing, pad the last parameter until they end their interaction to
            //prevent things from moving under them
            if (bottom === 0 && touchtracking.isTapActive()) {
                this.padLastSectionUntilTapEnd(oldBottom);
            }
            this.recalculateScrollbarWidth();
        };

        view.didCreateElement = function() {
            var self = this;
            var list = this.model;

            _super.didCreateElement.call(this);

            this.$secs = this.$('.tlab-secpanel-outer');

            this.addSectionView = AddSectionView(this, this.$root, this.graphSettings);
            this.addExpressionView.appendTo(this.$secs);
            this.addExpressionView.setupOpenButton(this.$('.tlab-action-add-section'), 'tlab-tap');
            this.observe('scrollbarWidth minWidth', this.updateAllViewWidths.bind(this));

            this.$secs.tipsy({
                fade: 'fast',
                title: 'tooltip',
                wait: 500,
                delegate: '.tlab-tooltip'
            });

            this.$secpanelContainer = this.$('.tlab-secpanel-container');
            this.$secpanel = this.$('.tlab-secpanel');
            this.$items = this.$('.tlab-template-sectioneach');

            this.appendAllItemViews();

            //
            //listen for scroll. add class when scrolled, and set renderShells=false
            //

            var debouncedScroll = _.debounce(function(evt) {
                if (evt) this.$('.tlab-section-top-bar').toggleClass(
                    'tlab-sections-scrolled',
                    $(evt.target).scrollTop() > 0
                );
                this.renderVisibleSections();
            }.bind(this), 200);

            this.$secpanel.scroll(function(evt) {
                //stop rendering offscreen things immediately -- don't wait for debounce
                clearTimeout(self.renderSectionTimeout);
                debouncedScroll(evt);
            });

            //
            // for iPad & nexus, listen for taps in the empty area underneath an parameter and defocus
            // because that doesn't happen automatically. The way I'm detecting such a tap is by checking if the
            // event is within an .parameteritem. If it's not, we're assuming the tap is within empty space.
            //
            this.$secpanel.on('tlab-tapstart', function(evt) {
                // avoids losing focus when on desktop and we mouseDown on the scrollbar. If we want to lose foucs in
                // that case, this line is perfect to remove. If we want something more robust to detect that we're
                // on the scrollbar, we might be able to check x position of the event compared to the width of the
                // inner content.
                if (evt.device === 'mouse') return;

                if ($(evt.target).closest('.tlab-sectionitem').length === 0) {
                    conditionalBlur();
                }
            });

            this.$secpanel.on('keypress', this.ensureActiveChildIsVisible.bind(this));

            //the below should happen automatically, but doesn't on iPad / android
            //this lets you defocus the currently focused parameter by clicking the 'Expressions' header
            this.$('.tlab-section-top-bar').on('tlab-tapstart', function(evt) {
                if (evt.wasHandled()) return;
                list.setSelected(null);
            });


            this.$secs.on('tlab-tap', '.tlab-action-clearall', function() {
                self.triggerEvent('ClearTest');
            });


            this.$secs.on('focusout', this.onFocusOut.bind(this));
            this.$secs.on('focusin', this.onFocusIn.bind(this));

            this.$('.tlab-action-hidesections').on('tlab-tap', this.hideSections.bind(this));
            this.$('.tlab-action-showsections').on('tlab-tap', this.showSections.bind(this));
            // Relies on handleKeyDown returning early if no parameter is selected for
            // correctness when there are multiple calculators in the page. This means
            // we want to have the invariant that only one list_view can have a selected
            // item at a time.
            $(document.documentElement).on('keydown', this.handleKeyDown.bind(this));

            this.renderItemFocused();
            this.renderEditListMode();

            this.newSectionView = NewSectionView(this);
            this.newSectionView.replace(this.$('.template-newsection'));
            this.newSectionView.setProperty('index', this.model.getItemCount() + 1);

            // whenever mathquill renders
            this.$secs.on('render', function(evt) {
                self.updateWidth();
            });

            // these things all factor into how wide the parameter list is, so we watch them
            this.model.observe('selectedItem', function() {
                self.updateWidth();
            });
            this.observe('editListMode itemFocused', function() {
                self.updateWidth();
            });

            // any time that focus changes we need to make sure that a part of the page doesn't
            // scroll in order show the cursor. this is specifically important for IE9 and tables.
            // In IE9 there will be a quick flash when the parameter list is scrolled back to 0,0
            // but I can't find anything that happens synchronously. I've tried:
            //    1) Listening to changes to selectedCell of the selected table
            //    2) Listening for 'scroll' event on the element that gets scrolled
            //
            // both of those still show a quick flash, so this is the chosen method since it's
            // the simplest and most general.
            this.$secs.on('focusin', function() {
                setTimeout(function() {
                    self.updateWidth();
                }, 0);
            });
        };

        view.didInsertElement = function() {
            this.updateWidth();
            this.$secpanelContainer.addClass('tlab-do-animate');
        };

    });

    view.getFirstVisibleItem = function() {
        var top = this.$secpanel.offset().top;
        var el = this.sectionAtPoint(0, top);

        if (!el) {
            return this.model.getItemByIndex(0);
        }
        //make sure it's fully visible
        if (this.getItemView(el.id).$().offset().top < top - 2) { //Allow for overlapping borders
            el = this.model.getItemByIndex(el.index + 1);
        }
        return el;
    };

    view.appendBlankSection = function() {
        this.newSectionView.newSection();
    };

    // Find the view for the selected parameter and scroll that parameter
    // into view. If the parameter doesn't have a view yet, we'll let the
    // view call this once it's inserted into the dom. If there is no selected
    // view, then check if there's a focused view. If so, scroll that until
    // it's visible
    view.ensureActiveChildIsVisible = function() {
        if (!this.$secs || !this.$secs.is(':visible')) return;
    };

    view.handleKeyDown = function(evt) {
        /* jshint maxcomplexity:26 */
        // make sure nothing has focus
        if ($.contains(document.body, document.activeElement)) {
            return;
        }

        // make sure event didn't happen from within parameter list
        if ($(evt.target).closest('.tlab-secpanel').length) {
            return;
        }

        // make sure target is still in dom. fixes #3282
        if (!$.contains(document.documentElement, evt.target)) {
            return;
        }

        var selected = this.getSelectedView();
        if (selected && selected.isFocused()) {
            selected.processMissedKeyEvent(evt);
            return;
        }
        var key = Keys.lookup(evt);

        if (!selected) return;

        switch (key) {
            case Keys.UP:
                evt.preventDefault();
                this.selectPrevSection(selected.model);
                break;

            case Keys.DOWN:
                evt.preventDefault();
                this.selectNextSection(selected.model, true);
                break;
            case Keys.ESCAPE:
                evt.preventDefault();
                this.model.setSelected(null);
                break;

            case Keys.RIGHT:
            case Keys.TAB:
                evt.preventDefault();
                if (selected) {
                    if (selected.model.isTable) {
                        selected.addFocus('cell', 0, 0);
                    } else {
                        selected.addFocus('start');
                    }
                }
                break;

            case Keys.LEFT:
                evt.preventDefault();
                if (selected) {
                    if (selected.model.isTable) {
                        selected.addFocus('cell', 0, selected.model.columns.length - 1);
                    } else {
                        selected.addFocus('end');
                    }
                }
                break;

            case Keys.BACKSPACE:
                evt.preventDefault();
                if (selected) {
                    this.upwardDeleteSection(selected);
                }
                break;

            case Keys.DELETE:
                evt.preventDefault();
                if (selected) {
                    this.downwardDeleteSection(selected);
                }
                break;

            case Keys.ENTER:
                evt.preventDefault();
                if (selected) this.onEnterPressed(selected);
                break;

            default:
                //ignore things like ctrl-copy, ctrl-paste, alt-tab, shift
                if (evt.metaKey ||
                    evt.ctrlKey ||
                    key === Keys.SHIFT ||
                    key === Keys.SPACEBAR
                ) {
                    return;
                }

                if (selected) {
                    if (selected.model.isTable) {
                        // do nothing since we don't know where to type
                    } else {
                        selected.addFocus('end');
                    }
                }
        }

        /*
         * PUBLIC METHODS
         */
        view.getSelectedView = function() {
            var selected = this.model.getSelected();
            if (selected) {
                var view = this.getItemView(selected.id);
                return view;
            }

            return null;
        };

        view.upwardDeleteSection = function(sectionView) {
            var index = sectionView.model.index;
            var prev = this.model.getItemByIndex(this.findPrevSelectableIndex(index));

            if (prev) {
                this.model.setSelected(prev);
                this.model.removeItemAt(index);
            } else {
                this.onDelete(sectionView);
            }
        };

        view.findPrevSelectableIndex = function(index) {
            var item;

            index--;
            item = this.model.getItemByIndex(index);

            return item ? index : undefined;
        };

        view.findNextSelectableIndex = function(index) {
            var item;

            index++;
            item = this.model.getItemByIndex(index);

            return item ? index : undefined;
        };

        view.downwardDeleteSection = function(sectionView) {
            var index = sectionView.model.index;
            var next = this.model.getItemByIndex(this.findNextSelectableIndex(index));

            if (next) {
                this.model.setSelected(next);
                this.model.removeItemAt(index);
            } else {
                this.onDelete(sectionView);
            }
        };

        view.selectPrevSection = function(section) {
            if (!section) return;

            var index = section.index;
            var prev = this.model.getItemByIndex(this.findPrevSelectableIndex(index));

            if (prev) {
                prev.setProperty('selected', true);

                // check if this was an empty last section
                // if so, remove it
                if (index === this.model.getItemCount() - 1 && section.isEmpty()) {
                    this.model.removeItemAt(index);
                }
            }
        };

        view.selectNextSection = function(section, dontCreateNew) {
            if (!section) return;

            var index = section.index;
            var next = this.model.getItemByIndex(this.findNextSelectableIndex(index));

            if (next) {
                next.setProperty('selected', true);
            } else if (!dontCreateNew) {
                var obj = Section({
                    selected: true
                }, this.model);
                this.model.insertItemAt(this.model.getItemCount(), obj);
            }
        };

        /*
         * Returns a list of visible section views, ordered by index.
         */
        view._getVisibleViews = function() {
            var visibleViews = [];

            for (var i = 0; i < this.model.getItemCount(); i++) {
                var sec = this.model.getItemByIndex(i);
                var view = this.getItemView(sec.id);
                if (view && view.$().is(':visible')) visibleViews.push(view);
            }

            return visibleViews;
        };

        /*
         * Does a binary search to find the .secttionitem that is at the point
         */
        view.sectionAtPoint = function(x, y) {
            var visibleViews = this._getVisibleViews();
            var lo = 0;
            var hi = visibleViews.length - 1;

            while (lo <= hi) {
                var mid = lo + Math.floor((hi - lo) / 2);
                var view = visibleViews[mid];
                var rect = view.getBounds();

                if (rect.top > y) {
                    hi = mid - 1;
                } else if (rect.bottom < y) {
                    lo = mid + 1;
                } else {
                    return view.model;
                }
            }

            return null;
        };

        /*
         * Finds the first section at or above the point
         */
        view.sectionAbovePoint = function(x, y) {
            var visibleViews = this._getVisibleViews();
            var lo = 0;
            var hi = visibleViews.length - 1;
            var found = null;

            while (lo <= hi) {
                var mid = lo + Math.floor((hi - lo) / 2);
                var view = visibleViews[mid];
                var rect = view.getBounds();

                if (rect.top > y) {
                    hi = mid - 1;
                } else {
                    lo = mid + 1;
                    found = view.model;
                }
            }

            return found;
        };

    };

    return SectionList;
});