import { Component, ViewChild } from '@angular/core';
import { App, Events, MenuController, Nav, Platform } from 'ionic-angular';
import { Splashscreen, StatusBar } from 'ionic-native';

import { TabsPage } from '../pages/tabs/tabs';
import { TutorialPage } from '../pages/tutorial/tutorial';

import { Observable } from 'rxjs/Rx';

export interface PageObj {
  title: string;
  component: any;
  icon: string;
  index?: number;
  params?:any;
}

@Component({
  templateUrl: 'app.template.html'
})

export class FormulaApp {
  // the root nav is a child of the root app component
  // @ViewChild(Nav) gets a reference to the app's root nav
  @ViewChild(Nav) nav: Nav;

  // List of pages that can be navigated to from the left menu
  // the left menu only works after login
  // the login page disables the left menu
  appPages: PageObj[] = [
    { title: 'Units', component: TabsPage, icon: 'calendar' },
  ];
  

  rootPage: any = TabsPage;
  showLoginMenu$: Observable<boolean>;

  constructor(
    public menu: MenuController,
    platform: Platform
  ) {
    // Call any initial plugins when ready
    platform.ready().then(() => {
      StatusBar.styleDefault();
      Splashscreen.hide();
    });

    if(!localStorage.getItem("tutShown")){
      this.rootPage = TutorialPage;
      localStorage.setItem("tutShown", "1");
      
    }

  }

  openPage(page: PageObj) {
    // the nav component was found using @ViewChild(Nav)
    // reset the nav to remove previous pages and only have this page
    // we wouldn't want the back button to show in this scenario
    if (page.title === 'Login' || page.title === "Signup") {
      // Give the menu time to close before changing to logged out
      this.nav.push(page.component, page.params);
      return;
    }
    if (page.index) {
      this.nav.setRoot(page.component, {tabIndex: page.index});

    } else {
      this.nav.setRoot(page.component, page.params);
    }
  }
}




