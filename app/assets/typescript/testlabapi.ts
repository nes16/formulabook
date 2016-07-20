define(['require','utils/console','pjs','underscore','testlabembed'
    ,'utils/browser','config','utils/colors'], function(require) {
    var P = require('pjs');
    var TestLab = require('testlabembed');
    var Browser = require('utils/browser');
    var config = require('config');
    var _ = require('underscore');
    var console = require('utils/console');
    
    var TestLabAPI = P(function(proto) {

        function validatedOptions (options) {
          var out = {};
          if (!options) options = {};

          var addOption = function (property, defaultValue) {
            if (options.hasOwnProperty(property)) {
              out[property] = options[property];
            } else {
              out[property] = defaultValue;
            }
          };
          addOption('keypad', true);
          addOption('graphpaper', true);
          addOption('settingsMenu', true);
          addOption('expressionsTopbar', true);
          addOption('branding', true);
          //zoomButtons don't make sense w/o graphpaper
          addOption('zoomButtons', out.graphpaper);
          addOption('solutions', true);
          // singlevarsolutions turns off less behavior than solutions.
          // expect to merge these two, but for now, singlevarsolutions
          // is internal only
          addOption('singlevarsolutions', true);
          addOption('expressionsCollapsed', false);
          addOption('lockViewport', false);
          addOption('globalKeyboardUndo', false);
          //default to useShellsOffscreen on mobile
          addOption('useShellsOffscreen', Browser.IS_MOBILE);
          addOption('redrawSlowly', false);
          addOption('onlyTraceSelected', false);
          addOption('disableMouseInteractions', false);
          addOption('folders', true);
          //images don't make much sense w/o graphpaper (but aren't strictly disallowed)
          addOption('images', out.graphpaper);
          addOption('expressions', true);
          addOption('border', true);
          addOption('nativeOnscreenKeypad', false);

          //secret option for resizing in a loop
          addOption('resizeLoop', false);

          if (options.hasOwnProperty('menus')) {
            console.warn(
              'As of API version 0.4, the \'menus\' option is deprecated and has been split into ' +
              'settingsMenu (boolean) and expressionsTopbar (boolean).'
            );
            if (!options.hasOwnProperty('settingsMenu')) out.settingsMenu = !!options.menus;
            if (!options.hasOwnProperty('expressionsTopbar')) out.expressionsTopbar = !!options.menus;
          }


          if (!out.graphpaper) {
            if (out.expressionsCollapsed) {
              out.expressionsCollapsed = false;
              console.warn(
                'Desmos API initialized with bad options. graphpaper: false ' +
                'and expressionsCollapsed: true are incompatible. Proceeding ' +
                'with expressionsCollapsed: false.'
              );
            }
            if (out.zoomButtons) {
              out.zoomButtons = false;
              console.warn(
                'Desmos API initialized with bad options. graphpaper: false ' +
                'and zoomButtons: true are incompatible. Proceeding ' +
                'with zoomButtons: false.'
              );
            }
          }

          return out;
        }
        proto.init = function(elt, options) {
            this._TLab = TestLab(elt, validatedOptions(options));
        }



        proto.setBlank = function () { return this._TLab.setBlank.apply(this._TLab, arguments); };
        proto.setState = function () { return this._TLab.setState.apply(this._TLab, arguments); };
        proto.getState = function () { return this._TLab.getState.apply(this._TLab, arguments); };


    });


    return TestLabAPI;

});
