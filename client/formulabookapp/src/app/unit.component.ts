import { Component } from '@angular/core'
import * as std from  '../reducers/interfaces'
import { NewDataService } from '../providers/new-data-service'

@Component({
    template:`
    <fl-val  [editMode]="true" [(ngModel)]="val"></fl-val>
    <ion-list>
        <ion-item>
            <ion-label>Select Measure</ion-label>
            <ion-select></ion-select>
        </ion-item>
        
        <ion-item>
            <ion-label>
                 <span>{{val.parsedValue?.numeric}}-{{val.parsedValue?.symbol}}-{{val.parsedValue?.power}}</span>
            </ion-label>
        </ion-item>
    </ion-list> 
    
    `
})
export class UnitApp{
    measure:std.Property;
    val:std.ValueU={input:"",unit_id:null,result:"", parsedValue:{numeric:"", symbol:"", power:""} };
    constructor(public nds:NewDataService){

    }


}