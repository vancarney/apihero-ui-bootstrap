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

}(jQuery);var ApiHeroUI, Backbone, _, global;

global = typeof exports !== "undefined" && exports !== null ? exports : window;

_ = (typeof exports !== 'undefined' ? require('underscore') : global)._;

Backbone = typeof exports !== 'undefined' ? require('backbone') : global.Backbone;

ApiHeroUI = {
  core: {},
  controls: {},
  interactions: {},
  utils: {},
  routes: {}
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
            return _this.__children.push(_this[selector] = new clazz(_.extend(params, {
              el: v,
              __parent: _this
            })));
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

  View.prototype.setCollection = function(c) {
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
    var ref, ref1;
    if ((ref = this.model) != null) {
      ref.on("change reset", this.render, this);
    }
    if ((ref1 = this.collection) != null) {
      ref1.on("change reset add remove", this.render, this);
    }
    if ((o != null) && o.__parent) {
      this.__parent = o.__parent;
    }
    if (typeof this.init === 'function') {
      if (o != null) {
        this.init(o);
      } else {
        this.init();
      }
    }
    return this.render();
  };

  return View;

})(Backbone.View);
/*
(=) require ./index
(=) require_tree ./core
 */
;
var extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
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

  FormView.prototype.init = function(o) {
    return this.model = new this.modelClass().on("change reset", ((function(_this) {
      return function() {
        _this.trigger('changing');
        return _this.model.validate();
      };
    })(this)), this).on('invalid', ((function(_this) {
      return function(model, e) {
        return _this.trigger('invalid', {
          message: e
        });
      };
    })(this)), this);
  };

  return FormView;

})(ApiHero.core.View);if (!(ApiHeroUI && typeof ApiHeroUI === 'object')) {
  global.ApiHeroUI = {};
}

global.ApiHeroUI.Bootstrap = {
  controls: {},
  components: {}
};var extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

console.log(ApiHeroUI);

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

})(ApiHeroUI.core.View);
/*
  use mincer compiler directives below to include dependencies
(=) require bootstrap/js/tooltip
(=) require apihero-ui/coffee/core
(=) require apihero-ui/coffee/components/form
(=) require_tree .
 */
;
