import {Action, ActionReducer} from '@ngrx/store';
import {Observable} from 'rxjs/Observable';

import {CategoryActions} from '../actions';
import * as _ from 'lodash';


export interface Category{
  id:string;
  name:string;
  parent_id:string;
}

const rootCategory:Category = {id:null, name:'Root', parent_id:null} 

export interface CategoryState{
  search:string;
  results:Category[];
  parents:Category[];
  modes:['search', 'singleSelect', 'multiSelect', 'edit', 'list']
  mode:boolean;
  editing:Category;
}

let categories:ActionReducer<Category[]> = (state, action:Action) => {
    switch (action.type) {
        case CategoryActions.ADD_CATEGORY: {
            return Object.assign({}, state, {list: [...state.list, action.payload]});
        }
        default: {
            return state;
        }
    }
}

let categoriesState:ActionReducer<CategoryState> = (state, action:Action) => {
    switch (action.type) {
        case CategoryActions.SET_CURRENT: {
            return  Object.assign({}, state, {list:action.payload});
        }
        case CategoryActions.SET_MODE: {
            return Object.assign({}, state, {list: [...state.list, action.payload]});
        }
        default: {
            return state;
        }
    }
}






