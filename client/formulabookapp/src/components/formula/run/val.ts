import { Component, Input, Output, EventEmitter } from '@angular/core'
import { NewDataService } from '../../../providers/new-data-service'
import { ValueU } from '../../../reducers/interfaces'
import { NG_VALUE_ACCESSOR, ControlValueAccessor } from '@angular/forms';
import { Directive, forwardRef } from '@angular/core';

@Component({
	selector: 'fl-val',
	template: `
    <ion-input *ngIf="editMode" type="text" (input)="parse($event)"  [(ngModel)]="input.input"></ion-input>
	<span>{{input.parsedValue?.numeric}}-{{input.parsedValue?.symbol}}-{{input.parsedValue?.power}}</span>
    <span *ngIf="!editMode">{{input.input}}</span>
    `
})
export class ValComponent {
	input:ValueU={input:"",unit_id:null, result:"", parsedValue:{numeric:"", symbol:"", power:""} };
	constructor(public nds: NewDataService) {

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

	parse(evt){
		this.input.input = evt.target.value;
		Object.assign(this.input.parsedValue, this.nds.parseValue(this.input));
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

