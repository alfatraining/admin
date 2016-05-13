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
  var CLASS_BUTTON_CHANGE = '.qor-sortable__button-change';
  var CLASS_BUTTON_DONE = '.qor-sortable__button-done';
  var CLASS_BUTTON_ADD = '.qor-sortable__button-add';
  var CLASS_BUTTON_DELETE = '.qor-sortable__button-delete';
  var CLASS_BUTTON_MOVE = '.qor-sortable__button-move';
  var CLASS_ACTION = '.qor-sortable__action';
  var CLASS_ACTION_POSITION = '.qor-sortable__action-position';
  var CLASS_ACTION_NEW = '.qor-sortable__item-new';
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

    initItemOrder: function (resetResource) {
      var $item = this.$element.find(CLASS_ITEM).filter(':visible').not(IS_DELETE);

      if (!$item.size()){
        return;
      }

      // hide change position button if just 1 item
      if ($item.size() == 1){
        $(CLASS_BUTTON_CHANGE).hide();
        return;
      }


      var $select = $item.find(CLASS_ACTION).find(CLASS_ACTION_POSITION),
          orderData = {},
          itemTotal = $item.size(),
          template = $item.first().html(),
          fullResourceName,
          resourceNamePrefix;

      if ($select.size()){
        $select.remove();
      }

      if (!resourceNamePrefix) {
        fullResourceName = template.match(/(\w+)\="(\S*\[\d+\]\S*)"/); // get results : [attribute, name, value]
        if (fullResourceName.length) {

          fullResourceName = fullResourceName[2];
          resourceNamePrefix = fullResourceName.match(/^(\S*)\[(\d+)\]([^\[\]]*)$/); // get results : [input, prefix, index, suffix]

          if (resourceNamePrefix.length) {
            resourceNamePrefix = resourceNamePrefix[1];
          }
        }

      }

      $item.each(function (index) {
        var $this = $(this),
            $action = $this.find(CLASS_ACTION);

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

        // reset form resource name prop
        if (resetResource){
          var resourceName,
              newResourceName,
              $resource = $(this).find('[name^="' + resourceNamePrefix + '"]');

          $resource.each(function () {
            resourceName = $(this).prop('name');
            newResourceName = '[' + orderData.itemIndex + ']';
            resourceName = resourceName.replace(/\[\d+\]/,newResourceName);
            $(this).prop('name',resourceName);
          });
        }

        $this.data(orderData);

      });
    },

    moveItem: function ($ele) {
      var $current = $ele.closest(CLASS_ITEM),
          currentPosition = $current.data().itemIndex,
          targetPosition = $current.find(CLASS_ACTION_POSITION).val(),

          $target = $(CLASS_ITEM).filter(function(){
            return $(this).data().itemIndex == targetPosition;
          });

      if (targetPosition == currentPosition) {
        return;
      }

      if (targetPosition == 1) {
        $target.before($current.fadeOut('slow').fadeIn('slow'));
      } else {
        $target.after($current.fadeOut('slow').fadeIn('slow'));
      }

      this.initItemOrder(true);

      // TODO: scroll to targetPosition after move item

    },

    click: function (e) {
      var $target = $(e.target),
          $element = this.$element;

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


        // need init item orders if have new items
        if (this.checkNewItem()) {
          this.initItemOrder();
        }

      }

    },

    checkNewItem: function () {
      var $items = $(CLASS_ACTION_NEW).filter(':visible'),
          hasSelect,
          isNeedInit = false;

      $items.size() && $items.each(function () {
        hasSelect = $(this).find(CLASS_ACTION_POSITION).size();

        if (!hasSelect){
          isNeedInit = true;
        }

      });

      return isNeedInit;

    },

    destroy: function () {
      this.unbind();
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
