define( ['require', 'pjs', 'base/underscoremodel', 'utils/parsejsonerrors','i18n', 'backend', 'tests/file', 'math/randomhash'], function(require) {
    var P = require('pjs');
    var _ = require('underscore');
    var UnderscoreModel = require('base/underscoremodel');
    var backend = require('backend');
    var Test = require('tests/file');
    var randomHash = require('math/randomhash');
    var i18n = require('i18n');
    var parseJSONErrors = require('utils/parsejsonerrors');

    var TestsController = P(UnderscoreModel, function(tc, _super) {

        tc.init = function(testlab, randomSeed) {
            _super.init.call(this);
            this.observe('currentTest', this.onCurrentTestChange.bind(this));
            this.content = [];

           
            this.testlab = testlab;
            
            this.myEvents = ['startSaving','saveSuccess','saveError','driveAccessError','startUpdatingTests','updateTestsSuccess','updateTestsError','testAdded'
                            ,'cleared','testRemoved'];
            this.randomHash = randomHash;
            this.seedRandom(randomSeed);
            this.__visitedTests = {};
        }

        tc.hasEvent = function(evt){
          return (this.myEvents.indexOf(evt) >= 0);
        }

        tc.seedRandom = function(seed) {
            var d = new Date();
            var augmentedSeed = '' + seed + d.getTime() + d.getMilliseconds();
            this.randomHash.init(augmentedSeed);
        };

        tc.remove = function (test) {
          var index = this.getIndexFromTest(test);
          this.content.splice(index, 1);
          this.triggerEvent('testRemoved', index);
          backend.removeTest(test);
        };




        tc.clear = function () {
          this.content = [];
          this.triggerEvent('cleared');
        };

        // Update state and screenshot
        tc.updateTestData = function (test) {
          var state = JSON.stringify(this.testlab.getState());
          test.setProperty('testState', state);
          test.setProperty('parentHash', test.testHash);
          test.setProperty('testHash', this.randomHash.next());
        };

        tc.saveAs = function (test) {
          this.save(test, true);
        };

        //do_not_overwrite flag -- only exposed to tc.saveAs
        tc.save = function (test, do_not_overwrite) {

          var oldTest = this.currentTest;
          var self = this;

          self.triggerEvent('startSaving');

          // about to modify the test, so we make sure we modify the copy, not the original
          test = test.copy();
          self.updateTestData(test);

          backend.saveTest(test).done(function(test) {


            // Don't call loadTest here because we don't want to trigger a
            // setState on save.

            // copy test so that what goes into my_tests list isn't the exact
            // same object as what's stored in currentTest.
            self.setProperty('currentTest', test.copy());
            self.content.unshift(test);
            self.triggerEvent('testAdded', {index:0});
            self.triggerEvent('saveSuccess');

            if (!do_not_overwrite && oldTest) {
              self.remove(oldTest);
            }

          }).fail(function(jqXHR) {
            var error = parseJSONErrors(jqXHR)[0];
            if (error.key === 'drive_access_error') self.triggerEvent('DriveAccessError', error);
            self.triggerEvent('SaveError');
          });
        };
        //is this the stablest way to do this?
        tc.getIndexFromTest = function (test) {
          for (var index = 0 ; index < this.content.length ; index++) {
            if (test.testHash === this.content[index].testHash) return index;
          }
          return -1;
        };

        tc.updateTests = function () {
          var self = this;
          self.triggerEvent('startUpdatingTests');
          backend.getTests().done(function (msg) {
            var tests;
            if (msg.mytests) tests = msg.mytests.map(Test.fromAjax);
            self.content = tests;
            self.lazyLoadTestStates();
            self.triggerEvent('updateTestsSuccess');
          }).fail(function () {
            self.triggerEvent('updateTestsError');
          });
        };

        tc.lazyLoadTestStates = function () {
          var imax = 20;

          var self = this;
          var loadOne = function (i) {
            if (i >= self.content.length || i >= imax) return;
            self.content[i].fetchData().then(function () { loadOne(i+1); });
          };

          loadOne(0);
        };


        tc.loadTest = function (test) {
          var self = this;
          // set the sate. this itself is going to add to undo/redo stream to
          self.testlab.setState(test.testState);

          // set the currentTest. This will add to undo/redo as well.
          self.setProperty('currentTest', test);
        };

        tc.clearTest = function () {
          this.loadTest(Test());
          this.testlab._TLab.addFocus();
        };

        tc.onCurrentTestChange = function () {
          var currentTest = this.currentTest;
          document.title = currentTest.title || i18n.t('Testlab Test');
          this.pushState(currentTest);
        };

        
          // We used to push the test object onto the history state stack
          // directly, but Firefox has a limit of 640kB for objects in the state
          // stack, and we now allow single images that are larger than that.
        tc.pushState = function (test) {
          if (!(window.history && history.pushState)) return;
            this.__visitedTests[test.testHash] = test;

          var path = test.path;
          if (!path) return;
          if (window.location.search) path += window.location.search;
          if (path !== window.location.href) {
            history.pushState(
              test.testHash,
              test.title,
              path
            );
          }
        };

        tc.popState = function (evt) {
          //If you have unsaved work, back will take you *not* to your last on this test
          //But to the save (or load) before that. This warns you in the same way
          //That reload or a hard back does.
          if (this.testlab.hasUnsavedChanges()) {
            if (!confirm(i18n.t("Are you sure you want to leave this test? Your unsaved work will be lost."))) {
              history.forward();
              return;
            }
          }

          var hash = evt.originalEvent.state;

          if (hash === null) {
            // If there is null state then we came from the calculator, but from a blank (or unsaved one) test.
            this.loadTest(Test());
            return;
          } else if (this.currentTest.testHash === hash) {
            //If we read a popstate but the user wants to cancel it,
            //We execute a ".forward()". This triggers another popstate,
            //but right back to the test we started with. We don't need to do
            //anything in this case.
            return;
          } else if (this.__visitedTests.hasOwnProperty(hash)) {
            var test = this.__visitedTests[hash];
            this.loadTest(test);
            //Toast when you navigate between tests
            var testTitle;
            if (!test.title) {
              testTitle = i18n.t('Untitled Test');
            } else {
              if (test.title.length > 15) {
                testTitle = test.title.substr(0,15) + '...';
              } else {
                testTitle = test.title;
              }
            }

            var str = i18n.t("Opened '__testTitle__'", {testTitle: testTitle});
            //include a blank undo function so that the "undo" option still shows up
            //this.testlab._TLab.toast(str, { undoCallback: function () {} });
          } else {
            this.loadTest(Test());
            return;
          }
        };        

    });

    return TestsController;
});
