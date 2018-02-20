class TreeView {
  static onDataTableInit(e, settings) {
    if (e.namespace !== 'dt') return;
    if (!settings.oInit.treeView) return;

    new TreeView($(settings.nTable), settings.oInit.treeView);
  }

  constructor(table, options) {
    this.table = table;
    this.options = $.extend({}, TreeView.defaults, options);
    this.api = table.dataTable().api();

    this.api.on('render', () => this.prependExpandIcons());
    this.prependExpandIcons();

    table.on('click', '.dt-tree-toggle',
      (event) => this.toggleRow(this.api.row($(event.target).parent())));
  }

  collapse(parentRow) {
    this.expandIcon(parentRow);
    parentRow.child.hide();
  }

  collapseIcon(row) {
    this.renderIcon('collapse')
      .replaceAll($(row.node()).find('.dt-tree-toggle'));
  }

  expand(parentRow) {
    const rowData = parentRow.data();
    this.collapseIcon(parentRow);

    if (parentRow.child()) {
      parentRow.child.show();
    } else {
      const newRows = rowData[this.options.key]
        .map(data => this.renderChildRow(parentRow, data).node());
      parentRow.child(newRows).show();
    }
  }

  expandIcon(row) {
    this.renderIcon('expand')
      .replaceAll($(row.node()).find('.dt-tree-toggle'));
  }

  firstVisibleColumn() {
    return this.api.column('0:visible');
  }

  prependExpandIcons() {
    this.firstVisibleColumn()
      .nodes()
      .to$()
      .each((index, element) => {
        const $el = $(element);
        const rowData = this.api.row(index).data();
        if (!rowData[this.options.key]) return;

        $el.prepend(this.renderIcon('expand'));
      });
  }

  renderChildRow(parentRow, data) {
    const row = this.api.row.add(data);
    const cell = this.api.cell(row.index(), this.firstVisibleColumn().index()).node();
    $(cell).prepend(this.renderSpacer(0));
    $(row.node()).detach();
    return row;
  }

  renderIcon(direction) {
    const icon = $(this.options[`${direction}Icon`]);
    icon.addClass('dt-tree-toggle');
    return icon;
  }

  renderSpacer(level) {
    const spacer = $('<span></span>');
    spacer.css('margin-left', `${this.options.margin * (level + 1)}px`);
    return spacer;
  }

  toggleRow(row) {
    if (row.child.isShown()) {
      this.collapse(row);
    } else {
      this.expand(row);
    }
  }
}

TreeView.defaults = {
  margin: 15,
  spacer: '<span></span>',
  expandIcon: '<button>+</button>',
  collapseIcon: '<button>-</button>',
  key: 'children',
};

$.fn.dataTable.TreeView = $.fn.DataTable.TreeView = TreeView;
$(document).on('init.dt.dtr', TreeView.onDataTableInit);
