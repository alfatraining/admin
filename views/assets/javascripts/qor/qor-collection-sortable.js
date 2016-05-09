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

  var NAMESPACE = 'qor.chooser.sortable';
  var EVENT_ENABLE = 'enable.' + NAMESPACE;
  var EVENT_DISABLE = 'disable.' + NAMESPACE;

  function QorCollectionSortable(element, options) {
    this.$element = $(element);
    this.options = $.extend({}, QorCollectionSortable.DEFAULTS, $.isPlainObject(options) && options);
    this.init();
  }

  QorCollectionSortable.prototype = {
    constructor: QorCollectionSortable,

    init: function () {
      var $this = this.$element;
      var $parent = $this.parents();

    },

    destroy: function () {
      this.$element.removeData(NAMESPACE);
    }
  };

  QorCollectionSortable.DEFAULTS = {};

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
    var selector = 'select[data-toggle="qor.collection.sortable"]';

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
