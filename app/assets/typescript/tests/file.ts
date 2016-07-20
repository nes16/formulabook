define(['require', 'jquery', 'pjs', 'base/underscoremodel', 'utils/urlprefix', 'utils/displaydate','i18n'], function(require) {
    var P = require('pjs');
    var UnderscoreModel = require('base/underscoremodel');
    var URL_PREFIX = require('utils/urlprefix');
    var i18n = require('i18n');
    var DisplayDate = require('utils/displaydate');
    var $ = require('jquery');

    var TestFile = P(UnderscoreModel, function(test, _super) {

        var properties = [
            'title',
            'tester',
            'testHash',
            'parentHash',
            'stateURL',
            'access',
            'created',
            'testState'
        ];

        test.init = function(obj) {
            _super.init.call(this);
            var self = this;
            this.observe('title', function() {
                self.displayTitle = self.title || '[' + i18n.t('Untitled Test') + ']';
            });
            this.observe('created', this.updateDisplayDate.bind(this));
            this.observe('testHash', function() {
                self.setProperty(
                    'path',
                    URL_PREFIX + (self.testHash ? '/' + self.testHash : '')
                );
            });

            if (obj) {
                properties.forEach(function(p) {
                    if (obj.hasOwnProperty(p)) self.setProperty(p, obj[p]);
                });
            }
            if (!this.access) this.setProperty('access', 'all');
            if (!this.path) this.setProperty('path', URL_PREFIX);
        };

        test.copy = function() {
            return TestFile(this);
        };

        test.updateDisplayDate = function () {
          this.displayDate = DisplayDate.compute(this.created);
        };
        test.plainObject = function () {
          var out = {};
          var self = this;
          properties.forEach(function (p) {
            out[p] = self[p];
          });
          return out;
        };

        test.fetchData = function () {
          var d = $.Deferred();
          var self = this;
          if (self.testState) {
            setTimeout(function () { d.resolve(self.testState); }, 1);
          } else {
            // For the benefit of IE9's XDomainRequest restrictions, need to make
            // sure that we use the same scheme to request the test state.
            var sameSchemeStateURL = (self.stateURL.slice(0, 6) === 'https:') ?
              window.location.protocol + self.stateURL.slice(6) :
              self.stateURL
            ;

            var request = $.getJSON(sameSchemeStateURL);

            // Cache testState for future calls
            request.then(function (msg) { self.testState = msg.testState; });
            // Pass response through to returned promise
            request.then(d.resolve.bind(d), d.reject.bind(d));
          }
          return d.promise();
        };


    });

    TestFile.fromAjax = function(obj) {
        return TestFile({
            title: obj.title,
            stateURL: obj.stateURL,
            testHash: obj.testHash,
            parentHash: obj.parentHash,
            access: obj.access,
            created: new Date(obj.created)
        });
    };

    TestFile.updateFromSync = function(obj, resp) {
        obj.setProperty('title', resp.title);
        obj.setProperty('testHash', resp.testHash);
        obj.setProperty('testState', obj.testState);
        obj.setProperty('parentHash', resp.parenthash);
        obj.setProperty('stateURL', resp.stateURL);
        obj.setProperty('created', new Date(resp.created));
    };

    return TestFile;

});