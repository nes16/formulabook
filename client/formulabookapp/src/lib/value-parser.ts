import '../assets/parsers/value-parser'
declare let ValParser: any;

export class ValueParser {
    private static parser = ValParser;
    constructor() {
    }

    static parse(input) {
        return ValueParser.parser.parse(input)
    }

}