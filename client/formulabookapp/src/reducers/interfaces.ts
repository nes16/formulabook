export interface Resource{
    type:string;
    id:string;
    name:string;
    user_id:number;
    shared:boolean;
    favourite:boolean;
    version:number;
}

export interface Property extends Resource {
}

export interface SingleUnit {
    prefix:string;
    symbol:string;
    reference?:string;
    power?:number;
}

export interface Unit extends Resource {
    property_id:string;
    factor:string;
    symbol:string;
    system:string;
    definition:SingleUnit[];
}

export interface ParsedValue {
    numeric:string;
    symbol:string;
    power:string;
}
export interface ValueU {
    input:string;
    unit_id:string;
    result:string;
    parsedValue?:ParsedValue;
}

export interface FormulaRun{
    name:string;
    values:{[symbol: string]:ValueU};
    result:ValueU;
}
export interface Variable {
    index:number;
    name?:string;
    symbol:string;
    unit_id:string;
}
export interface Global extends Resource {
    unit_id?:string;
    value:string;
    symbol:string;

}

export interface Formula extends Resource {
    symbol:string;
    unit_id:string;
    formula:string;
    variables:Variable[]
    global_ids:string[];
    runs:FormulaRun[];
}

export interface Favourite{
    id:string;
    favoritable_type:string;
    favoritable_id:string;
}

export interface Category{
    id:string;
    name:string;
    partent_id:string;
}

export interface CategoryResource{
    id:string;
    categorizable_id:string;
    categorizable_type:string;
}

