/*
 * Touch/Mouse event handling gets complicated when a user has both a touch
 * device attached and a mouse attached. This tracking system helps deal with
 * that situation. We listen for the touch and mouse events on the document
 * and redispatch new, normalized events that work for many different devices
 * It's important to note that evt.stopPropagation() cannot be called on any
 * events that this is listening for.
 *
 * It normalizes 'touchStart' and 'mouseDown' to the 'tapstart' event.
 * It normalizes 'touchMove' and 'mouseMove' to the 'tapmove' event.
 * It normalizes 'touchEnd' and 'mouseUp' to the 'tapend' event.
 * It sends out a 'tap' event after a single touchStart and touchEnd.
 * It sends out a 'longhold' event if 500ms after a single 'tapstart'
 *    there hasn't been another event and the 'tapstart' is the only touch.
 *    Events have a 'wasLongheld' property that lets you know if a longhold
 *    has happened.
 *
 * TODO - dispatch 'doubletap' event after 'tap' and 'tap' near same location.
 *
 * One thing that it does is enforce that only one device, either touch or
 * or mouse, be used at a time. TOUCH_MODE starts on 'touchStart' and ends when
 * when all touches are lifted. MOUSE_MODE starts on 'mouseDown' and ends on
 * 'mouseUp'. When in TOUCH_MODE, it ignores all MOUSE_MODE events. When in
 * MOUSE_MODE, it ignores all TOUCH_MODE events.
 *
 * There is still one other slight complication. The ipad issues a 'mouseDown'
 * event after the 'touchEnd' event. That means following the logic above, we'd
 * leave TOUCH_MODE on touchEnd, and we'd get a mouseDown event. That'd put us
 * in MOUSE_MODE. We'd process the 'mouseDown' as if it were from a mouse, and
 * we'd happily process the 'mouseUp' event as well. In order to combat that,
 * on each 'mouseDown' event we check if we've recently been in TOUCH_MODE. We
 * enforce that half a second has passed since a person was in TOUCH_MODE
 * before they can enter MOUSE_MODE. If we decide that that's not ideal, we
 * can check if the mouseDown is near the 'touchStart' or 'touchEnd' events, but
 * that sounds like an unnecessary complication.
 *
 * One other interesting thing is that 'mouseMove' can be dispatched even when
 * the mouse button isn't pressed. For that reason, this doesn't require that
 * you be in MOUSE_MODE to listen for 'mouseMove' events.
 *
 * UPDATE 24/10 - DM
 * I have put in support for pointerevents & MSPointerEvents to allow for multitouch
 * on Windows 8 machines. For once, MS have made a good move and proposed a useful
 * standard in pointerevents - down the line that may end up being the W3C standard
 * which will involve some more work here. Primarily, they don't track multiple touches
 * in a single event, so here we are keeping track of them and then conforming that array
 * to the rest of our more touch/tap-esque system.
 */
