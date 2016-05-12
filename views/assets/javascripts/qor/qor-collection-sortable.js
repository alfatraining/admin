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
  var CLASS_ITEM_NEW = '.qor-sortable__item-new';
  var CLASS_BUTTON_CHANGE = '.qor-sortable__button-change';
  var CLASS_BUTTON_DONE = '.qor-sortable__button-done';
  var CLASS_BUTTON_ADD = '.qor-sortable__button-add';
  var CLASS_BUTTON_DELETE = '.qor-sortable__button-delete';
  var CLASS_BUTTON_MOVE = '.qor-sortable__button-move';
  var CLASS_ACTION = '.qor-sortable__action';
  var CLASS_ACTION_NEW = '.qor-sortable__action-new';
  var CLASS_ACTION_POSITION = '.qor-sortable__action-position';
  var IS_DELETE = '.is-delete';

  function QorCollectionSortable(element, options) {
    this.$element = $(element);
    this.options = $.extend({}, QorCollectionSortable.DEFAULTS, $.isPlainObject(options) && options);
    this.init();
  }

  QorCollectionSortable.prototype = {
    constructor: QorCollectionSortable,

    init: function () {
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
      var $this = this.$element,
          $item = $this.find(CLASS_ITEM).filter(':visible').not(IS_DELETE),
          $select = $item.find(CLASS_ACTION).find(CLASS_ACTION_POSITION),
          orderData = {},
          itemTotal = $item.size();

      if ($select.size()){
        $select.remove();
      }

      $item.each(function(index){
        var $this = $(this);
        var $action = $this.find(CLASS_ACTION);


        orderData.isSelected = false;
        orderData.itemTotal = itemTotal;

        orderData.itemIndex = index + 1;

        $action.prepend('<select class="qor-sortable__action-position"></select>');

        for (var i = 1; i <= itemTotal; i++) {
          orderData.index = i;

          if (orderData.itemIndex == i){
            orderData.isSelected = true;
          } else {
            orderData.isSelected = false;
          }

          $action.find('select').append(Mustache.render(QorCollectionSortable.OPTION_HTML, orderData));
        }

        $this.data(orderData);

      });

    },

    moveItem: function ($ele) {
      var $current = $ele.closest(CLASS_ITEM),
          currentPosition = $current.data().itemIndex,
          targetPosition = $current.find(CLASS_ACTION_POSITION).val(),
          step,

          $target = $(CLASS_ITEM).filter(function(){
            return $(this).data().itemIndex == targetPosition;
          });


      if (targetPosition == 1) {
        $target.before($current.fadeOut('slow').fadeIn('slow'));
      } else {
        $target.after($current.fadeOut('slow').fadeIn('slow'));
      }

      this.initItemOrder();

    },

    click: function (e) {
      var $target = $(e.target),
          $element = this.$element,

          $this = this.$element,
          $newItem = $this.find(CLASS_ITEM_NEW).filter(':visible'),


      if ($target.is(CLASS_BUTTON_MOVE)){
        this.moveItem($target);
      }

      if ($target.is(CLASS_BUTTON_DONE)){
        $target.hide();
        $element.find(CLASS_ACTION).hide();

        $element.find(CLASS_BUTTON_CHANGE).show();
        $element.find(CLASS_BUTTON_ADD).show();
        $element.find(CLASS_BUTTON_DELETE).show();
      }

      if ($target.is(CLASS_BUTTON_CHANGE)){
        $target.hide();

        $element.find(CLASS_BUTTON_DONE).show();
        $element.find(CLASS_ACTION).show();
        $element.find(CLASS_BUTTON_ADD).hide();
        $element.find(CLASS_BUTTON_DELETE).hide();

        // TODO: need init item orders if have new items
        // if ($newItem.find())
        //

      }

    },

    destroy: function () {
      this.$element.removeData(NAMESPACE);
    }
  };

  QorCollectionSortable.DEFAULTS = {};

  QorCollectionSortable.OPTION_HTML = '<option value="[[index]]" [[#isSelected]]selected[[/isSelected]]>[[index]] of [[itemTotal]]</option>';


  QorCollectionSortable.plugin = function (options) {
    return this.each(function () {
      var $this = $(this);
      var data = $this.data(NAMESPACE);
      var fn;

      if (!data) {

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

  $.fn.QorCollectionSortable = QorCollectionSortable.plugin;

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
