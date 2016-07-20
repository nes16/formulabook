/* Translates latex equations to javascript */

%lex
// States (by default there is also 'INITIAL'
%x ARRAY

// Some code that does stuff
%{
  addNode = function(type, arg) { 
  args = [];
  for(i=1;i<arguments.length;i++)
        args.push(arguments[i]);
  
  return yy.MathNode(type, args);
  }; 
%}

%%


// Basic operators
<INITIAL,ARRAY>("+")                   { return 'ADD'; }
<INITIAL,ARRAY>("-")                   { return 'SUB'; }
<INITIAL,ARRAY>("*")                   { return 'MUL'; }
<INITIAL,ARRAY>("\\times")             { return 'MUL'; }
<INITIAL,ARRAY>("\\cdot")              { return 'MUL'; }
<INITIAL,ARRAY>("/")                   { return 'DIV'; }
<INITIAL,ARRAY>("\\div")               { return 'DIV'; }
<INITIAL,ARRAY>("\\frac")              { return 'FRAC'; }
<INITIAL,ARRAY>("\\mod")               { return 'MOD'; }
// Exponential stuff
<INITIAL,ARRAY>("\\sqrt")              { return 'SQRT'; }
<INITIAL,ARRAY>("^")                   { return 'POW'; }
<INITIAL,ARRAY>("\\ln")                { return 'LN'; }
<INITIAL,ARRAY>("\\log_")              { return 'LOGBASE'; }
<INITIAL,ARRAY>("\\log")               { return 'LOG10'; }
// Trig functions 
<INITIAL,ARRAY>("\\sin")               { return 'SIN'; }
<INITIAL,ARRAY>("\\cos")               { return 'COS'; }
<INITIAL,ARRAY>("\\tan")               { return 'TAN'; }
<INITIAL,ARRAY>("\\arcsin")            { return 'ARCSIN'; }
<INITIAL,ARRAY>("\\arccos")            { return 'ARCCOS'; }
<INITIAL,ARRAY>("\\arctan")            { return 'ARCTAN'; }
<INITIAL,ARRAY>("\\csc")               { return 'CSC'; }
<INITIAL,ARRAY>("\\sec")               { return 'SEC'; }
<INITIAL,ARRAY>("\\cot")               { return 'COT'; }
// Brackets 
<INITIAL,ARRAY>("(")                   { return 'LPAREN'; }
<INITIAL,ARRAY>("{")                   { return 'LCURLY'; }
<INITIAL,ARRAY>("[")                   { return 'LSQUARE'; }
<INITIAL,ARRAY>(")")                   { return 'RPAREN'; }
<INITIAL,ARRAY>("}")                   { return 'RCURLY'; }
<INITIAL,ARRAY>("]")                   { return 'RSQUARE'; }
// Logic stuff
<INITIAL,ARRAY>("\\sim")               {return 'NOT';}
<INITIAL,ARRAY>("\\wedge")             {return 'AND';}
<INITIAL,ARRAY>("\\vee")               {return 'OR';}
<INITIAL,ARRAY>("\\to")                {return 'IFTHEN';}
<INITIAL,ARRAY>("\\leftrightarrow")    {return 'IFTHEN';}
<INITIAL,ARRAY>("\\Rightarrow")        {return 'IFTHEN';}
<INITIAL,ARRAY>("\\Leftrightarrow")    {return 'IFTHEN';}
<INITIAL,ARRAY>("=")                   {return 'EQUAL';}
<INITIAL,ARRAY>("\\equiv")             {return 'EQUAL';}
<INITIAL,ARRAY>("\\ne")                {return 'NOT_EQUAL';}
<INITIAL,ARRAY>("\\le")                {return 'LESS_EQUAL';}
<INITIAL,ARRAY>("<=")                  {return 'LESS_EQUAL';}
<INITIAL,ARRAY>("<")                   {return 'LT';}
<INITIAL,ARRAY>("\\ge")                {return 'GREAT_EQUAL';}
<INITIAL,ARRAY>(">=")                  {return 'GREAT_EQUAL';}
<INITIAL,ARRAY>(">")                   {return 'GT';}
// Summation and product
<INITIAL,ARRAY>("_")                   {return 'UNDERSCORE';}

