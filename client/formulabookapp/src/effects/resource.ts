import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';
import 'rxjs/add/operator/startWith';
import 'rxjs/add/operator/switchMap';
import 'rxjs/add/operator/mergeMap';
import 'rxjs/add/operator/toArray';
import { Injectable } from '@angular/core';
import { Action } from '@ngrx/store';
import { Effect, Actions } from '@ngrx/effects';
import { Database } from '@ngrx/db';
import { Observable } from 'rxjs/Observable';
import { defer } from 'rxjs/observable/defer';
import { of } from 'rxjs/observable/of';

import {State} from '../reducers';
import {ResourceActions} from '../actions';
import { Resource } from '../reducers/resource';


@Injectable()
export class ResourceEffects {
  constructor(private actions$: Actions, public ractions:ResourceActions, private db: Database) { }

  /**
   * This effect does not yield any actions back to the store. Set
   * `dispatch` to false to hint to @ngrx/effects that it should
   * ignore any elements of this effect stream.
   * 
   * The `defer` observable accepts an observable factory function
   * that is called when the observable is subscribed to.
   * Wrapping the database open call in `defer` makes
   * effect easier to test.
   */
  @Effect({ dispatch: false })
  openDB$: Observable<any> = defer(() => {
    return this.db.open('formulalib_app');
  });

  /**
   * This effect makes use of the `startWith` operator to trigger
   * the effect immediately on startup.
   */
  @Effect()
  loadResources$: Observable<Action> = this.actions$
    .ofType(ResourceActions.LOAD_RESOURCE)
    .startWith(this.ractions.loadResources())
    .switchMap(() =>
      this.db.query('resources')
        .toArray()
        .map((resources: Resource[]) => this.ractions.loadResourcesSuccess(resources))
        .catch(error => Observable.of(this.ractions.loadResourcesFailed(error)))
    );

  @Effect()
  addResourceToCollection$: Observable<Action> = this.actions$
    .ofType(ResourceActions.ADD_RESOURCE)
    .map((action: Action) => action.payload)
    .mergeMap(resource =>
      this.db.insert('resources', [ resource ])
        .map(() => this.ractions.AddResourceSuccess(resource))
        .catch((error) => {
          console.log('Error in addResourceToCollection')
          console.log(JSON.stringify(error))
         return  Observable.of(this.ractions.AddResourceFailed(error))
        })
    );

  @Effect()
  removeResourceFromCollection$: Observable<Action> = this.actions$
    .ofType(ResourceActions.DELETE_RESOURCE)
    .map((action: Action) => action.payload)
    .mergeMap(resources => 
      this.db.executeWrite('resources', 'delete', resources)
        .map((r) => this.ractions.deleteResourceSuccess(r))
        .catch((error) => Observable.of(this.ractions.deleteResourceFailed(error)))
    );

  
  @Effect()
  editResourcesInCollection$: Observable<Action> = this.actions$
    .ofType(ResourceActions.EDIT_RESOURCES)
    .map((action: Action) => action.payload)
    .mergeMap(resources =>
      this.db.executeWrite('resources', 'put', resources)
        .map((resource) => this.ractions.editResourcesSuccess(resource))
        .catch((error) => of(this.ractions.editResourcesFail(error)))
    );
}