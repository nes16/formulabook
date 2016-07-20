define(['require','math/builtin','./numeric'],function (require) {
  var Builtin = require('math/builtin');
  var Numeric = require('./numeric');

  var Distance = {
    // sqrt(x^2 + y^2), computed to avoid overflow and underflow.
    // http://en.wikipedia.org/wiki/Hypot
    hypot: function(x, y) {
      if(x === 0 && y === 0) {
        return 0;
      }
      if (Math.abs(x) > Math.abs(y)) {
        return Math.abs(x) * Math.sqrt((y/x) * (y/x) + 1);
      } else {
        return Math.abs(y) * Math.sqrt((x/y) * (x/y) + 1);
      }
    },

    // (x1 + x2)/2, computed to avoid overflow.
    mean: function (x1, x2) {
      return ((x1 > 0) === (x2 > 0)) ? x1 + 0.5*(x2 - x1) : 0.5*(x1 + x2);
    },

    dot: function(x1, y1, x2, y2) {
      return x1*x2 + y1*y2;
    },

    // Consider the line extending the segment, parameterized as
    // v1 + t (v2 - v1), where p, v1, and v2 are (xp, yp), (x1, y1), and
    // (x2, y2) respectively.
    //
    // Return the value of the parameter t for the projected point of p onto
    // the line through the segment.
    //
    // It falls where t = [(p-v) . (w-v)] / |w-v|^2
    //
    // Returns 0 in the degenerate case where v1 === v2.
    pointToSegmentParameter: function(xp, yp, x1, y1, x2, y2) {
      var line_length = this.hypot(x2 - x1, y2 - y1);

      // Degenerate case of a point to a point
      if (line_length === 0) return 0;

      var t = this.dot(
        (xp - x1)/line_length,
        (yp - y1)/line_length,
        (x2 - x1)/line_length,
        (y2 - y1)/line_length
      );

      return t;
    },

    closestPointOnSegment: function (xp, yp, x1, y1, x2, y2) {
      var t = this.pointToSegmentParameter(xp, yp, x1, y1, x2, y2);

      if (t <= 0) return [x1, y1];
      if (t >= 1) return [x2, y2];
      return [x1 + t*(x2 - x1), y1 + t*(y2 - y1)];
    },

    // Shortest distance from a point to a line segment
    // http://stackoverflow.com/questions/849211/shortest-distance-between-a-point-and-a-line-segment
    pointToSegment: function (xp, yp, x1, y1, x2, y2) {
      var p = this.closestPointOnSegment(xp, yp, x1, y1, x2, y2);
      return this.hypot(xp - p[0], yp - p[1]);
    },

    // (Near) 0 if x3, y3 lies on the line from x1, y1 to x2, y2.
    // Positive if x3, y3 is on the left of the line, so that the points form a
    // triangle with clockwise orientation.
    isLine: function (x1, y1, x2, y2, x3, y3) {
      var S = Numeric.svd([
        [x1, y1, 1],
        [x2, y2, 1],
        [x3, y3, 1]
      ]).S;
      return Builtin.approx(S[S.length - 1]/S[0], 0);
    },

    isCircle: function (x1, y1, x2, y2, x3, y3, x4, y4) {
      var S = Numeric.svd([
        [x1*x1 + y1*y1, x1, y1, 1],
        [x2*x2 + y2*y2, x2, y2, 1],
        [x3*x3 + y3*y3, x3, y3, 1],
        [x4*x4 + y4*y4, x4, y4, 1]
      ]).S;
      return Builtin.approx(S[S.length - 1]/S[0], 0);
    },

    // (Near) 0 if x6, y6 lies on the conic defined by the first five points.
    // I don't quite know how to interpret the sign for a general conic.
    isConic: function (x1, y1, x2, y2, x3, y3, x4, y4, x5, y5, x6, y6) {
      var S =  Numeric.svd([
        [x1*x1, y1*y1, 2*x1*y1, x1, y1, 1],
        [x2*x2, y2*y2, 2*x2*y2, x2, y2, 1],
        [x3*x3, y3*y3, 2*x3*y3, x3, y3, 1],
        [x4*x4, y4*y4, 2*x4*y4, x4, y4, 1],
        [x5*x5, y5*y5, 2*x5*y5, x5, y5, 1],
        [x6*x6, y6*y6, 2*x6*y6, x6, y6, 1]
      ]).S;
      return Builtin.approx(S[S.length - 1]/S[0], 0);
    },

    conicQuadraticParameters: function (x1, y1, x2, y2, x3, y3, x4, y4, x5, y5) {
      return {
        a: Numeric.det([
          [y1*y1, 2*x1*y1, x1, y1, 1],
          [y2*y2, 2*x2*y2, x2, y2, 1],
          [y3*y3, 2*x3*y3, x3, y3, 1],
          [y4*y4, 2*x4*y4, x4, y4, 1],
          [y5*y5, 2*x5*y5, x5, y5, 1]
        ]),

        b: Numeric.det([
          [x1*x1, y1*y1, x1, y1, 1],
          [x2*x2, y2*y2, x2, y2, 1],
          [x3*x3, y3*y3, x3, y3, 1],
          [x4*x4, y4*y4, x4, y4, 1],
          [x5*x5, y5*y5, x5, y5, 1]
        ]),

        c: -Numeric.det([
          [x1*x1, 2*x1*y1, x1, y1, 1],
          [x2*x2, 2*x2*y2, x2, y2, 1],
          [x3*x3, 2*x3*y3, x3, y3, 1],
          [x4*x4, 2*x4*y4, x4, y4, 1],
          [x5*x5, 2*x5*y5, x5, y5, 1]
        ])
      };
    },

    // Classify a set of 6 points as line, circle, parabola, hyperbola, ellipse, or none for not a conic.
    classifyConic: function (x1, y1, x2, y2, x3, y3, x4, y4, x5, y5, x6, y6) {
      if (Distance.isLine(x1, y1, x3, y3, x6, y6)) return 'line';
      if (Distance.isCircle(x1, y1, x2, y2, x5, y5, x6, y6)) return 'circle';
      if (!Distance.isConic(x1, y1, x2, y2, x3, y3, x4, y4, x5, y5, x6, y6)) return 'none';

      var p = Distance.conicQuadraticParameters(x1, y1, x2, y2, x3, y3, x4, y4, x5, y5);
      var S = Numeric.svd([[p.a, p.b], [p.b, p.c]]).S;

      if (Builtin.approx(S[S.length - 1]/S[0], 0, 20)) return 'parabola';
      return (p.b*p.b > p.a*p.c) ? 'hyperbola' : 'ellipse';

    }
  };

  return Distance;
});