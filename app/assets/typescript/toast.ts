//generates a toast (little message near the top of the page)
// lets you do things like switch back into edit-list mode
define(['require','pjs','base/underscoreview','template!toast','loadcss!toast'],function (require) {

  var P = require('pjs');
  var UnderscoreView = require('base/underscoreview');
  var template = require('template!toast');
  require('loadcss!toast');

  var ToastView = P(UnderscoreView, function (toast, _super) {
    toast.template = template;

    toast.init = function (undoRedo) {
      _super.init.call(this);
      this.undoRedo = undoRedo;
    };

    toast.didCreateElement = function () {
      var self = this;

      // hide toast when UndoRedo
      self.undoRedo.changesCallbacks.push(function () {
        self.hide();
      });

      this.$('.tlab-action-toast-undo').on('tlab-tap', function () {
        self.undoRedo.undo();

        if (self.undoCallback) {
          self.undoCallback();
        }
        self.hide();
      });

      this.$().on('tlab-tap', '.tlab-action-hide', this.hide.bind(this));
      // start off hidden
      this.$().toggle(false);
    };

    // str: string in the toast message
    // options:
    //   undoCallback: a function that gets called if the "undo" button is pressed.
    //      Note: "undo" is only shown if this is present
    //   hideAfter: integer # of ms (never hide if set to 0)
    //   style: class that we'll add (error is the only option so far)
    //   learnMoreLink: a link that we'll show with the "learn more" text
    toast.show = function (str, options) {
      options = options || {};

      clearTimeout(this.hideTimeout);
      this.$('.tlab-toast-container').fadeOut('fast');
      this.$('.tlab-toast').toggleClass('tlab-show-undo', options.hasOwnProperty('undoCallback'));
      //note: because of how jquery works, this'll strip off the style attr if options.style is undefined
      this.$('.tlab-toast').attr('style', options.style || null);

      if (options.hasOwnProperty('learnMoreLink')) {
        this.$('.tlab-learn-more-link').attr('href', options.learnMoreLink).show();
      } else {
        this.$('.tlab-learn-more-link').hide();
      }

      this.$().fadeIn('fast');

      this.$('.tlab-variable-msg').html(str);
      this.undoCallback = options.undoCallback;

      // hide after (default) 6 seconds
      var hideAfter = (options.hasOwnProperty('hideAfter') ? options.hideAfter : 6000);

      if (hideAfter > 0) {
        var self = this;
        this.hideTimeout = setTimeout(function () {
          self.hide();
        }, hideAfter);
      }
    };

    toast.hide = function () {
      clearTimeout(this.hideTimeout);
      this.$().fadeOut('fast');
    };
  });

  return ToastView;
});
