//from http://www.w3schools.com/js/js_cookies.asp
define( [], function() {
    function getCookie(c_name) {

        var encoded_c_name = encodeURIComponent(c_name);
        var i, x, y, ARRcookies = document.cookie.split(";");
        for (i = 0; i < ARRcookies.length; i++) {
            x = ARRcookies[i].substr(0, ARRcookies[i].indexOf("="));
            y = ARRcookies[i].substr(ARRcookies[i].indexOf("=") + 1);
            x = x.replace(/^\s+|\s+$/g, "");
            if (x == encoded_c_name) {
                return decodeURIComponent(y);
            }
        }
    }

    function setCookie(c_name, value, duration) {
        //set a javascript cookie
        var expires = new Date();
        expires.setDate(expires.getDate() + (duration || 30));
        document.cookie = (
            encodeURIComponent(c_name) +
            "=" + encodeURIComponent(value) +
            "; expires=" + expires.toUTCString() +
            "; path=/"
        );
    }

    return {
        getCookie: getCookie,
        setCookie: setCookie
    };
});

