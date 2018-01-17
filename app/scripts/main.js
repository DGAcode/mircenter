(function ($) { // Begin jQuery
  $(function () { // DOM ready
    // If a link has a dropdown, add sub menu toggle.
    $('nav ul li a:not(:only-child)').click(function (e) {
      $(this).siblings('.nav-dropdown').toggle();
      // Close one dropdown when selecting another
      $('.nav-dropdown').not($(this).siblings()).hide();
      e.stopPropagation();
    });
    // Clicking away from dropdown will remove the dropdown class
    $('html').click(function () {
      $('.nav-dropdown').hide();
    });
    // Toggle open and close nav styles on click
    $('#nav-toggle').click(function () {
      $('nav ul').slideToggle();
    });
    // Hamburger to X toggle
    $('#nav-toggle').on('click', function () {
      this.classList.toggle('active');
    });
  }); // end DOM ready
})(jQuery); // end jQuery

// end navigation bar

// -- Smooth Scroll --
(function () {

  var defaultOptions = {
    // Scrolling Variables (tweakable)
    frameRate: 60, // [Hz] 60
    animationTime: 400, // [px] 400
    stepSize: 100, // [px] 100

    // Pulse (less tweakable)
    // ratio of 'tail' to 'acceleration'
    pulseAlgorithm: true, // true
    pulseScale: 8, // 8
    pulseNormalize: 1, // 1

    // Acceleration
    accelerationDelta: 200, // 200
    accelerationMax: 1, // 1

    // Keyboard Settings
    keyboardSupport: true, // true
    arrowScroll: 50, // [px] 50

    // Overscroll
    overscroll: false, // false
    overscrollThreshold: 150, // [px] 150
    overscrollSelector: 'body', // body

    // Other
    touchpadSupport: true, // true
    fixedBackground: true, // true
    excluded: '', // ''
  };

  // Other Variables
  var isExcluded = false;
  var isFrame = false;
  var direction = {
    x: 0,
    y: 0
  };
  var initDone = false;
  var root = document.documentElement;
  var activeElement;
  var overscrollElement;
  var deltaBuffer = [120, 120, 120];

  var key = {
    left: 37,
    up: 38,
    right: 39,
    down: 40,
    spacebar: 32,
    pageup: 33,
    pagedown: 34,
    end: 35,
    home: 36
  };


  /***********************************************
   * SETTINGS
   ***********************************************/

  var options = deepExtend(defaultOptions, window.SmoothScrollOptions || {});


  /***********************************************
   * INITIALIZE
   ***********************************************/

  /**
   * Tests if smooth scrolling is allowed. Shuts down everything if not.
   */
  function initTest() {
    var disableKeyboard = false;

    // disable keyboard support if anything above requested it
    if (disableKeyboard) {
      removeEvent('keydown', keydown);
    }

    if (options.keyboardSupport && !disableKeyboard) {
      addEvent('keydown', keydown);
    }
  }

  /**
   * Sets up scrolls array, determines if frames are involved.
   */
  function init() {
    if (!document.body) {
      return;
    }

    var body = document.body;
    var html = document.documentElement;
    var windowHeight = window.innerHeight;
    var scrollHeight = body.scrollHeight;

    // check compat mode for root element
    root = (document.compatMode.indexOf('CSS') >= 0) ? html : body;
    activeElement = body;

    initTest();
    initDone = true;

    // Checks if this script is running in a frame
    if (top !== self) {
      isFrame = true;

    } else if (scrollHeight > windowHeight &&
      (body.offsetHeight <= windowHeight ||
        html.offsetHeight <= windowHeight)) {
      /**
       * This fixes a bug where the areas left and right to
       * the content does not trigger the onmousewheel event
       * on some pages. e.g.: html, body { height: 100% }
       */

      // DOMChange (throttle): fix height
      var pending = false;
      var refresh = function () {
        if (!pending && html.scrollHeight !== document.height) {
          pending = true; // add a new pending action
          setTimeout(function () {
            html.style.height = document.height + 'px';
            pending = false;
          }, 500); // act rarely to stay fast
        }
      };
      html.style.height = 'auto';
      setTimeout(refresh, 10);

      // clearfix
      if (root.offsetHeight <= windowHeight) {
        var underlay = document.createElement('div');
        underlay.style.clear = 'both';
        body.appendChild(underlay);
      }
    }

    // disable fixed background
    if (!options.fixedBackground && !isExcluded) {
      body.style.backgroundAttachment = 'scroll';
      html.style.backgroundAttachment = 'scroll';
    }

    // observe changes and update document min-height
    if (options.overscroll) {
      var observer = new MutationObserver(function (mutations) {
        resetOverscroll();
      });

      observer.observe(document.body, {
        childList: true,
        subtree: true
      });

      resetOverscroll();
    }
  }


  /************************************************
   * SCROLLING
   ************************************************/

  var que = [];
  var pending = false;
  var lastScroll = +new Date();
  var overscrolled = false;
  var overscrollMax = 0;

  /**
   * Pushes scroll actions to the scrolling queue.
   */
  function scrollArray(elem, left, top, touchpad, delay) {
    touchpad = touchpad || false;
    delay = delay || 1000;
    directionCheck(left, top);

    var accelerationMax = touchpad ? options.accelerationMax / 2 : options.accelerationMax;
    var accelerationDelta = options.accelerationDelta;

    if (accelerationMax !== 1) {
      var now = +new Date();
      var elapsed = now - lastScroll;
      if (elapsed < accelerationDelta) {
        var factor = (1 + (30 / elapsed)) / 2;
        if (factor > 1) {
          factor = Math.min(factor, accelerationMax);
          left *= factor;
          top *= factor;
        }
      }
      lastScroll = +new Date();
    }

    // push a scroll command
    que.push({
      x: left,
      y: top,
      lastX: (left < 0) ? 0.99 : -0.99,
      lastY: (top < 0) ? 0.99 : -0.99,
      start: +new Date()
    });

    // don't act if there's a pending queue
    if (pending) {
      return;
    }

    var scrollWindow = (elem === document.body);

    var step = function (time) {
      var now = +new Date();
      var scrollX = 0;
      var scrollY = 0;
      var animationTime = options.animationTime;

      for (var i = 0; i < que.length; i++) {

        var item = que[i];
        var elapsed = now - item.start;
        var finished = elapsed >= animationTime;

        // scroll position: [0, 1]
        var position = finished ? 1 : elapsed / animationTime;

        // easing [optional]
        if (options.pulseAlgorithm) {
          position = pulse(position, touchpad);
        }

        // only need the difference
        var x = (item.x * position - item.lastX) >> 0;
        var y = (item.y * position - item.lastY) >> 0;

        // add this to the total scrolling
        scrollX += x;
        scrollY += y;

        // update last values
        item.lastX += x;
        item.lastY += y;

        // delete and step back if it's over
        if (finished) {
          que.splice(i, 1);
          i--;
        }
      }

      // scroll left and top
      if (scrollWindow) {
        var overscrollDisabled = !!(overscrollElement && overscrollElement.getAttribute('overscroll') && JSON.parse(overscrollElement.getAttribute('overscroll')) === false);

        if (options.overscroll && !overscrollDisabled) {

          var translateY = 0;

          // translate if scroll is top/bottom of window
          if ((window.scrollY === 0 && scrollY <= 0) || (window.scrollY === overscrollElement.scrollHeight - window.innerHeight && scrollY >= 0)) {
            translateY = -scrollY;

          } else {
            window.scrollBy(scrollX, scrollY);
          }

          // reset overscrolled after snap back
          if (translateY === 0) {
            overscrolled = false;
            overscrollMax = 0;
          }

          // dispatch overscroll event if over threshold
          if (Math.abs(translateY) > options.overscrollThreshold && !overscrolled) {
            overscrolled = true;

            var event = new CustomEvent('overscroll', {
              detail: {
                direction: scrollY < 0 ? 'top' : 'bottom'
              }
            });

            window.dispatchEvent(event);
          }

          if (Math.abs(translateY) > overscrollMax) {
            overscrollMax = Math.abs(translateY);
          }

          // if (!overscrolled || Math.abs(translateY) >= overscrollMax) {
          overscrollElement.style.transform = 'translate(0, ' + translateY + 'px)';
          // }

        } else {
          window.scrollBy(scrollX, scrollY);
        }

      } else {
        if (scrollX) {
          elem.scrollLeft += scrollX;
        }
        if (scrollY) {
          elem.scrollTop += scrollY;
        }
      }

      // clean up if there's nothing left to do
      if (!left && !top) {
        que = [];
      }

      if (que.length) {
        requestFrame(step, elem, (delay / options.frameRate + 1));
      } else {
        pending = false;
      }
    };

    // start a new queue of actions
    requestFrame(step, elem, 0);

    pending = true;
  }


  /***********************************************
   * EVENTS
   ***********************************************/

  /**
   * Resize handler
   * @param {Object} event
   */
  function resize(event) {
    if (options.overscroll) {
      resetOverscroll();
    }
  }

  /**
   * Mouse wheel handler.
   * @param {Object} event
   */
  function wheel(event) {
    if (!initDone) {
      init();
    }

    var target = event.target;
    var overflowing = overflowingAncestor(target);
    var preventOverscroll = !options.overscroll && event.defaultPrevented;

    // use default if there's no overflowing
    // element or default action is prevented
    if (!overflowing || preventOverscroll ||
      isNodeName(activeElement, 'embed') ||
      (isNodeName(target, 'embed') && /\.pdf/i.test(target.src))) {
      return true;
    }

    var deltaX = event.wheelDeltaX || 0;
    var deltaY = event.wheelDeltaY || 0;

    // use wheelDelta if deltaX/Y is not available
    if (!deltaX && !deltaY) {
      deltaY = event.wheelDelta || 0;
    }

    var touchpad = isTouchpad(deltaY);

    // check if it's a touchpad scroll that should be ignored
    if (!options.touchpadSupport && touchpad) {
      return true;
    }

    // scale by step size
    // delta is 120 most of the time
    // synaptics seems to send 1 sometimes
    if (Math.abs(deltaX) > 1.2) {
      deltaX *= options.stepSize / 120;
    }

    if (Math.abs(deltaY) > 1.2) {
      deltaY *= options.stepSize / 120;
    }

    scrollArray(overflowing, -deltaX, -deltaY, touchpad);

    event.preventDefault();
  }

  /**
   * Keydown event handler.
   * @param {Object} event
   */
  function keydown(event) {
    var target = event.target;
    var modifier = event.ctrlKey || event.altKey || event.metaKey ||
      (event.shiftKey && event.keyCode !== key.spacebar);

    // do nothing if user is editing text
    // or using a modifier key (except shift)
    // or in a dropdown
    if (/input|textarea|select|embed/i.test(target.nodeName) ||
      target.isContentEditable ||
      event.defaultPrevented ||
      modifier) {
      return true;
    }

    // spacebar should trigger button press
    if (isNodeName(target, 'button') &&
      event.keyCode === key.spacebar) {
      return true;
    }

    var shift, x = 0,
      y = 0;
    var elem = overflowingAncestor(activeElement);
    var clientHeight = elem.clientHeight;

    if (elem === document.body) {
      clientHeight = window.innerHeight;
    }

    switch (event.keyCode) {
      case key.up:
        y = -options.arrowScroll;
        break;
      case key.down:
        y = options.arrowScroll;
        break;
      case key.spacebar: // (+ shift)
        shift = event.shiftKey ? 1 : -1;
        y = -shift * clientHeight * 0.9;
        break;
      case key.pageup:
        y = -clientHeight * 0.9;
        break;
      case key.pagedown:
        y = clientHeight * 0.9;
        break;
      case key.home:
        y = -elem.scrollTop;
        break;
      case key.end:
        var damt = elem.scrollHeight - elem.scrollTop - clientHeight;
        y = (damt > 0) ? damt + 10 : 0;
        break;
      case key.left:
        x = -options.arrowScroll;
        break;
      case key.right:
        x = options.arrowScroll;
        break;
      default:
        return true; // a key we don't care about
    }

    scrollArray(elem, x, y);

    event.preventDefault();
  }

  /**
   * Mousedown event only for updating activeElement
   */
  function mousedown(event) {
    activeElement = event.target;
  }


  /***********************************************
   * OVERFLOW
   ***********************************************/

  var cache = {}; // cleared out every once in while
  setInterval(function () {
    cache = {};
  }, 10 * 1000);

  var uniqueID = (function () {
    var i = 0;
    return function (el) {
      return el.uniqueID || (el.uniqueID = i++);
    };
  })();

  function setCache(elems, overflowing) {
    for (var i = elems.length; i--;) {
      cache[uniqueID(elems[i])] = overflowing;
    }
    return overflowing;
  }

  function overflowingAncestor(el) {
    var elems = [];
    var rootScrollHeight = root.scrollHeight;
    do {
      var cached = cache[uniqueID(el)];
      if (cached) {
        return setCache(elems, cached);
      }
      elems.push(el);
      if (rootScrollHeight === el.scrollHeight) {
        if (!isFrame || root.clientHeight + 10 < rootScrollHeight) {
          return setCache(elems, document.body); // scrolling root in WebKit
        }
      } else if (el.clientHeight + 10 < el.scrollHeight) {
        overflow = getComputedStyle(el, '').getPropertyValue('overflow-y');
        if (overflow === 'scroll' || overflow === 'auto') {
          return setCache(elems, el);
        }
      }
    } while (el = el.parentNode);
  }


  /***********************************************
   * HELPERS
   ***********************************************/

  function addEvent(type, fn, bubble) {
    window.addEventListener(type, fn, (bubble || false));
  }

  function removeEvent(type, fn, bubble) {
    window.removeEventListener(type, fn, (bubble || false));
  }

  function isNodeName(el, tag) {
    return (el.nodeName || '').toLowerCase() === tag.toLowerCase();
  }

  function directionCheck(x, y) {
    x = (x > 0) ? 1 : -1;
    y = (y > 0) ? 1 : -1;
    if (direction.x !== x || direction.y !== y) {
      direction.x = x;
      direction.y = y;
      que = [];
      lastScroll = 0;
    }
  }

  var deltaBufferTimer;

  function isTouchpad(deltaY) {
    if (!deltaY) {
      return;
    }
    deltaY = Math.abs(deltaY);
    deltaBuffer.push(deltaY);
    deltaBuffer.shift();
    clearTimeout(deltaBufferTimer);
    var allDivisable = (isDivisible(deltaBuffer[0], 120) &&
      isDivisible(deltaBuffer[1], 120) &&
      isDivisible(deltaBuffer[2], 120));
    return !allDivisable;
  }

  function isDivisible(n, divisor) {
    return (Math.floor(n / divisor) === n / divisor);
  }

  var requestFrame = (function () {
    return window.requestAnimationFrame ||
      window.webkitRequestAnimationFrame ||
      function (callback, element, delay) {
        window.setTimeout(callback, delay || (1000 / 60));
      };
  })();

  function resetOverscroll() {
    overscrollElement = document.querySelector(options.overscrollSelector);
    overscrollElement.style.transition = 'transform 100ms';
    overscrollElement.style.minHeight = '100%';
  }

  function debounce(fn, delay) {
    var timer = null;
    return function () {
      var context = this,
        args = arguments;
      clearTimeout(timer);
      timer = setTimeout(function () {
        fn.apply(context, args);
      }, delay);
    };
  }

  function deepExtend(destination, source) {
    for (var property in source) {
      if (source[property] && source[property].constructor &&
        source[property].constructor === Object) {
        destination[property] = destination[property] || {};
        arguments.callee(destination[property], source[property]);
      } else {
        destination[property] = source[property];
      }
    }
    return destination;
  }

  function normaliseDelta(eventDetail, wheelDeltaY) {
    var d = eventDetail,
      w = wheelDeltaY,
      n = 225,
      n1 = n - 1;

    // Normalize delta
    d = d ? w && (f = w / d) ? d / f : -d / 1.35 : w / 120;

    // Quadratic scale if |d| > 1
    d = d < 1 ? d < -1 ? (-Math.pow(d, 2) - n1) / n : d : (Math.pow(d, 2) + n1) / n;

    // Delta *should* not be greater than 2...
    return (Math.min(Math.max(d / 2, -1), 1)) * 2;
  }


  /***********************************************
   * PULSE
   ***********************************************/

  /**
   * Viscous fluid with a pulse for part and decay for the rest.
   * - Applies a fixed force over an interval (a damped acceleration), and
   * - Lets the exponential bleed away the velocity over a longer interval
   * - Michael Herf, http://stereopsis.com/stopping/
   */
  function _pulse(x, touchpad) {
    var val, start, expx;

    // test
    x = x * options.pulseScale;

    if (x < 1) { // acceleartion
      val = x - (1 - Math.exp(-x));

    } else { // tail
      // the previous animation ended here:
      start = Math.exp(-1);

      // simple viscous drag
      x -= 1;
      expx = 1 - Math.exp(-x);
      val = start + (expx * (1 - start));
    }

    return val * options.pulseNormalize;
  }

  function pulse(x, touchpad) {
    if (x >= 1) {
      return 1;
    }

    if (x <= 0) {
      return 0;
    }

    if (options.pulseNormalize === 1) {
      options.pulseNormalize /= _pulse(1, touchpad);
    }

    return _pulse(x);
  }

  var isChrome = /chrome/i.test(window.navigator.userAgent);
  var wheelEvent = null;
  if ('onwheel' in document.createElement('div')) {
    wheelEvent = 'wheel';
  } else if ('onmousewheel' in document.createElement('div')) {
    wheelEvent = 'mousewheel';
  }

  if (wheelEvent && isChrome) {
    addEvent(wheelEvent, wheel);
    addEvent('mousedown', mousedown);
    addEvent('load', init);
  }

  if (options.overscroll) {
    addEvent('resize', resize);
    addEvent('orientationchange', resize);
  }

})();

