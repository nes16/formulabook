import $ = require('jquery');
import Config = require('config');
import LOAD_DATA = require('utils/loaddata');
import TestsController = require('tests/controller');
import TestLabAPI = require('testlabapi');
import ModalsController = require('modals/controller');
import HeaderDesktop = require('headerdesktop');
import UserController = require('account/controller');
import TestTracker = require('tests/tracker');
import TestFile = require('tests/file');
import Browser = require('utils/browser');
import touchtracking = require('device/touchtracking');

var options = Config.all();
options.globalKeyboardUndo = true;
options.redrawSlowly = !Browser.IS_MOBILE;
options.border = false;

var elt = document.getElementById('test-container');

var TLab = TestLabAPI(elt, options);

var testsController = TestsController(TLab, LOAD_DATA.seed);

var userController = UserController(testsController);
window.userController = userController;

var modalsController = ModalsController(userController, testsController);
var modals = modalsController.modals;

var headerDesktop = HeaderDesktop(userController,
    testsController,
    TLab,
    modals);

TLab.testTracker = TestTracker(TLab, testsController);

TLab.testTracker.observe('testChanged', function() {
    headerDesktop.setProperty('testChanged', TLab.hasUnsavedChanges());
});

TLab.hasUnsavedChanges = function() {
    return TLab.testTracker.testChanged;
};

//This top-level location should becomes the place where all nontrivial document.ready() activities happen
$(document).ready(function() {
    /* jshint maxcomplexity: 11 */

    //Setup save shortcut listener
    $(document).bind('keydown', headerDesktop.handleKeydown.bind(headerDesktop));

    modalsController.ready();
    //Show warning modal for unsupported browsers (because of screensize, for example)
    if (Browser.IS_ANDROID && !Browser.IS_CHROME) {
        modals.unsupportedBrowserDialog.show();
    } else if (!userController.currentUser &&
        document.location.search.match(/(\?|\&)create_account/)
    ) {
        modals.createAccountDialog.show();
    }

    headerDesktop.appendTo('.tlab-header');

    $('.tlab-loading-div').fadeOut();

    // Process LOAD_DATA
    if (LOAD_DATA.user) userController.completeLogin(LOAD_DATA.user, 'load');

    if (LOAD_DATA.flash) {
        TLab._testlab.toast(LOAD_DATA.flash);
    }

    if (LOAD_DATA.test) {
        testsController.loadTest(TestFile.fromAjax(LOAD_DATA.test));
    } else {
        // The test state either needs to be set or cleared.
        testsController.clearTest();
    }
});
export = TLab;
