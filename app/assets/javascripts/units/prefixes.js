define( ['require'], function(require) {
    //Used for SI units
    var prefixes = {
        'T': ['tera', 'T', 12],
        'G': ['giga', 'G', 9],
        'M': ['mega', 'M', 6],
        'k': ['kilo', 'k', 3],
        'h': ['hecto', 'h', 2],
        'da': ['deca', 'da', 1],
        '': ['', '', 0],
        'd': ['deci', 'd', -1],
        'c': ['centi', 'c', -2],
        'm': ['milli', 'm', -3],
        'μ': ['micro', 'μ', -6],
        'n': ['nano', 'n', -9],
        'p': ['pico', 'p', -12]
    };
    return prefixes;

});