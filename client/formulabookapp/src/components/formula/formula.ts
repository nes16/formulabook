import { Component, ElementRef, Input, Output, EventEmitter } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { NavController, App } from 'ionic-angular';
import { DataService } from '../../providers/data-service';
import { UIStateService } from '../../providers/ui-state-service';
import { BaseComponent } from '../base-component'
import { DetailPage } from '../../pages/detail/detail';
import { symbolValidator, numberValidator, createMeasureValidator, createUniqueNameValidator, createUniqueSymbolValidator } from '../validators/custom.validators'
import * as std from '../../lib/types/standard';
import { Formula } from '../../reducers/resource'


@Component({
	selector: 'fl-global',
	templateUrl: 'global.html',
})
export class GlobalComponent {
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
	@Output() unit : EventEmitter<any> = new EventEmitter<any>();

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
			
			this.form = new FormGroup({
				name: new FormControl(vv.name, [ Validators.minLength(2)
											, Validators.maxLength(30)]),
                value: new FormControl(vv._result)
            })
            vv._formula.Variables.forEach((v,i) => {
				let fc = new FormControl(vv._values[v.symbol], [Validators.required]) as FormControl;
				this.form.addControl("Var"+i, fc );
				//fc.registerOnChange(this.evaluate);
				// fc.registerOnChange(val => {
				// 	if(this.form.valid)
				// 		vv.evaluate();
				// })
            })	
		}
	}

    onSave(){
        this.save.emit(this.fobj.getState());
	}

	onSelect(evt){
		this.check.emit({resource:this.resource, checked:evt.checked});
	}
	

	@Input() resource;
	//@ViewChildren(UnitComponent) unitForm: QueryList<UnitComponent>
	@Input() mode = 'list';
	@Input() query;
	@Input() units;
	@Input() onlyProp = false;
	@Input() index = null;
	@Input() last = null;
	@Input() filter:boolean = false;

	moveToVariable(global:FG){
		var [symbol, index] = [global.Global.symbol
								  ,this.resource.Globals.indexOf(global)]
		var v = this.resource.Variables.find(i => i.symbol == symbol);
		if(v)
			v.deleted = null;
		else
			this.resource.Variables.push(new Variable({symbol: symbol}))

		this.resource.Globals.splice(index, 1)
	}

	moveToGlobal(var1:Variable){
		var [symbol, index] = [var1.symbol, this.resource.Variables.indexOf(var1)];
		this.resource.Variables.splice(index, 1);
		var g1 = this.resource.Globals.find(g => g.Global.symbol == symbol);
		if(g1){
			g1.deleted = null;
		}
		else{
			var g = this.dataService.globals.getItem("symbol", symbol) as Global;
			if(g){
				var fg = new FG({})
				[fg.Global, fg.Formula] = [g, this.resource];
				this.resource.Globals.push(fg);
			}
			else{
				this.createGlobal({name:var1.name, symbol:symbol})		
			}
			
		}
	}

	selectedViewType(type){
        if(type == 'Definition'){
            
        }
        else if(type == 'Run'){
            
        }
        else if(type == 'History'){
            
        }
    }

	createGlobal(state){
		var g = new Global(state);
		var type = UIStateService.event_types.resource_save_complete;
		var subscribtion =
		this.uiStateService.ole.subscribe(i => {
						if(i.type == type){
							if(i.status == 'success'){
								var fg = new FG({});
								[fg.Global, fg.Formula] = [i.resource, this.resource];
								this.resource.Globals.push(fg);
							}
							subscribtion.unsubscribe();
						}
					},err=>{
						ErrorHandler.handle(err, "FormulaComponent::onRemoveCmd", true);
					},()=>{
					   console.log('The subscription completed')
					})

		this.nav.push(this.detailPage, {'currResource': g })
	}

	undeleted(list){
		return list.filter(i => i.deleted != "true");
	}

	updateVariables(latex) {
	    try {
			this.rootNode = this.parser.parse(latex);
			this.parser.getVarNodes(this.rootNode, this.resource, this.dataService.globals);
	    } catch (e) {
	        this.rootNode = null;
	        //throw (e);
	    }
	}

	edit(evt){
		//Ser formula reference in child object		
		this.resource.Globals.forEach(fg => fg.Formula = this.resource);
		this.resource.Variables.forEach(v => v.Formula = this.resource);

		//remove new deleted items
		this.resource.Globals = 
		this.resource.Globals.filter(fg => !(fg.deleted && !fg.id))

		this.resource.Variables = 
		this.resource.Variables.filter(v => !(v.deleted && !v.id))

		super.edit(evt);
	}

	evaluate(evt){
		if(evt.srcElement.changeTimeout)
       	 	clearTimeout(evt.srcElement.changeTimeout);
		evt.srcElement.changeTimeout = setTimeout(() => {
			this.resource.evaluate();
        }, 600);
	}

	get diagnostic() { return JSON.stringify(this.fobj) 

						+ '\n'+JSON.stringify(this.form.valid);}

}
