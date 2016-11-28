import { Component, ElementRef, Input, Output, EventEmitter } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable, Observer, Subscription } from 'rxjs/Rx';
import * as fromRoot from '../../reducers';
import { ViewController, NavController } from 'ionic-angular';
import { NewDataService } from '../../providers/new-data-service'
import { ResourceListPage } from '../../pages/resource-list'
import { ErrorHandler } from '../../lib/types/standard';
import { Resource, Unit } from '../../reducers/resource'


@Component({
	selector: 'fl-unit-sel',
	//<input  type="text" class="mathelem" id="mathelem"/>
	template: `
	<template [ngIf]="mode != 'edit'">
		<mathq *ngIf="latex?.length" [latex]="latex"></mathq>
		<span  *ngIf="name?.length">{{name}}</span>
	</template>
	
	<div *ngIf="mode == 'edit'" type="input" (click)="select()">
		<mathq *ngIf="latex?.length" [(ngModel)]="latex"></mathq>
		<span *ngIf="name?.length">{{name}}</span>
		<button ion-button small clear  type="input" (click)="clear($event)"><ion-icon icon-small name="close"></ion-icon>
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

	@Input() mode;
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
			this.latex = this.nds.getLatex(u.symbol);
			this.name = u.name;
		}
	}

	clear(evt){
		this.name = "None";
		this.latex = "";
		evt.stopPropagation();
        evt.preventDefault();
		//this.change.emit(null) 
	}

	select() {
		// var type = UIStateService.event_types.resource_selected;
		// var subscribtion = this.uiStateService.ole.subscribe(sel => {
		// 	if(sel.type == type)
		// 	{
		// 		if(sel.status == 'success'){
		// 			var unit = new unit(sel.resource)
		// 			this.writeValue(unit); 
		// 			this.change.emit(unit) 
		// 		}
		// 		subscribtion.unsubscribe();
		// 	}
		// }, error=>{
		// 	ErrorHandler.handle(error, "UnitSelector::select", true);
		// }, ()=>{
		// 	console.log('Subscribtion completed in select')
		// });
		// this.uiStateService.inSelectMode = true;
		// this.ssetResourcePage("properties");
		this.nav.push(ResourceListPage, {type:'properties', mode:'select'})
	}

}

