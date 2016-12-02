import {Action, ActionReducer} from '@ngrx/store';
import {Observable} from 'rxjs/Observable';
import {UIStateActions} from '../actions/uistate';
import {Resource, Property} from './resource'
import _ from "lodash";


/*
 *
 *filter_type:'All'/'Favourite'/'Library' 
 *nav_mode:'List'/'Select'/'Detail' 
 */ 
export interface UIState{
    active_tab_index:number;
    current_property?:Property;
    detail_nav_stake:Resource[];
    detail_currResource?:Resource;
    filter_type:string;
    selection:Resource[];
    showKB:boolean;
    view_type:string;
}

let initialState:UIState = {
    active_tab_index:0,
    detail_nav_stake:[],
    filter_type:'All',
    selection:[],
    showKB:false,
    view_type:'Uncategorized',
};

let TabIndex_Page:{[type:string]:number}={
    'properties':0,
    'units':0,
    'globals':1,
    'formulas':2
}

export let uiState: ActionReducer<UIState> = (state = initialState, action: Action) => {
        let newState:any;
        switch (action.type) {
            case UIStateActions.PUSH_RESOURCES:{
                newState={
                    active_tab_index:3,
                    detail_nav_stake:[...state.detail_nav_stake, action.payload],
                    detail_currResource:action.payload,
                }
                state = Object.assign({},state, newState);
                return state;
            }
            case UIStateActions.POP_RESOURCES:{
                let stake = [...state.detail_nav_stake];
                let oldResource = stake.pop();
                let newResource = stake.pop();
                if(newResource)
                    stake.push(newResource);
                let active_tab_index = TabIndex_Page[oldResource.type] 
                newState={
                    active_tab_index:active_tab_index,
                    detail_nav_stake:stake,
                    detail_currResource:newResource,
                }
                state = Object.assign({},state, newState);
                return state;
            }
            case UIStateActions.SELECT_RESOURCE:{
                let ns={
                  selection:[action.payload]
                }
                state=Object.assign({},state, ns);
                return state;
            }

            case UIStateActions.CURRENT_PROPERTY:{
                let ns={
                  current_property:action.payload
                }
                state=Object.assign({},state, ns);
                return state;
            }

            default: {
                return state;
            }
        }
    }
