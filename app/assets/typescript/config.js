define(["require", "exports", 'utils/clone'], function (require, exports, clone) {
    var config = {};
    // Parse query parameters from the url search.
    //
    // config options here have 2 purposes:
    //  * desktop-calc specific options (testing, preview, maintenance, language menu)
    //  * testing api options (nofolders, etc)
    var query = location.search;
    if (query[0] === '?')
        query = query.slice(1);
    var paramStrings = query.split('&'), params = {};
    for (var i = 0; i < paramStrings.length; i++) {
        var pair = paramStrings[i].split('=');
        params[pair[0]] = (pair.length === 2) ? pair[1] : true;
    }
    // Settings on window.Testlab.config override url parameters
    if (window.TLab && window.TLab.config) {
        for (var k in window.TLab.config) {
            if (window.TLab.config.hasOwnProperty(k))
                params[k] = window.TLab.config[k];
        }
    }
    var checkOption = function (option) {
        return params.hasOwnProperty(option);
    };
    var addOption = function (option) {
        if (checkOption(option))
            config[option] = true;
    };
    //starts "no", i.e. "nographpaper" => graphpaper: false
    var addInverseOption = function (option) {
        if (checkOption("no" + option))
            config[option] = false;
    };
    //desktop specific options
    addOption('testing');
    addOption('maintenance');
    addOption('disablelocale');
    addOption('detectlocale');
    addOption('secure');
    addOption('nativeOnscreenKeypad');
    if (params.lang)
        config.lang = params.lang;
    // Disable navigation warning -- Eric likes not having this in noconcat. Eli likes it in startlivecss
    if (checkOption('noconcat'))
        config.no_navigation_warning = true;
    //API options for testing
    addOption('lockViewport');
    addOption('resizeLoop');
    //note: on desktop, this won't work when you open a blank graph because we add focus
    //and that automatically uncollapses. Need to test on a non-blank state or in ?embed
    addOption('parametersCollapsed');
    addInverseOption('images');
    addInverseOption('folders');
    addInverseOption('menus');
    addInverseOption('zoomButtons');
    addInverseOption('keypad');
    addInverseOption('graphpaper');
    addInverseOption('parameters');
    addInverseOption('parametersTopbar');
    addInverseOption('settingsMenu');
    addInverseOption('branding');
    addInverseOption('singlevarsolutions');
    addInverseOption('s3upload');
    if (config.secure) {
        config.singlevarsolutions = false;
    }
    if (params.nworkers) {
        config.nworkers = params.nworkers;
    }
    return {
        get: function (prop) {
            return config[prop];
        },
        all: function () {
            return clone(config);
        }
    };
});
