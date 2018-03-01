/*!
* datatables.treeview v0.1.0
* DataTables Tree View Plugin
* Copyright Oath Inc. Apache-2.0
* https://git.ouroath.com/ebourge/datatables.treeview.js
*/
;(function($, window, document) {
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
      return _this.toggleRow(_this.api.row($(event.target).parents('tr').first()));
    });
  }

  TreeView.prototype.collapse = function collapse(parentRow) {
    this.expandIcon(parentRow);
    parentRow.child.hide();
  };

  TreeView.prototype.collapseIcon = function collapseIcon(row) {
    $(row.node()).find('.dt-tree-loading').remove();
    if (this.options.collapseIcon) {
      this.renderIcon('collapse').addClass('expanded').replaceAll($(row.node()).find('.dt-tree-toggle'));
    } else {
      $(row.node()).find('.dt-tree-toggle').addClass('expanded').show();
    }
  };

  TreeView.prototype.expand = function expand(parentRow) {
    var _this2 = this;

    var rowData = parentRow.data();

    if (parentRow.child()) {
      this.collapseIcon(parentRow);
      parentRow.child.show();
    } else {
      this.showLoadingIcon(parentRow);
      this.options.getChildren(rowData, parentRow.index(), function (children) {
        var newRows = children.map(function (data) {
          return _this2.renderChildRow(parentRow, data).node();
        });
        _this2.collapseIcon(parentRow);
        parentRow.child(newRows).show();
      });
    }
  };

  TreeView.prototype.expandIcon = function expandIcon(row) {
    if (this.options.collapseIcon) {
      this.renderIcon('expand').replaceAll($(row.node()).find('.dt-tree-toggle'));
    } else {
      $(row.node()).find('.dt-tree-toggle').removeClass('expanded');
    }
  };

  TreeView.prototype.firstVisibleColumn = function firstVisibleColumn() {
    return this.api.column('0:visible');
  };

  TreeView.prototype.prependExpandIcons = function prependExpandIcons() {
    var _this3 = this;

    this.firstVisibleColumn().nodes().to$().each(function (index, element) {
      var $el = $(element);
      var rowData = _this3.api.row(index).data();
      if (!_this3.options.hasChildren(rowData, index)) {
        $el.addClass('dt-tree-childless');
      } else {
        $el.prepend(_this3.renderIcon('expand'));
      }
    });
  };

  TreeView.prototype.renderChildRow = function renderChildRow(parentRow, data) {
    var row = this.api.row.add(data);
    var cell = this.api.cell(row.index(), this.firstVisibleColumn().index()).node();
    $(cell).prepend(this.options.spacer);
    $(row.node()).detach();
    return row;
  };

  TreeView.prototype.renderIcon = function renderIcon(direction) {
    var icon = $(this.options[direction + 'Icon']);
    icon.addClass('dt-tree-toggle');
    return icon;
  };

  TreeView.prototype.showLoadingIcon = function showLoadingIcon(row) {
    $(row.node()).find('.dt-tree-toggle').hide();
    $(this.api.cell(row.index(), this.firstVisibleColumn().index()).node()).prepend(this.options.loadingIcon);
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
  spacer: '<span class="dt-tree-spacer"></span>',
  expandIcon: '<button>+</button>',
  collapseIcon: '<button>-</button>',
  loadingIcon: '<span class="dt-tree-loading">...</span>'
};

$.fn.dataTable.TreeView = $.fn.DataTable.TreeView = TreeView;
$(document).on('init.dt.dtr', TreeView.onDataTableInit);
}($, window, window.document));
