define(['require','math/distance'],function(require){
  var Distance = require('math/distance');

  var Rounding = {
    // Returns the shortest decimal between two numbers according to the following rules
    //
    // 1. 0 is the shortest decimal in any range that contains it.
    // 2. Decimals with a larger exponent are shorter than decimals with a smaller exponent
    // 3. Of decimals with the same exponent, 1 is the shortest
    // 4. When there are multiple decimals in the range that are equally sort, the closest to
    //    the mean of x1 and x2 is chosen.
    shortestDecimalBetween: function (x1, x2) {
      var mean = Distance.mean(x1, x2);

      if (x1 > 0 !== x2 > 0) return 0;
      if (x1 === 0 || x2 === 0) return 0;

      // Already know x1 and x2 have the same sign, so make them positive
      // to avoid complication of leading '-' sign.
      var sign = x1 > 0 ? 1 : -1;
      var u1 = (Math.abs(x1)).toExponential().split('e');
      var u2 = (Math.abs(x2)).toExponential().split('e');

      var m1 = u1[0];
      var m2 = u2[0];

      var e1 = u1[1];
      var e2 = u2[1];

      if (e2 !== e1) {
        return sign*Math.pow(10, Math.max(parseFloat(e1), parseFloat(e2)));
      }

      if (m1[0] !== m2[0]) return parseFloat(mean.toPrecision(1));

      var precision = 1;

      // Start at 2 to skip the decimal point. We've already examined
      // the leading digit.
      for (var i = 2; i < Math.min(m1.length, m2.length); i++) {
        precision++;
        if (m1[i] !== m2[i]) break;
      }

      return parseFloat(mean.toPrecision(precision));

    }
  };

  return Rounding;
});