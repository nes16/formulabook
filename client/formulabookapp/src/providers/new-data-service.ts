import { Injectable , Optional} from '@angular/core';
import { UUID } from 'angular2-uuid';

import { Store } from '@ngrx/store';
import * as fromRoot from '../reducers';
import { LatexParser } from '../lib/latex-parser'
import { ValueParser } from '../lib/value-parser'
import '../assets/parsers/value-parser'
import { Property, Unit, Global, Formula, FormulaRun, ValueU, ParsedValue, SearchKey, prefixes, SingleUnit
     } from '../reducers/interfaces'


@Injectable()
export class NewDataService {

    state: fromRoot.State;
    constructor(@Optional() public store:Store<fromRoot.State>) {
        if(this.store)
            this.store.let(fromRoot.getState).subscribe(s => this.state = s);
        else
            this.setupSampleData();
        LatexParser.init();
    }

    createBaseResource() {
        return {
            shared: false,
            id: UUID.UUID(),
            favourite: false,
            user_id: -1,
            version: 1
        }
    }

    getResource(id) {
        return this.state.resources.find(i => i.id == id);
    }

    //Property interface
    createNewProperty(): Property {
        return Object.assign(this.createBaseResource(), {
            base: false,
            name: 'New Property',
            type: 'properties'
        })
    }
    
    getDefaultUnit(p: Property) {
        return this.state.resources.find(i => {
            let k = i as Unit;
            return i.type == 'units' && k.property_id == p.id && k.factor == "1"
        }
        )
    }

    findUnit(p:Property, pv: ParsedValue){
        let symbol = this.getUnitSymbolFromParsedValue(pv);
        let units:Unit[] = (this.state.resources as Unit[]).filter(r => r.type == 'units' && r.property_id == p.id && r.symbol ==  symbol)
        if(units.length == 1)
            return units[0];
        return null;
    }

    //ft factor = 0.304
    convert(val:number, fu:Unit, tu:Unit):number{
        if(val && val != NaN){
            if(!this.isFormulaFactor(fu) && !this.isFormulaFactor(tu))
                return val * (+fu.factor/+tu.factor)
            else if(this.isFormulaFactor(tu) && this.isFormulaFactor(tu))
                return ((+fu.offset - +tu.offset) + val*+fu.factor) / +tu.factor;
        }
    }
    //Unit interface
    createNewUnit(property): Unit {
        return Object.assign(this.createBaseResource(), {
            name: 'New Unit',
            symbol: 's3',
            property_id: property ? property.id : this.state.uiState.current_property.id,
            factor: "1",
            system: "SI",
            type: 'units',
            offset:"0"
        })
    }

    getFactor(u: Unit) {
        if (!u.factor || this.isFormulaFactor(u))
            return null;
        else
            return parseFloat(u.factor);
    }

    getFormulaFactor(u: Unit) {
        if (this.isFormulaFactor(u))
            return u.factor;
        else
            return null;
    }

    isFormulaFactor(u: Unit): boolean {
        if (!u.factor)
            return false;
        return u.factor.indexOf('x') != -1;
    }



    getUnitSymbolFromParsedValue(pv:ParsedValue):string{
        let symbol = "";
        return pv.symbol+pv.power;
    }

    isDefaultUnit(u: Unit) {
        return this.getFactor(u) == 1;
    }

    getSearchKeys(u:Unit, p:string):any{
        //Symbol
        //match ^p | ' p'
        let bFound = u.symbol.search(/^p| p/);
        if(bFound > 0)
            return {unit:u , weightage:10, location:bFound};
        //Name
        bFound = u.name.search(/^p| p/);
        if(bFound > 0)
            return {unit:u , weightage:8, location:bFound};
        
        //check prefix
        if(p.length == 1){
            return {unit:u, wightage:5}    
        }
    }



    //Global interface
    createNewGlobal(): Global {
        return Object.assign(this.createBaseResource(), {
            name: 'New Global',
            value: "1",
            symbol: 'g',
            type: 'globals',
            unit_id: '37e01265-09ff-3587-b4f8-a5a085a6ca7c'
        })
    }

