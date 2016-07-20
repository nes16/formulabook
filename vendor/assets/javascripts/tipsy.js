define('tipsy',['require','loadcss!tipsy','jquery'],function(require) {
  //note: the path to tipsycss needs to be configured in your requirejs config
  //for example: `'tipsycss': '../vendor_manual/albany/tipsy'`

  require('loadcss!tipsy');
  var $ = require('jquery');

  var openSticky = null;
  var ignoreStickyOpen = false;

  $(document).on('tlab-tap', '.tipsy-sticky', function (evnt) {

    // don't do anything. let the code that hides stickies close it.
    if (ignoreStickyOpen) {
      ignoreStickyOpen = false;
      return;
    }

    var opener = evnt.currentTarget;
    var $target = $(opener);

    // if the target doesn't have a tooltip, check if a child does
    if (!$target.attr('tooltip')) {
      $target = $target.find('[tooltip]').filter(':not([tooltip=""])');
    }

    // there should be exactly 1 tooltip to show
    if ($target.length !== 1) return;

    // ensure that the target is not display:none and no parent is display:none
    if ($target.css('display') === 'none') return;
    if ($target.parents().filter(function(){return $(this).css('display') === 'none'}).length) return;

    var options = $.extend({}, $.fn.tipsy.defaults);
    options.title = 'tooltip';
    options.gravity = 'nw';

    openSticky = new Tipsy($target[0], options);
    openSticky.show();
    openSticky.opener = opener;
  });

  $(document).on('tlab-tapstart keydown', function (evnt) {
    if (openSticky) {
      openSticky.hide();

      var opener = openSticky.opener;
      if (evnt.type === 'tlab-tapstart' && $(evnt.target).closest(opener).length ) {
        $(document).one('tlab-tapend', function (evnt2) {
          if ($(evnt2.target).closest(opener).length) {
            ignoreStickyOpen = true;
          }
        });
      }

      openSticky=null;
    }
  });

  function maybeCall(thing, ctx) {
    return (typeof thing == 'function') ? (thing.call(ctx)) : thing;
  }

  function Tipsy(element, options) {
    this.$element = $(element);
    this.options = options;
    this.fixTitle();
  }

  Tipsy.prototype = {
    show: function() {
      var title = this.getTitle();
      if (title && !isTipsyDisabled()) {
        var $tip = this.tip();
        var $arrow = $tip.find('.tipsy-arrow');

        $tip.find('.tipsy-inner')[this.options.html ? 'html' : 'text'](title);
        $tip[0].className = 'tipsy'; // reset classname in case of dynamic gravity
        $tip.remove().css({top: 0, left: 0, visibility: 'hidden', display: 'block'}).prependTo(document.body);

        var pos = $.extend({}, this.$element.offset(), {
          width: this.$element[0].offsetWidth,
          height: this.$element[0].offsetHeight
        });

        var tp, actualWidth = $tip[0].offsetWidth,
            actualHeight = $tip[0].offsetHeight,
            gravity = maybeCall(this.options.gravity, this.$element[0]);

        switch (gravity.charAt(0)) {
          case 'n':
            tp = {top: pos.top + pos.height + this.options.offset, left: pos.left + pos.width / 2 - actualWidth / 2};
            break;
          case 's':
            tp = {top: pos.top - actualHeight - this.options.offset, left: pos.left + pos.width / 2 - actualWidth / 2};
            break;
          case 'e':
            tp = {top: pos.top + pos.height / 2 - actualHeight / 2, left: pos.left - actualWidth - this.options.offset};
            break;
          case 'w':
            tp = {top: pos.top + pos.height / 2 - actualHeight / 2, left: pos.left + pos.width + this.options.offset};
            break;
        }

        if (gravity.length == 2) {
          if (gravity.charAt(1) == 'w') {
            tp.left = pos.left + pos.width / 2 - 15;
          } else {
            tp.left = pos.left + pos.width / 2 - actualWidth + 15;
          }
        }
        var arrowMarginLeft = 0;

        if (tp.left < 0) {
          arrowMarginLeft = tp.left;
          tp.left = 0;
        } else if (tp.left + actualWidth > window.innerWidth) {
          arrowMarginLeft = tp.left + actualWidth - window.innerWidth;
          tp.left = window.innerWidth - actualWidth;
        }

        //we want to center it, so add -5px margin because the tipsy arrow is 10px wide
        if (gravity === 'n' || gravity === 's') {
          arrowMarginLeft -= 5;
        }
        $arrow.css('marginLeft', arrowMarginLeft);

        $tip.css(tp).addClass('tipsy-' + gravity);

        $arrow[0].className = 'tipsy-arrow tipsy-arrow-' + gravity.charAt(0);
        if (this.options.className) {
          $tip.addClass(maybeCall(this.options.className, this.$element[0]));
        }

        if (this.options.fadeIn) {
          $tip.stop().css({opacity: 0, display: 'block', visibility: 'visible'})
                     .animate({opacity: this.options.opacity}, this.options.fadeIn);
        } else {
          $tip.css({visibility: 'visible', opacity: this.options.opacity});
        }

        if (this.options.sticky) {
          $tip.addClass('tipsy-sticky');
        }

        var self = this;
        var validateLoop = function () {
          self.validate();
          self.validateTimeout = setTimeout(validateLoop, 100);
        };
        validateLoop();
      }
    },

    hide: function() {
      clearTimeout(this.validateTimeout);

      if (this.options.fadeOut) {
        this.tip().stop().fadeOut(this.options.fadeOut, function() { $(this).remove(); });
      } else {
        this.tip().remove();
      }
    },

    fixTitle: function() {
      var $e = this.$element;
      if ($e.attr('title') || typeof($e.attr('original-title')) != 'string') {
        $e.attr('original-title', $e.attr('title') || '').removeAttr('title');
      }
    },

    getTitle: function() {
      var title, $e = this.$element, o = this.options;
      this.fixTitle();
      o = this.options;
      if (typeof o.title == 'string') {
        title = $e.attr(o.title == 'title' ? 'original-title' : o.title);
      } else if (typeof o.title == 'function') {
        title = o.title.call($e[0]);
      }

      if (title) title = ('' + title).replace(/(^\s*|\s*$)/, "");
      return title || o.fallback;
    },

    tip: function() {
      if (!this.$tip) {
        this.$tip = $('<div class="tipsy"><div class="tipsy-arrow"></div><div class="tipsy-inner"></div></div>');
      }
      return this.$tip;
    },

    validate: function() {
      var hasTitle = !!this.getTitle();
      var inDom = false;

      if (hasTitle) {
        try {
          var node = this.$element[0];

          while (node) {
            if (node === document) {
              inDom = true;
              break;
            } else {
              node = node.parentNode;
            }
          }
        } catch (e) {}
      }

      if (!inDom) {
        this.hide();
      }
    }
  };

  $.fn.tipsy = function(options) {

    if (options === true) {
      return this.data('tipsy');
    } else if (typeof options == 'string') {
      var tipsy = this.data('tipsy');
      if (tipsy) tipsy[options]();
      return this;
    }

    options = $.extend({}, $.fn.tipsy.defaults, options);

    options.fadeIn = options.fadeIn || options.fade;
    options.fadeOut = options.fadeOut || options.fade;

    function get(ele) {
      var tipsy = $.data(ele, 'tipsy');
      if (!tipsy) {
        tipsy = new Tipsy(ele, $.fn.tipsy.elementOptions(ele, options));
        $.data(ele, 'tipsy', tipsy);
      }
      return tipsy;
    }

    function enter(evnt) {
      // the tipsyshow event bubbles up the dom, so we only want to
      // listen to the event if the target is the same as the element
      // that is responding to the event. If this wasn't here then when
      // you move your mouse from a tipsy-enabled parent to a child, the
      // tipsyshow event would be fired from the child, bubble through
      // the parent, and get caught higher up. That would cause the
      // already opened tooltip to close and fade in again. With this
      // code, we ignore the tipsyshow event because the target is the
      // the child that isn't tipsy-enabled.
      if (evnt.type === 'tipsyshow' && evnt.target !== this) return;

      // this element has a sticky open already
      if (openSticky === this) return;

      var tipsy = get(this);
      tipsy.hoverState = 'in';

      if (options.delayIn === 0) {
        tipsy.show();
      } else {
        tipsy.fixTitle();
        setTimeout(function() { if (tipsy.hoverState == 'in') tipsy.show(); }, options.delayIn);
      }
    }

    function leave(evnt) {
      // we do this for the same reason we do it for the tipsyshow event.
      // look at the comment a few lines above for more information.
      if (evnt.type === 'tipsyhide' && evnt.target !== this) return;

      var tipsy = get(this);

      // if this is a sticky tooltip, don't close it on tlab-tapstart. If we
      // closed it now, it would flicker back on when we mouse up and
      // make it permanent. We'd like it to stay on the whole time.
      if (evnt.type === 'tlab-tapstart' && tipsy.options.sticky) return;

      tipsy.hoverState = 'out';
      if (options.delayOut === 0) {
        tipsy.hide();
      } else {
        setTimeout(function() { if (tipsy.hoverState == 'out') tipsy.hide(); }, options.delayOut);
      }
    }

    if (!options.live) this.each(function() { get(this); });

    if (options.trigger != 'manual') {
      var eventIn  = options.trigger == 'hover' ? 'tipsyshow' : 'focus';
      var eventOut = options.trigger == 'hover' ? 'tipsyhide tlab-tapstart tlab-tapend tlab-tapcancel' : 'blur';

      if (options.live && options.delegate) {
        this.on(eventIn, options.delegate, enter).on(eventOut, options.delegate, leave);
      } else {
        var binder   = options.live ? 'on' : 'bind';
        this[binder](eventIn, enter)[binder](eventOut, leave);
      }
    }

    return this;
  };

  $.fn.tipsy.defaults = {
    className: null,
    delayIn: 0,
    delayOut: 0,
    fade: false,
    fadeIn: false,
    fadeOut: false,
    fallback: '',
    gravity: 'n',
    html: false,
    live: true,
    offset: 0,
    opacity: 1,
    title: 'title',
    trigger: 'hover'
  };

  // Overwrite this method to provide options on a per-element basis.
  // (remember - do not modify 'options' in place!)
  $.fn.tipsy.elementOptions = function(ele, options) {
    options = $.extend({}, options);

    var gravity = $(ele).attr('tipsy-gravity');
    if (gravity) {
      options.gravity = gravity;
    }

    var offset = parseInt($(ele).attr('tipsy-offset'), 10);
    if (!isNaN(offset)) {
      options.offset = offset;
    }

    return options;
  };

  $.fn.tipsy.autoNS = function() {
    return $(this).offset().top > ($(document).scrollTop() + $(window).height() / 2) ? 's' : 'n';
  };

  $.fn.tipsy.autoWE = function() {
    return $(this).offset().left > ($(document).scrollLeft() + $(window).width() / 2) ? 'e' : 'w';
  };

  /**
   * yields a closure of the supplied parameters, producing a function that takes
   * no arguments and is suitable for use as an autogravity function like so:
   *
   * @param margin (int) - distance from the viewable region edge that an
   *        element should be before setting its tooltip's gravity to be away
   *        from that edge.
   * @param prefer (string, e.g. 'n', 'sw', 'w') - the direction to prefer
   *        if there are no viewable region edges effecting the tooltip's
   *        gravity. It will try to vary from this minimally, for example,
   *        if 'sw' is preferred and an element is near the right viewable
   *        region edge, but not the top edge, it will set the gravity for
   *        that element's tooltip to be 'se', preserving the southern
   *        component.
  */
  $.fn.tipsy.autoBounds = function(margin, prefer) {
    return function() {
      var dir = {ns: prefer[0], ew: (prefer.length > 1 ? prefer[1] : false)},
          boundTop = $(document).scrollTop() + margin,
          boundLeft = $(document).scrollLeft() + margin,
          $this = $(this);

      if ($this.offset().top < boundTop) dir.ns = 'n';
      if ($this.offset().left < boundLeft) dir.ew = 'w';
      if ($(window).width() + $(document).scrollLeft() - $this.offset().left < margin) dir.ew = 'e';
      if ($(window).height() + $(document).scrollTop() - $this.offset().top < margin) dir.ns = 's';

      return dir.ns + (dir.ew ? dir.ew : '');
    };
  };

  // automatically instantiate tipsy for .tipsy-sticky classes
  $(document).tipsy({
    title: 'tooltip',
    wait: 0,
    live: true,
    delegate: '.tipsy-sticky',
    gravity: 'nw',
    sticky: true,
    fade: false
  });

  var disableLocks = 0;
  function isTipsyDisabled () {
    return disableLocks !== 0;
  }

  function removeDisableLock() {
    disableLocks--;
  }

  function addDisableLock() {
    disableLocks++;
  }

  return {
    isDisabled: isTipsyDisabled,
    removeDisableLock: removeDisableLock,
    addDisableLock: addDisableLock
  };
});