import { NgModule, } from '@angular/core';
import { IonicApp, IonicModule } from 'ionic-angular';
import { FormsModule }   from '@angular/forms';
import { HttpModule }    from '@angular/http';

import { StoreModule } from '@ngrx/store';
import { EffectsModule } from '@ngrx/effects';
import { DBModule } from '@ngrx/db';
import { StoreDevtoolsModule } from '@ngrx/store-devtools';

//Pages
import { DetailPage } from '../pages/detail/detail'
import { TabsPage } from '../pages/tabs/tabs'
import { TutorialPage } from '../pages/tutorial/tutorial'
import { PropertyListPage } from '../pages/property-list'
import { UnitListPage } from '../pages/unit-list'
import { FormulaApp } from './app.component'
//components
import { AuthService } from '../providers/auth-service'
import { DataService } from '../providers/data-service'
import { BaseService } from '../providers/base-service'
import { MQService } from '../providers/mq-service'
import { RemoteService } from '../providers/remote-service'
import { SqlService } from '../providers/sql-service'
import { SqlCacheService } from '../providers/sqlcache-service'
import { LFCacheService } from '../providers/lfcache-service'
import { UIStateService } from '../providers/ui-state-service'
import { Sql } from '../providers/sql'
import { ComponentsModule } from '../components';
import { ResourceEffects } from '../effects';

import { reducer } from '../reducers';
import { schema } from '../db';
import { ResourceActions, UIStateActions, AuthActions } from '../actions';

@NgModule({
  declarations: [
    FormulaApp,
    DetailPage,
    TabsPage,
    TutorialPage,
    PropertyListPage,
    UnitListPage
  ],
  imports: [
    HttpModule,
    FormsModule,
    ComponentsModule,
    IonicModule.forRoot(FormulaApp),
  /**
     * StoreModule.provideStore is imported once in the root module, accepting a reducer
     * function or object map of reducer functions. If passed an object of
     * reducers, combineReducers will be run creating your application
     * meta-reducer. This returns all providers for an @ngrx/store
     * based application.
     */
    StoreModule.provideStore(reducer),

    /**
     * Store devtools instrument the store retaining past versions of state
     * and recalculating new states. This enables powerful time-travel
     * debugging.
     * 
     * To use the debugger, install the Redux Devtools extension for either
     * Chrome or Firefox
     * 
     * See: https://github.com/zalmoxisus/redux-devtools-extension
     */
    StoreDevtoolsModule.instrumentOnlyWithExtension(),

    /**
     * EffectsModule.run() sets up the effects class to be initialized
     * immediately when the application starts.
     *
     * See: https://github.com/ngrx/effects/blob/master/docs/api.md#run
     */
    EffectsModule.run(ResourceEffects),

    /**
     * `provideDB` sets up @ngrx/db with the provided schema and makes the Database
     * service available.
     */
    DBModule.provideDB(schema),
  ],
  bootstrap: [IonicApp],
  entryComponents: [
    DetailPage,
    TabsPage,
    TutorialPage,
    PropertyListPage,
    UnitListPage,
    FormulaApp
  ],
  providers: [
    ResourceActions,
    UIStateActions,
    AuthActions,
    {provide:'ApiEndpoint', useValue: 'api/v1'},
    AuthService,
    DataService,
    BaseService,
    MQService,
    RemoteService,
    SqlService,
    SqlCacheService,
    UIStateService,
    Sql   ]
})
export class AppModule {}
