/* global jQuery */
;(function($) {
  var GLOBAL_NAMESPACE = "_*_";
  
  $.Event.prototype.wasHandled = function (namespace) {

    namespace = namespace ? namespace : GLOBAL_NAMESPACE;
    var oe = this.originalEvent;
    var hb = oe && oe.handledBy;
    
    //check if it was explicitly handled in code
    if (hb && hb[namespace]) return true;
    
    // namespace wasn't handled
    if (namespace !== GLOBAL_NAMESPACE) return false;

    //Now, check if it was implicitly handled through
    //the dom attribute 'handleEvent'
    var dom = $(this.target).closest('[handleEvent]');
    //TEMPORARY: just return true instead of deeply parsing
    if (dom.length && dom[0] !== this.currentTarget) {
      return dom.attr('handleEvent') !== "false";
    }

    //must not have been handled
    return false;
  };

  $.Event.prototype.handle = function (namespace) {
    namespace = namespace ? namespace : GLOBAL_NAMESPACE;
    var oe = this.originalEvent;
    if (!oe) return; //can't handle this properly

    var hb = oe.handledBy;
    if (!hb) hb = oe.handledBy = {};

    hb[namespace] = true;
  };

})(jQuery);

define(function() {});
