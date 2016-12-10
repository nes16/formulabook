/* Translates latex equations to javascript */

%lex
// States (by default there is also 'INITIAL'
%x ARRAY
//// Some code that does stuff
//%{
//  if(!yy.setParseValue){
//        yy.setParseValue = function(val,unit, power){
//            console.log("Value with unit power - " + val + "-" + unit + "-" + power);
//            return true;
//        }
//    };
//  }
//%}
//
%%


// Basic operators

// Varibles numbers and constants
<INITIAL,ARRAY>(\s+)                   { return 'SPACE'; }
<INITIAL,ARRAY>([0-9]+(\.[0-9]+)?\b)   { return 'NUMBER'; }
<INITIAL,ARRAY>(([a-zA-Z][a-zA-Z]*)(_[a-zA-Z0-9]|_\{[a-zA-Z0-9]{2,}\})?)       { return 'SYMBOL'; }

// Other stuff to ignore 
<INITIAL,ARRAY>("$")                   {  }
<INITIAL,ARRAY><<EOF>>                 { return 'EOF'; }


/lex

/* operator associations and precedence */


%start unit

%% /* language grammar */

unitvalue
    : NUMBER SPACE unit  EOF { console.log(JSON.stringify($1));return $1;}
    ;

su
    : SYMBOL POWER                {$$ = {numeric:$1, symbol:$3, power:$4};}
    | SYMBOL                       {$$ = {numeric:$1, symbol:$3, power:null};}
    ;

unit   
    : su SPACE su SPACE su
    ;
    
%%

    