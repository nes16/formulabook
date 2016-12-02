import { Inject, Injectable } from '@angular/core';

import { Observable } from 'rxjs/Rx';
import { UIStateService } from './ui-state-service'
import { RemoteService } from './remote-service'
import { UUID } from 'angular2-uuid';

import { Store } from '@ngrx/store';
import * as fromRoot from '../reducers';
import { LatexParser } from '../lib/latex-parser'

import { Resource, Property, Unit, Global, Formula, FormulaRun, ValueU } from '../reducers/resource'

@Injectable()
export class NewDataService {

    state: fromRoot.State;
    constructor(public store: Store<fromRoot.State>) {
        this.store.let(fromRoot.getState).subscribe(s => this.state = s)
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

    //Unit interface
    createNewUnit(property): Unit {
        return Object.assign(this.createBaseResource(), {
            name: 'New Unit',
            symbol: 's3',
            property_id: property ? property.id : this.state.uiState.current_property.id,
            factor: "1",
            system: "SI",
            type: 'units'
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

    isDefaultUnit(u: Unit) {
        return this.getFactor(u) == 1;
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
            result: {input:"", result:"", unit_id:f.unit_id,}
        }
        f.variables.forEach(v => {
            r.values[v.symbol]={input:"", result:"", unit_id:v.unit_id,}
        })
        return r;
    }

    evaluateFormula(run:FormulaRun, f:Formula){
        
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

}