import { Component, ElementRef, Renderer, Input, Output, EventEmitter, ViewChild } from '@angular/core';
import { NavController } from 'ionic-angular';
import { MQService } from '../providers/mq-service';
import { UIStateService } from '../providers/ui-state-service';
import { Directive, forwardRef } from '@angular/core';
import { NG_VALUE_ACCESSOR, ControlValueAccessor } from '@angular/forms';

@Component({
	selector: 'mathq',
	template: `
				<span #mq style="font-size:15pt">x\\cdot5</span>
				

					`
				,
})
export class MathQ {
	mathelem: any;
	listeners: Array<any> = [];
	writing: boolean = false;
	latex: string = "";
	constructor( public el:ElementRef,
				 public renderer: Renderer,
				 public mqService:MQService,
				 public nav: NavController,
				 public uiStateService:UIStateService
				 ){
	}

	@Input() editable = false;
	@Input('latex') staticLatex:string;
	@Input() isText=false;
	@Input() isUnit=false;
	@Output('change') change = new EventEmitter();
	@ViewChild('mq') spanElem;	
	
	ngOnInit() {
		if(this.staticLatex != null){
			if(this.isUnit) 
				this.latex = this.getLatex(this.staticLatex);
			else if(this.isText)
				this.latex = this.makeText(this.staticLatex);
			else
				this.latex = this.staticLatex;
		}
	}
	//updATE units set factor="\left(x+459.67\right)\cdot\frac{5}{9}" where id=489
	//select factor from units where id=489
	ngAfterViewInit(){
		var _self = this;
		var MQ = this.mqService.getInterface();
		let mobileMathQFieldCreator = function() {
			   			var elem = document.createElement('span');
			   			elem.setAttribute("tabindex", "0");
    					return elem;
    				};
		if(this.editable){
			let options = {
			   spaceBehavesLikeTab: true,
			   handlers: {
				   edit: function(mq) {
					   if(!_self.writing)
					   _self.change.emit(mq.latex());
				   }
			   }
			 };
			 if(this.uiStateService.device == "mobile")
			 	options['substituteTextarea']=mobileMathQFieldCreator;
			this.mathelem = MQ.MathField(this.spanElem.nativeElement, options);
		}else{
			this.mathelem = MQ.StaticMath(this.spanElem.nativeElement);
		}
				
		this.writeValue(this.latex);
		this.listeners.push(this.renderer.listen(this.mathelem.el(), 'focusin', (event) => {
			if(this.editable){
				this.mqService.curElem = this.mathelem;
				this.mqService.setKeyboard(true);
				if(this.uiStateService.content){
					this.uiStateService.content.resize();
					//this.scrollTo();
				}
			}
    	}));

		this.listeners.push(this.renderer.listen(this.mathelem.el(), 'focusout', (event) => {
			this.mqService.setKeyboard(false);
			if(this.uiStateService.content)
				this.uiStateService.content.resize();
    	}));
		if(this.editable)
			this.init();
	}

	makeText(latex){
		return "\\text{" + latex + "}"
	}


    getLatex(symbol: string) {
        let [latex, s1, s] = ["", "", symbol];
        if (s) {
            if (s.length == 1) {
                return "\\text{" + s + "}";
            }
            //replace H2o as H_2o
            s1 = s.replace('H2O', 'H_2O');
            //replace ([a-zA-A])([1-9]) with g1^g2
            let [p, s2] = [/([A-Za-z])([1-9])/, '']
            while (s1 != s2) {
                s2 = s1;
                s1 = s1.replace(p, "$1^$2")
            }
            //replace ((a-zA-A )*) with \text{g1}
            let p2 = /([A-Za-z /]+)/
            s2 = ''
            let part1 = '';
            while (s1 != s2) {
                s2 = s1;
                s1 = s1.replace(p2, "\\text{$1}")
                if (s1 != s2) {
                    part1 += s1.slice(0, s1.lastIndexOf('}') + 1)
                    s1 = s1.slice(s1.lastIndexOf('}') + 1);
                }
                else {
                    part1 += s1;
                }
            }
            s1 = part1;
            return s1;
        }
        return s1
    }


	scrollTo() {
	let content = this.uiStateService.Content;
		let dim = content.getDimensions();
		let height = dim.height;
	    //Scroll only if the controll is bottom
	    let y = this.el.nativeElement.closest('.item').offsetTop;
	    if (height < y)
	          content.scrollTo(0, y - 20, 200);
	}

	writeValue(obj: any): void{
		if (this.mathelem && this.mathelem.latex() != obj) {
			this.writing = true;
			this.mathelem.latex(obj);
			this.writing = false;
		}
		else
			this.latex = obj;
	}

	ngDestroy(){
		//Destroy listeners
		this.listeners.map(l => l());
	}

	touchHandler(event)
{
    var touches = event.changedTouches,
        first = touches[0],
        type = "";
    switch(event.type)
    {
        case "touchstart": type = "mousedown"; break;
        case "touchmove":  type = "mousemove"; break;        
        case "touchend":   type = "mouseup";   break;
        default:           return;
    }

    // initMouseEvent(type, canBubble, cancelable, view, clickCount, 
    //                screenX, screenY, clientX, clientY, ctrlKey, 
    //                altKey, shiftKey, metaKey, button, relatedTarget);

    var simulatedEvent = document.createEvent("MouseEvent");
    simulatedEvent.initMouseEvent(type, true, true, window, 1, 
                                  first.screenX, first.screenY, 
                                  first.clientX, first.clientY, false, 
                                  false, false, false, 0/*left*/, null);

    first.target.dispatchEvent(simulatedEvent);
    event.preventDefault();
}

  init() 
  {
      this.listeners.push(this.renderer.listen(this.mathelem.el(), "touchstart", this.touchHandler));
      this.listeners.push(this.renderer.listen(this.mathelem.el(), "touchmove", this.touchHandler));
      this.listeners.push(this.renderer.listen(this.mathelem.el(), "touchend", this.touchHandler));
      this.listeners.push(this.renderer.listen(this.mathelem.el(), "touchcancel", this.touchHandler));    
  }
}


export const MQ_VALUE_ACCESSOR: any = {
    provide: NG_VALUE_ACCESSOR,
    useExisting: forwardRef(() => MathQValueAccessor),
    multi: true
};

@Directive({
  selector: 'mathq',
  host: { '(change)': 'onChange($event)'/*, '(blur)': 'onTouched()'*/ },
  providers: [MQ_VALUE_ACCESSOR]
})
export class MathQValueAccessor implements ControlValueAccessor {
  onChange = (_) => {};
  onTouched = () => {};

  constructor(public host: MathQ) {

  }

  writeValue(value: any): void {
    this.host.writeValue(value);
  }
 
  registerOnChange(fn: (_: any) => void): void { this.onChange = fn; }
  registerOnTouched(fn: () => void): void { this.onTouched = fn; }
}