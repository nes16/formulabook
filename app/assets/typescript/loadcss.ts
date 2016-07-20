
define(["text", "injectcss", "underscore"], function(e, t, n) {
    function i(e, t) {
        var n = document.location.protocol + "//" + document.location.host + 'assets/' + e;
        return t + "\n/*# sourceURL=" + n + "*/"
    }
    var r = {};
    return {
        load: function(n, a, s, o) {
            var l = a.toUrl(n) + ".css";
            o.isBuild ? e.get(l, function(e) {
                r[n] = e,
                s()
            }
            ) : e.get(l, function(e) {
                t(l, i(l, e)),
                s(),
                ("" + window.location.search).indexOf("reloadcss") >= 0 && requirejs(["jquery"], function(n) {
                    var r = function() {
                        setTimeout(function() {
                            n.get(l).done(function(n) {
                                e !== n && (e = n,
                                t(l, i(l, e)))
                            }
                            ).always(r)
                        }
                        , 1e3)
                    }
                    ;
                    r()
                }
                )
            }
            )
        },
        onLayerEnd: function(e, t) {
            var i = n.keys(r).sort().map(function(e) {
                return r[e]
            }
            ).join("")
              , a = require.nodeRequire("fs")
              , s = t.path.replace(/\.js/g, ".required.css");
            a.writeFileSync(s, i, "utf8")
        },
        write: function(e, t, n) {
            t in r ? n("define('" + e + "!" + t + "', function(){});") : console.log("ERROR - failed to find css " + t + " in buildMap")
        }
    }
}
)