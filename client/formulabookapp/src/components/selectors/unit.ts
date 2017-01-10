import { Component, ElementRef, Input, Output, EventEmitter } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable, Observer, Subscription } from 'rxjs/Rx';
import * as fromRoot from '../../reducers';
import { ViewController, NavController } from 'ionic-angular';
import { NewDataService } from '../../providers/new-data-service'
import { ResourceListPage } from '../../pages/resource-list'
import { ErrorHandler } from '../../lib/types/standard';
import { Resource, Unit } from '../../reducers/interfaces'
import { NG_VALUE_ACCESSOR, ControlValueAccessor } from '@angular/forms';
import { Directive, forwardRef } from '@angular/core';


@Component({
	selector: 'fl-unit-sel',
	//<input  type="text" class="mathelem" id="mathelem"/>
	template: `
	<template [ngIf]="!editMode">
		<mathq *ngIf="latex?.length" [latex]="latex" [isUnit]="true"></mathq>
		<span  *ngIf="name?.length">{{name}}</span>
	</template>
	
	<div *ngIf="editMode" (click)="select($event)">
		<mathq *ngIf="latex?.length" [isUnit]="true" [(ngModel)]="latex"></mathq>
		<span *ngIf="name?.length">{{name}}</span>
		<button ion-button small clear  type="input" (click)="clear($event)">
			<ion-icon icon-small name="close">
			</ion-icon>
		</button>
	</div>
	`
	,
})
export class UnitSelector {
	name: string ="None";
	latex: string = "";
	errorMessage: string;
	selection$:Observable<Resource>;
	subscription:Subscription;
	constructor(public el: ElementRef,
		public viewCtrl: ViewController,
		public nds: NewDataService,
		public nav: NavController,
		public store: Store<fromRoot.State>
		) {

			this.selection$ = store.let(fromRoot.getSelectedResources);
			this.subscription = this.selection$.subscribe(r => {
				if(!r)
					return;
				let unit;
				if(r.type == 'properties'){
					unit = nds.getDefaultUnit(r);
				}
				else
					unit = r;

				this.writeValue(unit.id);
				this.change.emit(unit.id);
				console.log('emitting -' + unit.id + '--')
		})
	}

	@Input() editMode:boolean = false;
	@Output('change') change = new EventEmitter();

	ngOnInit() {
	}

	 ngOnDestroy(){
		this.subscription.unsubscribe();
	}

	writeValue(obj: any) {
		this._writeValue(obj);
	}

	_writeValue(obj: any): void {
		if(obj && obj != ""){
			let u = this.nds.getResource(obj) as Unit;
			this.latex = u.symbol;
			this.name = u.name;
		}
	}

	clear(evt){
		this.name = "None";
		this.latex = "";
		evt.stopPropagation();
        evt.preventDefault();
	}

	select(evt) {
		this.nav.push(ResourceListPage, {type:'properties'})
	}

}



const UNIT_VALUE_ACCESSOR: any = {
    provide: NG_VALUE_ACCESSOR,
    useExisting: forwardRef(() => UnitValueAccessor),
    multi: true
};
@Directive({
  selector: 'fl-unit-sel',
  host: { '(change)': 'onChange($event)'/*, '(blur)': 'onTouched()'*/ },
  providers: [UNIT_VALUE_ACCESSOR]
})
export class UnitValueAccessor implements ControlValueAccessor {
  onChange = (_) => {};
  onTouched = () => {};

  constructor(public host: UnitSelector) {

  }

  writeValue(value: any): void {
    this.host.writeValue(value);
  }
 
  registerOnChange(fn: (_: any) => void): void { this.onChange = fn; }
  registerOnTouched(fn: () => void): void { this.onTouched = fn; }
}