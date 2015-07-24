/* ========================================================================
 * Bootstrap: tooltip.js v3.3.5
 * http://getbootstrap.com/javascript/#tooltip
 * Inspired by the original jQuery.tipsy by Jason Frame
 * ========================================================================
 * Copyright 2011-2015 Twitter, Inc.
 * Licensed under MIT (https://github.com/twbs/bootstrap/blob/master/LICENSE)
 * ======================================================================== */


+function ($) {
  'use strict';

  // TOOLTIP PUBLIC CLASS DEFINITION
  // ===============================

  var Tooltip = function (element, options) {
    this.type       = null
    this.options    = null
    this.enabled    = null
    this.timeout    = null
    this.hoverState = null
    this.$element   = null
    this.inState    = null

    this.init('tooltip', element, options)
  }

  Tooltip.VERSION  = '3.3.5'

  Tooltip.TRANSITION_DURATION = 150

  Tooltip.DEFAULTS = {
    animation: true,
    placement: 'top',
    selector: false,
    template: '<div class="tooltip" role="tooltip"><div class="tooltip-arrow"></div><div class="tooltip-inner"></div></div>',
    trigger: 'hover focus',
    title: '',
    delay: 0,
    html: false,
    container: false,
    viewport: {
      selector: 'body',
      padding: 0
    }
  }

  Tooltip.prototype.init = function (type, element, options) {
    this.enabled   = true
    this.type      = type
    this.$element  = $(element)
    this.options   = this.getOptions(options)
    this.$viewport = this.options.viewport && $($.isFunction(this.options.viewport) ? this.options.viewport.call(this, this.$element) : (this.options.viewport.selector || this.options.viewport))
    this.inState   = { click: false, hover: false, focus: false }

    if (this.$element[0] instanceof document.constructor && !this.options.selector) {
      throw new Error('`selector` option must be specified when initializing ' + this.type + ' on the window.document object!')
    }

    var triggers = this.options.trigger.split(' ')

    for (var i = triggers.length; i--;) {
      var trigger = triggers[i]

      if (trigger == 'click') {
        this.$element.on('click.' + this.type, this.options.selector, $.proxy(this.toggle, this))
      } else if (trigger != 'manual') {
        var eventIn  = trigger == 'hover' ? 'mouseenter' : 'focusin'
        var eventOut = trigger == 'hover' ? 'mouseleave' : 'focusout'

        this.$element.on(eventIn  + '.' + this.type, this.options.selector, $.proxy(this.enter, this))
        this.$element.on(eventOut + '.' + this.type, this.options.selector, $.proxy(this.leave, this))
      }
    }

    this.options.selector ?
      (this._options = $.extend({}, this.options, { trigger: 'manual', selector: '' })) :
      this.fixTitle()
  }

  Tooltip.prototype.getDefaults = function () {
    return Tooltip.DEFAULTS
  }

  Tooltip.prototype.getOptions = function (options) {
    options = $.extend({}, this.getDefaults(), this.$element.data(), options)

    if (options.delay && typeof options.delay == 'number') {
      options.delay = {
        show: options.delay,
        hide: options.delay
      }
    }

    return options
  }

  Tooltip.prototype.getDelegateOptions = function () {
    var options  = {}
    var defaults = this.getDefaults()

    this._options && $.each(this._options, function (key, value) {
      if (defaults[key] != value) options[key] = value
    })

    return options
  }

  Tooltip.prototype.enter = function (obj) {
    var self = obj instanceof this.constructor ?
      obj : $(obj.currentTarget).data('bs.' + this.type)

    if (!self) {
      self = new this.constructor(obj.currentTarget, this.getDelegateOptions())
      $(obj.currentTarget).data('bs.' + this.type, self)
    }

    if (obj instanceof $.Event) {
      self.inState[obj.type == 'focusin' ? 'focus' : 'hover'] = true
    }

    if (self.tip().hasClass('in') || self.hoverState == 'in') {
      self.hoverState = 'in'
      return
    }

    clearTimeout(self.timeout)

    self.hoverState = 'in'

    if (!self.options.delay || !self.options.delay.show) return self.show()

    self.timeout = setTimeout(function () {
      if (self.hoverState == 'in') self.show()
    }, self.options.delay.show)
  }

  Tooltip.prototype.isInStateTrue = function () {
    for (var key in this.inState) {
      if (this.inState[key]) return true
    }

    return false
  }

  Tooltip.prototype.leave = function (obj) {
    var self = obj instanceof this.constructor ?
      obj : $(obj.currentTarget).data('bs.' + this.type)

    if (!self) {
      self = new this.constructor(obj.currentTarget, this.getDelegateOptions())
      $(obj.currentTarget).data('bs.' + this.type, self)
    }

    if (obj instanceof $.Event) {
      self.inState[obj.type == 'focusout' ? 'focus' : 'hover'] = false
    }

    if (self.isInStateTrue()) return

    clearTimeout(self.timeout)

    self.hoverState = 'out'

    if (!self.options.delay || !self.options.delay.hide) return self.hide()

    self.timeout = setTimeout(function () {
      if (self.hoverState == 'out') self.hide()
    }, self.options.delay.hide)
  }

  Tooltip.prototype.show = function () {
    var e = $.Event('show.bs.' + this.type)

    if (this.hasContent() && this.enabled) {
      this.$element.trigger(e)

      var inDom = $.contains(this.$element[0].ownerDocument.documentElement, this.$element[0])
      if (e.isDefaultPrevented() || !inDom) return
      var that = this

      var $tip = this.tip()

      var tipId = this.getUID(this.type)

      this.setContent()
      $tip.attr('id', tipId)
      this.$element.attr('aria-describedby', tipId)

      if (this.options.animation) $tip.addClass('fade')

      var placement = typeof this.options.placement == 'function' ?
        this.options.placement.call(this, $tip[0], this.$element[0]) :
        this.options.placement

      var autoToken = /\s?auto?\s?/i
      var autoPlace = autoToken.test(placement)
      if (autoPlace) placement = placement.replace(autoToken, '') || 'top'

      $tip
        .detach()
        .css({ top: 0, left: 0, display: 'block' })
        .addClass(placement)
        .data('bs.' + this.type, this)

      this.options.container ? $tip.appendTo(this.options.container) : $tip.insertAfter(this.$element)
      this.$element.trigger('inserted.bs.' + this.type)

      var pos          = this.getPosition()
      var actualWidth  = $tip[0].offsetWidth
      var actualHeight = $tip[0].offsetHeight

      if (autoPlace) {
        var orgPlacement = placement
        var viewportDim = this.getPosition(this.$viewport)

        placement = placement == 'bottom' && pos.bottom + actualHeight > viewportDim.bottom ? 'top'    :
                    placement == 'top'    && pos.top    - actualHeight < viewportDim.top    ? 'bottom' :
                    placement == 'right'  && pos.right  + actualWidth  > viewportDim.width  ? 'left'   :
                    placement == 'left'   && pos.left   - actualWidth  < viewportDim.left   ? 'right'  :
                    placement

        $tip
          .removeClass(orgPlacement)
          .addClass(placement)
      }

      var calculatedOffset = this.getCalculatedOffset(placement, pos, actualWidth, actualHeight)

      this.applyPlacement(calculatedOffset, placement)

      var complete = function () {
        var prevHoverState = that.hoverState
        that.$element.trigger('shown.bs.' + that.type)
        that.hoverState = null

        if (prevHoverState == 'out') that.leave(that)
      }

      $.support.transition && this.$tip.hasClass('fade') ?
        $tip
          .one('bsTransitionEnd', complete)
          .emulateTransitionEnd(Tooltip.TRANSITION_DURATION) :
        complete()
    }
  }

  Tooltip.prototype.applyPlacement = function (offset, placement) {
    var $tip   = this.tip()
    var width  = $tip[0].offsetWidth
    var height = $tip[0].offsetHeight

    // manually read margins because getBoundingClientRect includes difference
    var marginTop = parseInt($tip.css('margin-top'), 10)
    var marginLeft = parseInt($tip.css('margin-left'), 10)

    // we must check for NaN for ie 8/9
    if (isNaN(marginTop))  marginTop  = 0
    if (isNaN(marginLeft)) marginLeft = 0

    offset.top  += marginTop
    offset.left += marginLeft

    // $.fn.offset doesn't round pixel values
    // so we use setOffset directly with our own function B-0
    $.offset.setOffset($tip[0], $.extend({
      using: function (props) {
        $tip.css({
          top: Math.round(props.top),
          left: Math.round(props.left)
        })
      }
    }, offset), 0)

    $tip.addClass('in')

    // check to see if placing tip in new offset caused the tip to resize itself
    var actualWidth  = $tip[0].offsetWidth
    var actualHeight = $tip[0].offsetHeight

    if (placement == 'top' && actualHeight != height) {
      offset.top = offset.top + height - actualHeight
    }

    var delta = this.getViewportAdjustedDelta(placement, offset, actualWidth, actualHeight)

    if (delta.left) offset.left += delta.left
    else offset.top += delta.top

    var isVertical          = /top|bottom/.test(placement)
    var arrowDelta          = isVertical ? delta.left * 2 - width + actualWidth : delta.top * 2 - height + actualHeight
    var arrowOffsetPosition = isVertical ? 'offsetWidth' : 'offsetHeight'

    $tip.offset(offset)
    this.replaceArrow(arrowDelta, $tip[0][arrowOffsetPosition], isVertical)
  }

  Tooltip.prototype.replaceArrow = function (delta, dimension, isVertical) {
    this.arrow()
      .css(isVertical ? 'left' : 'top', 50 * (1 - delta / dimension) + '%')
      .css(isVertical ? 'top' : 'left', '')
  }

  Tooltip.prototype.setContent = function () {
    var $tip  = this.tip()
    var title = this.getTitle()

    $tip.find('.tooltip-inner')[this.options.html ? 'html' : 'text'](title)
    $tip.removeClass('fade in top bottom left right')
  }

  Tooltip.prototype.hide = function (callback) {
    var that = this
    var $tip = $(this.$tip)
    var e    = $.Event('hide.bs.' + this.type)

    function complete() {
      if (that.hoverState != 'in') $tip.detach()
      that.$element
        .removeAttr('aria-describedby')
        .trigger('hidden.bs.' + that.type)
      callback && callback()
    }

    this.$element.trigger(e)

    if (e.isDefaultPrevented()) return

    $tip.removeClass('in')

    $.support.transition && $tip.hasClass('fade') ?
      $tip
        .one('bsTransitionEnd', complete)
        .emulateTransitionEnd(Tooltip.TRANSITION_DURATION) :
      complete()

    this.hoverState = null

    return this
  }

  Tooltip.prototype.fixTitle = function () {
    var $e = this.$element
    if ($e.attr('title') || typeof $e.attr('data-original-title') != 'string') {
      $e.attr('data-original-title', $e.attr('title') || '').attr('title', '')
    }
  }

  Tooltip.prototype.hasContent = function () {
    return this.getTitle()
  }

  Tooltip.prototype.getPosition = function ($element) {
    $element   = $element || this.$element

    var el     = $element[0]
    var isBody = el.tagName == 'BODY'

    var elRect    = el.getBoundingClientRect()
    if (elRect.width == null) {
      // width and height are missing in IE8, so compute them manually; see https://github.com/twbs/bootstrap/issues/14093
      elRect = $.extend({}, elRect, { width: elRect.right - elRect.left, height: elRect.bottom - elRect.top })
    }
    var elOffset  = isBody ? { top: 0, left: 0 } : $element.offset()
    var scroll    = { scroll: isBody ? document.documentElement.scrollTop || document.body.scrollTop : $element.scrollTop() }
    var outerDims = isBody ? { width: $(window).width(), height: $(window).height() } : null

    return $.extend({}, elRect, scroll, outerDims, elOffset)
  }

  Tooltip.prototype.getCalculatedOffset = function (placement, pos, actualWidth, actualHeight) {
    return placement == 'bottom' ? { top: pos.top + pos.height,   left: pos.left + pos.width / 2 - actualWidth / 2 } :
           placement == 'top'    ? { top: pos.top - actualHeight, left: pos.left + pos.width / 2 - actualWidth / 2 } :
           placement == 'left'   ? { top: pos.top + pos.height / 2 - actualHeight / 2, left: pos.left - actualWidth } :
        /* placement == 'right' */ { top: pos.top + pos.height / 2 - actualHeight / 2, left: pos.left + pos.width }

  }

  Tooltip.prototype.getViewportAdjustedDelta = function (placement, pos, actualWidth, actualHeight) {
    var delta = { top: 0, left: 0 }
    if (!this.$viewport) return delta

    var viewportPadding = this.options.viewport && this.options.viewport.padding || 0
    var viewportDimensions = this.getPosition(this.$viewport)

    if (/right|left/.test(placement)) {
      var topEdgeOffset    = pos.top - viewportPadding - viewportDimensions.scroll
      var bottomEdgeOffset = pos.top + viewportPadding - viewportDimensions.scroll + actualHeight
      if (topEdgeOffset < viewportDimensions.top) { // top overflow
        delta.top = viewportDimensions.top - topEdgeOffset
      } else if (bottomEdgeOffset > viewportDimensions.top + viewportDimensions.height) { // bottom overflow
        delta.top = viewportDimensions.top + viewportDimensions.height - bottomEdgeOffset
      }
    } else {
      var leftEdgeOffset  = pos.left - viewportPadding
      var rightEdgeOffset = pos.left + viewportPadding + actualWidth
      if (leftEdgeOffset < viewportDimensions.left) { // left overflow
        delta.left = viewportDimensions.left - leftEdgeOffset
      } else if (rightEdgeOffset > viewportDimensions.right) { // right overflow
        delta.left = viewportDimensions.left + viewportDimensions.width - rightEdgeOffset
      }
    }

    return delta
  }

  Tooltip.prototype.getTitle = function () {
    var title
    var $e = this.$element
    var o  = this.options

    title = $e.attr('data-original-title')
      || (typeof o.title == 'function' ? o.title.call($e[0]) :  o.title)

    return title
  }

  Tooltip.prototype.getUID = function (prefix) {
    do prefix += ~~(Math.random() * 1000000)
    while (document.getElementById(prefix))
    return prefix
  }

  Tooltip.prototype.tip = function () {
    if (!this.$tip) {
      this.$tip = $(this.options.template)
      if (this.$tip.length != 1) {
        throw new Error(this.type + ' `template` option must consist of exactly 1 top-level element!')
      }
    }
    return this.$tip
  }

  Tooltip.prototype.arrow = function () {
    return (this.$arrow = this.$arrow || this.tip().find('.tooltip-arrow'))
  }

  Tooltip.prototype.enable = function () {
    this.enabled = true
  }

  Tooltip.prototype.disable = function () {
    this.enabled = false
  }

  Tooltip.prototype.toggleEnabled = function () {
    this.enabled = !this.enabled
  }

  Tooltip.prototype.toggle = function (e) {
    var self = this
    if (e) {
      self = $(e.currentTarget).data('bs.' + this.type)
      if (!self) {
        self = new this.constructor(e.currentTarget, this.getDelegateOptions())
        $(e.currentTarget).data('bs.' + this.type, self)
      }
    }

    if (e) {
      self.inState.click = !self.inState.click
      if (self.isInStateTrue()) self.enter(self)
      else self.leave(self)
    } else {
      self.tip().hasClass('in') ? self.leave(self) : self.enter(self)
    }
  }

  Tooltip.prototype.destroy = function () {
    var that = this
    clearTimeout(this.timeout)
    this.hide(function () {
      that.$element.off('.' + that.type).removeData('bs.' + that.type)
      if (that.$tip) {
        that.$tip.detach()
      }
      that.$tip = null
      that.$arrow = null
      that.$viewport = null
    })
  }


  // TOOLTIP PLUGIN DEFINITION
  // =========================

  function Plugin(option) {
    return this.each(function () {
      var $this   = $(this)
      var data    = $this.data('bs.tooltip')
      var options = typeof option == 'object' && option

      if (!data && /destroy|hide/.test(option)) return
      if (!data) $this.data('bs.tooltip', (data = new Tooltip(this, options)))
      if (typeof option == 'string') data[option]()
    })
  }

  var old = $.fn.tooltip

  $.fn.tooltip             = Plugin
  $.fn.tooltip.Constructor = Tooltip


  // TOOLTIP NO CONFLICT
  // ===================

  $.fn.tooltip.noConflict = function () {
    $.fn.tooltip = old
    return this
  }

}(jQuery);/*!
 * typeahead.js 0.11.1
 * https://github.com/twitter/typeahead.js
 * Copyright 2013-2015 Twitter, Inc. and other contributors; Licensed MIT
 */

