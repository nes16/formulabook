import { NavParams, NavController } from 'ionic-angular';
import { ChangeDetectionStrategy, Component, OnInit, OnDestroy } from '@angular/core';
import { DetailPage } from '../pages/detail/detail';
import { CategoryPage } from './category/category';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs/Rx';
import * as fromRoot from '../reducers';

import {Property, Unit, Global, Formula} from '../reducers/resource'
import {ResourceActions} from '../actions'
import {UIStateActions} from '../actions'
import { UUID } from 'angular2-uuid';
import * as std from '../lib/types/standard';

@Component({
    templateUrl: 'resource-list.html',
    changeDetection: ChangeDetectionStrategy.OnPush
})
interface ResourceInfo {
    title:string;
    ole:Observable<Resource>;
    type:string;
}
export class ResourceListPage  {
    type:string;
    properties$:Observable<Property[]>;
    units$:Observable<Unit[]>;=store.let(fromRoot.getUnits)
    globals$:Observable<Global[]>;=store.let(fromRoot.getGlobals)
    formulas$:Observable<Formula[]>;=store.let(fromRoot.getFormulas)
        
    /*For listing units*/
	properties$:Observable<Property[]>;
    static resourceInfos= {[type:string]:ResourceInfo};
    constructor(public store: Store<fromRoot.State>,
				public navParams: NavParams, 
              public nav: NavController,
              public actions:ResourceActions,
              public uiActions:UIStateActions) {
        this.type = navParams.get('type');
        if(this.type == 'properties'){
            this.property = navParams.get('property');
        }

        this.properties$  = store.let(fromRoot.getProperties)
        this.unit$ = store.let(fromRoot.getUnits)
        this.globals$ = store.let(fromRoot.getGlobals)
        this.formulas$ = store.let(fromRoot.getFormulas)
        
        if(ResourceListPage.resourceInfos == null){
    	    resourceInfos['properties']={
                title:'Properties',
                ole:this.properties$,
                type:'properties'}
            resourceInfos['units']={
                title:'Units - {{}}',
                ole:this.units$,
                type:'units'}
            resourceInfo['globals']={
                title:'Globals',
                ole:this.globals$,
                type:'globals'}
            resourceInfo['formulas']={
                title:'Formulas',
                ole:this.formulas$,
                type:'formulas'}
            }
        }
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
            this.selectedItems.push(evt.resource);
        else{
            let index = this.selectedItems.findIndex(evt.resource);
            if(index > -1)
                this.selectedItems.splice(index,1);
        }
    }

    
    onUnitClick(property){
        this.store.dispatch(this.uiActions.currentProperty(property))
        this.nav.push(ResourceListPage, {type:'units', property:property})
    }


    onActionCmd(cmd:string){
        let flag=true;
        switch(cmd){
            
            case 'Done':{
                this.listMode = 'List'
                return;
            }
            case 'Delete':{
                this.store.dispatch(this.actions.deleteResource(this.selectedItems.map(r => r.id)))
                return;
            }
            case 'Share':{
                let newresources = this.selectedItems.map(r => Object.assign({},r,{shared:flag}))
                return;
            }
            case 'Categorize':{
                //this.nav.push(CategoryPage, {selectMode:true})
                return;
            }
            case 'Favourite':{
                let newresources = this.selectedItems.map(r => Object.assign({},r,{favourite:true}))
                return;
            }
            case 'Add':{
                let gobj = new std.Global();
                this.store.dispatch(this.uiActions.pushResources(gobj.getState()))
                return;
            }
            default:{

            }

        }
    }
}
