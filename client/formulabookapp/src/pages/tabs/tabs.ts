import { Component, ViewChild } from '@angular/core';
import { NavParams, Tabs } from 'ionic-angular';
import { PropertyListPage } from '../property-list';
import { DetailPage } from '../detail/detail';
import { GlobalListPage } from '../global-list';
import { FormulaListPage } from '../formula-list';

import { Store } from '@ngrx/store';
import { Observable } from 'rxjs/Rx';
import * as fromRoot from '../../reducers';


const TAB_INDEX_DETAIL:number = 3;

@Component({
  template: `
  <ion-tabs tabbarPlacement="bottom" #myTabs>
    <ion-tab [root]="rootInfo[0].page"  [rootParams]="rootInfo[0].params" tabTitle="Units" tabIcon="map"></ion-tab>
    <ion-tab [root]="rootInfo[1].page"  [rootParams]="rootInfo[1].params" tabTitle="Global" tabIcon="map"></ion-tab>
    <ion-tab [root]="rootInfo[2].page"  [rootParams]="rootInfo[2].params" tabTitle="Formula" tabIcon="map"></ion-tab>
    <ion-tab [root]="rootInfo[4].page"  [rootParams]="rootInfo[3].params" show="false" tabTitle="Details" tabIcon="information-circle"></ion-tab>
  </ion-tabs>
  `
})

export class TabsPage {
  // set the root pages for each tab
  rootInfo: any[] = [
                      {page:ResourceListPage, params={type:'properties'}},
                      {page:ResourceListPage, params={type:'globals'}},
                      {page:ResourceListPage, params={type:'formulas'}},
                      {page:DetailListPage,   params={}},
                    ]
  constructor(public store: Store<fromRoot.State>, 
              navParams: NavParams) {
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
