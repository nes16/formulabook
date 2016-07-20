
define(['require', 'jquery', 'pjs', 'underscore', 'base/underscoremodel', 'i18n'], function(require) {
    var $ = require('jquery');
    var _ = require('underscore');
    var UnderscoreModel = require('base/underscoremodel');
    var P = require('pjs');
    var i18n = require('i18n');

    var insertionQueue = [];

    var UnderscoreView = P(UnderscoreModel, function(view, _super, _class) {

        // Class method for generating more efficient templates in the case
        // that the template takes no parameters
        _class.staticTemplate = function(str) {
            var node = $(str)[0];
            return function() {
                return node.cloneNode(true);
            };
        };

        view.$ = function(selector) {
            var $node = $(this.__domNode);
            if (!selector) {
                return $node;
            } else {
                return $node.filter(selector).add($node.find(selector));
            }
        };

        // methods to adding view to dom. these call .didInsertElement()
        // automatically
        var makeInsertFn = function(methodName) {
            return function(selector) {
                var isTopmostInsert = (insertionQueue.length === 0);
                insertionQueue.push(this);
                if (!this.__domNode) _render.call(this);

                $(selector)[methodName](this.$());
                if (isTopmostInsert) {
                    while (insertionQueue.length) {
                        insertionQueue.pop().didInsertElement();
                    }
                }
                return this.$();
            };
        };

        view.appendTo = makeInsertFn('append');
        view.replace = makeInsertFn('replaceWith');
        view.prependTo = makeInsertFn('prepend');
        view.insertAfter = makeInsertFn('after');
        view.insertBefore = makeInsertFn('before');

        view.remove = function() {
            this.$().remove();
            this.destruct();
        };

        // should be overriden and used to cleanup any resources this view has
        // aquired. Most often, that means remove any observers set and any child
        // views created.
        view.destruct = function() {};

        // Called when the view has been rendered, but before its DOM node has been
        // inserted into the document. This is a good time to attach child views and
        // event listeners.
        view.didCreateElement = function() {};

        // for this to be called, must insert this.$() into dom using one of the
        // methods above. If not, you must call .didInsertElement() yourself.
        view.didInsertElement = function() {};

        // this is the information that will be made available to the underscore template
        view.getTemplateParams = function() {
            return {};
        };

        // tap into these if you want deep control of how a complete rerender happens.
        // one thing these are useful for are saving/restoring temporary data within
        // the view that will get wiped out when the html is regenerated.
        view.beforeRerender = function() {};
        view.afterRerender = function() {};

        // will render only if something has changed
        view.rerender = function() {
            var oldDomNode = this.__domNode;
            var newParams = this.getTemplateParams();
            if (_.isEqual(newParams, this.__lastRenderParams)) return;

            this.beforeRerender();

            _render.call(this);

            if (oldDomNode && $.contains(document, oldDomNode)) {
                this.replace(oldDomNode);
            }

            this.afterRerender();
        };

        view.setDomNode = function(node) {
            this.__domNode = node[0] ? node[0] : node;
            this.didInsertElement();
        };

        // private
        var _render = function() {
            var params = this.getTemplateParams();
            var helpers = {
                t: function(key, args) {
                    return i18n.t(key, args);
                }
            };
            var combined = _.extend({}, params, helpers);
            var html = this.template(combined);
            var $node = $(html);
            this.__domNode = $node[0];
            this.__lastRenderParams = params;
            this.didCreateElement();
        };

    });
    return UnderscoreView;
});