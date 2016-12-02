import { ChangeDetectionStrategy, Component, ElementRef, Input, Output, EventEmitter, ViewChildren, QueryList } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { App, NavController } from 'ionic-angular';
import { createUniqueNameValidator } from '../validators/custom.validators'
import { Property } from '../../reducers/resource'
@Component({
	changeDetection: ChangeDetectionStrategy.OnPush,
	selector: 'fl-property',
	templateUrl: 'property.html',
})

export class PropertyComponent {
	er: Property;
	form: FormGroup;

	constructor(public el: ElementRef,
		app: App,
		nav: NavController) {
	}
	@Input() resource;
	@Output() save: EventEmitter<Property> = new EventEmitter<Property>();
	ngOnInit() {
		this.er = Object.assign({}, this.resource)
		this.form = new FormGroup({
			name: new FormControl(this.resource.name, [Validators.required
				, Validators.minLength(2)
				, Validators.maxLength(30)])
		})
	}

	onSave() {
		this.save.emit(this.resource);
	}

	get diagnostic() {
		return JSON.stringify(this.resource)

			+ '\n' + JSON.stringify(this.form.valid);
	}

}
