describe('datatables.treeview.js', () => {
  let table, api, config, treeView;

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

    treeView = new TreeView(table);
  });

  afterEach(() => $('#test-grid').remove());

  it('should load the plugin', () => expect(TreeView).toBeDefined());

  it('should instantiate the tree view', () => expect(treeView).toBeDefined());

  it('should automatically instantiate the plugin if the config is present', () => {
    config.treeView = true;
    renderTable();
    expect(table.find('.dt-tree-toggle').length).not.toBe(0);
  });

  describe('collapse', () => {
    it('should hide the child rows and swap the icon', () => {
      const row = api.row(0);
      treeView.expand(row);
      treeView.collapse(row);
      expect(row.child.isShown()).toBe(false);
      expect($(row.node()).find('.dt-tree-toggle').text()).toBe('+');
    });
  });

  describe('expand', () => {
    it('should create the child rows first', () => {
      const row = api.row(0);
      treeView.expand(row);

      expect(row.child.isShown()).toBe(true);
      expect($(row.node()).find('.dt-tree-toggle').text()).toBe('-');
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

      expect($(row.node()).find('.dt-tree-toggle').text()).toBe('-');
      expect(row.child()[0].childNodes[0].id).toBe('unique-id');
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
