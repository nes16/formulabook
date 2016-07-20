define( ['require', 'jquery', 'tests/file', 'config'], function(require) {
    var $ = require('jquery');
    var Config = require('config');
    var Test = require('tests/file');


    var testlabBackend = {
        //Test related
        _saveTest: function(test, isPvt) {
            //var push_to_drive = ($('input[name="push_to_drive"]').attr("checked") ? "push_to_drive" : undefined);
            //var access = ($('input[name="access"]').attr("checked") ? "all" : "link");
            var formData = {
                parenthash: test.parentHash,
                thumbdata: test.thumbURL,
                testHash: test.testHash,
                version: 'v1',
                accesss: test.accesss,

                title: test.title || undefined,
            };

            formData.testState = test.testState;
            
            return $.post('/api/v1/testlab/save', formData).then(function(resp) {
                Test.updateFromSync(test, resp);
                return test;
            });
        },

        saveTest: function(test) {
            return this._saveTest(test, true);
        },

        shareTest: function(test) {
            return this._saveTest(test, false);
        },

        emailTest: function(data) {
            return $.post('/api/v1/testlab/emailtest', data);
        },

        emailFeedback: function(data) {
            return $.post('/api/v1/testlab/emailfeedback', data);
        },

        getTests: function() {
            return $.getJSON('/api/v1/testlab/mytests');
        },

        getUnits: function() {
            return $.getJSON('/api/v1/testlab/units');
        },

        getProperties: function() {
            return $.getJSON('/api/v1/testlab/properties');
        },

        removeTest: function(test) {
            return $.post('/api/v1/testlab/remove', {
                hash: test.testHash
            });
        },

    };

    return testlabBackend;
});