// Varibles numbers and constants
<INITIAL,ARRAY>([0-9]*\.{0,1}[0-9]+)   { return 'NUMBER'; }
<INITIAL,ARRAY>([A-Za-z][a-zA-Z0-9]*)       { return 'VAR'; }
<INITIAL,ARRAY>("\\alpha")      { return 'VAR'; }
<INITIAL,ARRAY>("\\beta")       { return 'VAR'; }
<INITIAL,ARRAY>("\\chi")        { return 'VAR'; }
<INITIAL,ARRAY>("\\delta")      { return 'VAR'; }
<INITIAL,ARRAY>("\\epsilon")    { return 'VAR'; }
<INITIAL,ARRAY>("\\varepsilon") { return 'VAR'; }
<INITIAL,ARRAY>("\\eta")        { return 'VAR'; }
<INITIAL,ARRAY>("\\gamma")      { return 'VAR'; }
<INITIAL,ARRAY>("\\iota")       { return 'VAR'; }
<INITIAL,ARRAY>("\\kappa")      { return 'VAR'; }
<INITIAL,ARRAY>("\\lambda")     { return 'VAR'; }
<INITIAL,ARRAY>("\\mu")         { return 'VAR'; }
<INITIAL,ARRAY>("\\nu")         { return 'VAR'; }
<INITIAL,ARRAY>("\\omega")      { return 'VAR'; }
<INITIAL,ARRAY>("\\phi")        { return 'VAR'; }
<INITIAL,ARRAY>("\\varphi")     { return 'VAR'; }
<INITIAL,ARRAY>("\\pi")         { return 'VAR'; }
<INITIAL,ARRAY>("\\psi")        { return 'VAR'; }
<INITIAL,ARRAY>("\\rho")        { return 'VAR'; }
<INITIAL,ARRAY>("\\sigma")      { return 'VAR'; }
<INITIAL,ARRAY>("\\tau")        { return 'VAR'; }
<INITIAL,ARRAY>("\\theta")      { return 'VAR'; }
<INITIAL,ARRAY>("\\upsilon")    { return 'VAR'; }
<INITIAL,ARRAY>("\\xi")         { return 'VAR'; }
<INITIAL,ARRAY>("\\zeta")       { return 'VAR'; }
<INITIAL,ARRAY>("\\Delta")      { return 'VAR'; }
<INITIAL,ARRAY>("\\Gamma")      { return 'VAR'; }
<INITIAL,ARRAY>("\\Lambda")     { return 'VAR'; }
<INITIAL,ARRAY>("\\Omega")      { return 'VAR'; }
<INITIAL,ARRAY>("\\Phi")        { return 'VAR'; }
<INITIAL,ARRAY>("\\Pi")         { return 'VAR'; }
<INITIAL,ARRAY>("\\Psi")        { return 'VAR'; }
<INITIAL,ARRAY>("\\Sigma")      { return 'VAR'; }
<INITIAL,ARRAY>("\\Theta")      { return 'VAR'; }
<INITIAL,ARRAY>("\\Upsilon")    { return 'VAR'; }
<INITIAL,ARRAY>("\\Xi")         { return 'VAR'; }
<INITIAL,ARRAY>("\\aleph")      { return 'VAR'; }
<INITIAL,ARRAY>("\\beth")       { return 'VAR'; }
<INITIAL,ARRAY>("\\daleth")     { return 'VAR'; }
<INITIAL,ARRAY>("\\gimel")      { return 'VAR'; }
<INITIAL,ARRAY>("e")                   { return 'CONST'; }
<INITIAL,ARRAY>("\\pi")                { return 'CONST'; }

// Other stuff to ignore 
<INITIAL,ARRAY>("$")                   {  }
<INITIAL,ARRAY>(\s+)                   {  }
<INITIAL,ARRAY><<EOF>>                 { return 'EOF'; }

/lex

/* operator associations and precedence */
%left IFTHEN
%left NOT AND OR EQUAL NOT_EQUAL LT GT GREAT_EQ LESS_EQ
%left ADD SUB
%left MUL DIV FRAC MOD
%right POW SQRT
%right SIN COS TAN ARCSIN ARCCOS ARCTAN CSC SEC COT LN LOG10 LOGBASE
%right UNDERSCORE
%right NEG /* unary negate operator should be done first */
%left IGNORE NUMBER


