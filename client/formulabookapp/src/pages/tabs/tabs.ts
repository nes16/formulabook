import { Component, ViewChild } from '@angular/core';
import { NavParams, Tabs } from 'ionic-angular';
import { ResourceListPage } from '../resource-list';
import { DetailPage } from '../detail/detail';

import { Store } from '@ngrx/store';
import { Observable } from 'rxjs/Rx';
import * as fromRoot from '../../reducers';


const TAB_INDEX_DETAIL:number = 3;

@Component({
  template: `
  <ion-tabs tabbarPlacement="bottom" #myTabs>
    <ion-tab [root]="rootInfo0.page"  [rootParams]="rootInfo0.params" tabTitle="Units" tabIcon="map"></ion-tab>
    <ion-tab [root]="rootInfo1.page"  [rootParams]="rootInfo1.params" tabTitle="Global" tabIcon="map"></ion-tab>
    <ion-tab [root]="rootInfo2.page"  [rootParams]="rootInfo2.params" tabTitle="Formula" tabIcon="map"></ion-tab>
    <ion-tab [root]="rootInfo3.page"  [rootParams]="rootInfo3.params" show="false" tabTitle="Details" tabIcon="information-circle">
    </ion-tab>
  </ion-tabs>
  `
})

export class TabsPage {
  // set the root pages for each tab
  rootInfo0:any;
  rootInfo1:any;
  rootInfo2:any;
  rootInfo3:any;
  constructor(public store: Store<fromRoot.State>, 
              navParams: NavParams) {
    this.rootInfo0 =  {page:ResourceListPage, params:{type:'properties'}},
    this.rootInfo1 = {page:ResourceListPage, params:{type:'globals'}},
    this.rootInfo2 = {page:ResourceListPage, params:{type:'formulas'}},
    this.rootInfo3 = {page:DetailPage,   params:{}},

    this.store.let(fromRoot.getTabStatus).subscribe(status => {
        if(status.active_index == TAB_INDEX_DETAIL && status.nav_length > 0){
          if(this.tabRef){
            if(this.tabRef.getSelected() != this.tabRef.getByIndex(TAB_INDEX_DETAIL))
              this.tabRef.select(TAB_INDEX_DETAIL);
            this.showTabs(false);
          }
        }
        else{
          if(this.tabRef){
            this.showTabs(true);
            if(this.tabRef.getSelected() != this.tabRef.getByIndex(status.active_index))
              this.tabRef.select(status.active_index);
            //this.tabRef.select(status.active_index);
          }
        }
    })
  }

  ngOnInit(){
  }


  ngAfterViewInit(){
    
  }

  @ViewChild('myTabs') tabRef: Tabs;

  showTabs(flag:boolean){
    for (var index = 0; index < TAB_INDEX_DETAIL; index++) {
      this.tabRef.getByIndex(index).show = flag;
    }
  }

}
