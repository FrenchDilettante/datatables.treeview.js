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

    this.api.on('draw', () => this.onDraw());
    this.prepareAllRows();

    table.on('click', '.dt-tree-toggle', event => this.onToggleClick(event));
  }

  collapse(parentRow) {
    this.expandIcon(parentRow);
    this.collapseChildRows(parentRow);
    parentRow.child.hide();
  }

  collapseAllRows() {
    this.api.rows().each((index, row) => this.collapse(this.api.row(row)));
  }

  collapseChildRows(parentRow) {
    if (parentRow.child()) {
      parentRow.child()
        .each((index, childRow) => this.collapse(this.api.row(childRow)));
    }
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

  createSpacer($cell, level) {
    for (let i = 0; i < level; i++) {
      $cell.prepend(this.options.spacer);
    }
    $cell.addClass(`dt-tree-level-${level}`);
  }

  expand(parentRow, level) {
    const rowData = parentRow.data();

    if (parentRow.child()) {
      this.collapseIcon(parentRow);
      parentRow.child.show();
    } else {
      this.showLoadingIcon(parentRow);
      this.options.getChildren(rowData, (children) => {
        const newRows = children.map(data => this.renderChildRow(parentRow, data, level).node());
        this.collapseIcon(parentRow);
        parentRow.child(newRows).show();
      });
    }
  }

  expandIcon(row) {
    if (this.options.collapseIcon) {
      const $toggle = $(row.node()).find('.dt-tree-toggle');
      this.renderIcon('expand')
        .data('dt-tree-level', $toggle.data('dt-tree-level'))
        .replaceAll($toggle);
    } else {
      $(row.node())
        .find('.dt-tree-toggle')
        .removeClass('expanded');
    }
  }

  firstVisibleColumn() {
    return this.api.column('0:visible');
  }

  isAlreadyProcessed() {
    return this.table.find('.dt-tree-toggle, .dt-tree-childless').length > 0;
  }

  onDraw() {
    if (!this.isAlreadyProcessed()) {
      this.prepareAllRows();
    } else {
      this.collapseAllRows();
    }
  }

  onToggleClick(event) {
    let $toggle = $(event.target);
    if (!$toggle.is('.dt-tree-toggle')) {
      $toggle = $toggle.parents('.dt-tree-toggle').first();
    }
    const row = this.api.row($toggle.parents('tr').first());
    this.toggleRow(row, $toggle.data('dt-tree-level'));
  }

  prepareAllRows() {
    this.firstVisibleColumn()
      .nodes()
      .to$()
      .each((index, element) => this.prepareSingleRow(element, this.api.row(index).data(), 0));
  }

  prepareSingleRow(cellElement, rowData, level) {
    const $el = $(cellElement);
    if (!this.options.hasChildren(rowData)) {
      $el.addClass('dt-tree-childless');
    } else {
      $el.prepend(this.renderIcon('expand', level));
    }
    this.createSpacer($el, level);
  }

  renderChildRow(parentRow, data, parentLevel) {
    const row = this.api.row.add(data);
    const cell = this.api.cell(row.index(), this.firstVisibleColumn().index()).node();
    this.prepareSingleRow(cell, data, parentLevel + 1);
    $(row.node()).detach();
    return row;
  }

  renderIcon(direction, level) {
    const icon = $(this.options[`${direction}Icon`]);
    icon.addClass('dt-tree-toggle')
      .data('dt-tree-level', level);
    return icon;
  }

  showLoadingIcon(row) {
    $(row.node()).find('.dt-tree-toggle').hide();
    const $cell = $(this.api.cell(row.index(), this.firstVisibleColumn().index()).node());
    if ($cell.find('.dt-tree-spacer').length > 0) {
      $cell.find('.dt-tree-spacer').last().after(this.options.loadingIcon);
    } else {
      $cell.prepend(this.options.loadingIcon);
    }
  }

  toggleRow(row, level) {
    if (row.child.isShown()) {
      this.collapse(row);
    } else {
      this.expand(row, level);
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