(function(root, factory) {
    if (typeof define === "function" && define.amd) {
        define("bloodhound", [ "jquery" ], function(a0) {
            return root["Bloodhound"] = factory(a0);
        });
    } else if (typeof exports === "object") {
        module.exports = factory(require("jquery"));
    } else {
        root["Bloodhound"] = factory(jQuery);
    }
})(this, function($) {
    var _ = function() {
        "use strict";
        return {
            isMsie: function() {
                return /(msie|trident)/i.test(navigator.userAgent) ? navigator.userAgent.match(/(msie |rv:)(\d+(.\d+)?)/i)[2] : false;
            },
            isBlankString: function(str) {
                return !str || /^\s*$/.test(str);
            },
            escapeRegExChars: function(str) {
                return str.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&");
            },
            isString: function(obj) {
                return typeof obj === "string";
            },
            isNumber: function(obj) {
                return typeof obj === "number";
            },
            isArray: $.isArray,
            isFunction: $.isFunction,
            isObject: $.isPlainObject,
            isUndefined: function(obj) {
                return typeof obj === "undefined";
            },
            isElement: function(obj) {
                return !!(obj && obj.nodeType === 1);
            },
            isJQuery: function(obj) {
                return obj instanceof $;
            },
            toStr: function toStr(s) {
                return _.isUndefined(s) || s === null ? "" : s + "";
            },
            bind: $.proxy,
            each: function(collection, cb) {
                $.each(collection, reverseArgs);
                function reverseArgs(index, value) {
                    return cb(value, index);
                }
            },
            map: $.map,
            filter: $.grep,
            every: function(obj, test) {
                var result = true;
                if (!obj) {
                    return result;
                }
                $.each(obj, function(key, val) {
                    if (!(result = test.call(null, val, key, obj))) {
                        return false;
                    }
                });
                return !!result;
            },
            some: function(obj, test) {
                var result = false;
                if (!obj) {
                    return result;
                }
                $.each(obj, function(key, val) {
                    if (result = test.call(null, val, key, obj)) {
                        return false;
                    }
                });
                return !!result;
            },
            mixin: $.extend,
            identity: function(x) {
                return x;
            },
            clone: function(obj) {
                return $.extend(true, {}, obj);
            },
            getIdGenerator: function() {
                var counter = 0;
                return function() {
                    return counter++;
                };
            },
            templatify: function templatify(obj) {
                return $.isFunction(obj) ? obj : template;
                function template() {
                    return String(obj);
                }
            },
            defer: function(fn) {
                setTimeout(fn, 0);
            },
            debounce: function(func, wait, immediate) {
                var timeout, result;
                return function() {
                    var context = this, args = arguments, later, callNow;
                    later = function() {
                        timeout = null;
                        if (!immediate) {
                            result = func.apply(context, args);
                        }
                    };
                    callNow = immediate && !timeout;
                    clearTimeout(timeout);
                    timeout = setTimeout(later, wait);
                    if (callNow) {
                        result = func.apply(context, args);
                    }
                    return result;
                };
            },
            throttle: function(func, wait) {
                var context, args, timeout, result, previous, later;
                previous = 0;
                later = function() {
                    previous = new Date();
                    timeout = null;
                    result = func.apply(context, args);
                };
                return function() {
                    var now = new Date(), remaining = wait - (now - previous);
                    context = this;
                    args = arguments;
                    if (remaining <= 0) {
                        clearTimeout(timeout);
                        timeout = null;
                        previous = now;
                        result = func.apply(context, args);
                    } else if (!timeout) {
                        timeout = setTimeout(later, remaining);
                    }
                    return result;
                };
            },
            stringify: function(val) {
                return _.isString(val) ? val : JSON.stringify(val);
            },
            noop: function() {}
        };
    }();
    var VERSION = "0.11.1";
    var tokenizers = function() {
        "use strict";
        return {
            nonword: nonword,
            whitespace: whitespace,
            obj: {
                nonword: getObjTokenizer(nonword),
                whitespace: getObjTokenizer(whitespace)
            }
        };
        function whitespace(str) {
            str = _.toStr(str);
            return str ? str.split(/\s+/) : [];
        }
        function nonword(str) {
            str = _.toStr(str);
            return str ? str.split(/\W+/) : [];
        }
        function getObjTokenizer(tokenizer) {
            return function setKey(keys) {
                keys = _.isArray(keys) ? keys : [].slice.call(arguments, 0);
                return function tokenize(o) {
                    var tokens = [];
                    _.each(keys, function(k) {
                        tokens = tokens.concat(tokenizer(_.toStr(o[k])));
                    });
                    return tokens;
                };
            };
        }
    }();
    var LruCache = function() {
        "use strict";
        function LruCache(maxSize) {
            this.maxSize = _.isNumber(maxSize) ? maxSize : 100;
            this.reset();
            if (this.maxSize <= 0) {
                this.set = this.get = $.noop;
            }
        }
        _.mixin(LruCache.prototype, {
            set: function set(key, val) {
                var tailItem = this.list.tail, node;
                if (this.size >= this.maxSize) {
                    this.list.remove(tailItem);
                    delete this.hash[tailItem.key];
                    this.size--;
                }
                if (node = this.hash[key]) {
                    node.val = val;
                    this.list.moveToFront(node);
                } else {
                    node = new Node(key, val);
                    this.list.add(node);
                    this.hash[key] = node;
                    this.size++;
                }
            },
            get: function get(key) {
                var node = this.hash[key];
                if (node) {
                    this.list.moveToFront(node);
                    return node.val;
                }
            },
            reset: function reset() {
                this.size = 0;
                this.hash = {};
                this.list = new List();
            }
        });
        function List() {
            this.head = this.tail = null;
        }
        _.mixin(List.prototype, {
            add: function add(node) {
                if (this.head) {
                    node.next = this.head;
                    this.head.prev = node;
                }
                this.head = node;
                this.tail = this.tail || node;
            },
            remove: function remove(node) {
                node.prev ? node.prev.next = node.next : this.head = node.next;
                node.next ? node.next.prev = node.prev : this.tail = node.prev;
            },
            moveToFront: function(node) {
                this.remove(node);
                this.add(node);
            }
        });
        function Node(key, val) {
            this.key = key;
            this.val = val;
            this.prev = this.next = null;
        }
        return LruCache;
    }();
    var PersistentStorage = function() {
        "use strict";
        var LOCAL_STORAGE;
        try {
            LOCAL_STORAGE = window.localStorage;
            LOCAL_STORAGE.setItem("~~~", "!");
            LOCAL_STORAGE.removeItem("~~~");
        } catch (err) {
            LOCAL_STORAGE = null;
        }
        function PersistentStorage(namespace, override) {
            this.prefix = [ "__", namespace, "__" ].join("");
            this.ttlKey = "__ttl__";
            this.keyMatcher = new RegExp("^" + _.escapeRegExChars(this.prefix));
            this.ls = override || LOCAL_STORAGE;
            !this.ls && this._noop();
        }
        _.mixin(PersistentStorage.prototype, {
            _prefix: function(key) {
                return this.prefix + key;
            },
            _ttlKey: function(key) {
                return this._prefix(key) + this.ttlKey;
            },
            _noop: function() {
                this.get = this.set = this.remove = this.clear = this.isExpired = _.noop;
            },
            _safeSet: function(key, val) {
                try {
                    this.ls.setItem(key, val);
                } catch (err) {
                    if (err.name === "QuotaExceededError") {
                        this.clear();
                        this._noop();
                    }
                }
            },
            get: function(key) {
                if (this.isExpired(key)) {
                    this.remove(key);
                }
                return decode(this.ls.getItem(this._prefix(key)));
            },
            set: function(key, val, ttl) {
                if (_.isNumber(ttl)) {
                    this._safeSet(this._ttlKey(key), encode(now() + ttl));
                } else {
                    this.ls.removeItem(this._ttlKey(key));
                }
                return this._safeSet(this._prefix(key), encode(val));
            },
            remove: function(key) {
                this.ls.removeItem(this._ttlKey(key));
                this.ls.removeItem(this._prefix(key));
                return this;
            },
            clear: function() {
                var i, keys = gatherMatchingKeys(this.keyMatcher);
                for (i = keys.length; i--; ) {
                    this.remove(keys[i]);
                }
                return this;
            },
            isExpired: function(key) {
                var ttl = decode(this.ls.getItem(this._ttlKey(key)));
                return _.isNumber(ttl) && now() > ttl ? true : false;
            }
        });
        return PersistentStorage;
        function now() {
            return new Date().getTime();
        }
        function encode(val) {
            return JSON.stringify(_.isUndefined(val) ? null : val);
        }
        function decode(val) {
            return $.parseJSON(val);
        }
        function gatherMatchingKeys(keyMatcher) {
            var i, key, keys = [], len = LOCAL_STORAGE.length;
            for (i = 0; i < len; i++) {
                if ((key = LOCAL_STORAGE.key(i)).match(keyMatcher)) {
                    keys.push(key.replace(keyMatcher, ""));
                }
            }
            return keys;
        }
    }();
    var Transport = function() {
        "use strict";
        var pendingRequestsCount = 0, pendingRequests = {}, maxPendingRequests = 6, sharedCache = new LruCache(10);
        function Transport(o) {
            o = o || {};
            this.cancelled = false;
            this.lastReq = null;
            this._send = o.transport;
            this._get = o.limiter ? o.limiter(this._get) : this._get;
            this._cache = o.cache === false ? new LruCache(0) : sharedCache;
        }
        Transport.setMaxPendingRequests = function setMaxPendingRequests(num) {
            maxPendingRequests = num;
        };
        Transport.resetCache = function resetCache() {
            sharedCache.reset();
        };
        _.mixin(Transport.prototype, {
            _fingerprint: function fingerprint(o) {
                o = o || {};
                return o.url + o.type + $.param(o.data || {});
            },
            _get: function(o, cb) {
                var that = this, fingerprint, jqXhr;
                fingerprint = this._fingerprint(o);
                if (this.cancelled || fingerprint !== this.lastReq) {
                    return;
                }
                if (jqXhr = pendingRequests[fingerprint]) {
                    jqXhr.done(done).fail(fail);
                } else if (pendingRequestsCount < maxPendingRequests) {
                    pendingRequestsCount++;
                    pendingRequests[fingerprint] = this._send(o).done(done).fail(fail).always(always);
                } else {
                    this.onDeckRequestArgs = [].slice.call(arguments, 0);
                }
                function done(resp) {
                    cb(null, resp);
                    that._cache.set(fingerprint, resp);
                }
                function fail() {
                    cb(true);
                }
                function always() {
                    pendingRequestsCount--;
                    delete pendingRequests[fingerprint];
                    if (that.onDeckRequestArgs) {
                        that._get.apply(that, that.onDeckRequestArgs);
                        that.onDeckRequestArgs = null;
                    }
                }
            },
            get: function(o, cb) {
                var resp, fingerprint;
                cb = cb || $.noop;
                o = _.isString(o) ? {
                    url: o
                } : o || {};
                fingerprint = this._fingerprint(o);
                this.cancelled = false;
                this.lastReq = fingerprint;
                if (resp = this._cache.get(fingerprint)) {
                    cb(null, resp);
                } else {
                    this._get(o, cb);
                }
            },
            cancel: function() {
                this.cancelled = true;
            }
        });
        return Transport;
    }();
    var SearchIndex = window.SearchIndex = function() {
        "use strict";
        var CHILDREN = "c", IDS = "i";
        function SearchIndex(o) {
            o = o || {};
            if (!o.datumTokenizer || !o.queryTokenizer) {
                $.error("datumTokenizer and queryTokenizer are both required");
            }
            this.identify = o.identify || _.stringify;
            this.datumTokenizer = o.datumTokenizer;
            this.queryTokenizer = o.queryTokenizer;
            this.reset();
        }
        _.mixin(SearchIndex.prototype, {
            bootstrap: function bootstrap(o) {
                this.datums = o.datums;
                this.trie = o.trie;
            },
            add: function(data) {
                var that = this;
                data = _.isArray(data) ? data : [ data ];
                _.each(data, function(datum) {
                    var id, tokens;
                    that.datums[id = that.identify(datum)] = datum;
                    tokens = normalizeTokens(that.datumTokenizer(datum));
                    _.each(tokens, function(token) {
                        var node, chars, ch;
                        node = that.trie;
                        chars = token.split("");
                        while (ch = chars.shift()) {
                            node = node[CHILDREN][ch] || (node[CHILDREN][ch] = newNode());
                            node[IDS].push(id);
                        }
                    });
                });
            },
            get: function get(ids) {
                var that = this;
                return _.map(ids, function(id) {
                    return that.datums[id];
                });
            },
            search: function search(query) {
                var that = this, tokens, matches;
                tokens = normalizeTokens(this.queryTokenizer(query));
                _.each(tokens, function(token) {
                    var node, chars, ch, ids;
                    if (matches && matches.length === 0) {
                        return false;
                    }
                    node = that.trie;
                    chars = token.split("");
                    while (node && (ch = chars.shift())) {
                        node = node[CHILDREN][ch];
                    }
                    if (node && chars.length === 0) {
                        ids = node[IDS].slice(0);
                        matches = matches ? getIntersection(matches, ids) : ids;
                    } else {
                        matches = [];
                        return false;
                    }
                });
                return matches ? _.map(unique(matches), function(id) {
                    return that.datums[id];
                }) : [];
            },
            all: function all() {
                var values = [];
                for (var key in this.datums) {
                    values.push(this.datums[key]);
                }
                return values;
            },
            reset: function reset() {
                this.datums = {};
                this.trie = newNode();
            },
            serialize: function serialize() {
                return {
                    datums: this.datums,
                    trie: this.trie
                };
            }
        });
        return SearchIndex;
        function normalizeTokens(tokens) {
            tokens = _.filter(tokens, function(token) {
                return !!token;
            });
            tokens = _.map(tokens, function(token) {
                return token.toLowerCase();
            });
            return tokens;
        }
        function newNode() {
            var node = {};
            node[IDS] = [];
            node[CHILDREN] = {};
            return node;
        }
        function unique(array) {
            var seen = {}, uniques = [];
            for (var i = 0, len = array.length; i < len; i++) {
                if (!seen[array[i]]) {
                    seen[array[i]] = true;
                    uniques.push(array[i]);
                }
            }
            return uniques;
        }
        function getIntersection(arrayA, arrayB) {
            var ai = 0, bi = 0, intersection = [];
            arrayA = arrayA.sort();
            arrayB = arrayB.sort();
            var lenArrayA = arrayA.length, lenArrayB = arrayB.length;
            while (ai < lenArrayA && bi < lenArrayB) {
                if (arrayA[ai] < arrayB[bi]) {
                    ai++;
                } else if (arrayA[ai] > arrayB[bi]) {
                    bi++;
                } else {
                    intersection.push(arrayA[ai]);
                    ai++;
                    bi++;
                }
            }
            return intersection;
        }
    }();
    var Prefetch = function() {
        "use strict";
        var keys;
        keys = {
            data: "data",
            protocol: "protocol",
            thumbprint: "thumbprint"
        };
        function Prefetch(o) {
            this.url = o.url;
            this.ttl = o.ttl;
            this.cache = o.cache;
            this.prepare = o.prepare;
            this.transform = o.transform;
            this.transport = o.transport;
            this.thumbprint = o.thumbprint;
            this.storage = new PersistentStorage(o.cacheKey);
        }
        _.mixin(Prefetch.prototype, {
            _settings: function settings() {
                return {
                    url: this.url,
                    type: "GET",
                    dataType: "json"
                };
            },
            store: function store(data) {
                if (!this.cache) {
                    return;
                }
                this.storage.set(keys.data, data, this.ttl);
                this.storage.set(keys.protocol, location.protocol, this.ttl);
                this.storage.set(keys.thumbprint, this.thumbprint, this.ttl);
            },
            fromCache: function fromCache() {
                var stored = {}, isExpired;
                if (!this.cache) {
                    return null;
                }
                stored.data = this.storage.get(keys.data);
                stored.protocol = this.storage.get(keys.protocol);
                stored.thumbprint = this.storage.get(keys.thumbprint);
                isExpired = stored.thumbprint !== this.thumbprint || stored.protocol !== location.protocol;
                return stored.data && !isExpired ? stored.data : null;
            },
            fromNetwork: function(cb) {
                var that = this, settings;
                if (!cb) {
                    return;
                }
                settings = this.prepare(this._settings());
                this.transport(settings).fail(onError).done(onResponse);
                function onError() {
                    cb(true);
                }
                function onResponse(resp) {
                    cb(null, that.transform(resp));
                }
            },
            clear: function clear() {
                this.storage.clear();
                return this;
            }
        });
        return Prefetch;
    }();
    var Remote = function() {
        "use strict";
        function Remote(o) {
            this.url = o.url;
            this.prepare = o.prepare;
            this.transform = o.transform;
            this.transport = new Transport({
                cache: o.cache,
                limiter: o.limiter,
                transport: o.transport
            });
        }
        _.mixin(Remote.prototype, {
            _settings: function settings() {
                return {
                    url: this.url,
                    type: "GET",
                    dataType: "json"
                };
            },
            get: function get(query, cb) {
                var that = this, settings;
                if (!cb) {
                    return;
                }
                query = query || "";
                settings = this.prepare(query, this._settings());
                return this.transport.get(settings, onResponse);
                function onResponse(err, resp) {
                    err ? cb([]) : cb(that.transform(resp));
                }
            },
            cancelLastRequest: function cancelLastRequest() {
                this.transport.cancel();
            }
        });
        return Remote;
    }();
    var oParser = function() {
        "use strict";
        return function parse(o) {
            var defaults, sorter;
            defaults = {
                initialize: true,
                identify: _.stringify,
                datumTokenizer: null,
                queryTokenizer: null,
                sufficient: 5,
                sorter: null,
                local: [],
                prefetch: null,
                remote: null
            };
            o = _.mixin(defaults, o || {});
            !o.datumTokenizer && $.error("datumTokenizer is required");
            !o.queryTokenizer && $.error("queryTokenizer is required");
            sorter = o.sorter;
            o.sorter = sorter ? function(x) {
                return x.sort(sorter);
            } : _.identity;
            o.local = _.isFunction(o.local) ? o.local() : o.local;
            o.prefetch = parsePrefetch(o.prefetch);
            o.remote = parseRemote(o.remote);
            return o;
        };
        function parsePrefetch(o) {
            var defaults;
            if (!o) {
                return null;
            }
            defaults = {
                url: null,
                ttl: 24 * 60 * 60 * 1e3,
                cache: true,
                cacheKey: null,
                thumbprint: "",
                prepare: _.identity,
                transform: _.identity,
                transport: null
            };
            o = _.isString(o) ? {
                url: o
            } : o;
            o = _.mixin(defaults, o);
            !o.url && $.error("prefetch requires url to be set");
            o.transform = o.filter || o.transform;
            o.cacheKey = o.cacheKey || o.url;
            o.thumbprint = VERSION + o.thumbprint;
            o.transport = o.transport ? callbackToDeferred(o.transport) : $.ajax;
            return o;
        }
        function parseRemote(o) {
            var defaults;
            if (!o) {
                return;
            }
            defaults = {
                url: null,
                cache: true,
                prepare: null,
                replace: null,
                wildcard: null,
                limiter: null,
                rateLimitBy: "debounce",
                rateLimitWait: 300,
                transform: _.identity,
                transport: null
            };
            o = _.isString(o) ? {
                url: o
            } : o;
            o = _.mixin(defaults, o);
            !o.url && $.error("remote requires url to be set");
            o.transform = o.filter || o.transform;
            o.prepare = toRemotePrepare(o);
            o.limiter = toLimiter(o);
            o.transport = o.transport ? callbackToDeferred(o.transport) : $.ajax;
            delete o.replace;
            delete o.wildcard;
            delete o.rateLimitBy;
            delete o.rateLimitWait;
            return o;
        }
        function toRemotePrepare(o) {
            var prepare, replace, wildcard;
            prepare = o.prepare;
            replace = o.replace;
            wildcard = o.wildcard;
            if (prepare) {
                return prepare;
            }
            if (replace) {
                prepare = prepareByReplace;
            } else if (o.wildcard) {
                prepare = prepareByWildcard;
            } else {
                prepare = idenityPrepare;
            }
            return prepare;
            function prepareByReplace(query, settings) {
                settings.url = replace(settings.url, query);
                return settings;
            }
            function prepareByWildcard(query, settings) {
                settings.url = settings.url.replace(wildcard, encodeURIComponent(query));
                return settings;
            }
            function idenityPrepare(query, settings) {
                return settings;
            }
        }
        function toLimiter(o) {
            var limiter, method, wait;
            limiter = o.limiter;
            method = o.rateLimitBy;
            wait = o.rateLimitWait;
            if (!limiter) {
                limiter = /^throttle$/i.test(method) ? throttle(wait) : debounce(wait);
            }
            return limiter;
            function debounce(wait) {
                return function debounce(fn) {
                    return _.debounce(fn, wait);
                };
            }
            function throttle(wait) {
                return function throttle(fn) {
                    return _.throttle(fn, wait);
                };
            }
        }
        function callbackToDeferred(fn) {
            return function wrapper(o) {
                var deferred = $.Deferred();
                fn(o, onSuccess, onError);
                return deferred;
                function onSuccess(resp) {
                    _.defer(function() {
                        deferred.resolve(resp);
                    });
                }
                function onError(err) {
                    _.defer(function() {
                        deferred.reject(err);
                    });
                }
            };
        }
    }();
    var Bloodhound = function() {
        "use strict";
        var old;
        old = window && window.Bloodhound;
        function Bloodhound(o) {
            o = oParser(o);
            this.sorter = o.sorter;
            this.identify = o.identify;
            this.sufficient = o.sufficient;
            this.local = o.local;
            this.remote = o.remote ? new Remote(o.remote) : null;
            this.prefetch = o.prefetch ? new Prefetch(o.prefetch) : null;
            this.index = new SearchIndex({
                identify: this.identify,
                datumTokenizer: o.datumTokenizer,
                queryTokenizer: o.queryTokenizer
            });
            o.initialize !== false && this.initialize();
        }
        Bloodhound.noConflict = function noConflict() {
            window && (window.Bloodhound = old);
            return Bloodhound;
        };
        Bloodhound.tokenizers = tokenizers;
        _.mixin(Bloodhound.prototype, {
            __ttAdapter: function ttAdapter() {
                var that = this;
                return this.remote ? withAsync : withoutAsync;
                function withAsync(query, sync, async) {
                    return that.search(query, sync, async);
                }
                function withoutAsync(query, sync) {
                    return that.search(query, sync);
                }
            },
            _loadPrefetch: function loadPrefetch() {
                var that = this, deferred, serialized;
                deferred = $.Deferred();
                if (!this.prefetch) {
                    deferred.resolve();
                } else if (serialized = this.prefetch.fromCache()) {
                    this.index.bootstrap(serialized);
                    deferred.resolve();
                } else {
                    this.prefetch.fromNetwork(done);
                }
                return deferred.promise();
                function done(err, data) {
                    if (err) {
                        return deferred.reject();
                    }
                    that.add(data);
                    that.prefetch.store(that.index.serialize());
                    deferred.resolve();
                }
            },
            _initialize: function initialize() {
                var that = this, deferred;
                this.clear();
                (this.initPromise = this._loadPrefetch()).done(addLocalToIndex);
                return this.initPromise;
                function addLocalToIndex() {
                    that.add(that.local);
                }
            },
            initialize: function initialize(force) {
                return !this.initPromise || force ? this._initialize() : this.initPromise;
            },
            add: function add(data) {
                this.index.add(data);
                return this;
            },
            get: function get(ids) {
                ids = _.isArray(ids) ? ids : [].slice.call(arguments);
                return this.index.get(ids);
            },
            search: function search(query, sync, async) {
                var that = this, local;
                local = this.sorter(this.index.search(query));
                sync(this.remote ? local.slice() : local);
                if (this.remote && local.length < this.sufficient) {
                    this.remote.get(query, processRemote);
                } else if (this.remote) {
                    this.remote.cancelLastRequest();
                }
                return this;
                function processRemote(remote) {
                    var nonDuplicates = [];
                    _.each(remote, function(r) {
                        !_.some(local, function(l) {
                            return that.identify(r) === that.identify(l);
                        }) && nonDuplicates.push(r);
                    });
                    async && async(nonDuplicates);
                }
            },
            all: function all() {
                return this.index.all();
            },
            clear: function clear() {
                this.index.reset();
                return this;
            },
            clearPrefetchCache: function clearPrefetchCache() {
                this.prefetch && this.prefetch.clear();
                return this;
            },
            clearRemoteCache: function clearRemoteCache() {
                Transport.resetCache();
                return this;
            },
            ttAdapter: function ttAdapter() {
                return this.__ttAdapter();
            }
        });
        return Bloodhound;
    }();
    return Bloodhound;
});

