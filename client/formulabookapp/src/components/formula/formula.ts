import { Component,  Input, Output, EventEmitter, ViewChild } from '@angular/core';
import { Tabs, NavParams } from 'ionic-angular';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { NewDataService } from '../../providers/new-data-service';
import {
	symbolValidator, numberValidator, createUnitValidator
	, createUniqueNameValidator, createUniqueSymbolValidator
	, createFormulaValidator
} from '../validators/custom.validators'
import { Formula, Variable, Global, FormulaRun, ValueU } from '../../reducers/resource'
import { LatexParserService } from '../../../providers/latex-parser-service';
import { Observable, Observer } from 'rxjs/Rx';


@Component({
	templateUrl:'runs.html'
})

export class RunHistoryTab{
	@Input() resource:Formula;
    selectedItems: FormulaRun[] = [];
	editMode:boolean = false;
	constructor(public nds:NewDataService,
				public navParams:NavParams){
		this.resource= this.navParams.get('resource')

	}

	ngOnInit(){
		console.log('NgInit RunHistoryTab');
	}


    // onPress(run, evt) {
	// 	let runRow = evt.target;
    //     run.editMode = true;
    // }

    onCheck(resource, evt) {
        if (evt.checked == true)
            this.selectedItems.push(resource);
        else {
            let i = this.selectedItems.indexOf(resource);
            if (i > -1) {
                this.selectedItems.splice(i, 1);
            }
        }
    }


    onActionCmd(cmd: string) {
        this.editMode = false;
               
        switch (cmd) {
            case 'Delete': {
                break;
            }
            case 'Add': {
				let fr = this.nds.createNewRun(this.resource);
				this.resource.runs.push(fr);
                break;
            }
            case 'Done':
            default: {

            }
        }
        this.selectedItems = []; 
    }
}


@Component({
	templateUrl:'formula.html'
})
export class FormulaTab{

	form:FormGroup;
	resource:Formula;
	rootNode:any;
	constructor(public navParams:NavParams
				,public nds:NewDataService){
		
		this.resource= this.navParams.get('resource')
	}
	ngOnInit(){
		console.log('Form tab init - ' + JSON.stringify(this.resource));
		
		this.form = new FormGroup({
			name: new FormControl(this.resource.name, [Validators.required
				, Validators.minLength(2)
				, Validators.maxLength(30)]),
			symbol: new FormControl(this.resource.symbol, [Validators.required
				, symbolValidator]),
			formula: new FormControl(this.resource.formula),
			unit_id: new FormControl(this.resource.unit_id, [Validators.required
				, createUnitValidator(false, false)])
		})

		this.form.controls["formula"].valueChanges.subscribe(r => {
			console.log('Formula changed ' + this.resource.formula);
			this.updateVariables(this.resource.formula);
			console.log(JSON.stringify(this.resource))
		})
	}

	get diagnostic() {
		return JSON.stringify(this.resource)
			+ '\n' + JSON.stringify(this.form.valid);
	}

	updateVariables(latex) {
	    try {
			this.rootNode = this.nds.parse(latex);
			this.nds.updateVariablesAndGlobals(this.rootNode, this.resource);
	    } catch (e) {
			console.log('Error occured while parsing')
	        this.rootNode = null;
	        //throw (e);
	    }
	}
}

@Component({
	selector: 'fl-formula',
	template: `
	<ion-tabs tabbarPlacement="top" #formulaTabs>
		<ion-tab [root]="formulaTab" [rootParams]="formulaParam" tabTitle="Formula" tabIcon="map"></ion-tab>
		<ion-tab [root]="runTab" [rootParams]="formulaParam"  tabTitle="Run" tabIcon="map"></ion-tab>
	</ion-tabs>
 `
})
export class FormulaComponent {
	runTab:any = RunHistoryTab;
	formulaTab:any = FormulaTab;
	formulaParam:any;
	constructor(public nds:NewDataService) {
		console.log('In cons - ' + JSON.stringify(this.resource));
	}

	@Input() resource;
	@Output() save: EventEmitter<Formula> = new EventEmitter<Formula>();

	ngOnInit() {
		console.log('In init - ' + JSON.stringify(this.resource));
		this.formulaParam =  {resource:this.resource}

	}

	@ViewChild('formulaTabs') tabRef: Tabs;

	onSave(evt) {
		this.save.emit(this.resource);
	}

	onMoveToVariable(gid, evt){

	}

	onMoveToGlobal(v, evt){

	}
}
