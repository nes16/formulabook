import { Component, ElementRef, Input, Output, EventEmitter } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { NavController, App } from 'ionic-angular';
import { DataService } from '../../providers/data-service';
import { UIStateService } from '../../providers/ui-state-service';
import { BaseComponent } from '../base-component'
import { DetailPage } from '../../pages/detail/detail';
import { symbolValidator, numberValidator, createMeasureValidator
	, createUniqueNameValidator, createUniqueSymbolValidator
	, createFormulaValidator } from '../validators/custom.validators'
import * as std from '../../lib/types/standard';
import { Formula } from '../../reducers/resource'


@Component({
	selector: 'fl-formula',
	templateUrl: 'formula.html',
})
export class FormulaComponent {
	fobj:std.Formula;
	form:FormGroup;
    viewType:string = 'Definition'

	constructor(public el: ElementRef,
				 app:App,
				 nav: NavController) {
	}
	@Input() showChkbox:boolean = false;
	@Input() resource;
	@Input() mode = 'list';
	@Output() save : EventEmitter<Formula> = new EventEmitter<Formula>();
	@Output() check : EventEmitter<any> = new EventEmitter<any>();

	ngOnInit() {
		if(this.mode == 'edit'){
		this.fobj = new std.Formula(this.resource);
		this.form = new FormGroup({
			name: new FormControl(this.fobj.name, [Validators.required
										, Validators.minLength(2)
										, Validators.maxLength(30)]),
			symbol: new FormControl(this.fobj.symbol, [Validators.required
										,symbolValidator]),
			latex: new FormControl(this.fobj.latex, [Validators.required
										,createFormulaValidator(this.fobj)]),
			measure: new FormControl(this.fobj.Measure, [Validators.required
											,createMeasureValidator(false, false)])
			})
			
		}
	}

    onSave(evt){
        this.save.emit(this.fobj.getState());
	}

	onSelect(evt){
		this.check.emit({resource:this.resource, checked:evt.checked});
	}

	selectedViewType(type){
        if(type == 'Definition'){
            
        }
        else if(type == 'Run'){
            
        }
        else if(type == 'History'){
            
        }
    }

	get diagnostic() { 
		return JSON.stringify(this.fobj) 
		+ '\n'+JSON.stringify(this.form.valid);
	}

}
