import {Injectable} from '@angular/core';
import {Action} from '@ngrx/store';

@Injectable()
export class SyncActions {

   static SYNC = '[Remote] Sync';
   remoteSync(type, syncInfo): Action {
        return {
            type: SyncActions.SYNC,
            payload: syncInfo
        }
    }


    static SYNC_SUCCESS = '[Remote] Sync success';
    remoteSyncSuccess(type, syncInfo): Action {
        return {
            type: SyncActions.SYNC_SUCCESS,
            payload: syncInfo
        }
    }


    static SYNC_FAILED = '[Remote] Sync failed';
    remoteSyncFailed(type, syncInfo): Action {
        return {
            type: SyncActions.SYNC_FAILED,
            payload: syncInfo
        }
    }
}