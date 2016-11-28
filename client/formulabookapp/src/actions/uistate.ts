import {Injectable} from '@angular/core';
import {Action} from '@ngrx/store';

@Injectable()
export class UIStateActions {
   static SHOW_SIDE_PANEL = '[UIState] Show side panel';
   showSidePanel(): Action {
        return {
            type: UIStateActions.SHOW_SIDE_PANEL
        }
    }


    static HIDE_SIDE_PANEL = '[UIState] Hide side panel';
    hideSidePanel(): Action {
        return {
            type: UIStateActions.HIDE_SIDE_PANEL
        }
    }


    static SHOW_NAV_BAR = '[UIState] Show nav bar';
    showNavBar(): Action {
        return {
            type: UIStateActions.SHOW_NAV_BAR
        }
    }

    static SHOW_ACTION_BAR = '[UIState] Show action bar';
    showActionBar(): Action {
        return {
            type: UIStateActions.SHOW_ACTION_BAR
        }
    }

    static PUSH_RESOURCES = '[UIState] Push resource';
    pushResources(resource): Action {
        return {
            type: UIStateActions.PUSH_RESOURCES,
            payload:resource
        };
    }
    
    static POP_RESOURCES = '[UIState] Pop resource';
    popResources(): Action {
        return {
            type: UIStateActions.POP_RESOURCES,
        };
    }

    static SELECT_RESOURCE = '[UIState] Select resource'
    selectResource(resource){
        return{
            type:UIStateActions.SELECT_RESOURCE,
            payload:resource
        }
    }   

    static CURRENT_PROPERTY = '[UIState] Current property';
    currentProperty(property){
        return{
            type:UIStateActions.CURRENT_PROPERTY,
            payload:property
        }
    }      
}