/*!
* datatables.treeview v0.3.1
* DataTables Tree View Plugin
* Copyright 2018, Oath Inc.
* Licensed under the terms of the MIT license.
* See LICENSE file in https://github.com/manudwarf/datatables.treeview.js for terms.
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

    this.api.on('draw', function () {
      return _this.onDraw();
    });
    this.prepareAllRows();

    table.on('click', '.dt-tree-toggle', function (event) {
      return _this.onToggleClick(event);
    });
  }

  TreeView.prototype.collapse = function collapse(parentRow) {
    this.expandIcon(parentRow);
    this.collapseChildRows(parentRow);
    parentRow.child.hide();
  };

  TreeView.prototype.collapseAllRows = function collapseAllRows() {
    var _this2 = this;

    this.api.rows().each(function (index, row) {
      return _this2.collapse(_this2.api.row(row));
    });
  };

  TreeView.prototype.collapseChildRows = function collapseChildRows(parentRow) {
    var _this3 = this;

    if (parentRow.child()) {
      parentRow.child().each(function (index, childRow) {
        return _this3.collapse(_this3.api.row(childRow));
      });
    }
  };

  TreeView.prototype.collapseIcon = function collapseIcon(row) {
    $(row.node()).find('.dt-tree-loading').remove();
    if (this.options.collapseIcon) {
      this.renderIcon('collapse').addClass('expanded').replaceAll($(row.node()).find('.dt-tree-toggle'));
    } else {
      $(row.node()).find('.dt-tree-toggle').addClass('expanded').show();
    }
  };

  TreeView.prototype.createSpacer = function createSpacer($cell, level) {
    for (var i = 0; i < level; i++) {
      $cell.prepend(this.options.spacer);
    }
    $cell.addClass('dt-tree-level-' + level);
  };

  TreeView.prototype.expand = function expand(parentRow, level) {
    var _this4 = this;

    var rowData = parentRow.data();

    if (parentRow.child()) {
      this.collapseIcon(parentRow);
      parentRow.child.show();
    } else {
      this.showLoadingIcon(parentRow);
      this.options.getChildren(rowData, function (children) {
        var newRows = children.map(function (data) {
          return _this4.renderChildRow(parentRow, data, level).node();
        });
        _this4.collapseIcon(parentRow);
        parentRow.child(newRows).show();
      });
    }
  };

  TreeView.prototype.expandIcon = function expandIcon(row) {
    if (this.options.collapseIcon) {
      var $toggle = $(row.node()).find('.dt-tree-toggle');
      this.renderIcon('expand').data('dt-tree-level', $toggle.data('dt-tree-level')).replaceAll($toggle);
    } else {
      $(row.node()).find('.dt-tree-toggle').removeClass('expanded');
    }
  };

  TreeView.prototype.firstVisibleColumn = function firstVisibleColumn() {
    return this.api.column('0:visible');
  };

  TreeView.prototype.isAlreadyProcessed = function isAlreadyProcessed() {
    return this.table.find('.dt-tree-toggle, .dt-tree-childless').length > 0;
  };

  TreeView.prototype.onDraw = function onDraw() {
    if (!this.isAlreadyProcessed()) {
      this.prepareAllRows();
    } else {
      this.collapseAllRows();
    }
  };

  TreeView.prototype.onToggleClick = function onToggleClick(event) {
    var $toggle = $(event.target);
    if (!$toggle.is('.dt-tree-toggle')) {
      $toggle = $toggle.parents('.dt-tree-toggle').first();
    }
    var row = this.api.row($toggle.parents('tr').first());
    this.toggleRow(row, $toggle.data('dt-tree-level'));
  };

  TreeView.prototype.prepareAllRows = function prepareAllRows() {
    var _this5 = this;

    this.firstVisibleColumn().nodes().to$().each(function (index, element) {
      return _this5.prepareSingleRow(element, _this5.api.row(index).data(), 0);
    });
  };

  TreeView.prototype.prepareSingleRow = function prepareSingleRow(cellElement, rowData, level) {
    var $el = $(cellElement);
    if (!this.options.hasChildren(rowData)) {
      $el.addClass('dt-tree-childless');
    } else {
      $el.prepend(this.renderIcon('expand', level));
    }
    this.createSpacer($el, level);
  };

  TreeView.prototype.renderChildRow = function renderChildRow(parentRow, data, parentLevel) {
    var row = this.api.row.add(data);
    var cell = this.api.cell(row.index(), this.firstVisibleColumn().index()).node();
    this.prepareSingleRow(cell, data, parentLevel + 1);
    $(row.node()).detach();
    return row;
  };

  TreeView.prototype.renderIcon = function renderIcon(direction, level) {
    var icon = $(this.options[direction + 'Icon']);
    icon.addClass('dt-tree-toggle').data('dt-tree-level', level);
    return icon;
  };

  TreeView.prototype.showLoadingIcon = function showLoadingIcon(row) {
    $(row.node()).find('.dt-tree-toggle').hide();
    var $cell = $(this.api.cell(row.index(), this.firstVisibleColumn().index()).node());
    if ($cell.find('.dt-tree-spacer').length > 0) {
      $cell.find('.dt-tree-spacer').last().after(this.options.loadingIcon);
    } else {
      $cell.prepend(this.options.loadingIcon);
    }
  };

  TreeView.prototype.toggleRow = function toggleRow(row, level) {
    if (row.child.isShown()) {
      this.collapse(row);
    } else {
      this.expand(row, level);
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
