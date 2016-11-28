import { Component, ElementRef, Input, Output, EventEmitter } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { NavController, App } from 'ionic-angular';
import { NewDataService } from '../../providers/new-data-service';
import { UIStateService } from '../../providers/ui-state-service';
import { BaseComponent } from '../base-component'
import { DetailPage } from '../../pages/detail/detail';
import { symbolValidator, numberValidator, createMeasureValidator, createUniqueNameValidator, createUniqueSymbolValidator } from '../validators/custom.validators'
import * as std from '../../lib/types/standard';
import { Global } from '../../reducers/resource'


@Component({
	selector: 'fl-global',
	templateUrl: 'global.html',
})
export class GlobalComponent {
	gobj:std.Global;
	form:FormGroup;
	temp:Global;
	unit_id:string;
	constructor(public nds:NewDataService,
				public el: ElementRef,
				 app:App,
				 nav: NavController) {
	}
	@Input() resource;
	@Output() save : EventEmitter<Global> = new EventEmitter<Global>();

	ngOnInit() {
		console.log('Oninit called');
		this.temp = Object.assign({},this.resource);
		if(!this.temp.unit_id)
			this.temp.unit_id = "";
		this.form = new FormGroup({
			name: new FormControl(this.temp.name, [Validators.required
											, Validators.minLength(2)
											, Validators.maxLength(30)]),
				value: new FormControl(this.temp.value, [Validators.required
											, numberValidator]),
				symbol: new FormControl(this.temp.symbol, [Validators.required
											, symbolValidator]),
				unit_id: new FormControl(this.temp.unit_id, [Validators.required])
		})
		this.form.valueChanges.subscribe(r => {
			console.log(JSON.stringify(r));
		})
				
	}

    onSave(evt){
        this.save.emit(this.temp);
	}

	get diagnostic() { return JSON.stringify(this.resource) 


						+ '\n'+JSON.stringify(this.form.valid);}

}