    //Formula interface
    createNewFormula(): Formula {
        let f = Object.assign(this.createBaseResource(), {
            name: 'New Formula',
            symbol: 'f',
            formula: 'x+y',
            type: 'formulas',
            unit_id:null,
            global_ids: [],
            variables: [],
            runs:[]
        })
        return f;
    }

    createNewVariable() {
        let v = Object.assign({
            name: 'var1',
            symbol: 'x',
            unit_id: null
        })
        return v;
    }
    
    createNewRun(f:Formula) {
        let r:FormulaRun = {
            name: 'run1',
            values:{},
            result: {input:"", result:"", inunit_id:f.unit_id,}
        }
        f.variables.forEach(v => {
            r.values[v.symbol]={input:"", result:"", inunit_id:v.unit_id,}
        })
        return r;
    }

    parseValue(v:ValueU):ParsedValue{
        return ValueParser.parse(v.input);
    }

    evaluateFormula(run:FormulaRun, f:Formula){
        //If all variable has value
        let varsWithNoValue = f.variables.filter(v => !run.values[v.symbol].input || run.values[v.symbol].input.length == 0)
        if(varsWithNoValue.length > 0)
            return;
        
        let values:{[symbol:string]: number} = {};
        f.variables.forEach(v => {this.parseValue(run.values[v.symbol]); values[v.symbol]= parseInt(run.values[v.symbol].result)})
        
        //Set the nodes of each variable this as value provider
        try{
            let rootNode:any;
            rootNode = this.parse(f.formula);
            LatexParser.setValueProviderForVarNodes(rootNode, values) 
            rootNode.type() as number;
            run.result.input = rootNode.val.toString();
        }
        catch(exp){
            throw exp;
        }

    }

    validateVaue(v:ValueU){
        let nu = v.input.split(' ');
    }

    //UI interface
    isCurrentlyEdititng(): boolean {
        return this.state.uiState.detail_currResource != null
    }

    //Parsing interfaces
    parse(latex: string) {
        return LatexParser.parse(latex);
    }

    updateVariablesAndGlobals(rootNode, resource) {
        this.addSymbols(resource, LatexParser.getSymbols(rootNode));
    }

    addSymbols(formula: Formula, symbols: string[]) {
        let old_globals = formula.global_ids.map(id => this.getResource(id) as Global);
        let variables = [];
        let globals = [];
        symbols.forEach(s => {
            let v = formula.variables.find(v => v.symbol == s)
            if (v) {
                variables.push(v)
            }
            else {
                let g = old_globals.find(g => g.symbol == s);
                if (g) {
                    globals.push(g)
                }
                else {
                    let resources = this.state.resources as Global[];
                    let g1 = resources.find(r => r.type == 'globals' && r.symbol == s);
                    if (g1)
                        globals.push(g1);
                    else {
                        variables.push(Object.assign({}, this.createNewVariable(), { symbol: s }))
                    }
                }
            }
        })
        formula.variables = variables;
        formula.global_ids = globals.map(g => g.id);
    }

    setupSampleData(){
       this.state  = {
           resources:[]
       } as any;
       let data =[
            ['Length', 
                ['meter', 'm', "1"],
                ['feet', 'ft', "0.2" ]
            ],
            ['Area', 
                ['square meter', 'm2', "1"],
                ['square feet', 'ft2', "0.04"]
            ],
            ['Temperature', 
                ['Degree kelvin', 'K', "1"],
                ['Degree celcius', 'C', "0.2"],
            ]
       ]
        data.forEach(i => {
            let p = i[0] as string;
            let np = this.createNewProperty();
            np.name = p;
            this.state.resources.push(np);
            i.splice(0).forEach(j => {
                let u = this.createNewUnit(np);
                [u.name, u.symbol, u.factor] = [j[0], j[1], j[2]]
                this.state.resources.push(u);
            })
        })
    }


}
