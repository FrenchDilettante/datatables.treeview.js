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

    new TreeView(settings, settings.oInit.treeView);
  };

  function TreeView(table, options) {
    _classCallCheck(this, TreeView);

    this.table = table;
    this.options = $.extend({}, TreeView.defaults, options);
  }

  return TreeView;
}();

TreeView.defaults = {
  margin: 15,
  expandIcon: '<span>+</span>',
  collapseIcon: '<span>-</span>'
};

$.fn.dataTable.TreeView = $.fn.DataTable.TreeView = TreeView;
$(document).on('init.dt.dtr', TreeView.onDataTableInit);
}($, window, window.document));

//# sourceMappingURL=index.js.map
