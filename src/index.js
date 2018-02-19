class TreeView {
  static onDataTableInit(e, settings) {
    if (e.namespace !== 'dt') return;
    if (!settings.oInit.treeView) return;

    new TreeView(settings, settings.oInit.treeView);
  }

  constructor(table, options) {
    this.table = table;
    this.options = $.extend({}, TreeView.defaults, options);
  }
}

TreeView.defaults = {
  margin: 15,
  expandIcon: '<span>+</span>',
  collapseIcon: '<span>-</span>',
};

$.fn.dataTable.TreeView = $.fn.DataTable.TreeView = TreeView;
$(document).on('init.dt.dtr', TreeView.onDataTableInit);
