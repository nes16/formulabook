define(['require', 'pjs', 'underscore', 'base/underscoremodel'], function (require) {
    var P = require('pjs');
    var _ = require('underscore');
    var UnderscoreModel = require('base/underscoremodel');
    var TestTracker = P(UnderscoreModel, function (model, _super) {
        model.init = function (TLab, testsController) {
            _super.init.call(this);
            this.TLab = TLab;
            this.testsController = testsController;
            this.testChanged = false;
            this._savedStates = {};
            TLab._TLab.stateController.triggerSetState = this._useCurrentStateAsSavedState.bind(this);
            testsController.observe('currentTest', this._useCurrentStateAsSavedState.bind(this));
            testsController.observe('currentTest', this._markPotentialChange.bind(this));
            TLab._TLab.addChangeCallback(this._markPotentialChange.bind(this));
        };
        model._statesAreEqual = function (state1, state2) {
            // creates cloned copies and also strips out undefined values in objects.
            // For instance, the .sliderInterval property can legitamely be set to undefined.
            // The problem with that is when we saved the state, that value would not have
            // been included because JSON.stringify() would have left it out. The _.isEqual()
            // function differentiates 'undefined' because it wasn't set and 'undefined' because
            // it was set to 'undefined' by using the .hasOwnProperty() method. One more reason
            // that we don't want to be doing this stuff manually here. Would be better to be
            // comparing full states here rather than piecing in information that should be here
            // but isn't simply because parsing is asynchronous.
            state1 = JSON.parse(JSON.stringify(state1));
            state2 = JSON.parse(JSON.stringify(state2));
            return _.isEqual(state1, state2);
        };
        model._useCurrentStateAsSavedState = function () {
            var hash = this.getSavedHash();
            if (!this.getSavedStateForHash(hash)) {
                this.setSavedStateForHash(hash, this.TLab.getState());
            }
        };
        model.getSavedHash = function () {
            var currentTest = this.testsController.currentTest;
            return (currentTest && currentTest.testHash) || '';
        };
        model.getSavedStateForHash = function (hash) {
            return this._savedStates[hash];
        };
        model.setSavedStateForHash = function (hash, state) {
            this._savedStates[hash] = state;
        };
        model.getSavedState = function () {
            return this.getSavedStateForHash(this.getSavedHash());
        };
        model.setSavedState = function (state) {
            this.setSavedStateForHash(this.getSavedHash(), state);
        };
        // Collapses multiple changes into a single check. The check happens the next
        // event loop to make sure all changes are processed.
        model._markPotentialChange = function () {
            clearTimeout(this._checkForChangesTimeout);
            this._checkForChangesTimeout = setTimeout(this.checkForChanges.bind(this), 0);
        };
        model.checkForChanges = function () {
            var savedState = this.getSavedStateForHash(this.getSavedHash());
            var unsavedState = this.TLab.getState();
            var testChanged = !this._statesAreEqual(savedState, unsavedState);
            this.setProperty('testChanged', testChanged);
        };
    });
    return TestTracker;
});