(function(root, factory) {
    if (typeof define === "function" && define.amd) {
        define("typeahead.js", [ "jquery" ], function(a0) {
            return factory(a0);
        });
    } else if (typeof exports === "object") {
        module.exports = factory(require("jquery"));
    } else {
        factory(jQuery);
    }
})(this, function($) {
    var _ = function() {
        "use strict";
        return {
            isMsie: function() {
                return /(msie|trident)/i.test(navigator.userAgent) ? navigator.userAgent.match(/(msie |rv:)(\d+(.\d+)?)/i)[2] : false;
            },
            isBlankString: function(str) {
                return !str || /^\s*$/.test(str);
            },
            escapeRegExChars: function(str) {
                return str.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&");
            },
            isString: function(obj) {
                return typeof obj === "string";
            },
            isNumber: function(obj) {
                return typeof obj === "number";
            },
            isArray: $.isArray,
            isFunction: $.isFunction,
            isObject: $.isPlainObject,
            isUndefined: function(obj) {
                return typeof obj === "undefined";
            },
            isElement: function(obj) {
                return !!(obj && obj.nodeType === 1);
            },
            isJQuery: function(obj) {
                return obj instanceof $;
            },
            toStr: function toStr(s) {
                return _.isUndefined(s) || s === null ? "" : s + "";
            },
            bind: $.proxy,
            each: function(collection, cb) {
                $.each(collection, reverseArgs);
                function reverseArgs(index, value) {
                    return cb(value, index);
                }
            },
            map: $.map,
            filter: $.grep,
            every: function(obj, test) {
                var result = true;
                if (!obj) {
                    return result;
                }
                $.each(obj, function(key, val) {
                    if (!(result = test.call(null, val, key, obj))) {
                        return false;
                    }
                });
                return !!result;
            },
            some: function(obj, test) {
                var result = false;
                if (!obj) {
                    return result;
                }
                $.each(obj, function(key, val) {
                    if (result = test.call(null, val, key, obj)) {
                        return false;
                    }
                });
                return !!result;
            },
            mixin: $.extend,
            identity: function(x) {
                return x;
            },
            clone: function(obj) {
                return $.extend(true, {}, obj);
            },
            getIdGenerator: function() {
                var counter = 0;
                return function() {
                    return counter++;
                };
            },
            templatify: function templatify(obj) {
                return $.isFunction(obj) ? obj : template;
                function template() {
                    return String(obj);
                }
            },
            defer: function(fn) {
                setTimeout(fn, 0);
            },
            debounce: function(func, wait, immediate) {
                var timeout, result;
                return function() {
                    var context = this, args = arguments, later, callNow;
                    later = function() {
                        timeout = null;
                        if (!immediate) {
                            result = func.apply(context, args);
                        }
                    };
                    callNow = immediate && !timeout;
                    clearTimeout(timeout);
                    timeout = setTimeout(later, wait);
                    if (callNow) {
                        result = func.apply(context, args);
                    }
                    return result;
                };
            },
            throttle: function(func, wait) {
                var context, args, timeout, result, previous, later;
                previous = 0;
                later = function() {
                    previous = new Date();
                    timeout = null;
                    result = func.apply(context, args);
                };
                return function() {
                    var now = new Date(), remaining = wait - (now - previous);
                    context = this;
                    args = arguments;
                    if (remaining <= 0) {
                        clearTimeout(timeout);
                        timeout = null;
                        previous = now;
                        result = func.apply(context, args);
                    } else if (!timeout) {
                        timeout = setTimeout(later, remaining);
                    }
                    return result;
                };
            },
            stringify: function(val) {
                return _.isString(val) ? val : JSON.stringify(val);
            },
            noop: function() {}
        };
    }();
    var WWW = function() {
        "use strict";
        var defaultClassNames = {
            wrapper: "twitter-typeahead",
            input: "tt-input",
            hint: "tt-hint",
            menu: "tt-menu",
            dataset: "tt-dataset",
            suggestion: "tt-suggestion",
            selectable: "tt-selectable",
            empty: "tt-empty",
            open: "tt-open",
            cursor: "tt-cursor",
            highlight: "tt-highlight"
        };
        return build;
        function build(o) {
            var www, classes;
            classes = _.mixin({}, defaultClassNames, o);
            www = {
                css: buildCss(),
                classes: classes,
                html: buildHtml(classes),
                selectors: buildSelectors(classes)
            };
            return {
                css: www.css,
                html: www.html,
                classes: www.classes,
                selectors: www.selectors,
                mixin: function(o) {
                    _.mixin(o, www);
                }
            };
        }
        function buildHtml(c) {
            return {
                wrapper: '<span class="' + c.wrapper + '"></span>',
                menu: '<div class="' + c.menu + '"></div>'
            };
        }
        function buildSelectors(classes) {
            var selectors = {};
            _.each(classes, function(v, k) {
                selectors[k] = "." + v;
            });
            return selectors;
        }
        function buildCss() {
            var css = {
                wrapper: {
                    position: "relative",
                    display: "inline-block"
                },
                hint: {
                    position: "absolute",
                    top: "0",
                    left: "0",
                    borderColor: "transparent",
                    boxShadow: "none",
                    opacity: "1"
                },
                input: {
                    position: "relative",
                    verticalAlign: "top",
                    backgroundColor: "transparent"
                },
                inputWithNoHint: {
                    position: "relative",
                    verticalAlign: "top"
                },
                menu: {
                    position: "absolute",
                    top: "100%",
                    left: "0",
                    zIndex: "100",
                    display: "none"
                },
                ltr: {
                    left: "0",
                    right: "auto"
                },
                rtl: {
                    left: "auto",
                    right: " 0"
                }
            };
            if (_.isMsie()) {
                _.mixin(css.input, {
                    backgroundImage: "url(data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7)"
                });
            }
            return css;
        }
    }();
    var EventBus = function() {
        "use strict";
        var namespace, deprecationMap;
        namespace = "typeahead:";
        deprecationMap = {
            render: "rendered",
            cursorchange: "cursorchanged",
            select: "selected",
            autocomplete: "autocompleted"
        };
        function EventBus(o) {
            if (!o || !o.el) {
                $.error("EventBus initialized without el");
            }
            this.$el = $(o.el);
        }
        _.mixin(EventBus.prototype, {
            _trigger: function(type, args) {
                var $e;
                $e = $.Event(namespace + type);
                (args = args || []).unshift($e);
                this.$el.trigger.apply(this.$el, args);
                return $e;
            },
            before: function(type) {
                var args, $e;
                args = [].slice.call(arguments, 1);
                $e = this._trigger("before" + type, args);
                return $e.isDefaultPrevented();
            },
            trigger: function(type) {
                var deprecatedType;
                this._trigger(type, [].slice.call(arguments, 1));
                if (deprecatedType = deprecationMap[type]) {
                    this._trigger(deprecatedType, [].slice.call(arguments, 1));
                }
            }
        });
        return EventBus;
    }();
    var EventEmitter = function() {
        "use strict";
        var splitter = /\s+/, nextTick = getNextTick();
        return {
            onSync: onSync,
            onAsync: onAsync,
            off: off,
            trigger: trigger
        };
        function on(method, types, cb, context) {
            var type;
            if (!cb) {
                return this;
            }
            types = types.split(splitter);
            cb = context ? bindContext(cb, context) : cb;
            this._callbacks = this._callbacks || {};
            while (type = types.shift()) {
                this._callbacks[type] = this._callbacks[type] || {
                    sync: [],
                    async: []
                };
                this._callbacks[type][method].push(cb);
            }
            return this;
        }
        function onAsync(types, cb, context) {
            return on.call(this, "async", types, cb, context);
        }
        function onSync(types, cb, context) {
            return on.call(this, "sync", types, cb, context);
        }
        function off(types) {
            var type;
            if (!this._callbacks) {
                return this;
            }
            types = types.split(splitter);
            while (type = types.shift()) {
                delete this._callbacks[type];
            }
            return this;
        }
        function trigger(types) {
            var type, callbacks, args, syncFlush, asyncFlush;
            if (!this._callbacks) {
                return this;
            }
            types = types.split(splitter);
            args = [].slice.call(arguments, 1);
            while ((type = types.shift()) && (callbacks = this._callbacks[type])) {
                syncFlush = getFlush(callbacks.sync, this, [ type ].concat(args));
                asyncFlush = getFlush(callbacks.async, this, [ type ].concat(args));
                syncFlush() && nextTick(asyncFlush);
            }
            return this;
        }
        function getFlush(callbacks, context, args) {
            return flush;
            function flush() {
                var cancelled;
                for (var i = 0, len = callbacks.length; !cancelled && i < len; i += 1) {
                    cancelled = callbacks[i].apply(context, args) === false;
                }
                return !cancelled;
            }
        }
        function getNextTick() {
            var nextTickFn;
            if (window.setImmediate) {
                nextTickFn = function nextTickSetImmediate(fn) {
                    setImmediate(function() {
                        fn();
                    });
                };
            } else {
                nextTickFn = function nextTickSetTimeout(fn) {
                    setTimeout(function() {
                        fn();
                    }, 0);
                };
            }
            return nextTickFn;
        }
        function bindContext(fn, context) {
            return fn.bind ? fn.bind(context) : function() {
                fn.apply(context, [].slice.call(arguments, 0));
            };
        }
    }();
    var highlight = function(doc) {
        "use strict";
        var defaults = {
            node: null,
            pattern: null,
            tagName: "strong",
            className: null,
            wordsOnly: false,
            caseSensitive: false
        };
        return function hightlight(o) {
            var regex;
            o = _.mixin({}, defaults, o);
            if (!o.node || !o.pattern) {
                return;
            }
            o.pattern = _.isArray(o.pattern) ? o.pattern : [ o.pattern ];
            regex = getRegex(o.pattern, o.caseSensitive, o.wordsOnly);
            traverse(o.node, hightlightTextNode);
            function hightlightTextNode(textNode) {
                var match, patternNode, wrapperNode;
                if (match = regex.exec(textNode.data)) {
                    wrapperNode = doc.createElement(o.tagName);
                    o.className && (wrapperNode.className = o.className);
                    patternNode = textNode.splitText(match.index);
                    patternNode.splitText(match[0].length);
                    wrapperNode.appendChild(patternNode.cloneNode(true));
                    textNode.parentNode.replaceChild(wrapperNode, patternNode);
                }
                return !!match;
            }
            function traverse(el, hightlightTextNode) {
                var childNode, TEXT_NODE_TYPE = 3;
                for (var i = 0; i < el.childNodes.length; i++) {
                    childNode = el.childNodes[i];
                    if (childNode.nodeType === TEXT_NODE_TYPE) {
                        i += hightlightTextNode(childNode) ? 1 : 0;
                    } else {
                        traverse(childNode, hightlightTextNode);
                    }
                }
            }
        };
        function getRegex(patterns, caseSensitive, wordsOnly) {
            var escapedPatterns = [], regexStr;
            for (var i = 0, len = patterns.length; i < len; i++) {
                escapedPatterns.push(_.escapeRegExChars(patterns[i]));
            }
            regexStr = wordsOnly ? "\\b(" + escapedPatterns.join("|") + ")\\b" : "(" + escapedPatterns.join("|") + ")";
            return caseSensitive ? new RegExp(regexStr) : new RegExp(regexStr, "i");
        }
    }(window.document);
    var Input = function() {
        "use strict";
        var specialKeyCodeMap;
        specialKeyCodeMap = {
            9: "tab",
            27: "esc",
            37: "left",
            39: "right",
            13: "enter",
            38: "up",
            40: "down"
        };
        function Input(o, www) {
            o = o || {};
            if (!o.input) {
                $.error("input is missing");
            }
            www.mixin(this);
            this.$hint = $(o.hint);
            this.$input = $(o.input);
            this.query = this.$input.val();
            this.queryWhenFocused = this.hasFocus() ? this.query : null;
            this.$overflowHelper = buildOverflowHelper(this.$input);
            this._checkLanguageDirection();
            if (this.$hint.length === 0) {
                this.setHint = this.getHint = this.clearHint = this.clearHintIfInvalid = _.noop;
            }
        }
        Input.normalizeQuery = function(str) {
            return _.toStr(str).replace(/^\s*/g, "").replace(/\s{2,}/g, " ");
        };
        _.mixin(Input.prototype, EventEmitter, {
            _onBlur: function onBlur() {
                this.resetInputValue();
                this.trigger("blurred");
            },
            _onFocus: function onFocus() {
                this.queryWhenFocused = this.query;
                this.trigger("focused");
            },
            _onKeydown: function onKeydown($e) {
                var keyName = specialKeyCodeMap[$e.which || $e.keyCode];
                this._managePreventDefault(keyName, $e);
                if (keyName && this._shouldTrigger(keyName, $e)) {
                    this.trigger(keyName + "Keyed", $e);
                }
            },
            _onInput: function onInput() {
                this._setQuery(this.getInputValue());
                this.clearHintIfInvalid();
                this._checkLanguageDirection();
            },
            _managePreventDefault: function managePreventDefault(keyName, $e) {
                var preventDefault;
                switch (keyName) {
                  case "up":
                  case "down":
                    preventDefault = !withModifier($e);
                    break;

                  default:
                    preventDefault = false;
                }
                preventDefault && $e.preventDefault();
            },
            _shouldTrigger: function shouldTrigger(keyName, $e) {
                var trigger;
                switch (keyName) {
                  case "tab":
                    trigger = !withModifier($e);
                    break;

                  default:
                    trigger = true;
                }
                return trigger;
            },
            _checkLanguageDirection: function checkLanguageDirection() {
                var dir = (this.$input.css("direction") || "ltr").toLowerCase();
                if (this.dir !== dir) {
                    this.dir = dir;
                    this.$hint.attr("dir", dir);
                    this.trigger("langDirChanged", dir);
                }
            },
            _setQuery: function setQuery(val, silent) {
                var areEquivalent, hasDifferentWhitespace;
                areEquivalent = areQueriesEquivalent(val, this.query);
                hasDifferentWhitespace = areEquivalent ? this.query.length !== val.length : false;
                this.query = val;
                if (!silent && !areEquivalent) {
                    this.trigger("queryChanged", this.query);
                } else if (!silent && hasDifferentWhitespace) {
                    this.trigger("whitespaceChanged", this.query);
                }
            },
            bind: function() {
                var that = this, onBlur, onFocus, onKeydown, onInput;
                onBlur = _.bind(this._onBlur, this);
                onFocus = _.bind(this._onFocus, this);
                onKeydown = _.bind(this._onKeydown, this);
                onInput = _.bind(this._onInput, this);
                this.$input.on("blur.tt", onBlur).on("focus.tt", onFocus).on("keydown.tt", onKeydown);
                if (!_.isMsie() || _.isMsie() > 9) {
                    this.$input.on("input.tt", onInput);
                } else {
                    this.$input.on("keydown.tt keypress.tt cut.tt paste.tt", function($e) {
                        if (specialKeyCodeMap[$e.which || $e.keyCode]) {
                            return;
                        }
                        _.defer(_.bind(that._onInput, that, $e));
                    });
                }
                return this;
            },
            focus: function focus() {
                this.$input.focus();
            },
            blur: function blur() {
                this.$input.blur();
            },
            getLangDir: function getLangDir() {
                return this.dir;
            },
            getQuery: function getQuery() {
                return this.query || "";
            },
            setQuery: function setQuery(val, silent) {
                this.setInputValue(val);
                this._setQuery(val, silent);
            },
            hasQueryChangedSinceLastFocus: function hasQueryChangedSinceLastFocus() {
                return this.query !== this.queryWhenFocused;
            },
            getInputValue: function getInputValue() {
                return this.$input.val();
            },
            setInputValue: function setInputValue(value) {
                this.$input.val(value);
                this.clearHintIfInvalid();
                this._checkLanguageDirection();
            },
            resetInputValue: function resetInputValue() {
                this.setInputValue(this.query);
            },
            getHint: function getHint() {
                return this.$hint.val();
            },
            setHint: function setHint(value) {
                this.$hint.val(value);
            },
            clearHint: function clearHint() {
                this.setHint("");
            },
            clearHintIfInvalid: function clearHintIfInvalid() {
                var val, hint, valIsPrefixOfHint, isValid;
                val = this.getInputValue();
                hint = this.getHint();
                valIsPrefixOfHint = val !== hint && hint.indexOf(val) === 0;
                isValid = val !== "" && valIsPrefixOfHint && !this.hasOverflow();
                !isValid && this.clearHint();
            },
            hasFocus: function hasFocus() {
                return this.$input.is(":focus");
            },
            hasOverflow: function hasOverflow() {
                var constraint = this.$input.width() - 2;
                this.$overflowHelper.text(this.getInputValue());
                return this.$overflowHelper.width() >= constraint;
            },
            isCursorAtEnd: function() {
                var valueLength, selectionStart, range;
                valueLength = this.$input.val().length;
                selectionStart = this.$input[0].selectionStart;
                if (_.isNumber(selectionStart)) {
                    return selectionStart === valueLength;
                } else if (document.selection) {
                    range = document.selection.createRange();
                    range.moveStart("character", -valueLength);
                    return valueLength === range.text.length;
                }
                return true;
            },
            destroy: function destroy() {
                this.$hint.off(".tt");
                this.$input.off(".tt");
                this.$overflowHelper.remove();
                this.$hint = this.$input = this.$overflowHelper = $("<div>");
            }
        });
        return Input;
        function buildOverflowHelper($input) {
            return $('<pre aria-hidden="true"></pre>').css({
                position: "absolute",
                visibility: "hidden",
                whiteSpace: "pre",
                fontFamily: $input.css("font-family"),
                fontSize: $input.css("font-size"),
                fontStyle: $input.css("font-style"),
                fontVariant: $input.css("font-variant"),
                fontWeight: $input.css("font-weight"),
                wordSpacing: $input.css("word-spacing"),
                letterSpacing: $input.css("letter-spacing"),
                textIndent: $input.css("text-indent"),
                textRendering: $input.css("text-rendering"),
                textTransform: $input.css("text-transform")
            }).insertAfter($input);
        }
        function areQueriesEquivalent(a, b) {
            return Input.normalizeQuery(a) === Input.normalizeQuery(b);
        }
        function withModifier($e) {
            return $e.altKey || $e.ctrlKey || $e.metaKey || $e.shiftKey;
        }
    }();
    var Dataset = function() {
        "use strict";
        var keys, nameGenerator;
        keys = {
            val: "tt-selectable-display",
            obj: "tt-selectable-object"
        };
        nameGenerator = _.getIdGenerator();
        function Dataset(o, www) {
            o = o || {};
            o.templates = o.templates || {};
            o.templates.notFound = o.templates.notFound || o.templates.empty;
            if (!o.source) {
                $.error("missing source");
            }
            if (!o.node) {
                $.error("missing node");
            }
            if (o.name && !isValidName(o.name)) {
                $.error("invalid dataset name: " + o.name);
            }
            www.mixin(this);
            this.highlight = !!o.highlight;
            this.name = o.name || nameGenerator();
            this.limit = o.limit || 5;
            this.displayFn = getDisplayFn(o.display || o.displayKey);
            this.templates = getTemplates(o.templates, this.displayFn);
            this.source = o.source.__ttAdapter ? o.source.__ttAdapter() : o.source;
            this.async = _.isUndefined(o.async) ? this.source.length > 2 : !!o.async;
            this._resetLastSuggestion();
            this.$el = $(o.node).addClass(this.classes.dataset).addClass(this.classes.dataset + "-" + this.name);
        }
        Dataset.extractData = function extractData(el) {
            var $el = $(el);
            if ($el.data(keys.obj)) {
                return {
                    val: $el.data(keys.val) || "",
                    obj: $el.data(keys.obj) || null
                };
            }
            return null;
        };
        _.mixin(Dataset.prototype, EventEmitter, {
            _overwrite: function overwrite(query, suggestions) {
                suggestions = suggestions || [];
                if (suggestions.length) {
                    this._renderSuggestions(query, suggestions);
                } else if (this.async && this.templates.pending) {
                    this._renderPending(query);
                } else if (!this.async && this.templates.notFound) {
                    this._renderNotFound(query);
                } else {
                    this._empty();
                }
                this.trigger("rendered", this.name, suggestions, false);
            },
            _append: function append(query, suggestions) {
                suggestions = suggestions || [];
                if (suggestions.length && this.$lastSuggestion.length) {
                    this._appendSuggestions(query, suggestions);
                } else if (suggestions.length) {
                    this._renderSuggestions(query, suggestions);
                } else if (!this.$lastSuggestion.length && this.templates.notFound) {
                    this._renderNotFound(query);
                }
                this.trigger("rendered", this.name, suggestions, true);
            },
            _renderSuggestions: function renderSuggestions(query, suggestions) {
                var $fragment;
                $fragment = this._getSuggestionsFragment(query, suggestions);
                this.$lastSuggestion = $fragment.children().last();
                this.$el.html($fragment).prepend(this._getHeader(query, suggestions)).append(this._getFooter(query, suggestions));
            },
            _appendSuggestions: function appendSuggestions(query, suggestions) {
                var $fragment, $lastSuggestion;
                $fragment = this._getSuggestionsFragment(query, suggestions);
                $lastSuggestion = $fragment.children().last();
                this.$lastSuggestion.after($fragment);
                this.$lastSuggestion = $lastSuggestion;
            },
            _renderPending: function renderPending(query) {
                var template = this.templates.pending;
                this._resetLastSuggestion();
                template && this.$el.html(template({
                    query: query,
                    dataset: this.name
                }));
            },
            _renderNotFound: function renderNotFound(query) {
                var template = this.templates.notFound;
                this._resetLastSuggestion();
                template && this.$el.html(template({
                    query: query,
                    dataset: this.name
                }));
            },
            _empty: function empty() {
                this.$el.empty();
                this._resetLastSuggestion();
            },
            _getSuggestionsFragment: function getSuggestionsFragment(query, suggestions) {
                var that = this, fragment;
                fragment = document.createDocumentFragment();
                _.each(suggestions, function getSuggestionNode(suggestion) {
                    var $el, context;
                    context = that._injectQuery(query, suggestion);
                    $el = $(that.templates.suggestion(context)).data(keys.obj, suggestion).data(keys.val, that.displayFn(suggestion)).addClass(that.classes.suggestion + " " + that.classes.selectable);
                    fragment.appendChild($el[0]);
                });
                this.highlight && highlight({
                    className: this.classes.highlight,
                    node: fragment,
                    pattern: query
                });
                return $(fragment);
            },
            _getFooter: function getFooter(query, suggestions) {
                return this.templates.footer ? this.templates.footer({
                    query: query,
                    suggestions: suggestions,
                    dataset: this.name
                }) : null;
            },
            _getHeader: function getHeader(query, suggestions) {
                return this.templates.header ? this.templates.header({
                    query: query,
                    suggestions: suggestions,
                    dataset: this.name
                }) : null;
            },
            _resetLastSuggestion: function resetLastSuggestion() {
                this.$lastSuggestion = $();
            },
            _injectQuery: function injectQuery(query, obj) {
                return _.isObject(obj) ? _.mixin({
                    _query: query
                }, obj) : obj;
            },
            update: function update(query) {
                var that = this, canceled = false, syncCalled = false, rendered = 0;
                this.cancel();
                this.cancel = function cancel() {
                    canceled = true;
                    that.cancel = $.noop;
                    that.async && that.trigger("asyncCanceled", query);
                };
                this.source(query, sync, async);
                !syncCalled && sync([]);
                function sync(suggestions) {
                    if (syncCalled) {
                        return;
                    }
                    syncCalled = true;
                    suggestions = (suggestions || []).slice(0, that.limit);
                    rendered = suggestions.length;
                    that._overwrite(query, suggestions);
                    if (rendered < that.limit && that.async) {
                        that.trigger("asyncRequested", query);
                    }
                }
                function async(suggestions) {
                    suggestions = suggestions || [];
                    if (!canceled && rendered < that.limit) {
                        that.cancel = $.noop;
                        rendered += suggestions.length;
                        that._append(query, suggestions.slice(0, that.limit - rendered));
                        that.async && that.trigger("asyncReceived", query);
                    }
                }
            },
            cancel: $.noop,
            clear: function clear() {
                this._empty();
                this.cancel();
                this.trigger("cleared");
            },
            isEmpty: function isEmpty() {
                return this.$el.is(":empty");
            },
            destroy: function destroy() {
                this.$el = $("<div>");
            }
        });
        return Dataset;
        function getDisplayFn(display) {
            display = display || _.stringify;
            return _.isFunction(display) ? display : displayFn;
            function displayFn(obj) {
                return obj[display];
            }
        }
        function getTemplates(templates, displayFn) {
            return {
                notFound: templates.notFound && _.templatify(templates.notFound),
                pending: templates.pending && _.templatify(templates.pending),
                header: templates.header && _.templatify(templates.header),
                footer: templates.footer && _.templatify(templates.footer),
                suggestion: templates.suggestion || suggestionTemplate
            };
            function suggestionTemplate(context) {
                return $("<div>").text(displayFn(context));
            }
        }
        function isValidName(str) {
            return /^[_a-zA-Z0-9-]+$/.test(str);
        }
    }();
    var Menu = function() {
        "use strict";
        function Menu(o, www) {
            var that = this;
            o = o || {};
            if (!o.node) {
                $.error("node is required");
            }
            www.mixin(this);
            this.$node = $(o.node);
            this.query = null;
            this.datasets = _.map(o.datasets, initializeDataset);
            function initializeDataset(oDataset) {
                var node = that.$node.find(oDataset.node).first();
                oDataset.node = node.length ? node : $("<div>").appendTo(that.$node);
                return new Dataset(oDataset, www);
            }
        }
        _.mixin(Menu.prototype, EventEmitter, {
            _onSelectableClick: function onSelectableClick($e) {
                this.trigger("selectableClicked", $($e.currentTarget));
            },
            _onRendered: function onRendered(type, dataset, suggestions, async) {
                this.$node.toggleClass(this.classes.empty, this._allDatasetsEmpty());
                this.trigger("datasetRendered", dataset, suggestions, async);
            },
            _onCleared: function onCleared() {
                this.$node.toggleClass(this.classes.empty, this._allDatasetsEmpty());
                this.trigger("datasetCleared");
            },
            _propagate: function propagate() {
                this.trigger.apply(this, arguments);
            },
            _allDatasetsEmpty: function allDatasetsEmpty() {
                return _.every(this.datasets, isDatasetEmpty);
                function isDatasetEmpty(dataset) {
                    return dataset.isEmpty();
                }
            },
            _getSelectables: function getSelectables() {
                return this.$node.find(this.selectors.selectable);
            },
            _removeCursor: function _removeCursor() {
                var $selectable = this.getActiveSelectable();
                $selectable && $selectable.removeClass(this.classes.cursor);
            },
            _ensureVisible: function ensureVisible($el) {
                var elTop, elBottom, nodeScrollTop, nodeHeight;
                elTop = $el.position().top;
                elBottom = elTop + $el.outerHeight(true);
                nodeScrollTop = this.$node.scrollTop();
                nodeHeight = this.$node.height() + parseInt(this.$node.css("paddingTop"), 10) + parseInt(this.$node.css("paddingBottom"), 10);
                if (elTop < 0) {
                    this.$node.scrollTop(nodeScrollTop + elTop);
                } else if (nodeHeight < elBottom) {
                    this.$node.scrollTop(nodeScrollTop + (elBottom - nodeHeight));
                }
            },
            bind: function() {
                var that = this, onSelectableClick;
                onSelectableClick = _.bind(this._onSelectableClick, this);
                this.$node.on("click.tt", this.selectors.selectable, onSelectableClick);
                _.each(this.datasets, function(dataset) {
                    dataset.onSync("asyncRequested", that._propagate, that).onSync("asyncCanceled", that._propagate, that).onSync("asyncReceived", that._propagate, that).onSync("rendered", that._onRendered, that).onSync("cleared", that._onCleared, that);
                });
                return this;
            },
            isOpen: function isOpen() {
                return this.$node.hasClass(this.classes.open);
            },
            open: function open() {
                this.$node.addClass(this.classes.open);
            },
            close: function close() {
                this.$node.removeClass(this.classes.open);
                this._removeCursor();
            },
            setLanguageDirection: function setLanguageDirection(dir) {
                this.$node.attr("dir", dir);
            },
            selectableRelativeToCursor: function selectableRelativeToCursor(delta) {
                var $selectables, $oldCursor, oldIndex, newIndex;
                $oldCursor = this.getActiveSelectable();
                $selectables = this._getSelectables();
                oldIndex = $oldCursor ? $selectables.index($oldCursor) : -1;
                newIndex = oldIndex + delta;
                newIndex = (newIndex + 1) % ($selectables.length + 1) - 1;
                newIndex = newIndex < -1 ? $selectables.length - 1 : newIndex;
                return newIndex === -1 ? null : $selectables.eq(newIndex);
            },
            setCursor: function setCursor($selectable) {
                this._removeCursor();
                if ($selectable = $selectable && $selectable.first()) {
                    $selectable.addClass(this.classes.cursor);
                    this._ensureVisible($selectable);
                }
            },
            getSelectableData: function getSelectableData($el) {
                return $el && $el.length ? Dataset.extractData($el) : null;
            },
            getActiveSelectable: function getActiveSelectable() {
                var $selectable = this._getSelectables().filter(this.selectors.cursor).first();
                return $selectable.length ? $selectable : null;
            },
            getTopSelectable: function getTopSelectable() {
                var $selectable = this._getSelectables().first();
                return $selectable.length ? $selectable : null;
            },
            update: function update(query) {
                var isValidUpdate = query !== this.query;
                if (isValidUpdate) {
                    this.query = query;
                    _.each(this.datasets, updateDataset);
                }
                return isValidUpdate;
                function updateDataset(dataset) {
                    dataset.update(query);
                }
            },
            empty: function empty() {
                _.each(this.datasets, clearDataset);
                this.query = null;
                this.$node.addClass(this.classes.empty);
                function clearDataset(dataset) {
                    dataset.clear();
                }
            },
            destroy: function destroy() {
                this.$node.off(".tt");
                this.$node = $("<div>");
                _.each(this.datasets, destroyDataset);
                function destroyDataset(dataset) {
                    dataset.destroy();
                }
            }
        });
        return Menu;
    }();
    var DefaultMenu = function() {
        "use strict";
        var s = Menu.prototype;
        function DefaultMenu() {
            Menu.apply(this, [].slice.call(arguments, 0));
        }
        _.mixin(DefaultMenu.prototype, Menu.prototype, {
            open: function open() {
                !this._allDatasetsEmpty() && this._show();
                return s.open.apply(this, [].slice.call(arguments, 0));
            },
            close: function close() {
                this._hide();
                return s.close.apply(this, [].slice.call(arguments, 0));
            },
            _onRendered: function onRendered() {
                if (this._allDatasetsEmpty()) {
                    this._hide();
                } else {
                    this.isOpen() && this._show();
                }
                return s._onRendered.apply(this, [].slice.call(arguments, 0));
            },
            _onCleared: function onCleared() {
                if (this._allDatasetsEmpty()) {
                    this._hide();
                } else {
                    this.isOpen() && this._show();
                }
                return s._onCleared.apply(this, [].slice.call(arguments, 0));
            },
            setLanguageDirection: function setLanguageDirection(dir) {
                this.$node.css(dir === "ltr" ? this.css.ltr : this.css.rtl);
                return s.setLanguageDirection.apply(this, [].slice.call(arguments, 0));
            },
            _hide: function hide() {
                this.$node.hide();
            },
            _show: function show() {
                this.$node.css("display", "block");
            }
        });
        return DefaultMenu;
    }();
    var Typeahead = function() {
        "use strict";
        function Typeahead(o, www) {
            var onFocused, onBlurred, onEnterKeyed, onTabKeyed, onEscKeyed, onUpKeyed, onDownKeyed, onLeftKeyed, onRightKeyed, onQueryChanged, onWhitespaceChanged;
            o = o || {};
            if (!o.input) {
                $.error("missing input");
            }
            if (!o.menu) {
                $.error("missing menu");
            }
            if (!o.eventBus) {
                $.error("missing event bus");
            }
            www.mixin(this);
            this.eventBus = o.eventBus;
            this.minLength = _.isNumber(o.minLength) ? o.minLength : 1;
            this.input = o.input;
            this.menu = o.menu;
            this.enabled = true;
            this.active = false;
            this.input.hasFocus() && this.activate();
            this.dir = this.input.getLangDir();
            this._hacks();
            this.menu.bind().onSync("selectableClicked", this._onSelectableClicked, this).onSync("asyncRequested", this._onAsyncRequested, this).onSync("asyncCanceled", this._onAsyncCanceled, this).onSync("asyncReceived", this._onAsyncReceived, this).onSync("datasetRendered", this._onDatasetRendered, this).onSync("datasetCleared", this._onDatasetCleared, this);
            onFocused = c(this, "activate", "open", "_onFocused");
            onBlurred = c(this, "deactivate", "_onBlurred");
            onEnterKeyed = c(this, "isActive", "isOpen", "_onEnterKeyed");
            onTabKeyed = c(this, "isActive", "isOpen", "_onTabKeyed");
            onEscKeyed = c(this, "isActive", "_onEscKeyed");
            onUpKeyed = c(this, "isActive", "open", "_onUpKeyed");
            onDownKeyed = c(this, "isActive", "open", "_onDownKeyed");
            onLeftKeyed = c(this, "isActive", "isOpen", "_onLeftKeyed");
            onRightKeyed = c(this, "isActive", "isOpen", "_onRightKeyed");
            onQueryChanged = c(this, "_openIfActive", "_onQueryChanged");
            onWhitespaceChanged = c(this, "_openIfActive", "_onWhitespaceChanged");
            this.input.bind().onSync("focused", onFocused, this).onSync("blurred", onBlurred, this).onSync("enterKeyed", onEnterKeyed, this).onSync("tabKeyed", onTabKeyed, this).onSync("escKeyed", onEscKeyed, this).onSync("upKeyed", onUpKeyed, this).onSync("downKeyed", onDownKeyed, this).onSync("leftKeyed", onLeftKeyed, this).onSync("rightKeyed", onRightKeyed, this).onSync("queryChanged", onQueryChanged, this).onSync("whitespaceChanged", onWhitespaceChanged, this).onSync("langDirChanged", this._onLangDirChanged, this);
        }
        _.mixin(Typeahead.prototype, {
            _hacks: function hacks() {
                var $input, $menu;
                $input = this.input.$input || $("<div>");
                $menu = this.menu.$node || $("<div>");
                $input.on("blur.tt", function($e) {
                    var active, isActive, hasActive;
                    active = document.activeElement;
                    isActive = $menu.is(active);
                    hasActive = $menu.has(active).length > 0;
                    if (_.isMsie() && (isActive || hasActive)) {
                        $e.preventDefault();
                        $e.stopImmediatePropagation();
                        _.defer(function() {
                            $input.focus();
                        });
                    }
                });
                $menu.on("mousedown.tt", function($e) {
                    $e.preventDefault();
                });
            },
            _onSelectableClicked: function onSelectableClicked(type, $el) {
                this.select($el);
            },
            _onDatasetCleared: function onDatasetCleared() {
                this._updateHint();
            },
            _onDatasetRendered: function onDatasetRendered(type, dataset, suggestions, async) {
                this._updateHint();
                this.eventBus.trigger("render", suggestions, async, dataset);
            },
            _onAsyncRequested: function onAsyncRequested(type, dataset, query) {
                this.eventBus.trigger("asyncrequest", query, dataset);
            },
            _onAsyncCanceled: function onAsyncCanceled(type, dataset, query) {
                this.eventBus.trigger("asynccancel", query, dataset);
            },
            _onAsyncReceived: function onAsyncReceived(type, dataset, query) {
                this.eventBus.trigger("asyncreceive", query, dataset);
            },
            _onFocused: function onFocused() {
                this._minLengthMet() && this.menu.update(this.input.getQuery());
            },
            _onBlurred: function onBlurred() {
                if (this.input.hasQueryChangedSinceLastFocus()) {
                    this.eventBus.trigger("change", this.input.getQuery());
                }
            },
            _onEnterKeyed: function onEnterKeyed(type, $e) {
                var $selectable;
                if ($selectable = this.menu.getActiveSelectable()) {
                    this.select($selectable) && $e.preventDefault();
                }
            },
            _onTabKeyed: function onTabKeyed(type, $e) {
                var $selectable;
                if ($selectable = this.menu.getActiveSelectable()) {
                    this.select($selectable) && $e.preventDefault();
                } else if ($selectable = this.menu.getTopSelectable()) {
                    this.autocomplete($selectable) && $e.preventDefault();
                }
            },
            _onEscKeyed: function onEscKeyed() {
                this.close();
            },
            _onUpKeyed: function onUpKeyed() {
                this.moveCursor(-1);
            },
            _onDownKeyed: function onDownKeyed() {
                this.moveCursor(+1);
            },
            _onLeftKeyed: function onLeftKeyed() {
                if (this.dir === "rtl" && this.input.isCursorAtEnd()) {
                    this.autocomplete(this.menu.getTopSelectable());
                }
            },
            _onRightKeyed: function onRightKeyed() {
                if (this.dir === "ltr" && this.input.isCursorAtEnd()) {
                    this.autocomplete(this.menu.getTopSelectable());
                }
            },
            _onQueryChanged: function onQueryChanged(e, query) {
                this._minLengthMet(query) ? this.menu.update(query) : this.menu.empty();
            },
            _onWhitespaceChanged: function onWhitespaceChanged() {
                this._updateHint();
            },
            _onLangDirChanged: function onLangDirChanged(e, dir) {
                if (this.dir !== dir) {
                    this.dir = dir;
                    this.menu.setLanguageDirection(dir);
                }
            },
            _openIfActive: function openIfActive() {
                this.isActive() && this.open();
            },
            _minLengthMet: function minLengthMet(query) {
                query = _.isString(query) ? query : this.input.getQuery() || "";
                return query.length >= this.minLength;
            },
            _updateHint: function updateHint() {
                var $selectable, data, val, query, escapedQuery, frontMatchRegEx, match;
                $selectable = this.menu.getTopSelectable();
                data = this.menu.getSelectableData($selectable);
                val = this.input.getInputValue();
                if (data && !_.isBlankString(val) && !this.input.hasOverflow()) {
                    query = Input.normalizeQuery(val);
                    escapedQuery = _.escapeRegExChars(query);
                    frontMatchRegEx = new RegExp("^(?:" + escapedQuery + ")(.+$)", "i");
                    match = frontMatchRegEx.exec(data.val);
                    match && this.input.setHint(val + match[1]);
                } else {
                    this.input.clearHint();
                }
            },
            isEnabled: function isEnabled() {
                return this.enabled;
            },
            enable: function enable() {
                this.enabled = true;
            },
            disable: function disable() {
                this.enabled = false;
            },
            isActive: function isActive() {
                return this.active;
            },
            activate: function activate() {
                if (this.isActive()) {
                    return true;
                } else if (!this.isEnabled() || this.eventBus.before("active")) {
                    return false;
                } else {
                    this.active = true;
                    this.eventBus.trigger("active");
                    return true;
                }
            },
            deactivate: function deactivate() {
                if (!this.isActive()) {
                    return true;
                } else if (this.eventBus.before("idle")) {
                    return false;
                } else {
                    this.active = false;
                    this.close();
                    this.eventBus.trigger("idle");
                    return true;
                }
            },
            isOpen: function isOpen() {
                return this.menu.isOpen();
            },
            open: function open() {
                if (!this.isOpen() && !this.eventBus.before("open")) {
                    this.menu.open();
                    this._updateHint();
                    this.eventBus.trigger("open");
                }
                return this.isOpen();
            },
            close: function close() {
                if (this.isOpen() && !this.eventBus.before("close")) {
                    this.menu.close();
                    this.input.clearHint();
                    this.input.resetInputValue();
                    this.eventBus.trigger("close");
                }
                return !this.isOpen();
            },
            setVal: function setVal(val) {
                this.input.setQuery(_.toStr(val));
            },
            getVal: function getVal() {
                return this.input.getQuery();
            },
            select: function select($selectable) {
                var data = this.menu.getSelectableData($selectable);
                if (data && !this.eventBus.before("select", data.obj)) {
                    this.input.setQuery(data.val, true);
                    this.eventBus.trigger("select", data.obj);
                    this.close();
                    return true;
                }
                return false;
            },
            autocomplete: function autocomplete($selectable) {
                var query, data, isValid;
                query = this.input.getQuery();
                data = this.menu.getSelectableData($selectable);
                isValid = data && query !== data.val;
                if (isValid && !this.eventBus.before("autocomplete", data.obj)) {
                    this.input.setQuery(data.val);
                    this.eventBus.trigger("autocomplete", data.obj);
                    return true;
                }
                return false;
            },
            moveCursor: function moveCursor(delta) {
                var query, $candidate, data, payload, cancelMove;
                query = this.input.getQuery();
                $candidate = this.menu.selectableRelativeToCursor(delta);
                data = this.menu.getSelectableData($candidate);
                payload = data ? data.obj : null;
                cancelMove = this._minLengthMet() && this.menu.update(query);
                if (!cancelMove && !this.eventBus.before("cursorchange", payload)) {
                    this.menu.setCursor($candidate);
                    if (data) {
                        this.input.setInputValue(data.val);
                    } else {
                        this.input.resetInputValue();
                        this._updateHint();
                    }
                    this.eventBus.trigger("cursorchange", payload);
                    return true;
                }
                return false;
            },
            destroy: function destroy() {
                this.input.destroy();
                this.menu.destroy();
            }
        });
        return Typeahead;
        function c(ctx) {
            var methods = [].slice.call(arguments, 1);
            return function() {
                var args = [].slice.call(arguments);
                _.each(methods, function(method) {
                    return ctx[method].apply(ctx, args);
                });
            };
        }
    }();
    (function() {
        "use strict";
        var old, keys, methods;
        old = $.fn.typeahead;
        keys = {
            www: "tt-www",
            attrs: "tt-attrs",
            typeahead: "tt-typeahead"
        };
        methods = {
            initialize: function initialize(o, datasets) {
                var www;
                datasets = _.isArray(datasets) ? datasets : [].slice.call(arguments, 1);
                o = o || {};
                www = WWW(o.classNames);
                return this.each(attach);
                function attach() {
                    var $input, $wrapper, $hint, $menu, defaultHint, defaultMenu, eventBus, input, menu, typeahead, MenuConstructor;
                    _.each(datasets, function(d) {
                        d.highlight = !!o.highlight;
                    });
                    $input = $(this);
                    $wrapper = $(www.html.wrapper);
                    $hint = $elOrNull(o.hint);
                    $menu = $elOrNull(o.menu);
                    defaultHint = o.hint !== false && !$hint;
                    defaultMenu = o.menu !== false && !$menu;
                    defaultHint && ($hint = buildHintFromInput($input, www));
                    defaultMenu && ($menu = $(www.html.menu).css(www.css.menu));
                    $hint && $hint.val("");
                    $input = prepInput($input, www);
                    if (defaultHint || defaultMenu) {
                        $wrapper.css(www.css.wrapper);
                        $input.css(defaultHint ? www.css.input : www.css.inputWithNoHint);
                        $input.wrap($wrapper).parent().prepend(defaultHint ? $hint : null).append(defaultMenu ? $menu : null);
                    }
                    MenuConstructor = defaultMenu ? DefaultMenu : Menu;
                    eventBus = new EventBus({
                        el: $input
                    });
                    input = new Input({
                        hint: $hint,
                        input: $input
                    }, www);
                    menu = new MenuConstructor({
                        node: $menu,
                        datasets: datasets
                    }, www);
                    typeahead = new Typeahead({
                        input: input,
                        menu: menu,
                        eventBus: eventBus,
                        minLength: o.minLength
                    }, www);
                    $input.data(keys.www, www);
                    $input.data(keys.typeahead, typeahead);
                }
            },
            isEnabled: function isEnabled() {
                var enabled;
                ttEach(this.first(), function(t) {
                    enabled = t.isEnabled();
                });
                return enabled;
            },
            enable: function enable() {
                ttEach(this, function(t) {
                    t.enable();
                });
                return this;
            },
            disable: function disable() {
                ttEach(this, function(t) {
                    t.disable();
                });
                return this;
            },
            isActive: function isActive() {
                var active;
                ttEach(this.first(), function(t) {
                    active = t.isActive();
                });
                return active;
            },
            activate: function activate() {
                ttEach(this, function(t) {
                    t.activate();
                });
                return this;
            },
            deactivate: function deactivate() {
                ttEach(this, function(t) {
                    t.deactivate();
                });
                return this;
            },
            isOpen: function isOpen() {
                var open;
                ttEach(this.first(), function(t) {
                    open = t.isOpen();
                });
                return open;
            },
            open: function open() {
                ttEach(this, function(t) {
                    t.open();
                });
                return this;
            },
            close: function close() {
                ttEach(this, function(t) {
                    t.close();
                });
                return this;
            },
            select: function select(el) {
                var success = false, $el = $(el);
                ttEach(this.first(), function(t) {
                    success = t.select($el);
                });
                return success;
            },
            autocomplete: function autocomplete(el) {
                var success = false, $el = $(el);
                ttEach(this.first(), function(t) {
                    success = t.autocomplete($el);
                });
                return success;
            },
            moveCursor: function moveCursoe(delta) {
                var success = false;
                ttEach(this.first(), function(t) {
                    success = t.moveCursor(delta);
                });
                return success;
            },
            val: function val(newVal) {
                var query;
                if (!arguments.length) {
                    ttEach(this.first(), function(t) {
                        query = t.getVal();
                    });
                    return query;
                } else {
                    ttEach(this, function(t) {
                        t.setVal(newVal);
                    });
                    return this;
                }
            },
            destroy: function destroy() {
                ttEach(this, function(typeahead, $input) {
                    revert($input);
                    typeahead.destroy();
                });
                return this;
            }
        };
        $.fn.typeahead = function(method) {
            if (methods[method]) {
                return methods[method].apply(this, [].slice.call(arguments, 1));
            } else {
                return methods.initialize.apply(this, arguments);
            }
        };
        $.fn.typeahead.noConflict = function noConflict() {
            $.fn.typeahead = old;
            return this;
        };
        function ttEach($els, fn) {
            $els.each(function() {
                var $input = $(this), typeahead;
                (typeahead = $input.data(keys.typeahead)) && fn(typeahead, $input);
            });
        }
        function buildHintFromInput($input, www) {
            return $input.clone().addClass(www.classes.hint).removeData().css(www.css.hint).css(getBackgroundStyles($input)).prop("readonly", true).removeAttr("id name placeholder required").attr({
                autocomplete: "off",
                spellcheck: "false",
                tabindex: -1
            });
        }
        function prepInput($input, www) {
            $input.data(keys.attrs, {
                dir: $input.attr("dir"),
                autocomplete: $input.attr("autocomplete"),
                spellcheck: $input.attr("spellcheck"),
                style: $input.attr("style")
            });
            $input.addClass(www.classes.input).attr({
                autocomplete: "off",
                spellcheck: false
            });
            try {
                !$input.attr("dir") && $input.attr("dir", "auto");
            } catch (e) {}
            return $input;
        }
        function getBackgroundStyles($el) {
            return {
                backgroundAttachment: $el.css("background-attachment"),
                backgroundClip: $el.css("background-clip"),
                backgroundColor: $el.css("background-color"),
                backgroundImage: $el.css("background-image"),
                backgroundOrigin: $el.css("background-origin"),
                backgroundPosition: $el.css("background-position"),
                backgroundRepeat: $el.css("background-repeat"),
                backgroundSize: $el.css("background-size")
            };
        }
        function revert($input) {
            var www, $wrapper;
            www = $input.data(keys.www);
            $wrapper = $input.parent().filter(www.selectors.wrapper);
            _.each($input.data(keys.attrs), function(val, key) {
                _.isUndefined(val) ? $input.removeAttr(key) : $input.attr(key, val);
            });
            $input.removeData(keys.typeahead).removeData(keys.www).removeData(keys.attr).removeClass(www.classes.input);
            if ($wrapper.length) {
                $input.detach().insertAfter($wrapper);
                $wrapper.remove();
            }
        }
        function $elOrNull(obj) {
            var isValid, $el;
            isValid = _.isJQuery(obj) || _.isElement(obj);
            $el = isValid ? $(obj).first() : [];
            return $el.length ? $el : null;
        }
    })();
});'use strict';
var Backbone, _, global;

