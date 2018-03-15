# datatables.treeview.js

[DataTables](https://datatables.net/) plugin to display child rows.

## Installation

```
$ npm install datatables.treeview --save
```

Add `node_modules/datatables.treeview/datatables.treeview.js` to your files.

## Usage

```javascript
$().dataTables({
  treeView: {
    hasChildren: row => row.children.length > 0,
    getChildren: (row, callback) => callback(row.children),
  },
  /* ... */
});
```

With custom options:
```javascript
$().dataTables({
  treeView: {
    loadingIcon: '<svg>...</svg>',
  },
  /* ... */
});
```

Each child row will be prepended with a spacer that you have to style.

For instance:
```css
.dt-tree-spacer {
  margin-left: 12px;
}
```

## Available options

* `spacer` appended at the start of each child row
* `expandIcon` default + icon
* `collapseIcon` if null, will not change the toggle element, but simply add a CSS class to it
* `loadingIcon` shows until data comes back

You can change the default options by altering `$.fn.dataTable.TreeView.defaultOption`.

## Make changes

**DO NOT** make any change to `datatables.treeview.js` directly. It is compiled from `src/`.

Use the following commands:

* `gulp build` compiles all source files (once)
* `gulp demo` runs the demo server and compiles for any change
* `gulp lint` checks for linting
* `npm test` runs tests once
* `npm run test:watch` run tests + karma server
