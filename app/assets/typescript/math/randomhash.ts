define(['require', 'exports', 'module'], function(require, exports) {
    /* jshint bitwise: false */

    // ARC4 wraps BauARC4 (taken from seedrandom.js) to make an object that
    // takes a string seed instead of a key as a constructor, and returns an
    // array of integers between 0 and 255 instead of a large integer.
    //
    // The seed is designed to be the hex representation of a 128 bit random
    // UUID, but is allowed to be any string.
    //
    // Usage:
    // var arc4 = new ARC4('this is a seed')
    // arc4.g(4) // returns an array of 4 integers between 0 and 256
    function ARC4(seed) {
        this.bauArc4 = new BauARC4(toKey(seed));
    }

    ARC4.prototype.g = function(count) {
        var digits = Array(count);
        for (var i = 0; i < count; i++) {
            digits[i] = this.bauArc4.g(1);
        }
        return digits;
    };

    // Helpers used by ARC4
    var width = 256;

    function lowbits(n) {
        return n & (width - 1);
    }

    //
    // tokey()
    // Converts a string seed into a key that is an array of integers
    function toKey(seed) {
        var stringSeed = seed + ''; // Ensure the seed is a string
        var key = [];
        var smear = 0;
        var j;
        for (j = 0; j < stringSeed.length; j++) {
            key[lowbits(j)] =
                lowbits((smear ^= key[lowbits(j)] * 19) + stringSeed.charCodeAt(j));
        }
        return key;
    }

    // BauARC4, cribbed from http://davidbau.com/encode/seedrandom.js
    //
    // An ARC4 implementation.  The constructor takes a key in the form of
    // an array of at most (width) integers that should be 0 <= x < (width).
    //
    // The g(count) method returns a pseudorandom integer that concatenates
    // the next (count) outputs from ARC4.  Its return value is a number x
    // that is in the range 0 <= x < (width ^ count).
    //
    /** @constructor */
    function BauARC4(key) {
        var t, u, me = this,
            keylen = key.length;
        var i = 0,
            j = me.i = me.j = me.m = 0;
        me.S = [];
        me.c = [];

        // The empty key [] is treated as [0].
        if (!keylen) {
            key = [keylen++];
        }

        // Set up S using the standard key scheduling algorithm.
        while (i < width) {
            me.S[i] = i++;
        }
        for (i = 0; i < width; i++) {
            t = me.S[i];
            j = lowbits(j + t + key[i % keylen]);
            u = me.S[j];
            me.S[i] = u;
            me.S[j] = t;
        }

        // The "g" method returns the next (count) outputs as one number.
        me.g = function getnext(count) {
            var s = me.S;
            var i = lowbits(me.i + 1);
            var t = s[i];
            var j = lowbits(me.j + t);
            var u = s[j];
            s[i] = u;
            s[j] = t;
            var r = s[lowbits(t + u)];
            while (--count) {
                i = lowbits(i + 1);
                t = s[i];
                j = lowbits(j + t);
                u = s[j];
                s[i] = u;
                s[j] = t;
                r = r * width + s[lowbits(t + u)];
            }
            me.i = i;
            me.j = j;
            return r;
        };
        // For robust unpredictability discard an initial batch of values.
        // See http://www.rsa.com/rsalabs/node.asp?id=2009
        me.g(width);
    }

    // We're using a somewhat odd distribution of random hashes, but this
    // follows existing server side behavior. Draw characters from downcased
    // alphanumeric set. Weights each alphabetical character twice as heavily as
    // each digit.
    var upperLowerDigits =
        "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    var codex = upperLowerDigits.toLowerCase();
    // Hardcoded because the below algorithm relies on this number not changing.
    var codexLength = 62;

    var nchars = 10;
    var RandomHashFactory = function(seed) {
        if (!seed) throw 'You must supply a seed to RandomHashFactory. It should have at least 128 bits of entropy.';

        var arc4 = new ARC4(seed);

        this.next = function() {
            var chars = Array(nchars);
            var n = 0;
            var trialIndex;

            // Rejection sampling. Want uniform samples between 0 and 61, the
            // valid indices into our codex. arc4 returns integers between 0 and
            // 255, so we shift two bits off them to get integers between 0 and 63,
            // and then reject the samples larger than 61.
            while (n < nchars) {
                trialIndex = arc4.g(1)[0] >> 2;
                if (trialIndex < codexLength) {
                    chars[n] = codex[trialIndex];
                    n++;
                }
            }
            return chars.join("");
        };

        // Return a new random 128-bit hex value
        this.nextSeed = function() {
            var nbytes = 16;
            var bytes = arc4.g(nbytes);
            var hexCodes = Array(nbytes);
            for (var i = 0; i < nbytes; i++) {
                hexCodes[i] = bytes[i].toString(16);
                // Pad each byte representation to 2 hex characters
                if (hexCodes[i].length === 1) {
                    hexCodes[i] = "0" + hexCodes[i];
                }
            }
            return hexCodes.join("");
        };
    };

    var factory;

    exports.next = function() {
        if (!factory) throw "Random Hash Factory not initialized";
        return factory.next();
    };

    exports.nextSeed = function() {
        if (!factory) throw "Random Hash Factory not initialized";
        return factory.nextSeed();
    };

    exports.init = function(seed) {
        factory = new RandomHashFactory(seed);
    };

    return exports;
});