global = typeof exports !== "undefined" && exports !== null ? exports : window;

_ = (typeof exports !== 'undefined' ? require('underscore') : global)._;

Backbone = typeof exports !== 'undefined' ? require('backbone') : global.Backbone;

global.ApiHeroUI = {
  core: {},
  components: {},
  controls: {},
  interactions: {},
  plugins: {},
  utils: {},
  search: {},
  routes: {}
};$.fn.draggable = function(opt) {
  var $el;
  opt = $.extend({
    handle: null,
    cursor: "move"
  }, opt);
  $el = opt.handle != null ? this.find(opt.handle) : this;
  return $el.css('cursor', opt.cursor).on("mousedown", function(evt) {
    var $drag, drg_h, drg_w, pos_x, pos_y, z_idx;
    ($drag = opt.handle != null ? $(this).addClass('active-handle').parent() : $(this)).addClass('draggable');
    z_idx = $drag.css('z-index');
    drg_h = $drag.outerHeight();
    drg_w = $drag.outerWidth();
    pos_y = $drag.offset().top + drg_h - evt.pageY;
    pos_x = $drag.offset().left + drg_w - evt.pageX;
    return $drag.css('z-index', 1000).parents().on("mousemove", function(evt) {
      return $('.draggable').offset({
        top: evt.pageY + pos_y - drg_h,
        left: evt.pageX + pos_x - drg_w
      }).on("mouseup", (function(_this) {
        return function() {
          $(_this).removeClass('draggable').css('z-index', z_idx);
          return evt.preventDefault();
        };
      })(this));
    }).on("mouseup", (function(_this) {
      return function() {
        if (opt.handle != null) {
          return $(_this).removeClass('active-handle').parent().removeClass('draggable');
        } else {
          return $(_this).removeClass('draggable');
        }
      };
    })(this));
  });
};ApiHeroUI.utils.getFunctionName = function(fun) {
  var n;
  if ((n = fun.toString().match(/function+\s{1,}([a-zA-Z_0-9]*)/)) != null) {
    return n[1];
  } else {
    return null;
  }
};

