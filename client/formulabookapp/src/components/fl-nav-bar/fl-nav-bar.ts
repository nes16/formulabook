import { Component, ElementRef, Input, Output, EventEmitter } from '@angular/core';
import { NavController, App } from 'ionic-angular';
import { MoreOptionsPage } from '../../pages/more-options/more-options';
import { PopoverController } from 'ionic-angular';
import * as  rootStore  from '../../reducers'
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs/Rx';

@Component({
	selector: 'fl-nav-bar',
	templateUrl: 'fl-nav-bar.html',
})
export class FlNavBar {
	searchBar: boolean = false;
	searchQuery:string = '';
	constructor(public app: App
			    , public el: ElementRef
				, public nav: NavController
				, public popoverCtrl: PopoverController,
				public store: Store<rootStore.State>) {
		
	}
	@Input() searchDelay=2000;
	@Input() title="FormulaLib";
	@Input() editMode=false;
	@Input() selectionStatus=null;
	@Input() isSelectionList=false;
	@Output() filterChange = new EventEmitter();
	@Output() filterCancel = new EventEmitter();
	@Output() actionCmd = new EventEmitter();



	onSearchInput(evt) {
		this.filterChange.emit(this.searchQuery);
	}

	onSearchCancel(evt){

	}

	onMore(evt){
	    let opts = this.popoverCtrl.create(MoreOptionsPage)
	     opts.present({ev:evt});
	}

	onClose(evt){

	}

	onActionCmd(cmd:string, e){
		e.stopPropagation();
		this.actionCmd.emit(cmd);

	}
}