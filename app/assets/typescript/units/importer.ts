define(['require', 'backend', 'underscore', 'pjs'], function(require) {
    var _ = require('underscore');
    var Backend = require('backend');
    var P = require('pjs');

    var UnitImporter = P(function(importer) {

        //If the From cell contains following reg exp
        //that portion will considered part of name
        var nameFilters = [
            /[0-9] /, /EC/, /U\.S/, /U\.K/, /[A-Za-z] [A-Za-z]/, /avoirdupois/, /boiler/, /electric/
            , /metric/, /water/, /sidereal/, /tropical/, /printer/, /interval/
        ];
        
        var symbolFilters = [ 'fl oz', 'dry pt', 'liq pt', 'dry qt', 'liq qt'];
        importer.init = function() {
            this.unitProperties = {};
            this.unitFactors = [];
            this.customUnits = {};
            this.siUnits = {};
            this.propertyCount = 0;
            this.siUnitCount = 0;
            this.customUnitCount = 0;
        };


        importer.checkForSymbol = function(text, delimiters) {
            var bFound = false;
            var parts = text.split(delimiters[0]);
            if (parts.length > 1) {
                //check the last part contains any of the patterns for name
                
                var last = _.first(parts[parts.length - 1].split(delimiters[1]));
                if (last.length > 0) bFound = true;
                for (var k = 0; k < symbolFilters.length; k++)
                    if(symbolFilters[k] == last){
                        bFound = true;
                        return bFound;
                    }
                for (var k = 0; k < nameFilters.length; k++) {
                    if (nameFilters[k].test(last)){
                        bFound = false;
                        break;
                    }
                }
            }
            return bFound;
        };

        importer.processRow = function(row, prop) {
            var cells = row.find("td");

            //////from unit without anchor
            var nameFull = cells[0].innerHTML.replace(/<a.*a>/,'');
            //remove new line chars and spaces
            nameFull = nameFull.replace(/\n.*<nobr>/,'').replace(/<\/nobr>/, '').replace('&nbsp;', ' ');


            //symbol, name
            var name = "";
            var symbol = "";
            if (this.checkForSymbol(nameFull, '[]')) {
                symbol = _.first(_.last(nameFull.split('[')).split(']'));
                name = _.first(nameFull.split('[' + symbol + ']'));
            }
            else if (this.checkForSymbol(nameFull, '()')) {
                symbol = _.first(_.last(nameFull.split('(')).split(')'));
                name = _.first(nameFull.split('(' + symbol + ')'));
            }
            else {
                name = nameFull;
                symbol = "";
            }

            //encouraged
            var bEncouraged = $(cells[0]).find("i").length > 0;


            //trim
            var t = [/<i>/, /<\/i>/];
            var fromName = name.replace(/^\s*|\s*$/g, '').replace(t[0], '').replace(t[1], '');
            var fromSymbol = symbol.replace(/^\s*|\s*$/g, '');



            //////To unit
            nameFull = cells[1].innerHTML;
            
            //remove new line chars and spaces
            nameFull = nameFull.replace(/\n.*<nobr>/,'').replace(/<\/nobr>/, '').replace('&nbsp;', ' ');

            symbol = "";
            name = "";
            if (this.checkForSymbol(nameFull, '[]')) {
                symbol = _.first(_.last(nameFull.split('[')).split(']'));
                name = _.first(nameFull.split('[' + symbol + ']'));
            }
            else if (this.checkForSymbol(nameFull, '()')) {
                symbol = _.first(_.last(nameFull.split('(')).split(')'));
                name = _.first(nameFull.split('(' + symbol + ')'));
            }
            else {
                name = nameFull;
                symbol = "";
            }
            
            var toName = name.replace(/^\s*|\s*$/g, '').replace(/<i>/, '').replace(/<\\i>/, '');
            var toSymbol = symbol.replace(/^\s*|\s*$/g, '');
            var factor = "";
            var formula = "";
            var power = ""; 
            if(cells.length == 4)
            {
                //factor
                factor = cells[2].innerText.replace(/ /, '');
    
                //power
                power = _.last(cells[3].innerText.split('E')).replace(/\+/, '');
            }
            else
            {
                formula = $(cells[2]).mathquill('latex');
            }
            if (fromName.length) {
                var cu = this.customUnits[fromName];
                if (!cu) {
                    cu = {
                        id: this.customUnitCount++,
                        name: fromName,
                        symbol: fromSymbol,
                        property: prop.name,
                        encouraged: bEncouraged
                    };
                    this.customUnits[fromName] = cu;
                }
            }
            if (toName.length) {
                var si = this.siUnits[toName];
                if (!si) {
                    si = {
                        id: this.siUnitCount.length,
                        name: toName,
                        symbol: toSymbol,
                        property: prop.name
                    };
                    this.siUnits[toName] = si;
                }
            }
            if (fromName.length && toName.length) {
                this.unitFactors.push({
                    from: cu.name,
                    to: si.name,
                    formula: formula,
                    factor: factor,
                    power: power
                });
            }
        };


        importer.collectUnitData = function() {
            var k =4,
                rowStart = 4;
            var i = 11;
            //body > div > div:nth-child(11) > table > tbody > tr:nth-child(4)
            //body > div > div:nth-child(19) > table > tbody > tr:nth-child(28)
            var queryStr = "body > div > div:nth-child({0}) > table > tbody > tr:nth-child({1})";
            var bAdded = false;

            if (!String.prototype.format) {
                String.prototype.format = function() {
                    var args = arguments;
                    return this.replace(/{(\d+)}/g, function(match, number) {
                        return typeof args[number] != 'undefined' ? args[number] : match;
                    });
                };
            }


            while (true) {

                var row = $(queryStr.format(i.toString(), k.toString()));
                if (!row || row.length == 0) {
                    if (k == rowStart) break;
                    i += 2;
                    bAdded = false;
                    k = rowStart;
                    continue;
                }

                //Find property
                if (row.find('td').length == 4 || row.find('td').length == 3) {
                    if (!bAdded) {

                        bAdded = true;
                        var propName = row.parent().find('th')[0].innerText;
                        var prop = {
                            name: propName
                        };
                        this.unitProperties[prop.name] = prop;
                    }
                    this.processRow(row, prop);

                }
                k++;
            }

        };

        importer.saveUnitData = function() {
            var Backend = require('backend');

            this.backend = Backend();
            var n = 0;
            //for (var prop in this.unitProperties) {
            //    if (this.unitProperties.hasOwnProperty(prop)) {

                    // do stuff
                    this.backend.bSaving = true;
                    var newProperties =  {names: _.values(this.unitProperties), 
                                        froms: _.values(this.customUnits), 
                                        tos: _.values(this.siUnits), 
                                        factors: this.unitFactors
                                       };
                    this.backend.saveData('newproperty_save', {new_properties: newProperties}, this, this.onPropertySave);
                
             //       break;
                    
             //   }
                    

            //}
        };

        importer.onPropertySave = function(response) {
            console.log(response)
            console.log('Property saved successfully');
            this.backend.bSaving = false;
        };

    });
    return UnitImporter;
});


