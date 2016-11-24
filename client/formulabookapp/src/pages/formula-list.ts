import { NavParams, NavController } from 'ionic-angular';
import { ChangeDetectionStrategy, Component, OnInit, OnDestroy } from '@angular/core';
import { DetailPage } from '../pages/detail/detail';
import { CategoryPage } from './category/category';
import { UnitListPage } from './unit-list';
import { Store } from '@ngrx/store';

import { Observable } from 'rxjs/Rx';
import * as fromRoot from '../reducers';
import {Formula} from '../reducers/resource'
import {ResourceActions} from '../actions'
import {UIStateActions} from '../actions'
import { UUID } from 'angular2-uuid';
import * as std from '../lib/types/standard';
'
@Component({
    templateUrl: 'formula-list.html',
    changeDetection: ChangeDetectionStrategy.OnPush
})

export class FormulaListPage {
    args:any;
    /*For listing units*/
    viewType:string = 'All'
	formulas$:Observable<Formula[]>;
    selectedItems:Formula[] = [];
    listMode:string = 'List';
    constructor(public store: Store<fromRoot.State>,
				public navParams: NavParams, 
              public nav: NavController,
              public actions:ResourceActions,
              public uiActions:UIStateActions) {
		this.formulas$ = store.let(fromRoot.getFomulas) as Observable<Formula[]>
    }

    ngOnInit(){
    }

    selectedViewType(type){
    }

	type():string{
		return 'formulas';
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
              let fobj = new std.Formula();
                this.store.dispatch(this.uiActions.pushResources(fobj.getState()))
                return;
            }
            default:{

            }

        }
    }
}