ApiHeroUI.utils.getDiffs = function(obj1, obj2) {
  if ((obj1 != null) && (obj2 != null)) {
    return _.reject(_.pairs(obj1), (function(_this) {
      return function(v) {
        return obj2[v[0]] === v[1];
      };
    })(this));
  } else {
    return null;
  }
};

ApiHeroUI.utils.getTypeOf = function(obj) {
  return Object.prototype.toString.call(obj).slice(8, -1);
};

ApiHeroUI.utils.isOfType = function(value, kind) {
  return (this.getTypeOf(value)) === (ApiHeroUI.utils.getFunctionName(kind)) || value instanceof kind;
};

ApiHeroUI.utils.querify = function(array) {
  if (typeof array !== 'object') {
    return null;
  }
  if (!_.isArray(array)) {
    return ApiHeroUI.utils.objectToQuery(array);
  }
  return "" + ((_.map(array, function(v) {
    return v.join('=');
  })).join('&'));
};

ApiHeroUI.utils.objectToQuery = function(object) {
  var i, j, keys, pairs, ref;
  if (object == null) {
    object = {};
  }
  if (typeof array !== 'object') {
    return null;
  }
  pairs = [];
  keys = Object.keys(object);
  for (i = j = 0, ref = keys.length - 1; 0 <= ref ? j <= ref : j >= ref; i = 0 <= ref ? ++j : --j) {
    pairs[i] = [keys[i], object[keys[i]]];
  }
  return (pairs.map((function(_this) {
    return function(v, k) {
      return v.join('=');
    };
  })(this))).join('&');
};

