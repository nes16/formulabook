define(['require', 'jquery', 'pjs', 'base/underscoremodel'], function (require) {
    var P = require('pjs');
    var $ = require('jquery');
    var UM = require('base/underscoremodel');

    var UnitNode = P(UM, function (node, _super) {
        

        node.init = function(type, args){
            //initialize object level members
            console.log('Arguments length - ' + args.length);
            this.type = type;
            this.args = args;
        };
        
        node.prepare2Arg = function(print)
        {
            this.args[0].type.call(this.args[0], print);
            this.args[1].type.call(this.args[1], print);   
        };
        
        node.prepare1Arg = function(print)
        {
            this.args[0].type.call(this.args[0], print);
        };
        

        node.doPow = function(print){
            this.prepare2Arg(print);
            console.log("Pow - " + this.args[0].val + "-" + this.args[1].val );
            this.val = Math.pow(this.args[0].val, this.args[1].val);    
        };
        
        node.doDiv = function(print){
            this.prepare2Arg(print);
            if(print){
                this.val = '\\frac {' + this.args[0].val + '}{' + this.args[1].val + '}'; 
            }
            else{
                console.log("Div - " + this.args[0].val + "-" + this.args[1].val );
                this.val =  this.args[0].val /  this.args[1].val;
            }
            
            
        };
        
        node.doMul = function(print){
            this.prepare2Arg(print);
            if(print){
                this.val = this.args[0].val + ' \\cdot ' + this.args[1].val; 
            }
            else{
                
                console.log("Mul - " + this.args[0].val + "-" + this.args[1].val );
                this.val =  this.args[0].val *  this.args[1].val;    
            }
        };
        
        node.doNumber = function(print){
            if(print){
                this.val = this.args[0]
            }
            else{
                this.val = parseFloat(this.args[0]);
                console.log("Number - " + this.val );
            }
        };
        
        node.doVar = function(print){
            if(print){
                this.val = this.info.getExpression();
            }
            else{
                this.val = 1.0;
            }
            
        };

    });

    return UnitNode;

});
