import '../assets/latex-parser/latex-parser'
import { MathNode } from '../lib/math-node/math-node'
import { ValueProvider } from '../lib/math-node/value'

declare let Parser: any;

export class LatexParser {
    private static parser = Parser;
    static initComplete:boolean = false;
    constructor() {
    }

    static init(){
        LatexParser.parser.yy.MathNode = MathNode;
        LatexParser.initComplete = true;
    }

    static parse(latex) {
        if(!LatexParser.initComplete){
            console.log('Please call init first');
            return;
        }
        return LatexParser.parser.parse(latex);
    }

    static evaluate(root):number{
        if(!LatexParser.initComplete){
            console.log('Please call init first');
            return;
        }
        return root.type()
    }

    static getSymbols(root){
        if(!LatexParser.initComplete){
            console.log('Please call init first');
            return;
        }
        let list = {};
        MathNode.prototype.traverseNode(root, list);
        return Object.keys(list);
    }

    static setValueProviderForVarNodes(root:MathNode, vp:ValueProvider){
        if(!LatexParser.initComplete){
            console.log('Please call init first');
            return;
        }
        let list = {};
        MathNode.prototype.traverseNode(root, list);
        let symbols = Object.keys(list);
        symbols.forEach(a => {
            list[a].nodes.forEach(n => n.vp = vp)
        })
    }
}