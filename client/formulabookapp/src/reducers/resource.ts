import {Action, ActionReducer} from '@ngrx/store';
import {Observable} from 'rxjs/Observable';
import * as std from './interfaces'
import {ResourceActions} from '../actions';
import _ from "lodash";


const initialState = []


export let resources:ActionReducer<std.Resource[]> = (state=initialState, action:Action) => {
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




