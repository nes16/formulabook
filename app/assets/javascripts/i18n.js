define(['require', 'config', 'utils/cookie', 'localesall', 'underscore'], function(require) {
    var Config = require('config');
    var Cookie = require('utils/cookie');
    var locales = require('localesall');
    var _ = require('underscore');
    var default_lang = '';
    var language_dict = {};

    //this is a list of enabled languages -- i.e. ones that show up in the language dropdown
    //languages not on this list can still be accessed through the query parameter, but not
    //through the cookie or the browser preferences
    var enabled_languages = {
        'en': {
            displayName: 'English (US)',
            userGuideURL: 'https://desmos.s3.amazonaws.com/Testlab_User_Guide.pdf'
        },
        'en-GB': {
            displayName: 'English (GB)',
            userGuideURL: 'https://desmos.s3.amazonaws.com/Testlab_User_Guide.pdf'
        },
    };

    function init(lang, dict) {
        default_lang = lang || '';
        language_dict = dict || {};
    }

    function translateString(message, variables) {
        var translation = language_dict[default_lang] && language_dict[default_lang][message] || message || '';

        for (var variable in variables) {
            if (variables.hasOwnProperty(variable)) {
                translation = translation.split('__' + variable + '__').join(variables[variable]);
            }
        }

        return translation;
    }

    //this function looks through users preferences to determine what language to show
    //order is:
    //  Config (i.e. query parameter): this doesn't require the lanague to be enabled
    //  Cookie: this *does* require that the language is enabled
    //  Browser settings: does require enabled
    //  Truncated version of browser setting: does require enabled
    //
    //If none of those works, we fall back to 'en' (which is actually ignored by our i18n_dict)
    function detectLanguage() {
        if (Config.get('lang')) {
            return Config.get('lang');
        }

        var preferences = [Cookie.getCookie('lang')];

        //auto detect locales
        if (!Config.get('disablelocale')) {
            var browserLocale;
            if (navigator.userLanguage) {
                browserLocale = navigator.userLanguage;
            } else {
                browserLocale = navigator.language;
            }

            var baseLocale = browserLocale.split('-')[0];
            //first choice: exact dialect
            preferences.push(browserLocale);
            //second choice: root level locale
            preferences.push(baseLocale);
            //third choice: dialect that shares the root and has useAsRoot: true
            _.each(enabled_languages, function(lang, code) {
                if (
                    code.split('-')[0] === baseLocale &&
                    lang.useAsRoot
                ) preferences.push(code);
            });
        }

        for (var i = 0; i < preferences.length; i++) {
            var lang = preferences[i];
            if (enabled_languages.hasOwnProperty(lang)) return lang;
        }
        return 'en';
    }

    function currentLanguage() {
        return default_lang;
    }

    //when we want to send translatable strings out from the worker, we JSON.stringify
    //{msg: message, vars: variables}.
    //unpack that all here.
    var unpack = function(str) {
        //numbers are JSON.parse-able, so catch this situation and return early.
        //can arise when this is called recursively from an unpack
        if (typeof(str) === 'number') return str;

        var returnVal;
        try {
            var data = JSON.parse(str);
            //elements of data.vars could also be i18n strings. recursively unpack.
            for (var key in data.vars) {
                data.vars[key] = unpack(data.vars[key]);
            }
            returnVal = translateString(data.msg, data.vars);
        } catch (ex) {
            //we sometimes just send back non-json-encoded strings (i.e. if we don't need to interpolate)
            returnVal = translateString(str);
        }
        return returnVal;
    };


    // automatically initialize i18n module
    //
    // Tests can call this again to change
    // language. We need to init ASAP so that
    // translations work immediately after
    // loading the i18n module.
    init(detectLanguage(), locales);

    return {
        init: init,
        t: translateString,
        detectLanguage: detectLanguage,
        currentLanguage: currentLanguage,
        enabled_languages: enabled_languages,
        unpack: unpack
    };
});
