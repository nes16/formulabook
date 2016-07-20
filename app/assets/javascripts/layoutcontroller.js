define(['require','utils/console','pjs','jquery'],function(require){
  var console = require('utils/console');
  var P = require('pjs');
  var $ = require('jquery');

  return P(function (proto) {

    proto.init = function (views, $root, graphSettings) {
      this.views = views;
      this.$root = $root;
      // stores the current screen size at all times
      this.currentScreen = {};

      this.isAnimating = false;
      this.minExpressionWidth = 290;

      //TLab:this.$grapher = this.views.grapher.$;
      this.graphSettings = graphSettings;

      this.monitorWindowSize();
      // We call the monitorWindowSize() function every 200ms because the
      // window::onResize event just isn't reliable enough. In some browsers
      // (e.g. mobile safari) the event randomly gets dropped.
      if (graphSettings.config.resizeLoop) {
        var resizeLoop = function() {
          this.monitorWindowSize();
          setTimeout(resizeLoop, 200);
        }.bind(this);
        resizeLoop();
      }

      // We call the monitorWindowSize() function on window resize
      // this is triggered even for embedded tlabulator instances
      // it's a no-op if size hasn't changed
      $(window).resize(this.monitorWindowSize.bind(this));

      if (this.views.paramsView) {
        this.views.paramsView.observe('parametersVisible', function () {
          if (this.views.paramsView.parametersVisible) {
            this.$root.removeClass('tlab-fullscreen');
          } else {
            this.$root.addClass('tlab-fullscreen');
          }
          this.resize();
        }.bind(this));
      }

      if (this.views.keypadView) this.views.keypadView.observe('isOpen', this.resize.bind(this));
    };

    proto.resize = function () {
      /* jshint maxcomplexity:12 */
      if (this.views.keypadView) {
        this.$root.toggleClass('tlab-keypad-open', !!this.views.keypadView.isOpen);
      }

      //isAnimating is set by animateSlidingInterior
      //when we either show or hide the parameters list
      if (this.isAnimating) return;

      var h = this.$root.height();
      var w = this.$root.width();
      var isFullscreen = (!this.views.paramsView || !this.views.paramsView.parametersVisible);

      this.$root.toggleClass('tlab-narrow', this.isNarrow(w));
      this.$root.toggleClass('tlab-wide', this.isWide(w));
      this.$root.toggleClass('tlab-short', this.isShort(h));

      if (this.views.keypadView && this.views.keypadView.height) {
        var keypad_height = this.views.keypadView.height();
        this.views.paramsView.setBottom(keypad_height);

        if (this.views.pillboxView && this.views.pillboxView.settingsView) {
          this.views.pillboxView.settingsView.setBottom(keypad_height);
        }
      }

      if (this.views.paramsView) this.views.paramsView.setProperty('tlabIsNarrow', this.isNarrow(w));

      var newWidth = this.isNarrow(w) ? w : w < 356/0.45 ? Math.floor(0.45 * w) : 356;
      if (newWidth < this.minExpressionWidth) newWidth = this.minExpressionWidth;
      //since our open/close animations use the half-width and we don't want odd numbers
      if (!this.isNarrow(w)) newWidth = 2*Math.floor(0.5*newWidth);

      if (this.views.paramsView) this.views.paramsView.setMinWidth(newWidth);

      if (this.views.pillboxView) this.views.pillboxView.setProperty('graphpaperHeight', h);
      if (this.views.keypadView) this.views.keypadView.setProperty('graphpaperHeight', h);

      //on narrow screens, ignore offset
      var leftOffset = (this.isNarrow(w) || isFullscreen) ? 0 : newWidth;

      /*TLab:this.views.grapher.$.css({
        'left': leftOffset+'px',
        //get rid of any transform, in case this was called after doing an animation
        'transform': null
      });*/

      //TLab:this.views.grapher.updateScreenSize(w - leftOffset, h);

      //make sure that active parameter is scrolled into view
      if (this.views.paramsView) this.views.paramsView.ensureActiveChildIsVisible();
    };

    proto.animationIsRunning = function () {
      return this.runningAnimations !== 0;
    };

    proto.isNarrow = function (width) {
      return width < 450;
    };

    proto.isWide = function (width) {
      return width >= 900;
    };

    proto.isShort = function (height) {
      return height <= 480; //small iphone in portrait
    };

    proto.animateSlidingInterior = function () {
      if (this.isAnimating) return;
      this.isAnimating = true;

      setTimeout(function () {
        this.isAnimating = false;
        this.resize();
      }.bind(this), this.parseTransitionDuration('.tlab-sliding-interior'));
    };

    proto.parseTransitionDuration = function (target) {
      var $target = $(target);
      var durationString = $target.css('transition-duration');
      if (durationString[durationString.length - 1] !== 's') {
        console.warn(
          'Unexpected transition-duration format. ' +
          'Expected a number followed by \'s\' but saw ' + durationString
        );
        return 0;
      }

      return 1000*parseFloat(durationString.slice(0, -1));
    };

    proto.defocusMobile = function () {
      var focused = $(document.activeElement);
      // Only want to do this when we have to, since it can cause some bouncing.
      if (focused.filter('input, textarea').length === 0) return;
      // hack to get jquery to remove focus from hidden input.
      // the following steps work for all tested mobile devices.
      //
      // step 1) add an input textbox to body and focus it.
      // step 2) make that textbox disabled and readonly.
      // step 3) blur the textbox and remove from the dom.
      $('<input />').prependTo('body').focus()
      .attr({
        readonly: 'readonly',
        disabled: 'true'
      })
      .blur().remove();
    };

    proto.monitorWindowSize = function () {
      // check if anything actually updated
      var w = this.$root.width() + this.$root.scrollLeft();
      var h = this.$root.height() + this.$root.scrollTop();

      if (w === this.currentScreen.width && h === this.currentScreen.height) return;

      this.currentScreen.width = w;
      this.currentScreen.height = h;

      this.resize();
    };
  });
});