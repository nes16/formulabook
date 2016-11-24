import { Component, ElementRef, Input, Output, EventEmitter } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { NavController, App } from 'ionic-angular';
import { DataService } from '../../providers/data-service';
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

	constructor(public el: ElementRef,
				 app:App,
				 nav: NavController) {
	}
	@Input() showChkbox:boolean = false;
	@Input() resource;
	@Input() mode = 'list';
	@Output() save : EventEmitter<Global> = new EventEmitter<Global>();
	@Output() check : EventEmitter<any> = new EventEmitter<any>();
	@Output() unit : EventEmitter<any> = new EventEmitter<any>();
	ngOnInit() {
		if(this.mode == 'edit'){
		this.gobj = new std.Global(this.resource);
		this.form = new FormGroup({
			name: new FormControl(this.gobj.name, [Validators.required
											, Validators.minLength(2)
											, Validators.maxLength(30)]),
				value: new FormControl(this.gobj.value, [Validators.required
											, numberValidator]),
				symbol: new FormControl(this.gobj.symbol, [Validators.required
											, symbolValidator]),
				measure: new FormControl(this.gobj.Measure, [createMeasureValidator(false, true)]),
			})
			
				
		}
	}

    onSave(){
        this.save.emit(this.gobj.getState());
	}

	onSelect(evt){
		this.check.emit({resource:this.resource, checked:evt.checked});
	}
	
	get diagnostic() { return JSON.stringify(this.gobj) 

						+ '\n'+JSON.stringify(this.form.valid);}

}
