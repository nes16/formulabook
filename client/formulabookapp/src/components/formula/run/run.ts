import { Component, Input, Output, EventEmitter } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { NewDataService } from '../../../providers/new-data-service'
import { Formula, FormulaRun, ValueU } from '../../../reducers/interfaces'
import { Observable } from 'rxjs/Observable';
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