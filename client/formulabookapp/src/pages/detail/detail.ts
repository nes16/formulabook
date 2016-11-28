import { ChangeDetectionStrategy, Component, ViewChild } from '@angular/core';
import { App, NavController, NavParams, Content } from 'ionic-angular';
import * as  rootStore  from '../../reducers'

import { Store } from '@ngrx/store';
import { Observable } from 'rxjs/Rx';
import { UIState } from '../../reducers/uistate'
import { Resource, Property } from '../../reducers/resource'
import {ResourceActions} from '../../actions'
import {UIStateActions} from '../../actions'


@Component({
    templateUrl: 'detail.html',
    changeDetection: ChangeDetectionStrategy.OnPush
})

export class DetailPage {
    curRes$:Observable<Resource>;
    curProperty$:Observable<Property>;
    navMode:boolean = false;
    static root:DetailPage = null;
    constructor(public app:App, 
                public nav: NavController, 
                navParams: NavParams,
                public actions:ResourceActions, 
                public uiactions:UIStateActions, 
                public store: Store<rootStore.State>){

        this.curRes$ = this.store.let(rootStore.getCurrentResource);
        this.curProperty$ = this.store.let(rootStore.getCurrentProperty);
    }

    @ViewChild(Content) content: Content;

    
    ngOnInit() {
    }

    onSave(evt){
		   this.store.dispatch(this.actions.addResource(evt));
		   this.store.dispatch(this.uiactions.popResources());
    }

    onClose(evt){
        this.store.dispatch(this.uiactions.popResources());
    }
   
}