import '@ngrx/core/add/operator/select';
import 'rxjs/add/operator/switchMap';
import 'rxjs/add/operator/let';
import { Observable } from 'rxjs/Observable';
import { combineLatest } from 'rxjs/observable/combineLatest';
import { ActionReducer } from '@ngrx/store';
import { environment } from '../environments/environment';
/**
 * The compose function is one of our most handy tools. In basic terms, you give
 * it any number of functions and it returns a function. This new function
 * takes a value and chains it through every composed function, returning
 * the output.
 *
 * More: https://drboolean.gitbooks.io/mostly-adequate-guide/content/ch5.html
 */
import { compose } from '@ngrx/core/compose';

/**
 * storeFreeze prevents state from being mutated. When mutation occurs, an
 * exception will be thrown. This is useful during development mode to
 * ensure that none of the reducers accidentally mutates the state.
 */
import { storeFreeze } from 'ngrx-store-freeze';

/**
 * combineReducers is another useful metareducer that takes a map of reducer
 * functions and creates a new reducer that stores the gathers the values
 * of each reducer and stores them using the reducer's key. Think of it
 * almost like a database, where every reducer is a table in the db.
 *
 * More: https://egghead.io/lessons/javascript-redux-implementing-combinereducers-from-scratch
 */
import { combineReducers } from '@ngrx/store';



// reducers
import { resources, Resource, Property, Unit } from './resource';
import { uiState, UIState } from './uistate';
import { authState, AuthState } from './auth';
import { ResourceActions } from '../actions'
import { CategoryState, Category } from './category';

export interface State {
  resources: Resource[];
  uiState: UIState;
  authState: AuthState;
  categories: Category[];
  categoryState: CategoryState;
}

/**
 * Because metareducers take a reducer function and return a new reducer,
 * we can use our compose helper to chain them together. Here we are
 * using combineReducers to make our top level reducer, and then
 * wrapping that in storeLogger. Remember that compose applies
 * the result from right to left.
 */
const reducers = {
  resources,
  uiState,
  authState
};

const developmentReducer: ActionReducer<State> = compose(storeFreeze, combineReducers)(reducers);
const productionReducer: ActionReducer<State> = combineReducers(reducers);

export function reducer(state: any, action: any) {
  if (environment.production) {
    return productionReducer(state, action);
  }
  else {
    return developmentReducer(state, action);
  }
}


/**
 * A selector function is a map function factory. We pass it parameters and it
 * returns a function that maps from the larger state tree into a smaller
 * piece of state. This selector simply selects the `books` state.
 *
 * Selectors are used with the `let` operator. They take an input observable
 * and return a new observable. Here's how you would use this selector:
 *
 * ```ts
 * class MyComponent {
 * 	constructor(state$: Observable<State>) {
 * 	  this.booksState$ = state$.let(getBooksState);
 * 	}
 * }
 * ```
 *
 * Note that this is equivalent to:
 * ```ts
 * class MyComponent {
 * 	constructor(state$: Observable<State>) {
 * 	  this.booksState$ = getBooksState(state$);
 * 	}
 * }
 * ```
 *
 */
export function getProperties(state$: Observable<State>) {
  return state$.select(state => state.resources.filter(r => r.type=="properties"));
}
export function getShowLoggedinMenu(state$: Observable<State>){
  return state$.select(state => state.authState.access_token);
}

export function getCategories(state$: Observable<State>){
  return state$.map(state => {
                let parents = state.categoryState.parents;
                let current = parents[parents.length - 1];
                return state.categories.filter(c => c.parent_id == current.id);
  })
}

export function getCurrentCategoryHirarchy(state$: Observable<State>){
  return state$.map(state => state.categoryState.parents)
}

export function getTabStatus(state$:Observable<State>){
  let a:{index:number, navLength:number}
  return state$.map(state => {
              let res = {active_index:state.uiState.active_tab_index,
              nav_length:state.uiState.detail_nav_stake.length}
              return res;
          })
}


export function getSelectedResources(state$:Observable<State>){
  return state$.map(state => 
    state.uiState.list_selection
  )
} 

export function getUnits(state$:Observable<State>){
  return state$.map(state => {  
    let units = (state.resources as Unit[]).filter(r => r.type == 'units' && r.property_id == state.uiState.current_property.id)    
    return units;
  })
}


export function getCurrentProperty(state$:Observable<State>){
  return state$.map(state => state.uiState.current_property)    
}