define(['require', 'pjs', 'underscore', 'utils/function.bind'], function(require) {
    var P = require('pjs');
    var _ = require('underscore');
    require('utils/function.bind');

    var UnderscoreModel = P(function(model) {
        var guids_count = 0;
        var guid_prefix = 'guid_' + Math.round(Math.random() * 1000000) + "_" + (new Date().getTime()) + "_";

        model.init = function() {
            this.__observers = {};
            this.__eventObservers = {};
            this.__oldProperties = {};
            this.__propertyComparators = {};
            this.guid = guid_prefix + (++guids_count);
        };

        model.unobserveAll = function() {
            this.__observers = {};
            this.__eventObservers = {};
        };

        model.getProperty = function(property) {
            return this[property];
        };

        model.getOldProperty = function(property) {
            return this.__oldProperties[property];
        };

        model.setProperty = function(property, newValue) {
            var oldValue = this[property];
            var comparator = this.__propertyComparators[property];
            if (comparator) {
                if (comparator(oldValue, newValue)) {
                    return;
                }
            } else if (_.isEqual(oldValue, newValue)) {
                return;
            }

            this.__oldProperties[property] = oldValue;
            this[property] = newValue;
            this.notifyPropertyChange(property);
        };

        model.setProperties = function(obj) {
            for (var k in obj) {
                if (obj.hasOwnProperty(k)) this.setProperty(k, obj[k]);
            }
        };

        model.setPropertyComparator = function(property, comparator) {
            this.__propertyComparators[property] = comparator;
        };

        // for properties
        model.notifyPropertyChange = function(property) {
            this.__callObservers(this.__observers, property, this);
        };
        model.observe = function(property_string, callback) {
            this.__addObservers(this.__observers, property_string, callback);
        };
        model.unobserve = function(property_string) {
            this.__removeObservers(this.__observers, property_string);
        };
        model.observeAndSync = function(property_string, callback) {
            this.observe(property_string, callback);
            var props = property_string.split(" ");
            for (var i = 0; i < props.length; i++) {
                var prop_parts = props[i].split(".");
                var prop = prop_parts[0];
                if (this.hasOwnProperty(prop)) {
                    //Observer will fire for each observed property that exists
                    //With the same args that an observed change would cause
                    callback(prop, this);
                }
            }
        };

        // for events
        model.triggerEvent = function(event, param) {
            this.__callObservers(this.__eventObservers, event, param);
        };
        model.observeEvent = function(event_string, callback) {
            this.__addObservers(this.__eventObservers, event_string, callback);
        };
        model.unobserveEvent = function(event_string) {
            this.__removeObservers(this.__eventObservers, event_string);
        };

        // generic implementation of trigger, add, remove observers 
        model.__callObservers = function(list, prop, arg) {
            var observers = list[prop];
            if (observers) {
                for (var i = 0; i < observers.length; i++) {
                    observers[i].callback(prop, arg);
                }
            }
        };
        model.__removeObservers = function(list, prop_string) {
            var props = prop_string.split(" ");
            for (var i = 0; i < props.length; i++) {
                var prop_parts = props[i].split(".");
                var prop = prop_parts[0];
                var namespace = prop_parts[1];

                // only keep the ones with a different namespace
                if (prop && namespace) {
                    var original = list[prop];
                    var filtered = [];
                    if (!original) continue;
                    for (var j = 0; j < original.length; j++) {
                        var observer = original[j];
                        if (observer.namespace !== namespace) {
                            filtered.push(observer);
                        }
                    }
                    list[prop] = filtered;

                    // get rid of all of observers for this property since no namespace given
                } else if (prop) {
                    delete list[prop];

                    // we aren't given a property, only a namespace. run through each
                    // property that has observers and call .unobserve(property.namespace)
                } else if (namespace) {
                    for (prop in list) {
                        if (list.hasOwnProperty(prop)) {
                            this.__removeObservers(list, prop + "." + namespace);
                        }
                    }
                }
            }
        };
        model.__addObservers = function(list, prop_string, callback) {
            var props = prop_string.split(" ");
            for (var i = 0; i < props.length; i++) {
                var prop_parts = props[i].split(".");
                var prop = prop_parts[0];
                if (!prop) throw 'Must supply a property to observe';

                var namespace = prop_parts[1];
                var observer = {
                    namespace: namespace,
                    callback: callback
                };

                var observers = list[prop];
                if (!observers) {
                    list[prop] = [observer];
                } else {
                    observers.push(observer);
                }
            }
        };

    });
    return UnderscoreModel;
});