define(['require', 'jquery'], function (require) {
    var $ = require('jquery');
    var Browser = {
        IS_IE8: navigator.userAgent.match(/MSIE 8.0/i) !== null,
        IS_IE9: navigator.userAgent.match(/MSIE 9.0/i) !== null,
        IS_IE: navigator.userAgent.match(/MSIE/i) !== null,
        IS_IPAD: navigator.userAgent.match(/iPad/i) !== null,
        IS_MOBILE: navigator.userAgent.match(/Mobile|Android/i) !== null,
        IS_ANDROID: navigator.userAgent.match(/Android/i) !== null,
        IS_CHROME: navigator.userAgent.match(/Chrome/i) !== null,
        IS_KINDLE: navigator.userAgent.match(/Kindle/i) !== null || navigator.userAgent.match(/Silk/i) !== null,
        IS_IN_IFRAME: window.parent !== window
    };
    Browser.IS_TABLET = (Browser.IS_IPAD || Browser.IS_ANDROID || Browser.IS_KINDLE);
    Browser.IOS_VERSION = (function () {
        //http://stackoverflow.com/questions/8348139/detect-ios-version-less-than-5-with-javascript
        var v = (navigator.appVersion).match(/OS (\d+)_(\d+)_?(\d+)?/);
        if (v) {
            return [parseInt(v[1], 10), parseInt(v[2], 10), parseInt(v[3] || 0, 10)];
        }
        return null;
    })();
    // Returns translate3d if supported, translate otherwise
    // from http://stackoverflow.com/questions/5661671/detecting-transform-translate3d-support
    //
    // Needs document.body to be defined before it can run (so that we can put
    // an element into it). In supported browsers, the value will be set to
    // true on $(document).ready();
    Browser.SUPPORTS_TRANSLATE3D = false;
    $(document).ready(function () {
        var el = document.createElement('p');
        var has3d;
        var computedStyle;
        var transforms = {
            'webkitTransform': '-webkit-transform',
            'OTransform': '-o-transform',
            'msTransform': '-ms-transform',
            'MozTransform': '-moz-transform',
            'transform': 'transform'
        };
        // Add it to the body to get the computed style.
        document.body.insertBefore(el, null);
        for (var t in transforms) {
            if (el.style[t] !== undefined) {
                el.style[t] = "translate3d(1px,1px,1px)";
                computedStyle = window.getComputedStyle(el);
                if (!computedStyle)
                    return;
                has3d = computedStyle.getPropertyValue(transforms[t]);
            }
        }
        document.body.removeChild(el);
        Browser.SUPPORTS_TRANSLATE3D = (has3d !== undefined &&
            has3d.length > 0 &&
            has3d !== "none");
    });
    //return a generated rule for an x-y translation. use translate3d where supported
    Browser.translateRule = function (x, y) {
        if (Browser.SUPPORTS_TRANSLATE3D) {
            return "translate3d(" + x + (x ? "px" : "") + "," + y + (y ? "px" : "") + ",0)";
        }
        return "translate(" + x + (x ? "px" : "") + "," + y + (y ? "px" : "") + ")";
    };
    Browser.SUPPORTS_CANVAS = (function () {
        var elem = document.createElement('canvas');
        var supports_canvas = !!(elem.getContext && elem.getContext('2d'));
        return supports_canvas;
    })();
    return Browser;
});
