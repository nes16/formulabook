define('sample/units/unit_convertor', ['require', 'pjs', 'underscore'], function(require){
  var P = require('pjs');
  var _ = require("underscore");
  var AbstractUnitModel;
  
  var UnitConvertor = P(AbstractUnitModel, function(model, _super) {
    
    this.init = function(_super){
      
    }
    //Return latex expression formula for converting the the units 
    this.getExpression = function(from, to){
      '\\frac{'+ from.factorStr +' }{' + to.factorStr + '}'
    }
  });
  
  return UnitConvertor;
  
  
});