ApiHeroUI.utils.queryToObject = function(string) {
  var o;
  if (typeof string !== 'string') {
    return null;
  }
  o = {};
  decodeURIComponent(string).replace('?', '').split('&').forEach((function(_this) {
    return function(v, k) {
      var p;
      if ((p = v.split('=')).length === 2) {
        return o[p[0]] = p[1];
      }
    };
  })(this));
  return o;
};

ApiHeroUI.utils.getPackageClass = function(_path) {
  var j, len, nsPath, pkg, ref;
  if (!((_path != null) && typeof _path === 'string')) {
    return null;
  }
  pkg = window;
  ref = _path.split('.');
  for (j = 0, len = ref.length; j < len; j++) {
    nsPath = ref[j];
    pkg = pkg[nsPath];
  }
  return pkg;
};

ApiHeroUI.utils.mkGUID = function() {
  return 'xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    var r;
    return (r = Math.random() * 16 | 0).toString(16);
  });
};var extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

ApiHeroUI.core.View = (function(superClass) {
  extend(View, superClass);

  function View() {
    return View.__super__.constructor.apply(this, arguments);
  }

  View.prototype.ns = ApiHeroUI.core;

  View.prototype.collection = null;

  View.prototype.__children = [];

  View.prototype.__parent = null;

  View.prototype.subviews = {};

  View.prototype.render = function() {
    return this.createChildren();
  };

  View.prototype.createChildren = function() {
    this.removeAllChildren();
    if (typeof this.subviews !== 'undefined' && (this.subviews != null) && _.isObject(this.subviews)) {
      _.each(this.subviews, ((function(_this) {
        return function(view, selector) {
          var clazz, params;
          if (typeof view === 'undefined') {
            return;
          }
          params = {};
          if (typeof view === 'object') {
            if ((clazz = view.viewClass) == null) {
              return;
            }
            delete view.viewClass;
            _.extend(params, view);
          } else {
            clazz = view;
          }
          return _.each(_this.$el.find(selector), function(v, k) {
            if (_.isArray(v)) {
              _this[selector] = _.map(v, function(vEl) {
                return new clazz(_.extend(_.clone(params), {
                  el: vEl,
                  __parent: _this
                }));
              });
            } else {
              _this[selector] = new clazz(_.extend(params, {
                el: v,
                __parent: _this
              }));
            }
            return _this.__children.push(_this[selector]);
          });
        };
      })(this)));
      this.delegateEvents();
    }
    this.childrenComplete();
    return this;
  };

  View.prototype.getElement = function() {
    return this.$el;
  };

  View.prototype.setElement = function(el) {
    var ref;
    if ((ref = this.$el) != null) {
      ref.remove();
    }
    if (el) {
      this.$el = $(this.el = el);
    }
    this.delegateEvents();
    return this;
  };

  View.prototype.__formatter = null;

  View.prototype.setTextFormatter = function(fmt) {
    return this.__formatter = fmt;
  };

  View.prototype.getText = function() {
    return this.$el.text();
  };

  View.prototype.setText = function(v) {
    this.$el.text((typeof this.__formatter === "function" ? this.__formatter(v) : void 0) || v);
    return this;
  };

  View.prototype.setCollection = function(c) {
    if (!((c != null) && c instanceof Backbone.Collection)) {
      return this;
    }
    if (this.collection) {
      this.collection.off("change reset add remove");
    }
    (this.collection = c).on("change reset add remove", this.render, this);
    return this;
  };

  View.prototype.getCollection = function() {
    return this.collection;
  };

  View.prototype.setModel = function(c) {
    if (this.model) {
      this.model.off("change reset");
    }
    (this.model = c).on("change reset", this.render, this);
    return this;
  };

  View.prototype.getModel = function() {
    return this.model;
  };

  View.prototype.getChildren = function() {
    return this.__children;
  };

  View.prototype.getChild = function(sel) {
    if (typeof clazz !== 'function') {
      throw 'clazz must be type <Function>';
    }
    return this.__children[sel] || null;
  };

  View.prototype.addChild = function(sel, clazz, opts) {
    if (typeof clazz !== 'function') {
      throw 'clazz must be type <Function>';
    }
    (this.subviews != null ? this.subviews : this.subviews = {})[sel] = clazz;
    if (!(((opts != null ? opts.create : void 0) != null) && opts.create === false)) {
      this.createChildren();
    }
    return this;
  };

  View.prototype.removeChild = function(sel, opts) {
    var idx;
    if (!sel) {
      return;
    }
    if (typeof sel === 'string') {
      if (this[sel] != null) {
        if ((idx = this.__children.indexOf(this[sel])) >= 0) {
          this.__children.splice(idx, 1);
        }
        this[sel].remove();
        delete this[sel];
        delete this.subviews[sel];
      }
    } else {
      throw 'param sel must be CSS Selector String';
    }
    return this;
  };

  View.prototype.replaceChild = function(sel, clazz) {
    var _oC, idx;
    if (!((sel != null) && typeof sel === 'string')) {
      throw 'param sel must be CSS Selector String';
    }
    if (!(clazz instanceof Backbone.View)) {
      throw 'param clazz must be Backbone.View';
    }
    if ((idx = this.__children.indexOf(_oC = this[sel])) >= 0) {
      this.__children.splice(idx, 1);
    }
    this.__children[clazz] = this[sel] = clazz;
    return this;
  };

  View.prototype.removeAllChildren = function() {
    var i, len, ref, sel;
    ref = _.keys(this.subviews);
    for (i = 0, len = ref.length; i < len; i++) {
      sel = ref[i];
      this.removeChild(sel);
    }
    return this;
  };

  View.prototype.childrenComplete = function() {
    return this;
  };

  View.prototype.initialize = function(o) {
    var dataClass, pkg, ref, ref1;
    if (o == null) {
      o = {};
    }
    if (o.hasOwnProperty('textFormatter')) {
      this.setTextFormatter(o.textFormatter);
    }
    pkg = (dataClass = this.$el.attr('data-source')) != null ? ApiHeroUI.utils.getPackageClass(dataClass) : null;
    if (pkg != null) {
      if (pkg instanceof Backbone.Collection) {
        this.collection = pkg;
      }
      if (pkg instanceof Backbone.Model) {
        this.model = pkg;
      }
    }
    if ((ref = this.model) != null) {
      ref.on("change reset", this.render, this);
    }
    if ((ref1 = this.collection) != null) {
      ref1.on("change reset add remove", this.render, this);
    }
    if (o.hasOwnProperty('__parent')) {
      this.__parent = o.__parent;
    }
    if ((this.init != null) && typeof this.init === 'function') {
      this.init(o);
    }
    return this.render();
  };

  return View;

})(Backbone.View);var extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

