import {Action, ActionReducer} from '@ngrx/store';
import {Observable} from 'rxjs/Observable';

import {ResourceActions} from '../actions';
import _ from "lodash";

export interface Resource{
    type:string;
    id:string;
    name:string;
    user_id:number;
    shared:boolean;
    favourite:boolean;
    version:number;
}

export interface Property extends Resource {
}

export interface Unit extends Resource {
    property_id:string;
    factor:string;
    symbol:string;
    system:string;
}

export interface ValueU {
    input:string;
    unit_id:string;
    result:string;
}

export interface FormulaRun{
    name:string;
    values:{[symbol: string]:ValueU};
    result:ValueU;
}
export interface Variable {
    index:number;
    name?:string;
    symbol:string;
    unit_id:string;
}
export interface Global extends Resource {
    unit_id?:string;
    value:string;
    symbol:string;

}

export interface Formula extends Resource {
    symbol:string;
    unit_id:string;
    formula:string;
    variables:Variable[]
    global_ids:string[];
    runs:FormulaRun[];
}

export interface Favourite{
    id:string;
    favoritable_type:string;
    favoritable_id:string;
}

export interface Category{
    id:string;
    name:string;
    partent_id:string;
}

export interface CategoryResource{
    id:string;
    categorizable_id:string;
    categorizable_type:string;
}


const initialState = []


export let resources:ActionReducer<Resource[]> = (state=initialState, action:Action) => {
    switch (action.type) {
        case ResourceActions.LOAD_RESOURCE: {
            // return Object.assign({}, state, {
            //     loading: true
            // });
            return state;
        }

        case ResourceActions.LOAD_RESOURCE_SUCCESS: {
            return action.payload;
        }

        case ResourceActions.ADD_RESOURCE_SUCCESS:{
            const resource = action.payload;
            let index = _.findIndex(state, {id: resource.id});
            if (index >= 0) {
                return [
                    ...state.slice(0, index),
                    resource,
                    ...state.slice(index + 1)
                ];
            }
            else{
                return [...state, resource]
            }
        }


        case ResourceActions.DELETE_RESOURCE_FAIL: {
            const resource = action.payload;
            return state;
        }

        case ResourceActions.DELETE_RESOURCE_SUCCESS:{
            const id = action.payload;

            return state.filter(r => r.id !== id)
        }


        case ResourceActions.ADD_RESOURCE_FAIL: {
            return state;
        }

        case ResourceActions.EDIT_RESOURCES_SUCCESS: {
            const resource = action.payload;
            let index = _.findIndex(state, {id: resource.id});
            if (index >= 0) {
                return [
                    ...state.slice(0, index),
                    resource,
                    ...state.slice(index + 1)
                ];
            }
            return state;
        }

        case ResourceActions.EDIT_RESOURCES_FAIL: {

            return state;
        }
        
        default: {
            return state;
        }
    }
}




