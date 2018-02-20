/*!
* datatables.treeview v0.0.0
* DataTables Tree View Plugin
* Copyright Oath Inc. Apache-2.0
* https://git.ouroath.com/ebourge/datatables.treeview.js
*/
;(function($, window, document, undefined) {
'use strict';

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var TreeView = function () {
  TreeView.onDataTableInit = function onDataTableInit(e, settings) {
    if (e.namespace !== 'dt') return;
    if (!settings.oInit.treeView) return;

    new TreeView($(settings.nTable), settings.oInit.treeView);
  };

  function TreeView(table, options) {
    var _this = this;

    _classCallCheck(this, TreeView);

    this.table = table;
    this.options = $.extend({}, TreeView.defaults, options);
    this.api = table.dataTable().api();

    this.api.on('render', function () {
      return _this.prependExpandIcons();
    });
    this.prependExpandIcons();

    table.on('click', '.dt-tree-toggle', function (event) {
      return _this.toggleRow(_this.api.row($(event.target).parent()));
    });
  }

  TreeView.prototype.collapse = function collapse(parentRow) {
    this.expandIcon(parentRow);
    parentRow.child.hide();
  };

  TreeView.prototype.collapseIcon = function collapseIcon(row) {
    this.renderIcon('collapse').replaceAll($(row.node()).find('.dt-tree-toggle'));
  };

  TreeView.prototype.expand = function expand(parentRow) {
    var _this2 = this;

    var rowData = parentRow.data();
    this.collapseIcon(parentRow);

    if (parentRow.child()) {
      parentRow.child.show();
    } else {
      var newRows = rowData[this.options.key].map(function (data) {
        return _this2.renderChildRow(parentRow, data).node();
      });
      parentRow.child(newRows).show();
    }
  };

  TreeView.prototype.expandIcon = function expandIcon(row) {
    this.renderIcon('expand').replaceAll($(row.node()).find('.dt-tree-toggle'));
  };

  TreeView.prototype.firstVisibleColumn = function firstVisibleColumn() {
    return this.api.column('0:visible');
  };

  TreeView.prototype.prependExpandIcons = function prependExpandIcons() {
    var _this3 = this;

    this.firstVisibleColumn().nodes().to$().each(function (index, element) {
      var $el = $(element);
      var rowData = _this3.api.row(index).data();
      if (!rowData[_this3.options.key]) return;

      $el.prepend(_this3.renderIcon('expand'));
    });
  };

  TreeView.prototype.renderChildRow = function renderChildRow(parentRow, data) {
    var row = this.api.row.add(data);
    var cell = this.api.cell(row.index(), this.firstVisibleColumn().index()).node();
    $(cell).prepend(this.renderSpacer(0));
    $(row.node()).detach();
    return row;
  };

  TreeView.prototype.renderIcon = function renderIcon(direction) {
    var icon = $(this.options[direction + 'Icon']);
    icon.addClass('dt-tree-toggle');
    return icon;
  };

  TreeView.prototype.renderSpacer = function renderSpacer(level) {
    var spacer = $('<span></span>');
    spacer.css('margin-left', this.options.margin * (level + 1) + 'px');
    return spacer;
  };

  TreeView.prototype.toggleRow = function toggleRow(row) {
    if (row.child.isShown()) {
      this.collapse(row);
    } else {
      this.expand(row);
    }
  };

  return TreeView;
}();

TreeView.defaults = {
  margin: 15,
  spacer: '<span></span>',
  expandIcon: '<button>+</button>',
  collapseIcon: '<button>-</button>',
  key: 'children'
};

$.fn.dataTable.TreeView = $.fn.DataTable.TreeView = TreeView;
$(document).on('init.dt.dtr', TreeView.onDataTableInit);
}($, window, window.document));
