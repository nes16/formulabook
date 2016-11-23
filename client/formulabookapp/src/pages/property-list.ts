import { NavParams, NavController } from 'ionic-angular';
import { ChangeDetectionStrategy, Component, OnInit, OnDestroy } from '@angular/core';
import { DetailPage } from '../pages/detail/detail';
import { ResourcePage } from './resource'
import { CategoryPage } from './category/category';
import { UnitListPage } from './unit-list';
import { Store } from '@ngrx/store';

import { Observable } from 'rxjs/Rx';
import * as fromRoot from '../reducers';
import {Property} from '../reducers/resource'
import {ResourceActions} from '../actions'
import {UIStateActions} from '../actions'
import { UUID } from 'angular2-uuid';

@Component({
    templateUrl: 'property-list.html',
    changeDetection: ChangeDetectionStrategy.OnPush
})

export class PropertyListPage extends ResourcePage  {
    args:any;
    /*For listing units*/
    viewType:string = 'All'
	properties$:Observable<Property[]>;
    selectedItems:Property[] = [];
    listMode:string = 'List';
    constructor(public store: Store<fromRoot.State>,
				public navParams: NavParams, 
              public nav: NavController,
              public actions:ResourceActions,
              public uiActions:UIStateActions) {
		super();
		this.properties$ = store.let(fromRoot.getProperties) as Observable<Property[]>
    }

    ngOnInit(){
    }

    selectedViewType(type){
    }

	type():string{
		return 'properties';
	}

    onClick(res){
       this.store.dispatch(this.uiActions.pushResources(res))
    }

    onPress(evt){
        this.listMode= 'Select';
    }                   

    onCheck(evt){
        if(evt.checked)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         
            this.selectedItems.push(evt.resource.id);
        else{
            let index = this.selectedItems.findIndex(evt.resource.id);
            if(index > -1)
                this.selectedItems.splice(index,1);
        }
    }

    onActionCmd(cmd:string){
        let flag=true;
        let resources;
        let subscription = this.store.let(fromRoot.getSelectedResources).subscribe(r => {
            resources = r;
            subscription.unsubscribe();
        })         
        switch(cmd){
            
            case 'Done':{
                this.listMode = 'List'
                return;
            }
            case 'Delete':{
                this.store.dispatch(this.actions.deleteResource(resources))
                return;
            }
            case 'Share':{
                let newresources = resources.map(r => Object.assign({},r,{shared:flag}))
                return;
            }
            case 'Categorize':{
                //this.nav.push(CategoryPage, {selectMode:true})
                return;
            }
            case 'Favourite':{
                let newresources = resources.map(r => Object.assign({},r,{shared:true}))
                return;
            }
            case 'Add':{
                let id = UUID.UUID();
                this.store.dispatch(this.uiActions.pushResources({type:'properties', name:'property1', id:id}))
                return;
            }
            default:{

            }

        }
    }

    onUnitClick(property){
        this.store.dispatch(this.uiActions.currentProperty(property))
        this.nav.push(UnitListPage, {property})
    }
}