ApiHeroUI.core.Application = (function(superClass) {
  extend(Application, superClass);

  function Application() {
    return Application.__super__.constructor.apply(this, arguments);
  }

  Application.prototype.el = "body";

  Application.prototype.events = {
    "click a[href^='/']": function(evt) {
      var href, url;
      href = $(evt.currentTarget).attr('href');
      if (!(evt.altKey || evt.ctrlKey || evt.metaKey || evt.shiftKey)) {
        evt.preventDefault();
      }
      url = href.replace(/^\//, '').replace('\#\!\/', '');
      this.router.navigate(url, {
        trigger: true
      });
      return false;
    }
  };

  Application.prototype.childrenComplete = function() {
    var initMainView;
    if (this["#main"] == null) {
      throw "required element `#main` was not found, please check your layout";
    }
    initMainView = (function(_this) {
      return function() {
        var pkg, viewClass, viewEl, viewID, viewTitle;
        viewClass = _this["#main"].$el.children().first().attr('data-controller');
        pkg = viewClass != null ? ApiHeroUI.utils.getPackageClass(viewClass) : null;
        if (pkg == null) {
          pkg = ApiHeroUI.core.View;
        }
        viewEl = _this["#main"].$el.children().first();
        _this["#main"].__children.splice(0, _this["#main"].__children.length, _this["#main"]["page-view"] = new pkg({
          el: viewEl,
          __parent: _this["#main"]
        }));
        viewID = viewEl.attr("data-viewid" || 'UNKOWN_ID');
        viewTitle = viewEl.attr("data-title" || viewID);
        if (viewID === 'UNKOWN_ID') {
          console.log("WARNING: data-viewid was not set");
        }
        document.title = viewTitle;
        return _this.trigger("view-initialized", viewID);
      };
    })(this);
    return this.router.on('view-loaded', (function(_this) {
      return function(data) {
        _this["#main"].$el.html("").append(data);
        initMainView();
        return _this.delegateEvents();
      };
    })(this));
  };

  Application.prototype.init = function(o) {
    var rootRoute, routeOpts;
    _.extend(this.subviews, ApiHeroUI.core.Application.prototype.subviews);
    routeOpts = {
      pushState: true
    };
    if (o != null ? o.hasOwnProperty.rootRooute : void 0) {
      routeOpts.root = o.rootRoute;
    }
    if ((rootRoute = this.$el.attr('data-root-route')) != null) {
      routeOpts.root = rootRoute;
    }
    this.router = new this.Router;
    return Backbone.history.start(routeOpts);
  };

  return Application;

})(ApiHeroUI.core.View);

ApiHeroUI.core.Application.prototype.subviews = {
  "#main": ApiHeroUI.core.View
};

ApiHeroUI.core.Application.prototype.Router = ApiHeroUI.core.Routes = (function(superClass) {
  extend(Routes, superClass);

  function Routes() {
    return Routes.__super__.constructor.apply(this, arguments);
  }

  Routes.prototype.routes = {
    "*actions": "url"
  };

  Routes.prototype.url = function(route) {
    return $.get("/" + route, (function(_this) {
      return function(data, t, r) {
        return _this.trigger('view-loaded', data);
      };
    })(this));
  };

  return Routes;

})(Backbone.Router);var extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

ApiHeroUI.controls.Checkbox = (function(superClass) {
  extend(Checkbox, superClass);

  function Checkbox() {
    return Checkbox.__super__.constructor.apply(this, arguments);
  }

  Checkbox.prototype.ns = ApiHeroUI.controls;

  Checkbox.prototype.__props = null;

  Checkbox.prototype.propsClass = Backbone.Model.extend({
    defaults: {
      classes: '',
      label: '',
      id: '',
      name: '',
      checked: false
    }
  });

  Checkbox.prototype.val = function(val) {
    if (val != null) {
      this.$el.find('input').val(val);
      return this;
    } else {
      return this.$el.find('input').val();
    }
  };

  Checkbox.prototype.events = {
    'change input': function(evt) {
      return this.trigger('change', this.val());
    },
    'click .checkbox-container': function(evt) {
      var ckBx, val;
      evt.stopPropagation();
      evt.preventDefault();
      (ckBx = this.$('input[type="checkbox"]')).val(val = ckBx.val() === 'on' ? 'off' : 'on').trigger('change');
      return this.$('.checkbox-symbol')[val === 'on' ? 'addClass' : 'removeClass']('checkbox-on');
    }
  };

  Checkbox.prototype.render = function() {
    this.$el.children().remove().end().html(this.template(this.__props.attributes));
    return this;
  };

  Checkbox.prototype.initialize = function(opts) {
    var _t, clazz;
    if (opts == null) {
      opts = {};
    }
    if (this.__props == null) {
      this.__props = new this.propsClass(opts.params || null);
    }
    if (((clazz = this.ns[Fun.getConstructorName(this)] || Backbone.controls.Checkbox) != null) && typeof (_t = clazz.__template__) === 'string') {
      this.template = _.template(_t);
    }
    return this.render();
  };

  return Checkbox;

})(Backbone.View);

ApiHeroUI.controls.Checkbox.__template__ = "<span class=\"checkbox-container\">\n  <label for=\"{{id || ''}}\">{{label}}</label>\n  <input type=\"checkbox\" name=\"{{name}}\" id=\"{{id || ''}}\" value=\"off\"/>\n  <div class=\"checkbox-symbol {{classes || ''}}\"></div>\n</span>";var extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

ApiHeroUI.controls.DataLabel = (function(superClass) {
  extend(DataLabel, superClass);

  function DataLabel() {
    return DataLabel.__super__.constructor.apply(this, arguments);
  }

  DataLabel.prototype.model = null;

  DataLabel.prototype.defaultTitle = "Title";

  DataLabel.prototype.subviews = {
    '.datalabel-value': ApiHeroUI.core.View,
    '.datalabel-title': ApiHeroUI.core.View
  };

  DataLabel.prototype.setOptions = function(opts) {
    if (opts.defaultTitle) {
      this.defaultTitle = opts.defaultTitle;
      delete opts.defaultTitle;
    }
    this.model.set(opts);
    return this;
  };

  DataLabel.prototype.getTitle = function() {
    return this.model.get('title');
  };

  DataLabel.prototype.setTitle = function(v) {
    this.model.set({
      title: v,
      validate: true
    });
    return this;
  };

  DataLabel.prototype.getValue = function() {
    return this.model.get('value');
  };

  DataLabel.prototype.setValue = function(v) {
    this.model.set({
      value: (typeof this.__formatter === "function" ? this.__formatter(v) : void 0) || v,
      validate: true
    });
    return this;
  };

  DataLabel.prototype.setText = function(v) {
    return this.setValue(v);
  };

  DataLabel.prototype.init = function(o) {
    return (this.model = new (Backbone.Model.extend({
      defaults: {
        title: this.defaultTitle || "",
        value: ""
      },
      validate: function(o) {
        var param, type, value;
        for (param in o) {
          value = o[param];
          if ((type = typeof value) !== 'string') {
            return param + " required to be string type was <" + type + ">";
          }
        }
      }
    }))).on('change', (function(_this) {
      return function() {
        _this['.datalabel-value'].setText(_this.model.get('value'));
        return _this['.datalabel-title'].setText(_this.model.get('title'));
      };
    })(this));
  };

  return DataLabel;

})(ApiHeroUI.core.View);

$.fn.DataLabel = (function(_this) {
  return function(opts) {
    return new ApiHeroUI.controls.DataLabel({
      el: _this
    }, opts || {});
  };
})(this);var extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

ApiHeroUI.controls.ListItem = (function(superClass) {
  extend(ListItem, superClass);

  function ListItem() {
    return ListItem.__super__.constructor.apply(this, arguments);
  }

  ListItem.prototype.render = function() {
    if (!this.template) {
      if (this.model.attributes.hasOwnProperty('text')) {
        return this.setText(this.model.attributes.text);
      }
    } else {
      return ListItem.__super__.render.apply(this, arguments);
    }
  };

  ListItem.prototype.init = function(o) {
    if (this.model == null) {
      this.model = new (Backbone.Model.extend({
        defaults: {
          text: ""
        }
      }));
    }
    return this.model.on('change', this.render, this);
  };

  return ListItem;

})(Backbone.View);

$.fn.ListItem = (function(_this) {
  return function(opts) {
    return new ApiHeroUI.controls.ListItem({
      el: _this
    }, opts || {});
  };
})(this);var extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

ApiHeroUI.controls.List = (function(superClass) {
  extend(List, superClass);

  function List() {
    return List.__super__.constructor.apply(this, arguments);
  }

  List.prototype.el = "ul";

  List.prototype.subviews = {
    "li": ApiHeroUI.controls.ListItem
  };

  List.prototype.init = function(o) {
    if (this.collection == null) {
      this.collection = new Backbone.Collection;
    }
    return this.collection.on('change', this.render, this);
  };

  return List;

})(ApiHeroUI.core.View);

$.fn.List = (function(_this) {
  return function(opts) {
    return new ApiHeroUI.controls.List({
      el: _this
    }, opts || {});
  };
})(this);var extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

ApiHeroUI.controls.Panel = (function(superClass) {
  extend(Panel, superClass);

  function Panel() {
    return Panel.__super__.constructor.apply(this, arguments);
  }

  Panel.prototype.ns = ApiHeroUI.controls;

  Panel.prototype.modelClass = Backbone.Model.extend({
    defaults: {
      title: 'Panel',
      collapsable: false,
      minified: false
    }
  });

  Panel.prototype.events = {
    'click .panel-header .close': function() {
      this.$el.parent().remove(this.$el);
      return this.trigger('closed');
    },
    'click .panel-header .collapse': function() {
      if (this.$el.hasClass('panel-collapsed')) {
        this.$el.removeClass('panel-collapsed');
        return this.trigger('expanded');
      } else {
        this.$el.addClass('panel-collapsed');
        return this.trigger('collapsed');
      }
    }
  };

  Panel.prototype.getCollection = function() {
    var ref;
    return (ref = this['.panel-content']) != null ? ref.getCollection() : void 0;
  };

  Panel.prototype.setCollection = function(c) {
    var ref;
    return (ref = this['.panel-content']) != null ? ref.setCollection(c) : void 0;
  };

  Panel.prototype.getChildren = function() {
    var ref;
    return (ref = this['.panel-content']) != null ? ref.getChildren() : void 0;
  };

  Panel.prototype.addChild = function(sel, clazz, opts) {
    var ref;
    return (ref = this['.panel-content']) != null ? ref.addChild(sel, clazz, opts) : void 0;
  };

  Panel.prototype.removeChild = function(sel, opts) {
    var ref;
    return (ref = this['.panel-content']) != null ? ref.removeChild(sel, opts) : void 0;
  };

  Panel.prototype.replaceChild = function(sel, clazz) {
    var ref;
    return (ref = this['.panel-content']) != null ? ref.replaceChild(sel, clazz) : void 0;
  };

  Panel.prototype.removeAllChildren = function() {
    var ref;
    return (ref = this['.panel-content']) != null ? ref.removeAllChildren() : void 0;
  };

  Panel.prototype.createChildren = function() {
    var _t, _tpl, ref, ref1;
    if (typeof (_t = ((ref = this.ns[Fun.getConstructorName(this)]) != null ? ref.__template__ : void 0) || Backbone.controls.Panel.__template__) === 'string') {
      _tpl = _.template(_t);
    }
    if (_tpl) {
      this.$el.html(_tpl(((ref1 = this.model) != null ? ref1.attributes : void 0) != null ? this.model.attributes : {}));
    }
    if ((this.__content != null) && typeof this.__content === 'string') {
      this.$('.panel-content').html(this.__content);
    }
    return Panel.__super__.createChildren.call(this);
  };

  Panel.prototype.render = function() {
    Panel.__super__.render.call(this);
    this.$el.draggable({
      handle: '.panel-header'
    });
    return this;
  };

  Panel.prototype.initialize = function(o) {
    if (this.model == null) {
      this.model = new this.modelClass;
    }
    this.subviews = {
      '.panel-header': Backbone.CompositeView,
      '.panel-content': Backbone.CompositeView.extend({
        subviews: _.clone(this.subviews)
      })
    };
    this.events = _.extend({}, Panel.prototype.events, this.events);
    this.__content = this.$el.children().html();
    this.$el.children().remove();
    return Panel.__super__.initialize.call(this, o);
  };

  return Panel;

})(ApiHeroUI.core.View);

ApiHeroUI.controls.Panel.__template__ = "<div class=\"bbui-panel-container<%= minified ? ' minified' : ''%>\">\n  <div class=\"panel-header\">\n    <div class=\"panel-title-container\">\n      <h1 class=\"panel-title\"><%=title%></h1>\n    </div> \n  </div>\n  <div class=\"panel-content\">\n  </div>\n</div>";'use strict';
var extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

ApiHeroUI.Select = (function(superClass) {
  extend(Select, superClass);

  function Select() {
    return Select.__super__.constructor.apply(this, arguments);
  }

  Select.prototype.events = {
    "change": "changeHandler"
  };

  Select.prototype.changeHandler = function(evt) {
    evt.preventDefault();
    this.trigger('change', this.getValue());
    return false;
  };

  Select.prototype.reset = function() {
    _.each(this.$el.find('option'), (function(_this) {
      return function(v, k) {
        return $(v).attr('selected', false);
      };
    })(this));
    return this;
  };

  Select.prototype.setOptions = function(opts) {
    var opt;
    this.reset();
    if (opts.selected != null) {
      if (((opt = this.$el.find("option[value=" + opts.selected + "]")) != null) && opt.length) {
        opt.attr('selected', true);
      }
    }
    return this;
  };

  Select.prototype.getValue = function() {
    return this.$el.val();
  };

  Select.prototype.setValue = function(v) {
    this.setOptions({
      selected: v
    });
    return this;
  };

  return Select;

})(ApiHeroUI.core.View);

$.fn.Select = (function(_this) {
  return function(opts) {
    return new ApiHeroUI.controls.Select({
      el: _this
    }, opts || {});
  };
})(this);var extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

ApiHeroUI.controls.Slider = (function(superClass) {
  extend(Slider, superClass);

  function Slider() {
    return Slider.__super__.constructor.apply(this, arguments);
  }

  Slider.prototype.ns = ApiHeroUI.controls;

  Slider.prototype.modelClass = Backbone.Model.extend({
    defaults: {
      start: 50,
      range: {
        min: 0,
        max: 100
      },
      label: '',
      classes: ''
    }
  });

  Slider.prototype.model = null;

  Slider.prototype.getSliderOpts = function(o) {
    return _.pick(o || this.model.attributes, 'start', 'range', 'connect', 'margin', 'limit', 'step', 'orientation', 'direction', 'animate');
  };

  Slider.prototype.events = {
    'slide .bbui-slider-element': function() {
      return this.trigger('change', {
        value: this.value()
      });
    }
  };

  Slider.prototype.value = function(v) {
    if ((v != null) && typeof v === 'Number') {
      this.$('.bbui-slider-element').val(v);
      return this;
    }
    return this.$('.bbui-slider-element').val();
  };

  Slider.prototype.render = function() {
    Slider.__super__.render.call(this);
    if (this.template != null) {
      this.$el.html(this.template(this.model.attributes));
    }
    return this.$('.bbui-slider-element').noUiSlider(this.getSliderOpts());
  };

  Slider.prototype.initialize = function(o) {
    var _t, ref;
    if (this.model == null) {
      this.model = new this.modelClass;
    }
    _.extend(this.model.attributes, this.getSliderOpts(o));
    if (typeof (_t = ((ref = this.ns[Fun.getConstructorName(this)]) != null ? ref.__template__ : void 0) || Backbone.controls.Slider.__template__) === 'string') {
      this.template = _.template(_t);
    }
    this.model.on('change', this.render, this);
    return Slider.__super__.initialize.call(this, o);
  };

  return Slider;

})(ApiHeroUI.core.View);

ApiHeroUI.controls.Slider.__template__ = "<div class=\"bbui-slider <%=classes || ''%>\">\n  <span class=\"label\"><%=label%></span>\n  <div class=\"bbui-slider-element\"></div>\n</div>";$.fn.extend({
  rotaterator: function(options) {
    var defaults;
    defaults = {
      fadeSpeed: 600,
      pauseSpeed: 100,
      child: null
    };
    options = $.extend(defaults, options);
    return this.each(function() {
      var items, next, o, obj;
      o = options;
      obj = $(this);
      items = $(obj.children(), obj);
      items.each(function() {
        return $(this).hide();
      });
      if (!o.child) {
        next = $(obj).children(":first");
      } else {
        next = o.child;
      }
      return $(next).fadeIn(o.fadeSpeed, function() {
        return $(next).delay(o.pauseSpeed).fadeOut(o.fadeSpeed, function() {
          next = $(this).next();
          if (next.length === 0) {
            next = $(obj).children(":first");
          }
          return $(obj).rotaterator({
            child: next,
            fadeSpeed: o.fadeSpeed,
            pauseSpeed: o.pauseSpeed
          });
        });
      });
    });
  }
});var extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

ApiHeroUI.components.FormView = (function(superClass) {
  extend(FormView, superClass);

  function FormView() {
    return FormView.__super__.constructor.apply(this, arguments);
  }

  FormView.prototype.events = {
    "change input": function(evt) {
      var t;
      return this.model.set(((t = $(evt.target)).attr('name')).replace(/^reg_+/, ''), t.val(), {
        validate: true
      });
    },
    "click button[name=cancel]": function() {
      this.model.clear();
      this.$('input').val(null);
      _.extend(this.model.attributes, _.clone(this.model.defaults));
      return this.trigger('cancelled');
    },
    "click button[name=submit]": function() {
      return this.model.save(null, {
        success: (function(_this) {
          return function(m, r, o) {
            return _this.trigger('submit-success');
          };
        })(this),
        error: (function(_this) {
          return function() {
            return _this.trigger('submit-failure', {
              message: 'unable to complete form submission'
            });
          };
        })(this)
      });
    }
  };

  FormView.prototype.setModel = function(modelClass) {
    return this.model = new this.modelClass().on("change reset", ((function(_this) {
      return function() {
        return _this.trigger('changing');
      };
    })(this)), this).on('invalid', ((function(_this) {
      return function(model, e) {
        return _this.trigger('invalid', {
          message: e
        });
      };
    })(this)), this);
  };

  FormView.prototype.init = function(o) {
    if (o.hasOwnProperty('modelClass')) {
      this.modelClass = o.modelClass;
    }
    if (this.modelClass != null) {
      return this.setModel(this.modelClass);
    }
  };

  return FormView;

})(ApiHeroUI.core.View);var extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

ApiHeroUI.components.LoginFormView = (function(superClass) {
  extend(LoginFormView, superClass);

  function LoginFormView() {
    return LoginFormView.__super__.constructor.apply(this, arguments);
  }

  LoginFormView.prototype.init = function(o) {
    LoginFormView.__super__.init.call(this, o);
    ({
      formEvents: {
        "click button[name=submit]": function() {
          return this.model.login();
        }
      }
    });
    _.extend(this.events, formEvents);
    return this.delegateEvents();
  };

  return LoginFormView;

})(ApiHeroUI.components.FormView);ApiHeroUI.search.ResultsModel = (function() {
  ResultsModel.prototype.nestedCollection = Backbone.Collection.extend({
    model: Backbone.Model
  });

  function ResultsModel($scope) {
    $scope.Model.extend({
      defaults: {
        paginate: {
          current_page: 1,
          total_pages: 0
        },
        results: {}
      },
      params: "",
      uuid: "",
      url: function() {
        return "" + ($scope.getAPIUrl()) + this.params;
      },
      initialize: function(o) {
        this.on('change', (function(_this) {
          return function() {
            return _this.attributes['results'] = _this.nestCollection('results', new _this.nestedCollection(_this.get('results')));
          };
        })(this));
        return this.attributes['results'] = this.nestCollection('results', new this.nestedCollection(this.get('results')));
      }
    });
  }

  return ResultsModel;

})();var extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty,
  slice = [].slice;

ApiHeroUI.search.Collection = (function(superClass) {
  extend(Collection, superClass);

  function Collection() {
    return Collection.__super__.constructor.apply(this, arguments);
  }

  Collection.prototype.model = ApiHeroUI.search.ResultsModel;

  Collection.prototype.filter = null;

  Collection.prototype.getLastResults = function() {
    return this.at(this.models.length - 1);
  };

  Collection.prototype.getCurrentResults = function() {
    var idx;
    return this.at((idx = global.app.ViewHistory.currentIndex) >= 0 ? idx : 0);
  };

  Collection.prototype.getResultsByUUID = function(uuid) {
    return _.findWhere(this.models, {
      uuid: uuid
    });
  };

  Collection.prototype.setFilter = function(filter) {
    return this.filter = filter;
  };

  Collection.prototype.seed = function(seed_elements) {
    var h;
    this.models[0] = new this.model(seed_elements);
    return this.models[0].uuid = (h = global.app.ViewHistory).getUUIDAt(h.currentIndex);
  };

  Collection.prototype.initialize = function(o) {
    Collection.__super__.initialize.apply(this, arguments);
    this.filter = new ApiHeroUI.search.Filter;
    global.app.ViewHistory.on('navigate', (function(_this) {
      return function(o) {
        if (o.get('unique')) {
          return _this.add(new _this.model());
        }
      };
    })(this));
    return this.on('add', (function(_this) {
      return function() {
        var args;
        args = 1 <= arguments.length ? slice.call(arguments, 0) : [];
        return args[0].fetch({
          params: window.location.search
        });
      };
    })(this));
  };

  return Collection;

})(Backbone.Collection);var extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

ApiHeroUI.search.FilterElement = (function(superClass) {
  extend(FilterElement, superClass);

  function FilterElement() {
    return FilterElement.__super__.constructor.apply(this, arguments);
  }

  FilterElement.prototype.getName = function() {
    return this.$el.attr('name');
  };

  FilterElement.prototype.getValue = function() {
    return this.$el.val();
  };

  FilterElement.prototype.setValue = function(v) {
    return this.$el.val(v);
  };

  FilterElement.prototype.valueOf = function() {
    var o;
    o = {};
    o[this.getName()] = this.getValue();
    return o;
  };

  FilterElement.prototype.init = function() {
    return this.$el.on('change', ((function(_this) {
      return function() {
        return _this.trigger(_this.$el.valueOf());
      };
    })(this)), this);
  };

  return FilterElement;

})(ApiHeroUI.core.View);var extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

ApiHeroUI.search.Filter = (function(superClass) {
  extend(Filter, superClass);

  function Filter() {
    return Filter.__super__.constructor.apply(this, arguments);
  }

  Filter.prototype.options = {
    autoUpdate: true
  };

  Filter.prototype.changeHandler = function() {
    var diffs;
    if ((diffs = ApiHeroUI.utils.getDiffs(this.attributes, this.defaults)).length > 1) {
      _.each(diffs, (function(_this) {
        return function(v, k) {
          if ((v != null) && v[0] === 'page') {
            return diffs.splice(k, 1);
          }
        };
      })(this));
    }
    return this.submit(diffs);
  };

  Filter.prototype.submit = function(query) {
    return window.app.ViewHistory.navigate("" + (ApiHeroUI.utils.objectToQuery(query)));
  };

  Filter.prototype.addElement = function(el, opts) {
    var fFunc;
    _.extend(this.attributes, el.valueOf());
    fFunc = (function(_this) {
      return function(data) {
        return _this.filter.set(data);
      };
    })(this);
    el.on('change', fFunc, this);
    el.stopFiltering = (function(_this) {
      return function() {
        return el.off('change', fFunc);
      };
    })(this);
    return this;
  };

  Filter.prototype.removeElement = function(el, opts) {
    el.stopFiltering();
    delete el.stopFiltering;
    return this;
  };

  Filter.prototype.initialize = function(o) {
    if (o == null) {
      o = {};
    }
    _.extend(this.options, o);
    _.extend(this.attributes, ApiHeroUI.utils.queryToObject(window.location.search));
    if (this.options.autoUpdate) {
      return this.on('change', this.changeHandler, this);
    }
  };

  return Filter;

})(Backbone.Model);var extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

ApiHeroUI.search.GeoFilter = (function(superClass) {
  extend(GeoFilter, superClass);

  function GeoFilter() {
    return GeoFilter.__super__.constructor.apply(this, arguments);
  }

  GeoFilter.prototype.getBounds = function() {
    var createMarker, llNE, llSW;
    createMarker = function(llSW, llNE) {
      var lat, lng;
      lat = ApiHeroUI.utils.decodeLatLng(llSW);
      lng = ApiHeroUI.utils.decodeLatLng(llNE);
      return new google.maps.LatLngBounds(lat, lng);
    };
    if (((llNE = this.attributes.latLngNe) != null) && ((llSW = this.attributes.latLngSw) != null)) {
      return createMarker(llSW, llNE);
    } else {
      return null;
    }
  };

  GeoFilter.prototype.changeHandler = function() {
    var bounds;
    if ((bounds = this.getBounds()) != null) {
      this.attributes.near = null;
      this.attributes.search_radius = MapView.getBoundsRad(bounds);
      return GeoFilter.__super__.changeHandler.apply(this, arguments);
    }
  };

  GeoFilter.prototype.initialize = function(o) {
    if (o == null) {
      o = {};
    }
    GeoFilter.__super__.initialize.call(this, o);
    return this.on('change', this.changeHandler, this);
  };

  return GeoFilter;

})(ApiHeroUI.search.Filter);var extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

ApiHeroUI.search.HistoryItem = (function(superClass) {
  extend(HistoryItem, superClass);

  function HistoryItem() {
    return HistoryItem.__super__.constructor.apply(this, arguments);
  }

  HistoryItem.prototype.defaults = {
    search: "",
    unique: true,
    uuid: "",
    o_uuid: null
  };

  return HistoryItem;

})(Backbone.Model);var extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

ApiHeroUI.search.History = (function(superClass) {
  extend(History, superClass);

  function History() {
    return History.__super__.constructor.apply(this, arguments);
  }

  History.prototype.model = ApiHeroUI.search.HistoryItem;

  History.prototype.currentParams = window.location.search;

  History.prototype.route = "/search";

  History.prototype.currentIndex = -1;

  History.prototype.__popCount = -1;

  History.prototype.getLocation = function() {
    return window.location.search.replace('?', '');
  };

  History.prototype.getParams = function(search) {
    return decodeURIComponent(ApiHeroUI.utils.objectToQuery(search));
  };

  History.prototype.uuidExists = function(params) {
    var len, u;
    if ((len = (u = this.where({
      search: params
    })).length)) {
      return u[0].get('uuid');
    } else {
      return null;
    }
  };

  History.prototype.getUUIDAt = function(idx) {
    var itm;
    if ((itm = this.at(idx)) != null) {
      return itm.get('uuid');
    } else {
      return null;
    }
  };

  History.prototype.navigate = function(search) {
    var original_uuid, searchHistoryId;
    search = ApiHeroUI.utils.queryToObject(search);
    search['s_id'] = searchHistoryId = ApiHeroUI.utils.mkGUID();
    window.history.pushState(null, null, (this.route + "?" + (this.currentParams = this.getParams(search))).replace('?&', '?'));
    original_uuid = this.uuidExists(this.currentParams);
    return this.add(new this.model({
      search: this.currentParams,
      uuid: searchHistoryId,
      unique: original_uuid === null,
      o_uuid: original_uuid
    }));
  };

  History.prototype.add = function(models, opts) {
    if (((this.models.length - 1) - this.currentIndex) > 0) {
      this.remove(this.slice(this.currentIndex, this.models.length - 1));
    }
    return History.__super__.add.call(this, (!_.isArray(models) ? models = [models] : models), opts);
  };

  History.prototype.getSearchIndex = function(search) {
    return (this.pluck('search')).lastIndexOf(search.replace('?', ''));
  };

  History.prototype.initialize = function(o) {
    var m, search_d;
    if (o == null) {
      o = {};
    }
    if (o.hasOwnProperty('route')) {
      this.route = o.route;
    }
    this.on('add', (function(_this) {
      return function(models, object, options) {
        _this.currentIndex = _this.models.length - 1;
        return _.each((!_.isArray(models) ? models = [models] : models), function(v, k) {
          if (v.get('unique')) {
            return _this.trigger('navigate', v);
          }
        });
      };
    })(this));
    this.on('remove', (function(_this) {
      return function() {
        return _this.currentIndex = _this.models.length - 1;
      };
    })(this));
    $(window).on('popstate', (function(_this) {
      return function(evt) {
        var idx, p;
        if (((_this.__popCount = _this.__popCount + 1) + _this.currentIndex) === 0) {
          return;
        }
        if ((idx = _this.getSearchIndex(_this.currentParams = _this.getLocation())) >= 0) {
          _this.currentIndex = idx;
        } else {
          p = ApiHeroUI.utils.queryToObject(_this.currentParams);
          _this.unshift(new _this.model({
            search: _this.currentParams,
            uuid: p.s_id || null,
            unique: true,
            o_uuid: null
          }));
          _this.currentIndex = _this.getSearchIndex(_this.currentParams);
        }
        return _this.trigger('popstate', _this.at(_this.currentIndex));
      };
    })(this));
    search_d = (m = window.location.search.match(/s_id=([a-z0-9\-]{12})/)) ? m[1] : ApiHeroUI.utils.mkGUID();
    this.models.push(new this.model({
      search: (this.currentParams = this.getLocation().split('&s_id').shift()),
      uuid: search_d
    }));
    return this.currentIndex = 0;
  };

  return History;

})(Backbone.Collection);var extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

ApiHeroUI.search.View = (function(superClass) {
  extend(View, superClass);

  function View() {
    return View.__super__.constructor.apply(this, arguments);
  }

  View.prototype.events = {
    "click .search-submit": "submit"
  };

  View.prototype.subviews = {
    '.search-filter': ApiHeroUI.search.FilterElement,
    'ul.search-results': ApiHeroUI.controls.List
  };

  View.prototype.childrenComplete = function() {
    _.each(this['.search-filter'], (function(_this) {
      return function(filter) {
        return _this.collection.filter.addElement(filter);
      };
    })(this));
    if (this['ul.search-results'] == null) {
      throw "element ul.search-results was not a child of search view";
    }
    return this['ul.search-results'].setCollection(this.collection);
  };

  View.prototype.submit = function() {
    return this.collection.filter.submit(this.collection.filter.attributes);
  };

  View.prototype.init = function() {
    var base;
    if ((base = global.app).ViewHistory == null) {
      base.ViewHistory = new ApiHeroUI.search.History;
    }
    return this.collection != null ? this.collection : this.collection = new ApiHeroUI.search.Collection;
  };

  return View;

})(ApiHeroUI.core.View);
/*
(=) require ./index
(=) require_tree ./interactions
(=) require_tree ./core
(=) require_tree ./controls
(=) require_tree ./plugins
(=) require_tree ./components
(=) require_tree ./models
(=) require_tree ./search
 */
;
if (!((typeof ApiHeroUI !== "undefined" && ApiHeroUI !== null) && typeof ApiHeroUI === 'object')) {
  global.ApiHeroUI = {};
}

global.ApiHeroUI.Bootstrap = {
  controls: {},
  components: {},
  search: {}
};var extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

ApiHeroUI.Bootstrap.View = (function(superClass) {
  extend(View, superClass);

  function View() {
    return View.__super__.constructor.apply(this, arguments);
  }

  View.prototype.show = function() {
    this.$el.addClass('show').removeCLass('hidden');
    return this;
  };

  View.prototype.hide = function() {
    this.$el.addClass('hidden').removeCLass('show');
    return this;
  };

  View.prototype.setTooltip = function(text, opts) {
    if (opts == null) {
      opts = {};
    }
    this.$el.toolTip(_.extend(opts, {
      title: text
    }));
    return this;
  };

  View.prototype.pullLeft = function() {
    return this.$el.addClass('pull-left');
  };

  View.prototype.pullRight = function() {
    return this.$el.addClass('pull-right');
  };

  return View;

})(ApiHeroUI.core.View);var extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

ApiHeroUI.Bootstrap.components.FormView = (function(superClass) {
  extend(FormView, superClass);

  function FormView() {
    return FormView.__super__.constructor.apply(this, arguments);
  }

  FormView.prototype.alertDelegate = null;

  FormView.prototype.failureMessage = 'form submission failed';

  FormView.prototype.successMessage = 'form submission was succesful';

  FormView.prototype.init = function(o) {
    FormView.__super__.init.call(this, o);
    if (o.hasOwnProperty('alertDelegate')) {
      this.alertDelegate = o.alertDelegate;
    }
    this.on("changing", ((function(_this) {
      return function() {
        var ref;
        return (ref = _this.alertDelegate) != null ? ref.reset() : void 0;
      };
    })(this)), this);
    this.on('invalid', ((function(_this) {
      return function(model, e) {
        var ref;
        return (ref = _this.alertDelegate) != null ? ref.setMessage(e, 'danger') : void 0;
      };
    })(this)), this);
    this.on('submit-failure', ((function(_this) {
      return function(e) {
        var ref;
        return (ref = _this.alertDelegate) != null ? ref.setMessage(_this.failureMessage, 'danger') : void 0;
      };
    })(this)), this);
    return this.on('submit-success', ((function(_this) {
      return function() {
        var ref;
        return (ref = _this.alertDelegate) != null ? ref.setMessage(_this.successMessage, 'success') : void 0;
      };
    })(this)), this);
  };

  return FormView;

})(ApiHeroUI.components.FormView);var extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

ApiHeroUI.Bootstrap.components.LoginForm = (function(superClass) {
  extend(LoginForm, superClass);

  function LoginForm() {
    return LoginForm.__super__.constructor.apply(this, arguments);
  }

  LoginForm.prototype.init = function(o) {
    var fieldHandlers;
    LoginForm.__super__.init.call(this, o);
    fieldHandlers = {
      "change input[name=reg_email]": function() {
        if (this.model.isValid()) {
          return this.$('input[name=email_confirm]').removeClass('hidden').focus();
        }
      },
      "change input[name=reg_password]": function() {
        if (this.model.isValid()) {
          return this.$('input[name=password_confirm]').removeClass('hidden').focus();
        }
      }
    };
    _.extend(this.events, fieldHandlers);
    return this.delegateEvents();
  };

  return LoginForm;

})(ApiHeroUI.Bootstrap.components.FormView);var extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

ApiHeroUI.Bootstrap.components.Typeahead = (function(superClass) {
  extend(Typeahead, superClass);

  function Typeahead() {
    return Typeahead.__super__.constructor.apply(this, arguments);
  }

  Typeahead.prototype.el = '.typeahead';

  Typeahead.prototype.setCollection = function(collection) {
    this.collection = typeof collection !== 'function' ? collection : new collection;
    if (!this.collection) {
      return;
    }
    this.collection.on('reset', (function(_this) {
      return function() {
        var ds;
        ds = _.map(_this.collection.models, function(m) {
          return m.valueOf();
        });
        return _this.$el.typeahead({
          source: ds,
          header: "<div class='col-xs-12'><a href='#'>Click Here to see All Results</a></div>"
        });
      };
    })(this));
    return this.collection.fetch({
      reset: true
    });
  };

  Typeahead.prototype.init = function(o) {
    if (o == null) {
      o = {};
    }
    return Typeahead.__super__.init(o);
  };

  return Typeahead;

})(ApiHeroUI.Bootstrap.View);var extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

ApiHeroUI.Bootstrap.controls.AlertView = (function(superClass) {
  extend(AlertView, superClass);

  function AlertView() {
    return AlertView.__super__.constructor.apply(this, arguments);
  }

  AlertView.prototype.events = {
    "click button.close": function(evt) {
      evt.preventDefault();
      evt.stopPropagation();
      this.reset();
      return false;
    }
  };

  AlertView.prototype.setMessage = function(mssg, kind) {
    return this.model.set({
      message: mssg,
      kind: kind || this.model.defaults.kind || 'danger'
    });
  };

  AlertView.prototype.reset = function() {
    return this.model.set({
      message: null
    });
  };

  AlertView.prototype.render = function() {
    var kind, mssg;
    kind = this.model.getKind();
    if ((mssg = this.model.attributes.message) === null || mssg === '' || mssg === void 0) {
      return this.$el.removeClass("alert-" + kind).addClass('hidden').find('.alert-text').text('');
    }
    return this.$el.addClass("alert-" + kind).find('.alert-text').text(mssg).end().removeClass('hidden');
  };

  AlertView.prototype.init = function() {
    var model_class;
    model_class = Backbone.Model.extend({
      defaults: {
        kind: "danger",
        message: ""
      },
      getKind: function() {
        return this.attributes.kind || this.model.defaults.kind || 'danger';
      },
      validate: function(o) {
        var kind, mssg;
        mssg = o.message || this.attributes.message;
        kind = o.kind || this.attributes.kind;
        if (typeof mssg !== 'string') {
          return 'Alert Message must be string';
        }
        if (typeof kind !== 'string') {
          return 'Alert Kind must be string';
        }
        if (!(0 <= ['danger', 'info', 'warn', 'success'].indexOf(kind))) {
          return "Alert Kind must be one of: " + (kinds.join(','));
        }
      }
    });
    this.model = new model_class;
    this.model.on('change', this.render, this);
    return this.model.on('invalid', function() {
      return console.log(this.validationError);
    });
  };

  return AlertView;

})(ApiHeroUI.core.View);var extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

ApiHeroUI.Bootstrap.controls.Modal = (function(superClass) {
  extend(Modal, superClass);

  function Modal() {
    return Modal.__super__.constructor.apply(this, arguments);
  }

  Modal.prototype.events = {
    'hide.bs.modal': function() {
      return this.trigger('hiding', this.$el);
    },
    'hidden.bs.modal': function() {
      return this.trigger('hidden', this.$el);
    },
    'show.bs.modal': function() {
      return this.trigger('showing', this.$el);
    },
    'shown.bs.modal': function() {
      return this.trigger('shown', this.$el);
    },
    'loaded.bs.modal': function() {
      return this.trigger('loaded', this.$el);
    }
  };

  Modal.prototype.show = function() {
    return this.$el.modal('show');
  };

  Modal.prototype.hide = function() {
    return this.$el.modal('hide');
  };

  Modal.prototype.toggle = function() {
    return this.$el.modal('toggle');
  };

  Modal.prototype.handleUpdate = function() {
    return this.$el.modal('handleUpdate');
  };

  Modal.prototype.init = function(o) {
    if (o == null) {
      o = {
        show: false
      };
    }
    return this.$el.modal(_.pick(o, ['backdrop', 'keyboard', 'show', 'remote']));
  };

  return Modal;

})(ApiHeroUI.core.View);var extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

ApiHeroUI.Bootstrap.Tooltip = (function(superClass) {
  extend(Tooltip, superClass);

  function Tooltip() {
    return Tooltip.__super__.constructor.apply(this, arguments);
  }

  Tooltip.prototype.ns = ApiHeroUI.controls;

  Tooltip.prototype.options = new (Backbone.Model.extend({
    defaults: {
      "data-placement": "top",
      title: ""
    },
    validate: function(attrs, opts) {
      var attr, valid;
      valid = ['top', 'left', 'bottom', 'right'];
      attr = 'data-placement';
      if (attrs.hasOwnProperty(attr)) {
        if (!(0 <= valid.indexOf(attrs[attr]))) {
          return 'data-placement must be top,left,bottom or right';
        }
      }
    },
    valueOf: function() {
      var o;
      o = this.attributes;
      o['data-toggle'] = 'tooltip';
      return o;
    }
  }));

  Tooltip.prototype.render = function(options) {
    if (!this.options.isValid()) {
      return;
    }
    this.attributes = _.extend(this.attributes, this.model.valueOf());
    return this;
  };

  Tooltip.prototype.intialize = function(el, opts) {
    if (opts == null) {
      opts = {};
    }
    return this.options.on('change', this.render, this).set(opts);
  };

  return Tooltip;

})(Backbone.View);

$.fn.Tooltip = (function(_this) {
  return function(opts) {
    return new ApiHeroUI.Bootstrap.Tooltip({
      el: _this
    }, opts || {});
  };
})(this);var extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

ApiHeroUI.Bootstrap.controls.TypeAhead = (function(superClass) {
  extend(TypeAhead, superClass);

  function TypeAhead() {
    return TypeAhead.__super__.constructor.apply(this, arguments);
  }

  TypeAhead.prototype.el = '.typeahead';

  TypeAhead.prototype.close = function() {
    this.$el.typeahead('close');
    return this;
  };

  TypeAhead.prototype.open = function() {
    this.$el.typeahead('open');
    return this;
  };

  TypeAhead.prototype.getValue = function() {
    return this.$el.typeahead('val');
  };

  TypeAhead.prototype.setValue = function(v) {
    this.$el.typeahead('val', v);
    return this;
  };

  TypeAhead.prototype.destroy = function() {
    this.$el.typeahead('destroy');
    return this;
  };

  TypeAhead.prototype.init = function(o, ds) {
    var _ds, _opts;
    if (o == null) {
      o = {};
    }
    if (ds == null) {
      ds = null;
    }
    TypeAhead.__super__.init.apply(this, arguments);
    _opts = o;
    _ds = ds;
    this.setDataSource = (function(_this) {
      return function(ds) {
        _ds = _.pick(ds, ['source', 'async', 'name', 'limit', 'display', 'templates']);
        _this.$el.typeahead(_opts, _ds);
        return _this;
      };
    })(this);
    this.getDataSourc = (function(_this) {
      return function() {
        return _ds;
      };
    })(this);
    (this.setOptions = (function(_this) {
      return function(opts, ds) {
        _extend(_opts, _.pick(opts, ['highlight', 'hint', 'minLength', 'classNames']));
        if (ds != null) {
          _this.setDataSource(ds);
        } else {
          _this.$el.typeahead(_opts, _ds);
        }
        return _this;
      };
    })(this))(o, ds);
    this.getOptions = (function(_this) {
      return function() {
        return _opts;
      };
    })(this);
    this.$el.bind({
      typeahead: active
    }, (function(_this) {
      return function(evt, d) {
        return _this.trigger('active', evt, d);
      };
    })(this));
    this.$el.bind({
      typeahead: idle
    }, (function(_this) {
      return function(evt, d) {
        return _this.trigger('idle', evt, d);
      };
    })(this));
    this.$el.bind({
      typeahead: open
    }, (function(_this) {
      return function(evt, d) {
        return _this.trigger('open', evt, d);
      };
    })(this));
    this.$el.bind({
      typeahead: close
    }, (function(_this) {
      return function(evt, d) {
        return _this.trigger('close', evt, d);
      };
    })(this));
    this.$el.bind({
      typeahead: change
    }, (function(_this) {
      return function(evt, d) {
        return _this.trigger('change', evt, d);
      };
    })(this));
    this.$el.bind({
      typeahead: render
    }, (function(_this) {
      return function(evt, d) {
        return _this.trigger('render', evt, d);
      };
    })(this));
    this.$el.bind({
      typeahead: autocomplete
    }, (function(_this) {
      return function(evt, d) {
        return _this.trigger('autocomplete', evt, d);
      };
    })(this));
    this.$el.bind({
      typeahead: cursorchange
    }, (function(_this) {
      return function(evt, d) {
        return _this.trigger('cursorchange', evt, d);
      };
    })(this));
    this.$el.bind({
      typeahead: asyncrequest
    }, (function(_this) {
      return function(evt, d) {
        return _this.trigger('asyncrequest', evt, d);
      };
    })(this));
    this.$el.bind({
      typeahead: asynccancel
    }, (function(_this) {
      return function(evt, d) {
        return _this.trigger('asynccancel', evt, d);
      };
    })(this));
    return this.$el.bind({
      typeahead: asyncreceive
    }, (function(_this) {
      return function(evt, d) {
        return _this.trigger('asyncreceive', evt, d);
      };
    })(this));
  };

  return TypeAhead;

})(ApiHeroUI.Bootstrap.View);var extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

ApiHeroUI.Bootstrap.search.FilterElement = (function(superClass) {
  extend(FilterElement, superClass);

  function FilterElement() {
    return FilterElement.__super__.constructor.apply(this, arguments);
  }

  return FilterElement;

})(ApiHeroUI.search.FilterElement);var extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

ApiHeroUI.Bootstrap.search.View = (function(superClass) {
  extend(View, superClass);

  function View() {
    return View.__super__.constructor.apply(this, arguments);
  }

  View.prototype.init = function(o) {
    subviews['.search-filter'] = ApiHeroUI.Bootstrap.search.FilterElement;
    return View.__super__.init.apply(this, arguments);
  };

  return View;

})(ApiHeroUI.search.View);
/*
  use mincer compiler directives below to include dependencies
(=) require bootstrap/js/tooltip
(=) require typeahead.js/dist/typeahead.bundle
(=) require apihero-ui/coffee/application
(=) require_tree .
 */
;
