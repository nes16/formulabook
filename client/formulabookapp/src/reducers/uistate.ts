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
    list_selection:Resource[];
    nav_all:string;
    nav_mode:string;
    showKB:boolean;
    view_type:string;
}

let initialState:UIState = {
    active_tab_index:0,
    detail_nav_stake:[],
    filter_type:'All',
    list_selection:[],
    nav_all:'Select All',
    nav_mode:'List',
    showKB:false,
    view_type:'Uncategorized',
};


export let uiState: ActionReducer<UIState> = (state = initialState, action: Action) => {
        let newState:any;
        switch (action.type) {
            case UIStateActions.PUSH_RESOURCES:
                newState={
                    active_tab_index:1,
                    detail_nav_stake:[...state.detail_nav_stake, action.payload],
                    detail_currResource:action.payload,
                }
                state = Object.assign({},state, newState);
                return state;
            case UIStateActions.POP_RESOURCES:
                let stake = [...state.detail_nav_stake];
                let newResource = stake.pop();
                let active_tab_index = stake.length == 0?0:1; 
                newState={
                    active_tab_index:active_tab_index,
                    detail_nav_stake:stake,
                    detail_currResource:newResource,
                }
                state = Object.assign({},state, newState);
                return state;
            case UIStateActions.SWITCH_SELECT_MODE:{
                let ns={
                    nav_select_mode:true
                }
                state=Object.assign({},ns,state);
                return state;
            }
            
            case UIStateActions.RETURN_TO_LIST_MODE:{
                let ns={
                    nav_select_mode:false
                }
                state=Object.assign({},ns,state);
                return state;
            }

            case UIStateActions.TOGGLE_SELECT_ALL:{
                let ns={
                  nav_all:state.nav_all == 'Select All'?'Clear All':'Select All'
                }
                state=Object.assign({},ns,state);
                return state;
            }

            case UIStateActions.SELECT_RESOURCE:{
                let ns={
                  list_selection:[...state.list_selection, action.payload]
                }
                state=Object.assign({},ns,state);
                return state;

            }

            case UIStateActions.UNSELECT_RESOURCE:{
                const resource = action.payload;
                let index = _.findIndex(state.list_selection, {id: resource.id});
                if (index >= 0) {
                    let ns = [
                        ...state.list_selection.slice(0, index),
                        ...state.list_selection.slice(index + 1)
                    ];
                    return state=Object.assign({},ns,state);
                }
                return state;
            }

            case UIStateActions.CURRENT_PROPERTY:{
                let ns={
                  current_property:action.payload
                }
                state=Object.assign({},ns,state);
                return state;
            }

            default: {
                return state;
            }
        }
    }
