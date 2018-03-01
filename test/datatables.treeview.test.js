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
        .and.callFake((row, index, callback) => callback(row.children)),
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
