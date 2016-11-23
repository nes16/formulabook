import { NavParams, NavController } from 'ionic-angular';
import { ChangeDetectionStrategy, Component, OnInit, OnDestroy } from '@angular/core';
import { DetailPage } from '../pages/detail/detail';
import { ResourcePage } from './resource'
import { CategoryPage } from './category/category';
import { Store } from '@ngrx/store';

import { Observable } from 'rxjs/Rx';
import * as fromRoot from '../reducers';
import {Property, Unit} from '../reducers/resource'
import {ResourceActions} from '../actions'
import {UIStateActions} from '../actions'
import { UUID } from 'angular2-uuid';
import * as std from '../lib/types/standard';
@Component({
    templateUrl: 'unit-list.html',
    changeDetection: ChangeDetectionStrategy.OnPush
})

export class UnitListPage extends ResourcePage  {
    args:any;
    /*For listing units*/
    viewType:string = 'All'
	units$:Observable<Unit[]>;
    property:Property;
    listMode:string = 'List';
    constructor(public store: Store<fromRoot.State>,
				public navParams: NavParams, 
              public nav: NavController,
              public actions:ResourceActions,
              public uiActions:UIStateActions) {
		super();
		this.units$ = store.let(fromRoot.getUnits);
		store.let(fromRoot.getCurrentProperty).subscribe(p => this.property = p);
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
            this.store.dispatch(this.uiActions.selectResource(evt.resource))
        else{
            this.store.dispatch(this.uiActions.unselectResource(evt.resource))
        }
    }

    onActionCmd(cmd:string){
        let flag=true;
        let resources = this.store.let(fromRoot.getSelectedResources)         
        switch(cmd){
            
            case 'Done':{
                this.listMode = 'List'
                return;
            }
            case 'Delete':{
                this.store.dispatch(this.actons.deleteResource(resources))
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
                let pobj = new std.Property(this.property);
                let uobj = pobj.newUnit(true);
                this.store.dispatch(this.uiActions.pushResources(Object.assign({},uobj.getState())))
                return;
            }
            default:{

            }

        }
    }
}
