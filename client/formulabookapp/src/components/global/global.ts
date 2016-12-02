import { Component,  Input, Output, EventEmitter } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { NewDataService } from '../../providers/new-data-service';
import { symbolValidator, numberValidator, createUnitValidator, createUniqueNameValidator, createUniqueSymbolValidator } from '../validators/custom.validators'
import { Global } from '../../reducers/resource'


@Component({
	selector: 'fl-global',
	templateUrl: 'global.html',
})
export class GlobalComponent {
	form:FormGroup;
	constructor(public nds:NewDataService) {
	}
	@Input() resource;
	@Output() save : EventEmitter<Global> = new EventEmitter<Global>();

	ngOnInit() {
		console.log('Oninit called');
		this.form = new FormGroup({
			name: new FormControl(this.resource.name, [Validators.required
											, Validators.minLength(2)
											, Validators.maxLength(30)]),
				value: new FormControl(this.resource.value, [Validators.required
											, numberValidator]),
				symbol: new FormControl(this.resource.symbol, [Validators.required
											, symbolValidator]),
				unit_id: new FormControl(this.resource.unit_id, [Validators.required])
		})
		this.form.valueChanges.subscribe(r => {
			console.log(JSON.stringify(r));
		})
				
	}

    onSave(evt){
        this.save.emit(this.resource);
	}

	get diagnostic() { 
		return JSON.stringify(this.resource) 
						+ '\n'+JSON.stringify(this.form.valid);
	}

}
