define(['require', 'jquery', 'pjs', 'base/underscoremodel', 'underscore'], function (require) {
    var P = require('pjs');
    var $ = require('jquery');
    var _ = require('underscore');
    var UnderscoreModel = require('base/underscoremodel');
    

    var MathNode = P(UnderscoreModel, function (node, _super) {
        //class level members

        var isMathNode = true;
        
        node.init = function(type, args){
            //initialize object level members
            console.log('Arguments length - ' + args.length);
            this.type = type;
            this.args = args;
            
            if(this.isVar()){
                this.token = args[0];
                this.start = args[1];
                this.end = args[2];
                MathNode.onVarNode(this);
            }
        };
        
        
        
        node.prepare2Arg = function()
        {
            this.args[0].type.call(this.args[0]);
            this.args[1].type.call(this.args[1]);   
        };
        
        node.prepare1Arg = function()
        {
            this.args[0].type.call(this.args[0]);
        };
        
        node.method = function(p1){
            console.log('Using object var - ' + this.args);
        };
        
        node.doAdd = function(){
            this.prepare2Arg();
            console.log("Add - " + this.args[0].val + "-" + this.args[1].val );
            this.val =  this.args[0].val +  this.args[1].val;
        };
        
        node.doSub = function(){
            this.prepare2Arg();
            console.log("Sub - " + this.args[0].val + "-" + this.args[1].val );
            this.val =  this.args[0].val -  this.args[1].val;
        };
        
        node.doMul = function(){
            this.prepare2Arg();
            console.log("Mul - " + this.args[0].val + "-" + this.args[1].val );
            this.val =  this.args[0].val *  this.args[1].val;
        };
        
        node.doDiv = function(){
            
            this.prepare2Arg();
            console.log("Div - " + this.args[0].val + "-" + this.args[1].val );
            this.val =  this.args[0].val /  this.args[1].val;
        };
        
        node.doMod = function(){
            
        };
        
        node.doSqrt = function(){
            
            this.prepare1Arg();
            console.log("Sqrt - " + this.args[0].val );
            this.val = Math.sqrt(this.args[0].val);
        };
        

        node.doPow = function(){
            this.prepare2Arg();
            console.log("Pow - " + this.args[0].val + "-" + this.args[1].val );
            this.val = Math.pow(this.args[0].val, this.args[1].val);    
        };
        
        node.doLn = function(){
            
        };
        
        node.doLog10 = function(){
            
        };
        
        node.doLogBase = function(){
            
        };
        
        node.doParen = function(){
            this.prepare1Arg();
            console.log("Paran - " + this.args[0].val );
            this.val = this.args[0].val;
        };
        
        node.doCurly = function(){
            this.prepare1Arg();
            console.log("Curly - " + this.args[0].val );
            this.val = this.args[0].val;
        };
        
        node.doSquare = function(){
            this.prepare1Arg();
            console.log("Sqr - " + this.args[0].val );
            this.val = Math.pow(this.args[0].val, 2);
        };
        
        node.doSin = function(){
            
        };
        
        node.doCos = function(){
            
        };
        
        node.doTan = function(){
            
        };
        
        node.doArcSin = function(){
            
        };
        
        node.doArcCos = function(){
            
        };
        
        node.doArcTan = function(){
            
        };
        
        node.doCsc = function(){
            
        };
        
        node.doSec = function(){
            
        };
        
        node.doCot = function(){
            
        };
        
        node.doIfThen = function(){
            
        };
        
        node.doNot = function(){
            
        };
        
        node.doAnd = function(){
            
        };
        
        node.doOr = function(){
            
        };
        
        node.doEqual = function(){
            
        };
        
        node.doNotEqual = function(){
            
        };
        
        node.doLess = function(){
            
        };
        
        node.doGreater = function(){
            
        };
        
        node.doGreaterEq = function(){
            
        };
        
        node.doLessEq = function(){
            
        };
        
        node.doUnderscore = function(){
            
        };
        
        node.doConst = function(){
            
        };
        
        node.doNumber = function(){
            this.val = parseFloat(this.args[0]);
            console.log("Number - " + this.val );
            
        };
        
        node.doVar = function(){
            return 1;
        };
        

        node.isVar = function(){
            //TODO:check the logic
            return this.type === this.prototype.doVar;
        }

    });
    
    MathNode.shiftNodes = function(nodes, start, corr){
      _.each(nodes, function(n){
          if(n.start >= start){
            if(n.star != start)
                n.start += corr;
            n.end += corr;
          }
      });
    };
    
    MathNode.traverseNode = function(node, list){
      if (node.isVar()) {
        var token = node.token;
        if (list[token] != null) {
          list[token].nodes.push(node);

        }
        else {
          list[token].nodes = node;
        }
      }
      else{
       for (var i = 0, len = node.args.length; i < len; i++) {
          if(node.args[i].isMathNode)
            MathNode.traverseNode(node.args[i], list);
        }
      }
    };
    
    MathNode.onVarNode = function(node){};

    return MathNode;

});

