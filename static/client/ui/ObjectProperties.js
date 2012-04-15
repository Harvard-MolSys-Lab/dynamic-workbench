/**
 * Allows creation and editing object properties
 * @extends App.ui.BoundObjectPanel
 */

Ext.define('App.ui.ObjectProperties', {
	extend : 'App.ui.BoundObjectPanel',
	/**
	 * @inheritdoc
	 */
	enableBoundFields : false,
	constructor : function() {
		App.ui.ObjectProperties.superclass.constructor.apply(this, arguments);
	},
	initComponent : function() {
		this.grid = Ext.create('Ext.grid.property.Grid', {
			border : false,
			bodyBorder : false,
			source : {},
			title : 'All Properties'
		});
		
		this.selection = [];
		
		/**
		 * @property {Workspace} workspace
		 * The attached {@link Workspace}.
		 */
		
		/**
		 * @property {Workspace.objects.Object[]}
		 */
		this.items = this.items || [];
		this.items.push(this.grid);

		Ext.apply(this, {
			title : 'Selected Object',
			layout : 'accordion',
		});
		this.callParent(arguments);
		// App.ui.ObjectProperties.superclass.initComponent.apply(this,arguments);
		this.grid.on('propertychange', this.onPropertyChange, this);
		this.boundObjectPanels = Ext.create('Ext.util.MixedCollection');
		this.boundObjectPanels.addAll(this.query('component[bind]'));
		this.boundObjectPanels.each(function(item) {
			this.mon(item, 'action', this.doAction, this);

			if(item.init) {
				item.init();
			}
		}, this);
	},
	/**
	 * Invokes the passed {@link Workspace.actions.Action} on the {@link #workspace}
	 * @param {Workspace.actions.Action} action
	 */
	doAction : function(action) {
		var undoAction = action.getUndo();
		this.workspace.doAction(action);
	},
	/**
	 * Called when the {@link Workspace#selection selection} of the {@link #workspace attached workspace} changes.
	 */
	onSelectionChange : function() {
		var toBind = _.difference(this.workspace.getSelection(),this.selection),
			toUnbind = _.difference(this.selection,this.workspace.getSelection());
		
		_.each(toBind,function(item) {
			this.bind(item);
		});
		_.each(toUnbind,function(item) {
			this.unbind(item);
		});
				
		// copy new items into this.selection
		this.selection = this.workspace.getSelection();
	},
	
	bind : function(obj) {
		this.unbind();
		this.boundObject = obj;
		this.boundObject.on('change', this.onObjectChange, this);
		this.grid.setSource(obj.getReadableHash());
		this.callParent(arguments);
		this.boundObjectPanels.each(function(panel) {
			panel.bind(obj);
		});
	},
	unbind : function(obj) {
		if(this.boundObject) {
			if((obj == this.boundObject) || (!obj)) {
				this.boundObject.un('change', this.onObjectChange, this);
				this.grid.setSource({});
				this.boundObject = false
			}
		}
		this.callParent(arguments);
		this.boundObjectPanels.each(function(panel) {
			panel.unbind(obj);
		});
	},
	onObjectChange : function(prop, val) {
		if(!this.ignore)
			this.grid.setProperty(prop, val, true);
	},
	onPropertyChange : function(src, prop, value) {
		if(this.boundObject) {
			this.ignore = true;
			this.boundObject.set(prop, value);
			this.ignore = true;
		}
	},
	/**
	 * Attaches to a particular {@link Workspace}.
	 * @param {Workspace} workspace
	 */
	attachTo : function(workspace) {
		this.workspace = workspace;

		// bind ribbon to objects when selected in workspace
		this.mon(this.workspace, 'select', this.bind, this, {
			buffer: 200,
		});
		this.mon(this.workspace, 'unselect', this.unbind, this, {
			buffer: 200,
		});

	},
})