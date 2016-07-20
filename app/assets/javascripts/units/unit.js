
define( ['require', 'pjs', 'underscore', 'units/prefixes'], function(require) {
    var P = require('pjs');
    var UnderscoreModel = require('base/underscoremodel');
    var _ = require("underscore");
    var prefixes = require('units/prefixes');


    var Unit = P(UnderscoreModel, function(unit, _super) {

        //Units properties
        var obj_hash = ['name', 'system', 'isBaseUnit', 'prefix', 'symbol', 'prefixes', 'definition', 'description', 'factor_str', 'approximate',
            'factor', 'isFormula', 'isMultiSymbol'
        ];

        unit.init = function(state, prop) {
            _super.init.call(this);

            var self = this;
            this.property = prop;

            _.each(state, function(val, key) {
                self.key = val;
            });

            if (this.system == null) this.system = '';

            if (this.prefix == null) this.prefix = '';

            if (this.isBaseUnit == null) this.isBaseUnit = false;

            if (this.name == this.symbol) this.hasSymbol = false;



            if (this.system == 'SI' && !this._isSpecialSymbol(this.symbol))
                this.isMultiSymbol = true;
            else
                this.isMultiSymbol = false;


            if (this.system == 'SI' && !this.isMultiSymbol) {
                this.prefix = prefixes[this.prefix];

                //Normalise name and prefix
                this.name.replace(this.prefix[0], '');
                this.symbol.replace(this.prefix[1], '');
            } else
                this.prefix = null;

            if (this.prefixes == '' || this.prefixes == null) {
                this.prefixes = null;
            } else {
                var ps = this.prefixes;
                this.prefixes = [];
                if (ps.find('da') > -1) {
                    this.prefixes.push(prefixes['da']);
                    ps.replace('da', '');
                }
                _.each(ps, function(p) {
                    this.prefixes.push(prefixes[p]);
                }, this);
                //'' prefix will present in all units
                this.prefixes.push(prefixes['']);
            }

            if (this.factor_str.contains('['))
                this.isFormula = true;

            if (!this.isFormula) {
                var fs = this.factor_str.split('×10');
                this.factor = parseFloat(ps[0]);
                if (fs[1])
                    this.factor = this.factor * Math.pow(10, parseInt(fs[1]));
            } else
                this.factor = null;

        }

        //Units like watts, joule have seperate symbols 
        //so they are called special
        //Units for volume, area, flow don't have special symbol in SI
        unit._isSpecialSymbol = function() {
            //Check symbol is special name of the units.
            var sym = this.symbol;
            var system = this.system;
            var special = false;

            if (system != 'SI')
                return false;
            if (sym.length == 1)
                special = true;
            else if (sym.contains('/') || sym.contains(' ') || !isNaN(parseInt(sym[sym.length - 1])))
                special = false;
            else
                special = true;

            return special;
        };

        unit.parseSymbol = function(str) {
            var subUnits = {
                units: [],
                per_index: null
            };

            var parts = str.split['/'];
            if (parts.length > 2)
                return;
            var units = parts[0].split(' ');

            if (parts.length == 2) {
                subUnits.per_index = units.length;
                units = units.concat(parts[1].split(' '));
            }

            for (var i = 0, len = units.length; i < len; i++) {
                var u_str = units[i];
                var pow = 1;
                var len = u_str.length
                if (len > 1) {
                    pow = parseInt(u_str[len - 1])
                    if (pow > 0) {
                        if (len > 2 && u_str[len - 2] == '-')
                            pow = pow * -1;

                        if (pow != 0)
                            u_str = u_str.replace(pow.toString(), '');
                    } else
                        pow = 1
                }

                var uo = this.property.model.findUnitBySymbol(u_str);
                if (uo) {
                    var prefix = this.prefixes[u_str.replace(uo.symbol, '')]
                    subUnits.units.push({
                        unit: uo,
                        power: pow,
                        prefix: prefix
                    });
                } else
                    return;
            }

            return this.subUnits = subUnits;
        };

        unit.powerName = function(uo) {
            var name;
            if (uo.symbol != 's') {
                if (uo.pow == 2)
                    name = ('square ' + uo.name);
                else(pow == 3);
                name = ('cubic ' + uo.name);
            } else {
                if (uo.pow == 2)
                    name = ('second squared');
                else
                    name = ('second cubed');
            }
            return name;
        };

    });
    return Unit;
});