import { Component, Input, Output, EventEmitter } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { NewDataService } from '../../../providers/new-data-service'
import { Formula, FormulaRun, ValueU } from '../../../reducers/resource'
import { Observable } from 'rxjs/Observable';
import { NG_VALUE_ACCESSOR, ControlValueAccessor } from '@angular/forms';
import { Directive, forwardRef } from '@angular/core';

@Component({
	selector: 'fl-val',
	templateUrl: 'val.html',
})



export class ValComponent {
	input:ValueU={input:"",unit_id:null, result:"" };
	constructor(nds: NewDataService) {

	}
	
	@Input() editMode: boolean = false;
	@Output('change') change = new EventEmitter();


	ngOnInit() {
		console.log('Val component init')
	}

	writeValue(obj: any) {
		if(obj)
			this.input=Object.assign({}, obj);
	}

	onChange($evt){
		let input = Object.assign({}, this.input)
		this.writeValue(input)
		this.change.emit(input);
	}
}

const INPUT_VALUE_ACCESSOR: any = {
    provide: NG_VALUE_ACCESSOR,
    useExisting: forwardRef(() => InputValueAccessor),
    multi: true
	
};
@Directive({
  selector: 'fl-val',
  host: { '(change)': 'onChange($event)'/*, '(blur)': 'onTouched()'*/ },
  providers: [INPUT_VALUE_ACCESSOR]
})
export class InputValueAccessor implements ControlValueAccessor {
  onChange = (_) => {};
  onTouched = () => {};

  constructor(public host: ValComponent) {

  }

  writeValue(value: any): void {
    this.host.writeValue(value);
  }
 
  registerOnChange(fn: (_: any) => void): void { this.onChange = fn; }
  registerOnTouched(fn: () => void): void { this.onTouched = fn; }
}

//Global variable used in formula
@Component({
	selector: 'fl-run',
	templateUrl: 'run.html',
})
export class RunComponent {
	form: FormGroup;
	editModein: boolean = true;
	valueChange$: Observable<any>;
	constructor(public nds: NewDataService) {

	}
	@Input() resource: FormulaRun;
	@Input() formula: Formula;
	ngOnInit() {
		let r = this.resource;
		this.form = new FormGroup({
			name: new FormControl(r.name, [Validators.minLength(2)
				, Validators.maxLength(30)]),
			value: new FormControl(r.result)
		})
		let keys = Object.keys(r.values);
		let vals$: Observable<any>[] = [];
		keys.forEach((k, i) => {
			let fc = new FormControl(r.values[k], [Validators.required]) as FormControl;
			this.form.addControl("Var" + i, fc);
			vals$.push(fc.valueChanges);
		})
		this.valueChange$ = Observable.from(vals$)
			.map(i => i)
			.combineAll(r => {
				return r;
			})
		this.valueChange$.subscribe(i => {
			this.nds.evaluateFormula(this.resource, this.formula);
		})
	}

	getKeys() {
		return Object.keys(this.resource.values)
	}

	onPress(evt) {
		// 	let runRow = evt.target;
		console.log('Long press row')
		//this.editModein = !this.editModein;
	}


}