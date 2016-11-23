import '../assets/latex-parser/latex-parser'
import { MathNode } from '../lib/math-node/math-node'
import { ValueProvider } from '../lib/math-node/value'

declare var Parser: any;

export class LatexParser {
    private static parser = Parser;
    constructor() {
        LatexParser.parser.yy.MathNode = MathNode;
    }

    static parse(latex) {
        return LatexParser.parser.parse(latex);
    }

    static evaluate(root):number{
        return root.type()
    }

    static getVarNodes(root, resource, globals){
        var list = {};
        MathNode.prototype.traverseNode(root, list);
        var symbols = Object.keys(list);
        resource.addSymbols(symbols, globals);
        
    }

    static setValueProviderForVarNodes(root:MathNode, vp:ValueProvider){
        var list = {};
        MathNode.prototype.traverseNode(root, list);
        var symbols = Object.keys(list);
        symbols.forEach(a => {
            list[a].nodes.forEach(n => n.vp = vp)
        })
    }
}