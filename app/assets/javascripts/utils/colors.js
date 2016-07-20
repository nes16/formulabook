define(['require'],function(require) {
  var RED = '#C0504D';
  var BLUE = '#4F81BD';
  var GREEN = '#9BBB59';
  var PURPLE = '#8064A2';
  var ORANGE = '#F79646';
  var BLACK = '#000000';
  var all = [ RED, BLUE, GREEN, PURPLE, ORANGE, BLACK ];
  var i = 0;

  function next () {
    var color = all[i];
    i = (i + 1) % all.length;
    return color;
  }

  function reset () {
    i = 0;
  }

  return {
    all: all,
    next: next,
    reset: reset,
    RED: RED,
    BLUE: BLUE,
    GREEN: GREEN,
    PURPLE: PURPLE,
    ORANGE: ORANGE,
    BLACK: BLACK
  };
});
