/**
 * @class App.ui.ObjectTree
 * Displays a tree of objects in the workspace, grouped heirarchically
 */
Ext.define('App.ui.ObjectTree', {
	extend: 'Ext.tree.TreePanel',
	useArrows: true,
	initComponent: function() {
		// Ext.apply(this, {
		// selModel: new Ext.tree.MultiSelectionModel()
		// });
		App.ui.ObjectTree.superclass.initComponent.apply(this, arguments);
		//this.editor = new Ext.tree.TreeEditor(this);
		//this.editor.on('complete', this.onEditName, this);
	},
	/**
	 * attachTo
	 * Links this tree to the passed {@link Workspace}
	 * @param {Workspace} workspace
	 */
	attachTo: function(workspace) {
		this.workspace = workspace;
		this.mon(this.workspace, 'instantiate', this.onCreate, this);
		this.mon(this.workspace, 'initialize', this.bindParent, this);
		this.mon(this.workspace, 'select', this.onWorkspaceSelect, this);
		this.mon(this.workspace, 'unselect', this.onWorkspaceUnselect, this);
		this.mon(this.workspace, 'destroy', this.onObjectDestroy, this);
		var sm = this.getSelectionModel();
		sm.on('selectionchange', this.onSelect, this);
	},
	/**
	 * Finds a node in the tree for the passed object
	 * @param {Workspace.Object} item
	 * @return {Ext.tree.Node} node
	 */
	findNodeForObject: function(item) {
		if (item && item.getId) {
			// true to search deeply
			return this.findNodeForId(item.getId());
		}
		return false;
	},
	/**
	 * Finds a node in the tree for the passed object id
	 * @param {String} id
	 * @return {Ext.tree.Node} node
	 */
	findNodeForId: function(id) {
		// true to search deeply
		return this.getStore().getRootNode().findChild('id', id, true);
	},
	/**
	 * Finds an object in the configured workspace corresponding to the passed node
	 * @param {Ext.tree.Node} node
	 */
	getObjectFromNode: function(node) {
		return this.workspace.getObjectById(node.id);
	},
	/**
	 * onEditName
	 * callback invoked by tree editor after a node's text has been edited; sets the name of the requisite object
	 * @param {Ext.tree.TreeEditor} editor
	 * @param {Object} value
	 */
	onEditName: function(editor, value) {
		var o = this.getObjectFromNode(this.editor.editNode);
		o.set('name', value);
	},
	/**
	 * onSelect
	 * callback invoked by the selection model after the selection has been changed; updates the workspace selection to match
	 * @param {Object} sm
	 * @param {Object} nodes
	 */
	onSelect: function(sm, nodes) {
		if (!this.ignoreSelectionChange) {
			this.ignoreSelectionChange = true;
			var toSelect = [];
			Ext.each(nodes, function(node) {
				toSelect.push(this.workspace.getObjectById(node.id));
			},
			this);
			this.workspace.setSelection(toSelect);
			this.ignoreSelectionChange = false;
		}
	},
	/**
	 * onWorkspaceSelect
	 * listener invoked by the workspace when its selection changes; updates the tree's selection to match
	 * @param {Workspace.Object} item
	 */
	onWorkspaceSelect: function(item) {
		if (!this.ignoreSelectionChange) {
			this.ignoreSelectionChange = true;
			var n = this.findNodeForObject(item);
			if (n) {
				this.getSelectionModel().select(n,true);
			}
			this.ignoreSelectionChange = false;
		}
	},
	/**
	 * onWorkspaceUnselect
	 * listener invoked by the workspace when its selection changes; updates the tree's selection to match
	 * @param {Workspace.Object} item
	 */
	onWorkspaceUnselect: function(item) {
		if (!this.ignoreSelectionChange) {
			this.ignoreSelectionChange = true;
			var n = this.findNodeForObject(item);
			if (n) {
				this.getSelectionModel().deselect(n,true);
			}
			this.ignoreSelectionChange = false;
		}
	},
	/**
	 * onCreate
	 * listener invoked by the workspace when an object is constructed; builds a node for it in the tree
	 * @param {Workspace.Object} obj
	 */
	onCreate: function(obj) {
		var parentNode;

		if (obj.hasParent()) {
			parentNode = this.findNodeForObject(obj.getParent());
		}
		if(!parentNode) {
			parentNode = this.getRootNode();
		}

		if (parentNode) {
			parentNode.appendChild({
				text: obj.get('name'),
				id: obj.getId(),
				iconCls: obj.get('iconCls'),
				editable: true
			});
		}
		obj.on('change', this.onChange, this);
	},
	bindParent: function(obj) {
		var node = this.findNodeForObject(obj),
		parentNode = this.findNodeForObject(obj.getParent());
		if (parentNode) {
			node.remove(false);
			parentNode.appendChild(node);
		}
	},
	/**
	 * onObjectDestroy
	 * listener invoked by the workspace when an object is constructed; builds a node for it in the tree
	 * @param {Workspace.Object} obj
	 */
	onObjectDestroy: function(obj) {
		var node = this.findNodeForObject(obj);
		if (node) {
			node.remove();
			node.destroy();
		}
		obj.un('change', this.onChange, this);
	},
	/**
	 * onChange
	 * listener invoked by an object when one of its properties is changed; updates the tree to match
	 * @param {String} prop
	 * @param {Mixed} value
	 * @param {Workspace.Object} obj
	 */
	onChange: function(prop, value, old, obj) {
		if (!this.ignoreChange && obj && obj.getId) {
			if (prop == 'name') {
				var node = this.findNodeForObject(obj);
				if (node) {
					node.set('text',value);
				}
			} else if (prop == 'parent') {
				var node = this.findNodeForObject(obj),
				parentNode = this.findNodeForObject(obj.getParent());
				if (parentNode) {
					node.remove(false);
					parentNode.appendChild(node);
				}
			}
		}
	},
})