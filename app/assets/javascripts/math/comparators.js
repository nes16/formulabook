//Use this table to get rid of all the string comparisons used to interpret comparators
define('math/comparators',['require'],function(require){

var ComparatorTable = {
   '<': {inclusive: false, direction: -1},
  '!=': {inclusive: false, direction:  0},
   '>': {inclusive: false, direction:  1},
  '<=': {inclusive: true,  direction: -1},
  '=': {inclusive: true,  direction:  0},
  '>=': {inclusive: true,  direction:  1}
};

var getComparator = function(inclusive, direction){
  switch(direction){
    case -1:
      return (inclusive ? '<=' : '<');
    case 0:
      return (inclusive ? '=' : '!=');
    case 1:
      return (inclusive ? '>=' : '>');
    default:
      throw "Programming error.  Comparators must have a direction of -1, 0, or 1";
  }
};

return {
  table: ComparatorTable,
  get: getComparator,
};

});
