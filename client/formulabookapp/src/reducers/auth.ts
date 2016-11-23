import {Action, ActionReducer} from '@ngrx/store';
import {Observable} from 'rxjs/Observable';
import {AuthActions} from '../actions';
import * as _ from 'lodash';


export interface AuthState{
    access_token:string;
    email:string;
    expiry:string;
}


const initialState:AuthState = {
    access_token:null,
    email:null,
    expiry:null,
}

export let authState: ActionReducer<AuthState> = (state = initialState, action: Action) => {
        switch (action.type) {
            default: {
                return state;
            }
        }
    }