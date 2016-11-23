import {Injectable} from '@angular/core';
import {Action} from '@ngrx/store';

@Injectable()
export class CategoryActions {

    static ADD_CATEGORY = '[Category] Add category';
    addResource(category): Action {
        return {
            type: CategoryActions.ADD_CATEGORY,
            payload:category
        };
    }

    static SET_CURRENT = '[Category] Set current';
    addResouceSuccess(category): Action {
        return {
            type: CategoryActions.SET_CURRENT,
            payload: category
        };
    }

    static SET_MODE = '[Category] Set mode';
    updateResource(mode): Action {
        return {
            type: CategoryActions.SET_MODE,
            payload: mode
        };
    }

}