%start expressions

%% /* language grammar */

expressions
    : e EOF
        {return $1;}
    ;

e
    : e ADD e           {$$ = addNode(yy.MathNode.prototype.doAdd,$1,$3);}
    | e SUB e           {$$ = addNode(yy.MathNode.prototype.doSub,$1,$3);}
    | e MUL e           {$$ = addNode(yy.MathNode.prototype.doMul,$1,$3);}
    | e DIV e           {$$ = addNode(yy.MathNode.prototype.doDiv,$1,$3);}
    | e MOD e           {$$ = addNode(yy.MathNode.prototype.doMod,$1,$3);}
    | SQRT e            {$$ = addNode(yy.MathNode.prototype.doSqrt,$2);}
    | FRAC e e          {$$ = addNode(yy.MathNode.prototype.doDiv,$2,$3);}
    | e POW e           {$$ = addNode(yy.MathNode.prototype.doPow,$1,$3);}
    | LN e              {$$ = addNode(yy.MathNode.prototype.doLn,$2);}
    | LOG10 e           {$$ = addNode(yy.MathNode.prototype.doLog10,$2);}
    | LOGBASE e e       {$$ = addNode(yy.MathNode.prototype.doLogBase,$2,$3);}
    // Brackets
    | LPAREN  e RPAREN   {$$ = addNode(yy.MathNode.prototype.doParen,$2);}
    | LCURLY  e RCURLY   {$$ = addNode(yy.MathNode.prototype.doCurly,$2);}
    | LSQUARE e RSQUARE  {$$ = addNode(yy.MathNode.prototype.doSquare,$2);}
    // Trig
    | SIN e              {$$ = addNode(yy.MathNode.prototype.doSin,$2);}
    | COS e              {$$ = addNode(yy.MathNode.prototype.doCos,$2);}
    | TAN e              {$$ = addNode(yy.MathNode.prototype.doTan,$2);}
    | ARCSIN e           {$$ = addNode(yy.MathNode.prototype.doArcSin,$2);}
    | ARCCOS e           {$$ = addNode(yy.MathNode.prototype.doArcCos,$2);}
    | ARCTAN e           {$$ = addNode(yy.MathNode.prototype.doArcTan,$2);}
    | CSC e              {$$ = addNode(yy.MathNode.prototype.doCsc,$2);}
    | SEC e              {$$ = addNode(yy.MathNode.prototype.doSec,$2);}
    | COT e              {$$ = addNode(yy.MathNode.prototype.doCot,$2);}
    // Logic
    | e IFTHEN e         {$$ = addNode(yy.MathNode.prototype.doIfThen,$1,$3);}
    | NOT e              {$$ = addNode(yy.MathNode.prototype.doNot,$2);}
    | e AND e            {$$ = addNode(yy.MathNode.prototype.doAnd,$1,$3);}
    | e OR e             {$$ = addNode(yy.MathNode.prototype.doOr,$1,$3);}
    | e EQUAL e          {$$ = addNode(yy.MathNode.prototype.doEqual,$1,$3);}
    | e NOT_EQUAL e      {$$ = addNode(yy.MathNode.prototype.doNotEqual,$1,$3);}
    | e LT e             {$$ = addNode(yy.MathNode.prototype.doLess,$1,$3);}
    | e GT e             {$$ = addNode(yy.MathNode.prototype.doGreater,$1,$3);}
    | e GREAT_EQ e       {$$ = addNode(yy.MathNode.prototype.doGreaterEq,$1,$3);}
    | e LESS_EQ e        {$$ = addNode(yy.MathNode.prototype.doLessEq,$1,$3);}
    // Summations
    | VAR UNDERSCORE e {$$ = addNode(yy.MathNode.prototype.doUnderscore,$1,$3);}
    
    // Basics
    | CONST               {$$ = addNode(yy.MathNode.prototype.doConst, yytext);}
    | NUMBER              {$$ = addNode(yy.MathNode.prototype.doNumber, yytext);}
    | VAR                 {$$ = addNode(yy.MathNode.prototype.doVar, yytext, yyloc.first_column, yyloc.last_column);}
    ;
    
    
    %%
 
define(function(){
return latex_parser;
});
    
    