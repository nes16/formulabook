import { Inject, Injectable } from '@angular/core';

import { Observable } from 'rxjs/Rx';
import { UIStateService } from './ui-state-service'
import { RemoteService } from './remote-service'
import { UUID } from 'angular2-uuid';

import { Store } from '@ngrx/store';
import * as fromRoot from '../reducers';

import { Resource, Property, Unit, Global, Formula } from '../reducers/resource'

@Injectable()
export class NewDataService {

    state:fromRoot.State;
    constructor(public store: Store<fromRoot.State>){
        this.store.let(fromRoot.getState).subscribe(s => this.state = s)
    }

    createBaseResource(){
        return {
            shared:false,
            id:UUID.UUID(),
            favourite:false,
            user_id:-1,
            version:1
        }
    }
    getResource(id){
        return this.state.resources.find(i => i.id == id);
    }

    //Property interface
    createNewProperty():Property{
        return Object.assign(this.createBaseResource(), {
            name:'New Property',
            type:'properties'
        })
    }
    getDefaultUnit(p:Property){
        return this.state.resources.find(i => {
            let k = i as Unit;
            return i.type == 'units' && k.property_id == p.id && k.factor == "1"}
            )
    }

    //Unit interface
    createNewUnit(property):Unit{
        return Object.assign(this.createBaseResource(), {
            name:'New Unit',
            symbol:'s3',
            property_id:property?property.id:this.state.uiState.current_property.id,
            factor:"1",
            system:"SI",
            type:'units'
        })
    }
    
    getLatex(symbol:string){
        let [latex, s1, s] = ["", "", symbol];
        if (s) {
            if (s.length == 1) {
                return "\\text{" + s + "}";
            }
            //replace H2o as H_2o
            s1 = s.replace('H2O', 'H_2O');
            //replace ([a-zA-A])([1-9]) with g1^g2
            let [p, s2] = [/([A-Za-z])([1-9])/, '']
            while (s1 != s2) {
                s2 = s1;
                s1 = s1.replace(p, "$1^$2")
            }
            //replace ((a-zA-A )*) with \text{g1}
            let p2 = /([A-Za-z /]+)/
            s2 = ''
            let part1 = '';
            while (s1 != s2) {
                s2 = s1;
                s1 = s1.replace(p2, "\\text{$1}")
                if (s1 != s2) {
                    part1 += s1.slice(0, s1.lastIndexOf('}') + 1)
                    s1 = s1.slice(s1.lastIndexOf('}') + 1);
                }
                else {
                    part1 += s1;
                }
            }
            s1 = part1;
            return s1;
        }
        return s1

    }

    getFactor(u:Unit) {
        if (!u.factor || this.isFormulaFactor(u))
            return null;
        else
            return parseFloat(u.factor);
    }

    getFormulaFactor(u:Unit) {
        if (this.isFormulaFactor(u))
            return u.factor;
        else
            return null;
    }

    isFormulaFactor(u:Unit):boolean {
        if (!u.factor)
            return false;
        return u.factor.indexOf('x') != -1;
    }

    isDefaultUnit(u:Unit){
        return this.getFactor(u) == 1;
    }


    //Global interface
    createNewGlobal():Global{
        return Object.assign(this.createBaseResource(), {
            name:'New Global',
            value: "1",
            symbol:'g',
            type:'globals',
            unit_id:'37e01265-09ff-3587-b4f8-a5a085a6ca7c'
        })
    }

    //Formula interface
    createNewFormula():Resource{
        let f = Object.assign(this.createBaseResource(),{
            name:'New Formula',
            symbol:'f',
            latex:'x+y',
            type:'formulas'
        })
        return f;
    }
    

}