define(['require', 'jquery', 'device/ipadghostevents'], function(require) {

    var $ = require('jquery');
    var GhostEvents = require('device/ipadghostevents');

    GhostEvents.isGhostEvent = function(evt) {
        // I've seen no indication of "ghost events" when using PointerEvents.
        // Disabling altogether because the logic below doesn't work for PointerEvents.
        // The ipad appears to be the only device that sends legacy events after
        // the mouseup. Other devices send the legacy events after their touch,pointerevent
        // equivalent:
        //
        // ipad: touchstart, touchmove, touchend, mousedown, mouseup, click
        // surface: pointerdown, mousedown, pointerup, mouseup, click
        //
        // The logic below assumes that the touchend (or pointerend) has happened before
        // the evt in question. If it has not, then lastTarget will be null and we
        // will consider evt a ghostevent. The ghostevent code is specially tailored
        // to the ipad, so I'm not quick to change it.
        //
        // TODO - maybe make ghost event detection opt in rather opt out. IIRC, android
        // uses the same event sequence as the surface, so it's possible we're detecting
        // ghostevents on android when we shouldn't be.
        //
        // The effect of wrongly considering an event a ghost event is we preventDefault()
        // on it and possibly stopPropagation(). We also do fun things with focus.
        if (window.PointerEvent) {
            return false;
        }

        // not a ghost event if it's from a mouse
        if (mode !== TOUCH_MODE && !hasRecentlyEndedTouchMode()) {
            return false;
        }

        // it's a ghost event if the target of the event and our lastTarget aren't ancestors. What has happened is
        // the dom moved around while the legacy events were being generated. We'll be ignoring the upcoming
        // legacy events.
        if (evt.target === lastTarget) return false;
        if (evt.target && $.contains(evt.target, lastTarget)) return false;
        if (lastTarget && $.contains(lastTarget, evt.target)) return false;

        return true;
    };

    var NO_MODE = 0; // nothing pressed
    var TOUCH_MODE = 1; // finger is on screen
    var MOUSE_MODE = 2; // mouse is held down

    var mode = NO_MODE;
    var identifierLocation = {}; // lookup up touch identifier location on screen 
    var modeEvents = {};
    var modeTargets = [];
    var endTouchModeTime = 0;
    var endTouchModeTimeout = null;
    var lastTarget = null;

    var longholdTimeout = null;
    var pointerTouches = [];

    // returns an array of node, parent, grandparent, etc
    var getAncestors = function(node) {
        var nodes = [];
        while (node) {
            nodes.push(node);
            node = node.parentNode;
        }

        return nodes;
    };

    // only returns nodes within a .tlab-tap-container
    var filterSortedNodesWithinScope = function(sortedNodes) {
        var filtered = [];
        for (var i = 0; i < sortedNodes.length; i++) {
            var node = sortedNodes[i];
            filtered.push(node);

            if ($(node).hasClass('tlab-tap-container')) {
                return filtered;
            }
        }

        return [];
    };

    var beginMode = function(evnt) {
        lastTarget = null;

        if (evnt.type === 'mousedown') {
            mode = MOUSE_MODE;
            modeTargets = getAncestors(evnt.target);
        } else if (evnt.type === 'pointerdown' || evnt.type === 'MSPointerDown') {
            //we'll have filtered out all mouse and pen events by here, so this must've been a touch
            mode = TOUCH_MODE;
            modeTargets = getAncestors(evnt.target);
        } else {
            mode = TOUCH_MODE;
            modeTargets = getAncestors(evnt.originalEvent.touches[0].target);
        }
        // make the elements under the mouse look pressed
        $(filterSortedNodesWithinScope(modeTargets)).addClass('tlab-depressed');

        // save original scroll positions for elements we've moused on
        $(modeTargets).each(function() {
            var elm = $(this);

            elm.data({
                originalScrollTop: elm.scrollTop(),
                originalScrollLeft: elm.scrollLeft()
            });
        });

        modeEvents = {};
    };

    var endMode = function(evnt) {
        lastTarget = null;

        // nothing is pressed anymore
        $('.tlab-depressed').removeClass('tlab-depressed');

        // check if any of the elements we originally moused on have scrolled.
        $(modeTargets).each(function() {
            var elm = $(this);
            var verticalOffset = elm.data('originalScrollTop') - elm.scrollTop();
            var horizontalOffset = elm.data('originalScrollLeft') - elm.scrollLeft();
            // save original scroll positions
            if (verticalOffset || horizontalOffset) {
                modeEvents.scroll = true;
            }
        });

        if (modeEvents['tlab-tapstart'] === 1 && modeEvents['tlab-tapend'] === 1 && !modeEvents['tlab-tapcancel'] && !modeEvents.scroll) {

            // get the x and y position of event.
            var x = evnt.device === 'mouse' ? evnt.pageX : evnt.originalEvent.changedTouches[0].pageX;
            var y = evnt.device === 'mouse' ? evnt.pageY : evnt.originalEvent.changedTouches[0].pageY;

            // run through the original modeTargets to see if the touchend is
            // with the bounds.
            var tap_escaped_boundary = false;
            for (var i = 0; i < modeTargets.length && !tap_escaped_boundary; i++) {
                var target = $(modeTargets[i]);
                var offset = target.offset();

                // don't let tap events escape from a tapboundary.
                //
                // we allow you to mousedown on one element and mouseup on another. We
                // dispatch the tap event on the common ancestor. This allows you to be
                // imprecise when clicking. Sometimes that isn't ideal however. Say
                // you mouse down on a slider thumb and mouse up on the expression. By
                // default, we'd dispatch a tap event on the expression. That'd cause
                // the expression to be selected and focused. That's not what we want.
                // So, we define a tapboundary on the slider element. That will not
                // allow a tap event to start within the slider and end somewhere
                // outside of it. It must terminate within the boundary, otherwise we
                // won't dispatch a tap event at all.
                if (target.attr('tapboundary') === 'true') {
                    tap_escaped_boundary = true;
                }

                if (offset) {

                    // check if within top and left sides
                    if (x < offset.left || y < offset.top) continue;

                    // check if within right side
                    if (x > offset.left + target.outerWidth()) continue;

                    // check if within bottom side
                    if (y > offset.top + target.outerHeight()) continue;

                }

                lastTarget = target[0];
                dispatchEvent('tlab-tap', evnt, lastTarget);
                break;
            }
        }

        // start the timer after we process the tap event.
        // this fires an event 1000ms in the future. If anything had caused the ipad
        // legacy events to get delayed, that'll also cause this function call to
        // get delayed. For us to switch back to MOUSE_MODE, this event must have
        // fired and it must not have been fired within 500ms of us trying to
        // switch to MOUSE_MODE
        if (mode === TOUCH_MODE) {
            endTouchModeTimeout = setTimeout(function() {
                endTouchModeTimeout = null;
                endTouchModeTime = new Date().getTime();
            }, 1000);
        }

        modeTargets = [];
        mode = NO_MODE;
    };

    var hasRecentlyEndedTouchMode = function() {
        return endTouchModeTimeout || new Date().getTime() - endTouchModeTime < 500;
    };

    // it's important to clone touches because some devices keep updating the
    // same reference to a touch.
    var clone = function(touches) {
        var cloned = [];
        for (var i = 0; i < touches.length; i++) {

            var touch = touches[i];
            cloned.push({

                identifier: touch.identifier,
                x: touch.pageX,
                y: touch.pageY,

                screenX: touch.screenX,
                screenY: touch.screenY,
                pageX: touch.pageX,
                pageY: touch.pageY,
                clientX: touch.clientX,
                clientY: touch.clientY
            });
        }
        return cloned;
    };

    var dispatchEvent = function(type, evnt, differentTarget) {

        // Both Microsoft and Google think it's cute to send pointermove and
        // touchmove events after pointerdown and touchstart events.
        // I noticed this on the Microsoft Surface and the Samsung Galaxy S4.
        // Not all android devices seem to have this behavior, but we're getting
        // rid of it once and for all by making sure tapmove events are only
        // fired if a move has actually taken place.
        if (type === 'tlab-tapstart') {
            identifierLocation[evnt.identifier] = {
                type: type,
                pageX: evnt.originalEvent.changedTouches[0].pageX,
                pageY: evnt.originalEvent.changedTouches[0].pageY
            };
        } else if (type === 'tlab-tapmove') {
            var thisEvnt = evnt.originalEvent.changedTouches[0];
            var lastEvnt = identifierLocation[evnt.identifier];
            if (lastEvnt && thisEvnt.pageX === lastEvnt.pageX && thisEvnt.pageY === lastEvnt.pageY) {
                return; //didn't really move
            }

            // Most devices are smart about not firing unintentional tapmove events after a tapstart
            // event. Some devices, don't do noise filtering. We do that noise filtering here by
            // making sure your finger moves over a pixel from the tapstart event location before
            // considering tapmove events to be intentional.
            if (
                mode === TOUCH_MODE && lastEvnt && lastEvnt.type === 'tlab-tapstart' &&
                Math.abs(lastEvnt.pageX - thisEvnt.pageX) + Math.abs(lastEvnt.pageY - thisEvnt.pageY) < 2) {
                return; //this is very likely an unintentional tapmove event fired. ignoring it.
            }

            identifierLocation[evnt.identifier] = {
                type: type,
                pageX: evnt.originalEvent.changedTouches[0].pageX,
                pageY: evnt.originalEvent.changedTouches[0].pageY
            };
        }

        // count an event type. used to figure out if we should send out
        // a tap and doubletap event.
        if (modeEvents[type.toLowerCase()] === undefined) {
            modeEvents[type.toLowerCase()] = 1;
        } else {
            modeEvents[type.toLowerCase()]++;
        }

        var newEvnt = $.event.fix(evnt.originalEvent);
        newEvnt.type = type;
        newEvnt.device = mode === TOUCH_MODE ? 'touch' : 'mouse';
        newEvnt.touches = clone(evnt.originalEvent.touches);
        newEvnt.changedTouches = clone(evnt.originalEvent.changedTouches);
        newEvnt.target = differentTarget ? differentTarget : evnt.target;

        var wasLongheld = modeEvents.longhold > 0;
        newEvnt.wasLongheld = function() {
            return wasLongheld
        };

        // send out a 'longhold' 500ms after a 'tapstart' as long as nothing else happens between
        // now and then.
        clearTimeout(longholdTimeout);
        if (newEvnt.type === 'tlab-tapstart' && newEvnt.touches.length === 1) {
            longholdTimeout = setTimeout(function() {
                dispatchEvent('tlab-longhold', evnt, differentTarget);
            }, 500);
        }

        $(newEvnt.target).trigger(newEvnt);
    };

    // TODO - Remember nodes given .hovered last time instead of querying. Only
    //        problem I can see here is that it's possible for a person to
    //        clone an object that has the .hover and add it to
    //        the dom. Then it'll never lose the .hover class. If we find
    //        any more performance problems with this, then maybe we can worry
    //        about it, but I don't think we need that optimization.
    // Already optimized to leave .hover on elements that still are hovered. Saw
    // a preformance problem with sliders before optimization and problem went
    // away after optimization.
    var setHoveredNode = function(node) {

        var hoverableNodes = modeTargets; // gets a list of nodes that were under the mouse when it was pressed
        var checkIfNodeIsHoverable = !!modeTargets.length; // simple mouse move with no mouse down
        var hoveredBefore = $.makeArray($('.tlab-hovered'));
        var hoveredNow = [];
        var lostHover = [];
        var gainedHover = [];

        filterSortedNodesWithinScope(getAncestors(node)).forEach(function(node) {
            // only add to hovered list if it can be hovered.
            if (!checkIfNodeIsHoverable || hoverableNodes.indexOf(node) !== -1) {

                // hovered now, but wasn't before
                if (hoveredBefore.indexOf(node) === -1) {
                    gainedHover.push(node);
                }

                hoveredNow.push(node);
            }
        });

        // find the ones that used to be hovered but aren't any more
        for (var i = 0; i < hoveredBefore.length; i++) {
            node = hoveredBefore[i];
            if (hoveredNow.indexOf(node) === -1) {
                lostHover.push(node);
            }
        }

        $(lostHover).removeClass('tlab-hovered').trigger('tipsyhide');
        $(gainedHover).addClass('tlab-hovered').trigger('tipsyshow');
    };


    var removePointerEventById = function(id) {
        // Returns the removed event for use in some handlers
        for (var i = 0; i < pointerTouches.length; i++) {
            if (pointerTouches[i].pointerId === id) {
                return pointerTouches.splice(i, 1)[0];
            }
        }
    };

    //From:
    //http://msdn.microsoft.com/en-us/library/windows/apps/hh466130.aspx
    //IE10 uses longs, IE11 uses strings
    var isMSTouchEvent = function(evnt) {
        return (
            evnt.originalEvent.pointerType === 'touch' ||
            evnt.originalEvent.pointerType === 2
        );
    };

    // Apply touch & mouse event handlers for everything that isn't IE10+
    // and mspointerevents (IE10) & pointerevents for IE(11).
    $(document).on('pointerdown MSPointerDown', function(evnt) {
        if (mode === MOUSE_MODE || !isMSTouchEvent(evnt)) return;

        // setup TOUCH_MODE
        if (mode === NO_MODE) {
            beginMode(evnt);
        }

        // nothing can be hovered now
        setHoveredNode(null);

        // normalize pointer-event to a touch-event
        evnt.originalEvent.identifier = evnt.originalEvent.pointerId;
        evnt.originalEvent.touches = pointerTouches;
        evnt.originalEvent.changedTouches = [evnt.originalEvent];
        pointerTouches.push(evnt.originalEvent);

        dispatchEvent('tlab-tapstart', evnt);
    });

    $(document).on('pointermove MSPointerMove', function(evnt) {
        if (mode !== TOUCH_MODE || !isMSTouchEvent(evnt)) return;

        // Pointer events don't get updated, so we need to remove any existing
        // instances of this pointerId we are tracking and add the new data in.
        removePointerEventById(evnt.originalEvent.pointerId);
        pointerTouches.push(evnt.originalEvent);

        // normalize pointer-event to a touch-event
        evnt.originalEvent.identifier = evnt.originalEvent.pointerId;
        evnt.originalEvent.touches = pointerTouches;
        evnt.originalEvent.changedTouches = [evnt.originalEvent];
        dispatchEvent('tlab-tapmove', evnt);
    });

    $(document).on('pointercancel MSPointerCancel', function(evnt) {
        if (mode !== TOUCH_MODE || !isMSTouchEvent(evnt)) return;

        // Pointer events don't get updated, so we need to remove any existing
        // instances of this pointerId we are tracking
        removePointerEventById(evnt.originalEvent.pointerId);

        // normalize pointer-event to a touch-event
        evnt.originalEvent.identifier = evnt.originalEvent.pointerId;
        evnt.originalEvent.touches = pointerTouches;
        evnt.originalEvent.changedTouches = [evnt.originalEvent];

        dispatchEvent('tlab-tapcancel', evnt);
        // switch back to no mode if all touches are gone
        if (evnt.originalEvent.touches.length === 0) {
            endMode(evnt);
        }
    });

    $(document).on('pointerup MSPointerUp', function(evnt) {
        if (mode !== TOUCH_MODE || !isMSTouchEvent(evnt)) return;

        // Pointer events don't get updated, so we need to remove any existing
        // instances of this pointerId we are tracking
        removePointerEventById(evnt.originalEvent.pointerId);

        // normalize pointer-event to a touch-event
        evnt.originalEvent.identifier = evnt.originalEvent.pointerId;
        evnt.originalEvent.touches = pointerTouches;
        evnt.originalEvent.changedTouches = [evnt.originalEvent];

        dispatchEvent('tlab-tapend', evnt);
        // switch back to no mode if all touches are gone
        if (evnt.originalEvent.touches.length === 0) {
            endMode(evnt);
        }
    });

    $(document).on('touchstart', function(evnt) {
        if (mode === MOUSE_MODE) return;

        // setup TOUCH_MODE
        if (mode === NO_MODE) {
            beginMode(evnt);
        }

        // nothing can be hovered now
        setHoveredNode(null);
        dispatchEvent('tlab-tapstart', evnt);
    });

    $(document).on('touchmove', function(evnt) {
        if (mode !== TOUCH_MODE) return;
        dispatchEvent('tlab-tapmove', evnt);
    });

    $(document).on('touchcancel', function(evnt) {
        if (mode !== TOUCH_MODE) return;
        dispatchEvent('tlab-tapcancel', evnt);
        // switch back to no mode if all touches are gone
        if (evnt.originalEvent.touches.length === 0) {
            endMode(evnt);
        }
    });

    $(document).on('touchend', function(evnt) {
        if (mode !== TOUCH_MODE) return;
        dispatchEvent('tlab-tapend', evnt);
        // switch back to no mode if all touches are gone
        if (evnt.originalEvent.touches.length === 0) {
            endMode(evnt);
        }
    });

    $(document).on('mousedown', function(evnt) {
        if (evnt.button === 1 || evnt.button === 2) return;

        // Take evasive action for legacy clicks--that is, click events that are
        // synthesized by touch browsers after a sequence of touches has ended.
        // The problem we're trying to solve here is that if you move a DOM
        // element in response to a touch event, then the legacy mouse events will
        // be fired on whatever element happens to now be under where the touch
        // event occurred.
        //
        // For example, the "functions" menu is hidden when one of its buttons is
        // touched, and the legacy click event is subsequently fired on the graph
        // paper. This takes focus from the expression that was being edited.
        //
        // The solution is to preventDefault() on the legacy events if we are in
        // touch mode. However, this prevents inputs, textareas, and selects from
        // being focused properly in mobile webkit browsers. We compromise by
        // firing preventDefault() only if the target is not an input, textarea,
        // or select.
        if (mode === TOUCH_MODE || hasRecentlyEndedTouchMode()) {
            if (!$(evnt.target).is('input, textarea, select')) {
                evnt.preventDefault();
            }
            return;
        }

        // setup MOUSE_MODE
        beginMode(evnt);

        // add in missing touch api information
        evnt.originalEvent.touches = [evnt];
        evnt.originalEvent.changedTouches = [evnt];

        dispatchEvent('tlab-tapstart', evnt);
    });

    // Stop mousedown event from propagating for any element with an ancestor with
    // class .do-not-blur (and no ancestor with .do-blur)
    $(document).ready(function() {
        $(document).on("mousedown", function(e) {
            var doNotBlur = !!$(e.target).closest('.tlab-do-not-blur').length,
                doBlur = !!$(e.target).closest('.tlab-do-blur').length;
            if (doNotBlur && !doBlur) {
                e.preventDefault();
            }

            // we use preventDefault() in places and that will cause text selection
            // to be preserved when it shouldn't be. On mouse down, if the only
            // thing with selection is something that has the .tlab-text-selectable class
            // then we can safely remove selection.
            var selection = window.getSelection();
            if (selection.rangeCount === 1) {
                var range = selection.getRangeAt(0);
                if (
                    range.startContainer === range.endContainer &&
                    $(range.startContainer).closest('.tlab-text-selectable').length
                ) {
                    selection.removeAllRanges();
                }
            }

        });
    });

    // If the mouse isn't pressed, then the mousemove that moves us off the
    // the screen isn't reported. That'll leave the last hovered element hoverd.
    // this checks if we are in NO_MODE and have a mouseleave event.
    $(document).on('mouseleave', function(evnt) {
        // we can move the mouse while not being in mouseMode
        if (mode !== NO_MODE) return;

        // check if a significant amount of time has passed since
        // switching from TOUCH_MODE to NO_MODE
        if (hasRecentlyEndedTouchMode()) return;

        // nothing is hovered
        setHoveredNode(null);
    });

    $(document).on('mousemove', function(evnt) {
        if (evnt.button === 1 || evnt.button === 2) return;

        // we can move the mouse while not being in mouseMode
        if (mode === TOUCH_MODE) return;

        // check if a significant amount of time has passed since
        // switching from TOUCH_MODE to MOUSE_MODE
        if (hasRecentlyEndedTouchMode()) return;

        setHoveredNode(evnt.target);

        // add in missing touch api information
        evnt.originalEvent.touches = [evnt]; // TODO - not perfect because it could be a non-touch
        evnt.originalEvent.changedTouches = [evnt];

        dispatchEvent('tlab-tapmove', evnt);
    });


    $(document).on('mouseup', function(evnt) {
        if (evnt.button === 1 || evnt.button === 2) return;

        if (mode !== MOUSE_MODE) return;

        // add in missing touch api information
        evnt.originalEvent.touches = [];
        evnt.originalEvent.changedTouches = [evnt];

        dispatchEvent('tlab-tapend', evnt);

        endMode(evnt);
    });

    /* Uncomment to see visual dots on screen following mouse events

    $(document).on('tapstart tapend tapmove tap tapcancel', function (evt){
      console.log(evt.type, evt.originalEvent.changedTouches);

      function drawDot (touch, c, r, o) {
        if (evt.isDefaultPrevented()) r *= 10;

        var styles = [
          'position:absolute',
          'z-index: 5000000',
          'pointer-events: none',
          'left:' + (touch.pageX-r) + 'px',
          'top:' + (touch.pageY-r) + 'px',
          'width:' + (2*r) + 'px',
          'height:' + (2*r) + 'px',
          'border-radius:' + r + 'px',
          'background:'+ c,
          'opacity:'+ o
        ];

        return $('<div style="'+ styles.join(';') +'"></div>').appendTo('body');
      }

      for (var i in evt.originalEvent.changedTouches) {
        var touch = evt.originalEvent.changedTouches[i];
        if (evt.type === 'tapstart') {
          drawDot(touch, '#0F0', 6, .5);
        } else if (evt.type === 'tapend') {
          drawDot(touch, '#F00', 6, .5);
        } else if (evt.type === 'tapmove') {
          drawDot(touch, '#00F', 3, 1);
        } else if (evt.type === 'tap') {
          drawDot(touch, '#FF0', 12, .5);
        }
      }
    });

    */

    //Utilities to allow other modules to query this state
    return {
        isTapActive: function() {
            return (mode !== NO_MODE);
        }
    };

});
