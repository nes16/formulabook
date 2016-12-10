import { NgModule } from '@angular/core'
import { IonicApp, IonicModule } from 'ionic-angular';
import { NewDataService } from '../providers/new-data-service'
import { ValComponent, InputValueAccessor } from '../components/formula/run/val'
import { UnitApp } from './unit.component'




@NgModule ({
    declarations:[
        UnitApp,
        ValComponent,
        InputValueAccessor
    ],
    providers:[
        NewDataService,
        
    ],
    bootstrap: [IonicApp],
    entryComponents:[
        UnitApp
    ],
    imports:[
        IonicModule.forRoot(UnitApp)
    ],
    exports:[]
})
export class UnitModule {}