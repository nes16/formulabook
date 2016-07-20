define( ['require'], function(require) {
    //this ensures that innerEl is visible inside of outerEl by scrolling outerEl
    //padding is the space we want to enforce on either side, if available
    //
    //note: innerEl and outerEl are expected to be jQuery objects.
    var scrollVisible = function(innerEl, outerEl, padding) {
        var outerHeight = outerEl.height();
        var innerHeight = innerEl.height();

        var scrollTop = outerEl[0].scrollTop;
        //innerTop relative to the container (compensate for scroll and offset of container)
        var innerTop = innerEl.offset().top + scrollTop - outerEl.offset().top;

        // {padding}px from the top means innerTop - scrollTop = padding
        var maxScrollTop = innerTop - padding;
        // {padding}px from the bottom means outerHeight+scrollTop = innerHeight + innerTop + padding
        var minScrollTop = innerHeight + innerTop + padding - outerHeight;

        if (maxScrollTop >= minScrollTop) {
            //clamp value between the max and min scrollTop
            outerEl[0].scrollTop = Math.min(Math.max(scrollTop, minScrollTop), maxScrollTop);
        } else {
            //if we can't fit everything, just match padding on both sides by splitting the difference
            outerEl[0].scrollTop = 0.5 * (maxScrollTop + minScrollTop);
        }
    };

    return {
        scrollVisible: scrollVisible
    };
});