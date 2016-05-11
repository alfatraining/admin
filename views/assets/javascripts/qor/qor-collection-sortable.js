(function (factory) {
  if (typeof define === 'function' && define.amd) {
    // AMD. Register as anonymous module.
    define(['jquery'], factory);
  } else if (typeof exports === 'object') {
    // Node / CommonJS
    factory(require('jquery'));
  } else {
    // Browser globals.
    factory(jQuery);
  }
})(function ($) {

  'use strict';

  var Mustache = window.Mustache;
  var NAMESPACE = 'qor.collection.sortable';
  var EVENT_ENABLE = 'enable.' + NAMESPACE;
  var EVENT_DISABLE = 'disable.' + NAMESPACE;
  var EVENT_CLICK = 'click.' + NAMESPACE;
  var CLASS_ITEM = '.qor-sortable__item';
  var CLASS_BUTTON = '.qor-sortable__button';
  var CLASS_ACTION = '.qor-sortable__action';

  function QorCollectionSortable(element, options) {
    this.$element = $(element);
    this.options = $.extend({}, QorCollectionSortable.DEFAULTS, $.isPlainObject(options) && options);
    this.init();
  }

  QorCollectionSortable.prototype = {
    constructor: QorCollectionSortable,

    init: function () {
      var $this = this.$element;

      this.$item = $this.find(CLASS_ITEM);
      this.bind();
      this.initItemOrder();
    },

    bind: function () {
      this.$element.on(EVENT_CLICK, $.proxy(this.click, this));
    },

    unbind: function () {
      this.$element.off(EVENT_CLICK, this.click);
    },

    initItemOrder: function () {
      var orderData;

      this.$item.each(function(){
        var $this = $(this);
        var $action = $this.find(CLASS_ACTION);

        orderData = $this.data();
        orderData.isSelected = false;

        $action.prepend('<select></select>');

        for (var i = 1; i <= orderData.itemTotal; i++) {
          orderData.index = i;
          if ((orderData.itemIndex + 1) == i){
            orderData.isSelected = true;
          } else {
            orderData.isSelected = false;
          }
          $action.find('select').append(Mustache.render(QorCollectionSortable.OPTION_HTML, orderData));
        }

      });

    },

    click: function (e) {
      var $target = $(e.target);

      if ($target.is(CLASS_BUTTON)){
        $target.hide().next(CLASS_ACTION).show();
      }

    },

    destroy: function () {
      this.$element.removeData(NAMESPACE);
    }
  };

  QorCollectionSortable.DEFAULTS = {};
  QorCollectionSortable.OPTION_HTML = '<option [[#isSelected]]selected[[/isSelected]]>[[index]] of [[itemTotal]]</option>';

  QorCollectionSortable.plugin = function (options) {
    return this.each(function () {
      var $this = $(this);
      var data = $this.data(NAMESPACE);
      var fn;

      if (!data) {
        if (!$.fn.chosen) {
          return;
        }

        if (/destroy/.test(options)) {
          return;
        }

        $this.data(NAMESPACE, (data = new QorCollectionSortable(this, options)));
      }

      if (typeof options === 'string' && $.isFunction(fn = data[options])) {
        fn.apply(data);
      }
    });
  };

  $(function () {
    var selector = '[data-toggle="qor.collection.sortable"]';

    $(document).
      on(EVENT_DISABLE, function (e) {
        QorCollectionSortable.plugin.call($(selector, e.target), 'destroy');
      }).
      on(EVENT_ENABLE, function (e) {
        QorCollectionSortable.plugin.call($(selector, e.target));
      }).
      triggerHandler(EVENT_ENABLE);
  });

  return QorCollectionSortable;

});
