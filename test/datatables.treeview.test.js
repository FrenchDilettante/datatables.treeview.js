describe('datatables.treeview.js', () => {
  let table, api, config, treeView, options;

  const { TreeView } = $.fn.dataTable;

  function renderTable() {
    return table = $('<table id="test-id"></table>')
      .appendTo('body')
      .dataTable(config);
  }

  beforeEach(() => {
    config = {
      columns: [
        {data: 'name', title: 'Name'},
        {data: 'age', title: 'Age'},
      ],
      data: [
        {name: 'Row 1', age: 41, children: [
          {name: 'Child 1', age: 2},
          {name: 'Child 2', age: 4},
        ]},
        {name: 'Row 2', age: 27},
      ],
    };

    api = renderTable().api();

    options = {
      hasChildren: jasmine.createSpy('hasChildren')
        .and.callFake(row => row.name === 'Row 1'),
      getChildren: jasmine.createSpy('getChildren')
        .and.callFake((row, callback) => callback(row.children)),
    };

    treeView = new TreeView(table, options);
  });

  afterEach(() => $('#test-grid').remove());

  it('should load the plugin', () => expect(TreeView).toBeDefined());

  it('should instantiate the tree view', () => expect(treeView).toBeDefined());

  it('should automatically instantiate the plugin if the config is present', () => {
    config.treeView = options;
    renderTable();
    expect(table.find('.dt-tree-toggle').length).not.toBe(0);
  });

  describe('collapse', () => {
    it('should hide the child rows and swap the icon', () => {
      const row = api.row(0);
      treeView.expand(row);
      treeView.collapse(row);
      expect(row.child.isShown()).toBe(false);
      const toggle = $(row.node()).find('.dt-tree-toggle');
      expect(toggle.text()).toBe('+');
      expect(toggle.is('.expanded')).toBe(false);
    });

    it('should keep the expand icon if collapse is set to null', () => {
      treeView.options.collapseIcon = null;
      const row = api.row(0);
      const toggle = $(row.node()).find('.dt-tree-toggle');
      treeView.expand(row);
      treeView.collapse(row);

      expect(toggle.text()).toBe('+');
      expect(toggle.is('.expanded')).toBe(false);
    });

    it('should collapse child rows as well', () => {
      spyOn(treeView, 'collapseChildRows');
      const row = api.row(0);
      treeView.expand(row);
      treeView.collapse(row);
      expect(treeView.collapseChildRows).toHaveBeenCalled();
      expect(treeView.collapseChildRows.calls.mostRecent().args[0].node())
        .toBe(row.node());
    });
  });

  describe('collapseAllRows', () => {
    it('should collapse all rows present in the table', () => {
      treeView.expand(api.row(0));
      treeView.collapseAllRows();
      expect(api.row(0).child.isShown()).toBe(false);
    });
  });

  describe('createSpacer', () => {
    function emptyCell() {
      return $('<td></td>');
    }

    it('should create spacers to match the level', () => {
      let $cell = emptyCell();
      treeView.createSpacer($cell, 0);
      expect($cell.is('.dt-tree-level-0')).toBe(true);
      expect($cell.find('.dt-tree-spacer').length).toBe(0);

      $cell = emptyCell();
      treeView.createSpacer($cell, 2);
      expect($cell.is('.dt-tree-level-2')).toBe(true);
      expect($cell.find('.dt-tree-spacer').length).toBe(2);
    });
  });

  describe('expand', () => {
    it('should create the child rows first', () => {
      const row = api.row(0);
      treeView.expand(row);

      expect(row.child.isShown()).toBe(true);
      const toggle = $(row.node()).find('.dt-tree-toggle');
      expect(toggle.text()).toBe('-');
      expect(toggle.is('.expanded')).toBe(true);
      expect(row.child().length).toBe(2);
    });

    it('should simply show the same row when expanding a second time', () => {
      const row = api.row(0);
      treeView.expand(row);
      treeView.collapse(row);

      // tag the row for tests purposes
      row.child()[0].childNodes[0].id = 'unique-id';

      treeView.collapse(row);
      treeView.expand(row);

      const toggle = $(row.node()).find('.dt-tree-toggle');
      expect(toggle.text()).toBe('-');
      expect(toggle.is('.expanded')).toBe(true);
      expect(row.child()[0].childNodes[0].id).toBe('unique-id');
    });

    it('should keep the expand icon if collapse is set to null', () => {
      treeView.options.collapseIcon = null;
      const row = api.row(0);
      const toggle = $(row.node()).find('.dt-tree-toggle');
      // tag the toggle for tests purposes
      toggle[0].id = 'unique-id';

      treeView.expand(row);

      expect(toggle.text()).toBe('+');
      expect(toggle.is('.expanded')).toBe(true);
      expect(toggle[0].id).toBe('unique-id');
    });
  });

  describe('firstVisibleColumn', () => {
    it('should return the first visible column', () => {
      expect(treeView.firstVisibleColumn().index()).toBe(0);
      api.column(0).visible(false);
      expect(treeView.firstVisibleColumn().index()).toBe(1);
    });
  });

  describe('isAlreadyProcessed', () => {
    it('should indicate that the rows have already been processed', () => {
      expect(treeView.isAlreadyProcessed()).toBe(true);

      // Manually remove the relevant markers
      table.find('.dt-tree-toggle').remove();
      table.find('.dt-tree-childless').removeClass('dt-tree-childless');

      expect(treeView.isAlreadyProcessed()).toBe(false);
    });
  });

  describe('onDraw', () => {
    beforeEach(() => {
      spyOn(treeView, 'isAlreadyProcessed');
      spyOn(treeView, 'prepareAllRows');
      spyOn(treeView, 'collapseAllRows');
    });

    it('should prepare rows if they are not already so', () => {
      treeView.isAlreadyProcessed.and.returnValue(false);
      treeView.onDraw();
      expect(treeView.prepareAllRows).toHaveBeenCalled();
      expect(treeView.collapseAllRows).not.toHaveBeenCalled();
    });

    it('should collapse all child rows if they were already prepared', () => {
      treeView.isAlreadyProcessed.and.returnValue(true);
      treeView.onDraw();
      expect(treeView.prepareAllRows).not.toHaveBeenCalled();
      expect(treeView.collapseAllRows).toHaveBeenCalled();
    });
  });

  describe('onToggleClick', () => {
    beforeEach(() => spyOn(treeView, 'toggleRow'));

    it('should extract information from the jQuery event object', () => {
      treeView.onToggleClick({
        target: table.find('tr:eq(1) .dt-tree-toggle')[0],
      });
      expect(treeView.toggleRow).toHaveBeenCalled();
      expect(treeView.toggleRow.calls.mostRecent().args[0].node())
        .toBe(api.row(0).node());
      expect(treeView.toggleRow.calls.mostRecent().args[1]).toBe(0);
    });

    it('should handle more complex toggle templates', () => {
      const $toggle = table.find('tr:eq(1) .dt-tree-toggle');
      $toggle.html('<span>click me</span>');
      treeView.onToggleClick({
        target: $toggle.children()[0],
      });
      expect(treeView.toggleRow).toHaveBeenCalled();
      expect(treeView.toggleRow.calls.mostRecent().args[0].node())
        .toBe(api.row(0).node());
    });
  });

  describe('showLoadingIcon', () => {
    it('should place the loading icon at the beginning of the cell', () => {
      const row = api.row(0);
      treeView.showLoadingIcon(row);
      expect($(row.node()).children()[0].innerHTML)
        .toBe(
          '<span class="dt-tree-loading">...</span>' +
          '<button class="dt-tree-toggle" style="display: none;">+</button>' +
          'Row 1');
    });

    it('should place the loading icon after the spacers', () => {
      const row = api.row(0);
      $(row.node()).children().first().prepend(treeView.options.spacer);
      treeView.showLoadingIcon(row);
      expect($(row.node()).children()[0].innerHTML)
        .toBe(
          '<span class="dt-tree-spacer"></span>' +
          '<span class="dt-tree-loading">...</span>' +
          '<button class="dt-tree-toggle" style="display: none;">+</button>' +
          'Row 1');
    });
  });

  describe('toggleRow', () => {
    it('should show, then hide, the child rows', () => {
      const row = api.row(0);

      treeView.toggleRow(row);
      expect(row.child.isShown()).toBe(true);

      treeView.toggleRow(row);
      expect(row.child.isShown()).toBe(false);
    });
  });
});
