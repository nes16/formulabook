define(["require", "underscore"], function(e) {
    function t(e, t) {
        var a = i[e];
        if (!a) {
            a = document.createElement("style"),
            i[e] = a;
            var s = n.sortedIndex(r, e)
              , o = i[r[s]];
            o ? document.head.insertBefore(a, o) : document.head.appendChild(a),
            r.splice(s, 0, e)
        }
        a.textContent = t
    }
    var n = e("underscore")
      , i = {}
      , r = [];
    return t
}
)
