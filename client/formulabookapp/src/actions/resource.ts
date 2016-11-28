import {Injectable} from '@angular/core';
import {Action} from '@ngrx/store';

@Injectable()
export class ResourceActions {
    
    static LOAD_RESOURCE = '[Resource] Load resources';
    loadResources(): Action {
        return {
            type: ResourceActions.ADD_RESOURCE,
        };
    }

    static LOAD_RESOURCE_SUCCESS = '[Resource] Load resources success';
    loadResourcesSuccess(resources): Action {
        return {
            type: ResourceActions.LOAD_RESOURCE_SUCCESS,
            payload:resources
        };
    }

    static LOAD_RESOURCE_FAILED = '[Resource] Load resources failed';
    loadResourcesFailed(error): Action {
        return {
            type: ResourceActions.LOAD_RESOURCE_FAILED,
            payload:error
        };
    }

    static ADD_RESOURCE = '[Resource] Add resource';
    addResource(resource): Action {
        return {
            type: ResourceActions.ADD_RESOURCE,
            payload:resource
        };
    }

    static ADD_RESOURCE_SUCCESS = '[Resource] Add resource success';
    AddResourceSuccess(resource): Action {
        return {
            type: ResourceActions.ADD_RESOURCE_SUCCESS,
            payload:resource      };
    }

    static ADD_RESOURCE_FAIL = '[Resource] Add resource failed';
    AddResourceFailed(resource): Action {
        return {
            type: ResourceActions.ADD_RESOURCE_FAIL,
            payload:resource
        };
    }

    static DELETE_RESOURCE = '[Resource] Delete resource';
    deleteResource(resource): Action {
        return {
            type: ResourceActions.DELETE_RESOURCE,
            payload:resource
        };
    }

    static DELETE_RESOURCE_SUCCESS = '[Resource] Delete resource success';
    deleteResourceSuccess(resources): Action {
        return {
            type: ResourceActions.DELETE_RESOURCE_SUCCESS,
            payload:resources
        };
    }

    static DELETE_RESOURCE_FAIL = '[Resource] Delete resource failed';
    deleteResourceFailed(resources): Action {
        return {
            type: ResourceActions.DELETE_RESOURCE_FAIL,
            payload:resources
        };
    }

    static EDIT_RESOURCES = '[Resource] Edit resources';
    editResources(resources): Action {
        return {
            type: ResourceActions.EDIT_RESOURCES,
            payload:resources
        }
    }

    static EDIT_RESOURCES_SUCCESS = '[Resource] Edit resources success';
    editResourcesSuccess(resource): Action {
        return {
            type: ResourceActions.EDIT_RESOURCES_SUCCESS,
            payload:resource
        }
    }

    static EDIT_RESOURCES_FAIL = '[Resource] Edit resources fail';
    editResourcesFail(resource): Action {
        return {
            type: ResourceActions.EDIT_RESOURCES_FAIL,
            payload:resource
        }
    }
 
}