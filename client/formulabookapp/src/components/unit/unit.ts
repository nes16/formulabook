import { Component, ElementRef, Input, Output, EventEmitter } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { NavController, App } from 'ionic-angular';
import * as std from '../../lib/types/standard';
import { Property, Unit } from '../../reducers/resource'

import { symbolValidator, factorValidator, createUniqueNameValidator, createUniqueSymbolValidator } from '../validators/custom.validators'

@Component({
	selector: 'fl-unit',
	templateUrl: 'unit.html',
})

export class UnitComponent {
	isDefaultUnit: boolean;
	pobj:std.Property;
	uobj:std.Unit;
	form:FormGroup;
	systems= ["SI", "Others"];
	
	constructor(
				 public el: ElementRef,
				 app: App,
				 nav: NavController,
				 ) {
	}
	@Input() showChkbox:boolean = false;
	@Input() property;
	@Input() resource;
	@Input() mode = 'list';
	@Output() save : EventEmitter<Unit> = new EventEmitter<Unit>();
	@Output() select : EventEmitter<any> = new EventEmitter<any>();
	@Output() unit : EventEmitter<any> = new EventEmitter<any>();

	ngOnInit() {
		this.pobj = new std.Property(this.property);
		this.uobj = new std.Unit(this.resource);
		this.uobj.init({property:this.pobj})
		this.isDefaultUnit = this.uobj.IsDefaultUnit;
		if(this.uobj.system = "SI")
			this.uobj.system=this.systems[0];
		else
			this.uobj.system=this.systems[1];
		if(this.mode == 'edit'){
			this.form = new FormGroup({
				name: new FormControl(this.uobj.name, [Validators.required
											, Validators.minLength(2)
											, Validators.maxLength(30)]),
				description: new FormControl(this.uobj.description, [Validators.minLength(2)
												, Validators.maxLength(50)]),
				symbol: new FormControl(this.uobj.symbol, [Validators.required, symbolValidator]),
				factor: new FormControl(this.uobj.factor, [Validators.required
											, factorValidator]),
				approx: new FormControl(this.uobj.approx)
			
			})
		}
	}


    onSave(evt){
        this.save.emit(this.uobj.getState());
	}

	onSelect(evt){
		this.select.emit({resource:this.resource, checked:evt.checked});
	}

	get diagnostic() { return JSON.stringify(this.form.valid) }
	
}
