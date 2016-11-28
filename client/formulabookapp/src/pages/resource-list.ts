import { NavParams, NavController } from 'ionic-angular';
import { ChangeDetectionStrategy, Component, OnInit, OnDestroy } from '@angular/core';
import { DetailPage } from '../pages/detail/detail';
import { CategoryPage } from './category/category';
import { Store } from '@ngrx/store';
import { NewDataService } from '../providers/new-data-service';
import { Observable, Observer } from 'rxjs/Rx';
import * as fromRoot from '../reducers';

import { Resource, Property, Unit, Global, Formula } from '../reducers/resource'
import { ResourceActions } from '../actions'
import { UIStateActions } from '../actions'
import { UUID } from 'angular2-uuid';
import * as std from '../lib/types/standard';

export interface ButtonStatus {
    share?: { enable_button: boolean, disable_button: boolean },
    favourite?: { enable_button: boolean, disable_button: boolean }
}


export interface ResourceInfo {
    title: Observable<string>;
    fetchfn: (state$: Observable<fromRoot.State>) => Observable<Resource[]>;
    type: string;
    //New object creaating function
    protofn: string;
    param?: any;
};

@Component({
    templateUrl: 'resource-list.html',
    changeDetection: ChangeDetectionStrategy.OnPush
})

export class ResourceListPage {
    type: string;
    editMode: boolean = false;
    selectionStatus$: Observable<any>;
    selectionStatus$$: Observer<any>;
    selectedItems: Resource[] = [];
    resources$: Observable<Resource[]>;
    currentProperty$: Observable<Property>;
    info: ResourceInfo;
    static resourceInfos: { [type: string]: ResourceInfo; } = {};
    mode:string;

    constructor(public store: Store<fromRoot.State>,
        public nds:NewDataService,
        public navParams: NavParams,
        public nav: NavController,
        public actions: ResourceActions,
        public uiActions: UIStateActions) {
        this.type = navParams.get('type');
        this.mode = navParams.get('mode');
        this.currentProperty$ = store.let(fromRoot.getCurrentProperty);

        if (ResourceListPage.resourceInfos['formulas'] == null) {
            ResourceListPage.resourceInfos['properties'] = {
                title: Observable.of('Properties'),
                fetchfn: fromRoot.getProperties,
                type: 'properties',
                protofn: 'createNewProperty'
            }
            ResourceListPage.resourceInfos['units'] = {
                title: this.currentProperty$.map(p => 'Units of ' + p.name),
                fetchfn: fromRoot.getUnits,
                type: 'units',
                protofn: 'createNewUnit',
                param: null
            }
            ResourceListPage.resourceInfos['globals'] = {
                title: Observable.of('Globals'),
                fetchfn: fromRoot.getGlobals,
                type: 'globals',
                protofn: 'createNewGlobal'
            }
            ResourceListPage.resourceInfos['formulas'] = {
                title: Observable.of('Formulas'),
                fetchfn: fromRoot.getFormulas,
                type: 'formulas',
                protofn: 'createNewFormula'
            }
        }
        this.info = ResourceListPage.resourceInfos[this.type];
        this.resources$ = store.let(this.info.fetchfn) as Observable<Resource[]>;

        this.selectionStatus$ = Observable.create(or => this.selectionStatus$$ = or);
        this.selectionStatus$.subscribe().unsubscribe();
    }

   
    ngOnInit() {
    }

    ngAfterViewInit(){
        
    }

    onClick(res, e) {
        e.stopPropagation();
        if(this.mode == 'select'){
            this.store.dispatch(this.uiActions.selectResource(res));
            this.nav.pop();
            return;
        }
        this.store.dispatch(this.uiActions.pushResources(res))
    }

    onPress(evt) {
        if(this.mode == 'select')
            return;
        this.editMode = true;
        this.updateSelectionStatus();
    }

    onCheck(resource, evt) {
        if (evt.checked == true)
            this.selectedItems.push(resource);
        else {
            let i = this.selectedItems.indexOf(resource);
            if (i > -1) {
                this.selectedItems.splice(i, 1);
            }
        }
        this.updateSelectionStatus();
    }

    updateSelectionStatus() {
        let status: ButtonStatus = {};
        status = {
            share: { enable_button: false, disable_button: false },
            favourite: { enable_button: false, disable_button: false }
        }

        this.selectedItems.map(i => {
            if (i.shared)
                status.share.disable_button = true;
            else
                status.share.enable_button = true;
            if (i.favourite)
                status.favourite.disable_button = true;
            else
                status.favourite.enable_button = true;
        })
        if (this.selectedItems.length == 0) {
            status = {
                share: { enable_button: true, disable_button: false },
                favourite: { enable_button: true, disable_button: false }
            }
        }

        this.selectionStatus$$.next(status);
    }


    onUnitClick(property, evt) {
        evt.stopPropagation();
        this.store.dispatch(this.uiActions.currentProperty(property))
        this.nav.push(ResourceListPage, { type: 'units', property: property })
    }


    onActionCmd(cmd: string) {
        this.editMode = false;
               
        switch (cmd) {
            case 'Delete': {
                this.store.dispatch(this.actions.deleteResource(this.selectedItems.map(r => r.id)))
                break;
            }
            case 'Share': {
                let newresources = this.selectedItems.map(r => Object.assign({}, r, { share: true }))
                this.store.dispatch(this.actions.editResources(newresources))
                break;
            }
            case 'Unshare': {
                let newresources = this.selectedItems.map(r => Object.assign({}, r, { share: false }))
                this.store.dispatch(this.actions.editResources(newresources))
                break;
            }
            case 'Categorize': {
                //this.nav.push(CategoryPage, {selectMode:true})
                break;
            }
            case 'Favourite': {
                let newresources = this.selectedItems.map(r => Object.assign({}, r, { favourite: true }))
                this.store.dispatch(this.actions.editResources(newresources))
                break;
            }
            case 'Unfavourite': {
                let newresources = this.selectedItems.map(r => Object.assign({}, r, { favourite: false }))
                this.store.dispatch(this.actions.editResources(newresources))
                break;
            }
            case 'Add': {
                let obj = this.nds[this.info.protofn](this.info.param);
                this.store.dispatch(this.uiActions.pushResources(obj))
                break;
            }
            case 'Done':
            default: {

            }
        }
        this.selectedItems = []; 
    }

    selectedViewType(type) {
    }

}