// -- end smooth scrolling --

// -- slideshow --
(function ($, window, i) {
  $.fn.responsiveSlides = function (options) {

    // Default settings
    var settings = $.extend({
      'auto': true, // Boolean: Animate automatically, true or false
      'speed': 500, // Integer: Speed of the transition, in milliseconds
      'timeout': 4000, // Integer: Time between slide transitions, in milliseconds
      'pager': false, // Boolean: Show pager, true or false
      'nav': false, // Boolean: Show navigation, true or false
      'random': false, // Boolean: Randomize the order of the slides, true or false
      'pause': false, // Boolean: Pause on hover, true or false
      'pauseControls': true, // Boolean: Pause when hovering controls, true or false
      'prevText': 'Previous', // String: Text for the "previous" button
      'nextText': 'Next', // String: Text for the "next" button
      'maxwidth': '', // Integer: Max-width of the slideshow, in pixels
      'navContainer': '', // Selector: Where auto generated controls should be appended to, default is after the <ul>
      'manualControls': '', // Selector: Declare custom pager navigation
      'namespace': 'rslides', // String: change the default namespace used
      'before': $.noop, // Function: Before callback
      'after': $.noop // Function: After callback
    }, options);

    return this.each(function () {

      // Index for namespacing
      i++;

      var $this = $(this),

        // Local variables
        vendor,
        selectTab,
        startCycle,
        restartCycle,
        rotate,
        $tabs,

        // Helpers
        index = 0,
        $slide = $this.children(),
        length = $slide.length,
        fadeTime = parseFloat(settings.speed),
        waitTime = parseFloat(settings.timeout),
        maxw = parseFloat(settings.maxwidth),

        // Namespacing
        namespace = settings.namespace,
        namespaceIdx = namespace + i,

        // Classes
        navClass = namespace + '_nav ' + namespaceIdx + '_nav',
        activeClass = namespace + '_here',
        visibleClass = namespaceIdx + '_on',
        slideClassPrefix = namespaceIdx + '_s',

        // Pager
        $pager = $('<ul class=\'' + namespace + '_tabs ' + namespaceIdx + '_tabs\' />'),

        // Styles for visible and hidden slides
        visible = {
          'float': 'left',
          'position': 'relative',
          'opacity': 1,
          'zIndex': 2
        },
        hidden = {
          'float': 'none',
          'position': 'absolute',
          'opacity': 0,
          'zIndex': 1
        },

        // Detect transition support
        supportsTransitions = (function () {
          var docBody = document.body || document.documentElement;
          var styles = docBody.style;
          var prop = 'transition';
          if (typeof styles[prop] === 'string') {
            return true;
          }
          // Tests for vendor specific prop
          vendor = ['Moz', 'Webkit', 'Khtml', 'O', 'ms'];
          prop = prop.charAt(0).toUpperCase() + prop.substr(1);
          var i;
          for (i = 0; i < vendor.length; i++) {
            if (typeof styles[vendor[i] + prop] === 'string') {
              return true;
            }
          }
          return false;
        })(),

        // Fading animation
        slideTo = function (idx) {
          settings.before(idx);
          // If CSS3 transitions are supported
          if (supportsTransitions) {
            $slide
              .removeClass(visibleClass)
              .css(hidden)
              .eq(idx)
              .addClass(visibleClass)
              .css(visible);
            index = idx;
            setTimeout(function () {
              settings.after(idx);
            }, fadeTime);
            // If not, use jQuery fallback
          } else {
            $slide
              .stop()
              .fadeOut(fadeTime, function () {
                $(this)
                  .removeClass(visibleClass)
                  .css(hidden)
                  .css('opacity', 1);
              })
              .eq(idx)
              .fadeIn(fadeTime, function () {
                $(this)
                  .addClass(visibleClass)
                  .css(visible);
                settings.after(idx);
                index = idx;
              });
          }
        };

      // Random order
      if (settings.random) {
        $slide.sort(function () {
          return (Math.round(Math.random()) - 0.5);
        });
        $this
          .empty()
          .append($slide);
      }

      // Add ID's to each slide
      $slide.each(function (i) {
        this.id = slideClassPrefix + i;
      });

      // Add max-width and classes
      $this.addClass(namespace + ' ' + namespaceIdx);
      if (options && options.maxwidth) {
        $this.css('max-width', maxw);
      }

      // Hide all slides, then show first one
      $slide
        .hide()
        .css(hidden)
        .eq(0)
        .addClass(visibleClass)
        .css(visible)
        .show();

      // CSS transitions
      if (supportsTransitions) {
        $slide
          .show()
          .css({
            // -ms prefix isn't needed as IE10 uses prefix free version
            '-webkit-transition': 'opacity ' + fadeTime + 'ms ease-in-out',
            '-moz-transition': 'opacity ' + fadeTime + 'ms ease-in-out',
            '-o-transition': 'opacity ' + fadeTime + 'ms ease-in-out',
            'transition': 'opacity ' + fadeTime + 'ms ease-in-out'
          });
      }

      // Only run if there's more than one slide
      if ($slide.length > 1) {

        // Make sure the timeout is at least 100ms longer than the fade
        if (waitTime < fadeTime + 100) {
          return;
        }

        // Pager
        if (settings.pager && !settings.manualControls) {
          var tabMarkup = [];
          $slide.each(function (i) {
            var n = i + 1;
            tabMarkup +=
              '<li>' +
              '<a href=\'#\' class=\'' + slideClassPrefix + n + '\'>' + n + '</a>' +
              '</li>';
          });
          $pager.append(tabMarkup);

          // Inject pager
          if (options.navContainer) {
            $(settings.navContainer).append($pager);
          } else {
            $this.after($pager);
          }
        }

        // Manual pager controls
        if (settings.manualControls) {
          $pager = $(settings.manualControls);
          $pager.addClass(namespace + '_tabs ' + namespaceIdx + '_tabs');
        }

        // Add pager slide class prefixes
        if (settings.pager || settings.manualControls) {
          $pager.find('li').each(function (i) {
            $(this).addClass(slideClassPrefix + (i + 1));
          });
        }

        // If we have a pager, we need to set up the selectTab function
        if (settings.pager || settings.manualControls) {
          $tabs = $pager.find('a');

          // Select pager item
          selectTab = function (idx) {
            $tabs
              .closest('li')
              .removeClass(activeClass)
              .eq(idx)
              .addClass(activeClass);
          };
        }

        // Auto cycle
        if (settings.auto) {

          startCycle = function () {
            rotate = setInterval(function () {

              // Clear the event queue
              $slide.stop(true, true);

              var idx = index + 1 < length ? index + 1 : 0;

              // Remove active state and set new if pager is set
              if (settings.pager || settings.manualControls) {
                selectTab(idx);
              }

              slideTo(idx);
            }, waitTime);
          };

          // Init cycle
          startCycle();
        }

        // Restarting cycle
        restartCycle = function () {
          if (settings.auto) {
            // Stop
            clearInterval(rotate);
            // Restart
            startCycle();
          }
        };

        // Pause on hover
        if (settings.pause) {
          $this.hover(function () {
            clearInterval(rotate);
          }, function () {
            restartCycle();
          });
        }

        // Pager click event handler
        if (settings.pager || settings.manualControls) {
          $tabs.bind('click', function (e) {
              e.preventDefault();

              if (!settings.pauseControls) {
                restartCycle();
              }

              // Get index of clicked tab
              var idx = $tabs.index(this);

              // Break if element is already active or currently animated
              if (index === idx || $('.' + visibleClass).queue('fx').length) {
                return;
              }

              // Remove active state from old tab and set new one
              selectTab(idx);

              // Do the animation
              slideTo(idx);
            })
            .eq(0)
            .closest('li')
            .addClass(activeClass);

          // Pause when hovering pager
          if (settings.pauseControls) {
            $tabs.hover(function () {
              clearInterval(rotate);
            }, function () {
              restartCycle();
            });
          }
        }

        // Navigation
        if (settings.nav) {
          var navMarkup =
            '<a href=\'#\' class=\'' + navClass + ' prev\'>' + settings.prevText + '</a>' +
            '<a href=\'#\' class=\'' + navClass + ' next\'>' + settings.nextText + '</a>';

          // Inject navigation
          if (options.navContainer) {
            $(settings.navContainer).append(navMarkup);
          } else {
            $this.after(navMarkup);
          }

          var $trigger = $('.' + namespaceIdx + '_nav'),
            $prev = $trigger.filter('.prev');

          // Click event handler
          $trigger.bind('click', function (e) {
            e.preventDefault();

            var $visibleClass = $('.' + visibleClass);

            // Prevent clicking if currently animated
            if ($visibleClass.queue('fx').length) {
              return;
            }

            //  Adds active class during slide animation
            //  $(this)
            //    .addClass(namespace + "_active")
            //    .delay(fadeTime)
            //    .queue(function (next) {
            //      $(this).removeClass(namespace + "_active");
            //      next();
            //  });

            // Determine where to slide
            var idx = $slide.index($visibleClass),
              prevIdx = idx - 1,
              nextIdx = idx + 1 < length ? index + 1 : 0;

            // Go to slide
            slideTo($(this)[0] === $prev[0] ? prevIdx : nextIdx);
            if (settings.pager || settings.manualControls) {
              selectTab($(this)[0] === $prev[0] ? prevIdx : nextIdx);
            }

            if (!settings.pauseControls) {
              restartCycle();
            }
          });

          // Pause when hovering navigation
          if (settings.pauseControls) {
            $trigger.hover(function () {
              clearInterval(rotate);
            }, function () {
              restartCycle();
            });
          }
        }

      }

      // Max-width fallback
      if (typeof document.body.style.maxWidth === 'undefined' && options.maxwidth) {
        var widthSupport = function () {
          $this.css('width', '100%');
          if ($this.width() > maxw) {
            $this.css('width', maxw);
          }
        };

        // Init fallback
        widthSupport();
        $(window).bind('resize', function () {
          widthSupport();
        });
      }

    });

  };
})(jQuery, this, 0);

$(function () {

  $('#slider1').responsiveSlides({
    maxwidth: 5000,
    speed: 800
  });

});

// -- end slideshow -- https://github.com/viljamis/ResponsiveSlides.js
