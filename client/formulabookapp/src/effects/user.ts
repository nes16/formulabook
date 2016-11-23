import {Injectable, Inject} from '@angular/core';
import {Effect, Actions} from '@ngrx/effects';

import {State} from '../reducers';
import {AuthActions} from '../actions';

@Injectable()
export class UserEffects {
    constructor (
        private update$: Actions,
        private authActions: AuthActions,
    ) {}

}