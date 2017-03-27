import { Component,  Input, Output, EventEmitter } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { NewDataService } from '../../providers/new-data-service';
import { Property, Unit } from '../../reducers/interfaces'

import { symbolValidator, factorValidator, offsetValidator, createUniqueNameValidator, createUniqueSymbolValidator } from '../validators/custom.validators'

@Component({
	selector: 'fl-unit',
	templateUrl: 'unit.html',
})

export class UnitComponent {
	isDefaultUnit: boolean;
	form:FormGroup;
	systems= ["SI", "Others"];
	
	constructor(public nds:NewDataService
				 
				 ) {
	}
	@Input() property;
	@Input() resource;
	@Output() save : EventEmitter<Unit> = new EventEmitter<Unit>();

	ngOnInit() {
	
		this.form = new FormGroup({
			name: new FormControl(this.resource.name, [Validators.required
										, Validators.minLength(2)
										, Validators.maxLength(30)]),
			description: new FormControl(this.resource.description, [Validators.minLength(2)
											, Validators.maxLength(50)]),
			symbol: new FormControl(this.resource.symbol, [Validators.required, symbolValidator]),
			factor: new FormControl(this.resource.factor, [Validators.required
										, factorValidator]),
			offset: new FormControl(this.resource.offset, [Validators.required
										, offsetValidator]),										
			approx: new FormControl(this.resource.approx)
		
		})
	}


    onSave(evt){
        this.save.emit(this.resource);
	}

	get diagnostic() { 
		return JSON.stringify(this.form.valid) 
	}
	
}
