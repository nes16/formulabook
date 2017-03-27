import { Component } from '@angular/core'
import * as std from  '../reducers/interfaces'
import { NewDataService } from '../providers/new-data-service'

@Component({
    template:`
    
    <ion-list>
        <ion-item>
            <ion-label>Select Measure</ion-label>
            <ion-select [(ngModel)]="measureId" (ionChange)="onPropertySelect($event, measureId)">
                <ion-option *ngFor="let item of properties" value="{{item.id}}" >{{item.name}}</ion-option> 
            </ion-select>
        </ion-item>
        <ion-item>
            <ion-label>Desired Unit</ion-label>
            <ion-select [(ngModel)]="unitId" (ionChange)="onUnitSelect($event, unitId);">
                <ion-option *ngFor="let item of units" value="{{item.id}}" >{{item.name}}({{item.symbol}})</ion-option> 
            </ion-select>
        </ion-item>
        <ion-item>
            <ion-label>Input Value</ion-label>
            <fl-val item-content (change)="convert()" [editMode]="true" [(ngModel)]="val"></fl-val>  
        </ion-item>
        <ion-item>
            <ion-label>Result</ion-label>
            <span item-content>{{val.result}}</span>
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
    measureId:string;
    unitId:string;
    tu:std.Unit;
    properties:std.Property[] = [];
    units:std.Unit[] = [];
    val:std.ValueU={input:"",result:"", parsedValue:{numeric:"", symbol:"", power:""} };
    constructor(public nds:NewDataService){
        this.properties = this.nds.getAllProperties();
    }

    convert(){
        if(!this.val.parsedValue)
            return;
        console.log('Unit component convert parsed value-', this.val.parsedValue)
        console.log('Unit component convert - symbol', this.val.parsedValue.symbol)
        if(this.val.parsedValue.symbol && this.val.parsedValue.symbol.length > 0){
            let fu:std.Unit = this.nds.findUnit(this.measure, this.val.parsedValue);

            if(fu){
                this.val.result = this.nds.convert(+this.val.parsedValue.numeric, fu, this.tu ).toString();       
                console.log('this.val.result - ', this.val.result)
            }
        }
    }

    onPropertySelect(evt,id ){
        console.log(this.measureId);
        this.measure = this.nds.getResource(this.measureId) as std.Property;
        this.units = this.nds.getPropertyUnits(this.measure);
    }

    onUnitSelect(evt, id){
        console.log(this.unitId)
        this.tu = this.nds.getResource(this.unitId) as std.Unit; 
    }
}