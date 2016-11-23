import { Component, ViewChild } from '@angular/core';
import { NavParams, Tabs } from 'ionic-angular';
import { PropertyListPage } from '../property-list';
import { DetailPage } from '../detail/detail';

import { Store } from '@ngrx/store';
import { Observable } from 'rxjs/Rx';
import * as fromRoot from '../../reducers';


const TAB_INDEX_DETAIL:number = 1;

@Component({
  template: `
  <ion-tabs tabbarPlacement="bottom" #myTabs>
    <ion-tab [root]="tab1Root"  tabTitle="Units" tabIcon="map"></ion-tab>
    <ion-tab [root]="tab2Root"  show="false" tabTitle="Details" tabIcon="information-circle"></ion-tab>
  </ion-tabs>
  `
})

export class TabsPage {
  // set the root pages for each tab
  tab1Root: any = PropertyListPage;
  tab2Root: any = DetailPage;

  constructor(public store: Store<fromRoot.State>, 
              navParams: NavParams) {
    this.store.let(fromRoot.getTabStatus).subscribe(status => {
        if(status.active_index == TAB_INDEX_DETAIL && status.nav_length > 0){
          if(this.tabRef){
            this.tabRef.select(TAB_INDEX_DETAIL);
            this.showTabs(false);
          }
        }
        else{
          if(this.tabRef){
            this.showTabs(true);
            this.tabRef.select(status.active_index);
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
