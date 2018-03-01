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
      (event) => this.toggleRow(this.api.row($(event.target).parents('tr').first())));
  }

  collapse(parentRow) {
    this.expandIcon(parentRow);
    parentRow.child.hide();
  }

  collapseIcon(row) {
    $(row.node()).find('.dt-tree-loading').remove();
    if (this.options.collapseIcon) {
      this.renderIcon('collapse')
        .addClass('expanded')
        .replaceAll($(row.node()).find('.dt-tree-toggle'));
    } else {
      $(row.node())
        .find('.dt-tree-toggle')
        .addClass('expanded')
        .show();
    }
  }

  expand(parentRow) {
    const rowData = parentRow.data();

    if (parentRow.child()) {
      this.collapseIcon(parentRow);
      parentRow.child.show();
    } else {
      this.showLoadingIcon(parentRow);
      this.options.getChildren(rowData, parentRow.index(), (children) => {
        const newRows = children.map(data => this.renderChildRow(parentRow, data).node());
        this.collapseIcon(parentRow);
        parentRow.child(newRows).show();
      });
    }
  }

  expandIcon(row) {
    if (this.options.collapseIcon) {
      this.renderIcon('expand')
        .replaceAll($(row.node()).find('.dt-tree-toggle'));
    } else {
      $(row.node())
        .find('.dt-tree-toggle')
        .removeClass('expanded');
    }
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
        if (!this.options.hasChildren(rowData, index)) {
          $el.addClass('dt-tree-childless');
        } else {
          $el.prepend(this.renderIcon('expand'));
        }
      });
  }

  renderChildRow(parentRow, data) {
    const row = this.api.row.add(data);
    const cell = this.api.cell(row.index(), this.firstVisibleColumn().index()).node();
    $(cell).prepend(this.options.spacer);
    $(row.node()).detach();
    return row;
  }

  renderIcon(direction) {
    const icon = $(this.options[`${direction}Icon`]);
    icon.addClass('dt-tree-toggle');
    return icon;
  }

  showLoadingIcon(row) {
    $(row.node()).find('.dt-tree-toggle').hide();
    $(this.api.cell(row.index(), this.firstVisibleColumn().index()).node())
      .prepend(this.options.loadingIcon);
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
  spacer: '<span class="dt-tree-spacer"></span>',
  expandIcon: '<button>+</button>',
  collapseIcon: '<button>-</button>',
  loadingIcon: '<span class="dt-tree-loading">...</span>',
};

$.fn.dataTable.TreeView = $.fn.DataTable.TreeView = TreeView;
$(document).on('init.dt.dtr', TreeView.onDataTableInit);
