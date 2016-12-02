import { Component, Input, Output, EventEmitter } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { NewDataService } from '../../../providers/new-data-service'
import { symbolValidator, createUnitValidator } from '../../validators/custom.validators'
import { Formula, Variables, Global, FormulaRun, ValueU } from '../../reducers/resource'

@Component({
	selector: 'fl-var',
	templateUrl: 'variable.html',
})


export class VarComponent{
	form:FormGroup;

	constructor(nds: NewDataService) {

	}
	@Input() resource;
	@Input() editMode:boolean = false;
	@Output('moveToGlobal') moveToGlobal = new EventEmitter();


	ngOnInit() {
			this.form  = new FormGroup({
				name: new FormControl(this.resource.name, [Validators.required
											, Validators.minLength(2)
											, Validators.maxLength(30)]),
				symbol: new FormControl(this.resource.symbol, [Validators.required
															,symbolValidator]),
				unit_id: new FormControl(this.resource.unit_id, [Validators.required])
			})
	}

	onMoveToGlobal(res, evt:Event){
		evt.stopPropagation();
		this.moveToGlobal.emit(res);
	}


	onDblClick(evt){
		evt.stopPropagation();
	}

	onSave(evt) {
	}
}

//Global variable used in formula
@Component({
	selector: 'fl-gvar',
	templateUrl: 'gvar.html',
})
export class GVarComponent{
	
	
	form:FormGroup;

	constructor(nds: NewDataService) {
	}
	@Input() resource;
	@Input() editMode:boolean = false;
	@Output('moveToGlobal') moveToVariable= new EventEmitter();


	ngOnInit() {
		
	}

	onDblClick(evt){
		evt.stopPropagation();

	}
	onMoveToVariable(res, evt:Event){
		evt.stopPropagation();
		this.moveToVariable.emit(res);
	}

}