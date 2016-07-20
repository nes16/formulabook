define(['require'],function(require){

var BuiltIn = {};

BuiltIn.mod = function(a, b){
  return a - b * Math.floor(a/b);
};

BuiltIn.sign = function(x){
  if(x === 0) return 0;
  if(x > 0) return 1;
  if(x < 0) return -1;
  return NaN;
};

BuiltIn.lcm = function(a, b){
  a = Math.round(a);
  b = Math.round(b);
  var gcd = BuiltIn.getGCD(a, b);
  return Math.abs(a * b / gcd);
};

BuiltIn.gcd = function(a, b){
  return BuiltIn.getGCD(a, b);
};

BuiltIn.nCr = function(n, r){
  n = Math.round(n);
  r = Math.round(r);

  //Error conditions
  if(r > n || n < 0 || r < 0){
    return 0;
  }

  var total = 1;
  for(var i = 0; i < r; i++)
  {
    total *= (n - i) / (i + 1);
  }
  return total;
};

BuiltIn.nPr = function(n, r){
  n = Math.round(n);
  r = Math.round(r);

  //Error conditions
  if(r > n || n < 0 || r < 0){
    return 0;
  }

  var total = 1;
  for(var i = 0; i < r; i++){
    total *= (n-i);
  }
  return total;
};

BuiltIn.factorial = function (x) {
  return BuiltIn.gamma(x + 1);
};

BuiltIn._integerFactorial = function (n) {
  if (n !== Math.floor(n)) return NaN;
  if (n < 0) return NaN;
  if (n > 170) return NaN; // Overflows double point floats
  if (n === 0 || n === 1) return 1;

  var output = 1;
  for (var i = 2; i <= n; i++) output *= i;

  return output;
};

BuiltIn.gamma = function (x) {
  if (x === Math.floor(x)) return BuiltIn._integerFactorial(x - 1);
  // Euler's reflection formula
  if (x < 0) return Math.PI/(Math.sin(Math.PI*x)*BuiltIn.gamma(1-x));
  return Math.exp(BuiltIn.lnGamma(x));
};

BuiltIn.lnGamma = function (x) {
  if (x < 0) return NaN; // Alternates between real and complex on integers.

  // 15 term rational approximation of lnGamma, valid for positive numbers.
  // Original source not known, but verified by JM using Mathematica to give
  // at least 14 correct digits of gamma = Math.exp(Math.lnGamma(x)) for
  // integers and half integers between 0 and 60, and at least 12 correct
  // digits up to 170.
  var cof = [
    57.1562356658629235,
    -59.5979603554754912,
    14.1360979747417471,
    -0.491913816097620199,
    0.339946499848118887e-4,
    0.465236289270485756e-4,
    -0.983744753048795646e-4,
    0.158088703224912494e-3,
    -0.210264441724104883e-3,
    0.217439618115212643e-3,
    -0.164318106536763890e-3,
    0.844182239838527433e-4,
    -0.261908384015814087e-4,
    0.368991826595316234e-5
  ];

  var s = 0.999999999999997092;
  for (var i=0; i < 14; i++) s += cof[i]/(x + i + 1);

  var t = x + 5.24218750000000000;

  return (x + 0.5)*Math.log(t) - t + Math.log(2.5066282746310005*s/x);
};

// BernoulliB_{2k} for k=1..14
BuiltIn.bernoulliTable = [
  1/6, -1/30, 1/42, -1/30, 5/66, -691/2730, 7/6, -3617/510,
  43867/798, -174611/330, 854513/138, -236364091/2730, 8553103/6,
  -23749461029/870
];

// mth derivative of cot(x)
//
// Used in evaluating reflection formula for polygamma
//
// Uses fact that (d/dx)^m cot(x) = p_m(cos(x))/sin(x)^{m+1} where p_m(x) is a
// polynomial with coefficents that obey the following recursion relation:
//
// a_{m+1, n} = -((m - n + 2) a_{m, n-1} + (n+1) a_{m, n+1})
//            = -(            t1         +        t2       )
// a_{0, 0} = 0, a_{0, 1} = 1
//
// Could improve performance by taking advantage of fact that p is even/odd
// when m is odd/even. Didn't feel worth the added trickiness.
BuiltIn.cotDerivative = function(m, x) {
  /* jshint maxcomplexity:11 */
  if (m !== Math.floor(m)) return NaN;
  if (m < 0) return NaN;

  if (m === 0) return 1/BuiltIn.tan(x);

  var sinx = BuiltIn.sin(x);
  if (m === 1) return -1/(sinx*sinx);

  var cosx = BuiltIn.cos(x);
  if (m === 2) return 2*cosx/(sinx*sinx*sinx);

  var aprev = [0, 2];
  var a;
  var mp, n;
  var t1, t2;
  for (mp = 3; mp <= m; mp++) {
    a = [];
    for (n = 0; n < mp; n++) {
      t1 = 0;
      t2 = 0;
      if (n > 0) t1 = (mp - n + 1)*aprev[n - 1];
      if (n + 2 < mp) t2 = (n + 1)*aprev[n + 1];
      a.push(-(t1 + t2));
    }
    aprev = a;
  }

  var s = 0;
  // Horner's method for polynomial evaluation
  for (n = m - 1; n >= 0; n--) s = a[n] + cosx*s;

  return s/Math.pow(sinx, m + 1);
};

// polyGamma(m, n) is the (m+1)th derivative of lnGamma(n)
//
// Implemented by differentiating Stirling's approximation:
//
// d/dn ln(Gamma(n)) = -\left(
//         ln(n) + 1/2n + \sum_{k=1}^{\infty} B_{2k}/(2k n^{2k})
//       /right)
//
// d^{m+1}/dn^{m+1} ln(Gamma(n)) =
//      m! (-1)^{m + 1} \left(
//        1/(m n^m) - 1/(2 n^{1+m}) +
//        \sum_{k=1}^{\infty} B_{2k} (2k + m - 1)!/(m!(2k)!n^{2k+m})
//      \right)
//
// B_{2k} are the Bernoulli numbers.
//
// Uses recurrence relation to bring arguments above 10, and reflection
// formula for negative n. In this case, 14 term sum gives results accurate to
// machine precision for values of m between 0 and at least 8.
//
// Only get 8 digits for polyGamma(100, 30)
//
// Recurrence relation:
//
// polyGamma(m, n) = polyGamma(m, n + 1) + (-1)^m m!/n^{m+1}
//
// Reflection formula:
//
// polyGamma(m, n) = (-1)^{m}polyGamma(m, 1 - n) - pi d^m/dn^m cot(pi*n)
//
// Can lose some accuracy in reflection formula for large m because of large
// powers of trig functions.
BuiltIn.polyGamma = function (m, n) {
  if (m < 0) return NaN;
  if (m !== Math.floor(m)) return NaN;
  var sign = (m % 2 === 0) ? -1 : 1;
  // Use reflection formula for negative n
  if (n < 0) {
    return -sign*BuiltIn.polyGamma(m, 1 - n) -
      Math.pow(Math.PI, m + 1)*BuiltIn.cotDerivative(m, Math.PI*n);
  }

  var mfac = BuiltIn.factorial(m);

  // Use recurrence relation to bring n above 10
  var s = 0;
  var npmm = Math.pow(n, -(m + 1));
  while (n < 10) {
    s += npmm;
    n++;
    npmm = Math.pow(n, -(m + 1));
  }

  s += (m === 0) ? -Math.log(n) : npmm*n/m;
  s += 0.5*npmm;

  var bt = BuiltIn.bernoulliTable;
  var num = m + 1;
  var denom = 2;
  var pre = npmm*n*num/denom;
  var nsqinv = 1/(n*n);
  for (var k = 1; k <= 14; k++) {
    pre *= nsqinv;
    s += pre*bt[k-1];
    num++; denom++;
    pre *= num/denom;
    num++; denom++;
    pre *= num/denom;
  }
  return mfac*sign*s;
};

BuiltIn.getGCD = function(x,y)
{
    //Only defined over integers
    var a = Math.round(x);
    var b = Math.round(y);

    // Positive values only
    if (a < 0)
        a = -a;
    if (b < 0)
        b = -b;

    // Reverse order if necessary.
    // b should be smaller than a
    if (b > a)
    {
        var temp = b;
        b = a;
        a = temp;
    }

    //GCD(0, x) = x
    if(b === 0){
      return a;
    }

    var m = a % b;

    while (m > 0)
    {
        a = b;
        b = m;
        m = a % b;
    }

    return b;
};

// Returns a reduced fraction approximation of x with denominator less than
// maxDenominator. maxDenominator defaults to 1e6.
BuiltIn.toFraction = function (x, maxDenominator) {

  if (x === Infinity) return { n: Infinity, d: 1 };
  if (x === -Infinity) return { n: -Infinity, d: 1};
  if (!isFinite(x)) return { n: NaN, d: 1};

  var whole, n0 = 0, n1 = 1, d0 = 1, d1 = 0, n, d;
  if (!maxDenominator) maxDenominator = 1e6;
  while (true) {
    whole = Math.floor(x);
    n = whole*n1 + n0;
    d = whole*d1 + d0;
    if (d > maxDenominator) break;
    n0 = n1;
    d0 = d1;
    n1 = n;
    d1 = d;
    if (x === whole) break;
    x = 1/(x - whole);
  }
  return { n: n1, d: d1 };
};

// Check if two values are equal to within the given number of bits of
// precision. For numbers smaller than one, compares the difference in the
// numbers to 1 instead of the larger of the numbers. This makes calculations like
// BuiltIn.approx(Math.sin(Math.Pi), 0) work out.
BuiltIn.approx = function (x1, x2, bits) {
  var m = Math.max(Math.max(Math.abs(x1), Math.abs(x2)), 1);
  var d = (bits === undefined) ? 0.5 : Math.pow(0.5, bits);
  return m === m + d*Math.abs(x2 - x1);
};

BuiltIn.log_base = function(n, base){return Math.log(n) / Math.log(base)};

BuiltIn.pow = function (x, n) {
  if (x >= 0 || n === Math.floor(n)) return Math.pow(x, n);
  var frac = BuiltIn.toFraction(n, 100);
  if (BuiltIn.approx(frac.n/frac.d, n, 2) && frac.d % 2 === 1) return (frac.n % 2 === 0 ? 1 : -1) * Math.pow(-x, n);
  return NaN;
};
BuiltIn.nthroot = function(x, n) { return BuiltIn.pow(x, 1/n) };

var PI_INV = 1/Math.PI;

//Trig functions
// We do some work to make integer and half integer multiples of pi equal to 0 when they should be.
BuiltIn.sin = function (x) {
  var absx = Math.abs(x);
  if (0.5*(absx*PI_INV*2 % 2) + absx === absx) return 0;
  return Math.sin(x);
};

BuiltIn.cos = function (x) {
  var absx = Math.abs(x);
  if (0.5*((absx*PI_INV*2 + 1) % 2) + absx === absx) return 0;
  return Math.cos(x);
};

BuiltIn.tan = function (x) {
  var absx = Math.abs(x);
  if (0.5*(absx*PI_INV*2 % 2) + absx === absx) return 0;
  if (0.5*((absx*PI_INV*2 + 1) % 2) + absx === absx) return Infinity;
  return Math.tan(x);
};

BuiltIn.sec = function (x) {
  var absx = Math.abs(x);
  if (0.5*((absx*PI_INV*2 + 1) % 2) + absx === absx) return Infinity;
  return 1/Math.cos(x);
};

BuiltIn.csc = function(x) {
  var absx = Math.abs(x);
  if (0.5*(absx*PI_INV*2 % 2) + absx === absx) return Infinity;
  return 1/Math.sin(x);
};

BuiltIn.cot = function(x) {
  var absx = Math.abs(x);
  if (0.5*(absx*PI_INV*2 % 2) + absx === absx) return Infinity;
  if (0.5*((absx*PI_INV*2 + 1) % 2) + absx === absx) return 0;
  return 1/Math.tan(x);
};

//Inverse trig functions
BuiltIn.acot = function(x){return Math.PI / 2 - Math.atan(x)};
BuiltIn.acsc = function(x){return Math.asin(1/x)};
BuiltIn.asec = function(x){return Math.acos(1/x)};

//Hyperbolic trig functions
BuiltIn.sinh = function(x){return (Math.exp(x) - Math.exp(-x)) / 2};
BuiltIn.cosh = function(x){return (Math.exp(x) + Math.exp(-x)) / 2};
BuiltIn.tanh = function(x) {
  // This definition avoids overflow of sinh and cosh for large x
  if (x > 0) {
    return (1 - Math.exp(-2*x))/(1 + Math.exp(-2*x));
  } else {
    return (Math.exp(2*x) - 1)/(Math.exp(2*x) + 1);
  }
};

BuiltIn.sech = function(x){return 1 / BuiltIn.cosh(x)};
BuiltIn.csch = function(x){return 1 / BuiltIn.sinh(x)};
BuiltIn.coth = function(x){return 1 / BuiltIn.tanh(x)};

//Inverse hyperbolic trig functions
BuiltIn.asinh = function(x){return Math.log(x+Math.sqrt(x*x+1))};
BuiltIn.acosh = function(x){return Math.log(x+Math.sqrt(x+1)*Math.sqrt(x-1))};
BuiltIn.atanh = function(x){return 0.5 * Math.log((1+x)/(1-x))};

BuiltIn.asech = function(x){return Math.log(1/x + Math.sqrt((1/x + 1)) * Math.sqrt((1/x - 1)))};
BuiltIn.acsch = function(x){return Math.log(1/x + Math.sqrt((1/(x*x)+1)))};
BuiltIn.acoth = function(x){return 0.5 * Math.log((x+1)/(x-1))};

BuiltIn.mean = function(list){
  var total = 0;
  for(var i = 0; i < list.length; i++){
    total += list[i];
  }
  return total / list.length;
};

BuiltIn.total = function(list){
  var total = 0;
  for(var i = 0; i < list.length; i++){
    total += list[i];
  }
  return total;
};

BuiltIn.length = function(list){
  return list.length;
};

BuiltIn.listMin = function (list) {
  if (list.length < 1) return NaN;
  var min = list[0];
  if (isNaN(min)) return NaN;
  for (var i = 1; i < list.length; i++) {
    if (isNaN(list[i])) return NaN;
    if (list[i] < min) min = list[i];
  }
  return min;
};

BuiltIn.listMax = function (list) {
  if (list.length < 1) return NaN;
  var max = list[0];
  if (isNaN(max)) return NaN;
  for (var i = 1; i < list.length; i++) {
    if (isNaN(list[i])) return NaN;
    if (list[i] >= max) max = list[i];
  }
  return max;
};

BuiltIn.argMin = function (list) {
  // Our lists start indexing from 1, so returning 0 represents
  // no element of the list.
  if (list.length < 1) return 0;
  var min = list[0];
  if (isNaN(min)) return 0;
  var argMin = 0;
  for (var i = 1; i < list.length; i++) {
    if (isNaN(list[i])) return 0;
    if (list[i] < min) {
      argMin = i;
      min = list[i];
    }
  }
  return argMin + 1; // Convert between js and Testlab indexing conventions
};

BuiltIn.argMax = function (list) {
  if (list.length < 1) return 0;
  var max = list[0];
  if (isNaN(max)) return 0;
  var argMax = 0;
  for (var i = 1; i < list.length; i++) {
    if (list[i] >= max) {
      if (isNaN(list[i])) return 0;
      argMax = i;
      max = list[i];
    }
  }
  return argMax + 1; // Convert between js and Testlab indexing conventions
};

BuiltIn.var = function (list) {
  var m = BuiltIn.mean(list);
  var total = 0;
  for (var i = 0; i < list.length; i++) {
    var delta = list[i] - m;
    total += delta*delta;
  }
  return total/list.length;
};

// Pearson correlation coefficient
BuiltIn.corr = function (l1, l2) {
  if (l1.length !== l2.length) return NaN;
  var len = l1.length;
  var m1 = BuiltIn.mean(l1);
  var m2 = BuiltIn.mean(l2);
  var d1, d2;
  var t1 = 0, t2 = 0, tc = 0;
  for (var i = 0; i < len; i++) {
    d1 = l1[i] - m1;
    d2 = l2[i] - m2;
    t1 += d1*d1;
    t2 += d2*d2;
    tc += d1*d2;
  }
  return tc/Math.sqrt(t1*t2);
};

BuiltIn.stdev = function (list) {
  var l = list.length;
  return Math.sqrt(BuiltIn.var(list)*l/(l-1));
};

BuiltIn.stdevp = function (list) {
  return Math.sqrt(BuiltIn.var(list));
};

return BuiltIn;
});