/**
 * @class App.usr.canvas.Ribbon
 * Provides tabbed, dynamic toolbar which responds to user selection
 * @extends Ext.tab.Panel
 */
Ext.define('App.usr.canvas.Ribbon', {
	extend : 'Ext.tab.Panel',
	alias : 'widget.ribbon',
	requires : ['App.usr.canvas.ToolsTab', 'App.usr.canvas.InsertTab', 'App.usr.canvas.FillStrokeTab', 'App.usr.canvas.GeometryTab', 'App.usr.canvas.MetaTab'],

	cls : 'ui-ribbonbar',
	activeTab : 0,
	plain : true,
	//    unstyled: true,
	margin : '5 0 0 0',
	autoHeight : true,
	// plain : true,
	border : false,
	bodyBorder : '0 1 1 1',
	bodyCls : 'noborder-top',
	autoHeight : true,
	//tabPosition : 'bottom',
	initComponent : function() {

		Ext.applyIf(this, {
			activeTab : 0,
			defaults : {
				border : false,
				bodyBorder : false,
				bodyCls : 'tab-panel-body-toolbar'
			},
			tabBar : {
				border : false,
				bodyBorder : false,
			}
		});
		if(!this.items) {
			this.items = [new App.usr.canvas.ToolsTab({
				title : 'Tools',
				ref : 'toolsTab',
			}), new App.usr.canvas.InsertTab({
				title : 'Insert',
				ref : 'insertTab',
			}), new App.usr.canvas.FillStrokeTab({
				title : 'Fill and Stroke',
				ref : 'fillStroke'
			}), new App.usr.canvas.GeometryTab({
				title : 'Geometry',
				ref : 'geometry'
			}), new App.usr.canvas.MetaTab({
				title : 'Meta',
				ref : 'metaTab'
			})];
		}
		Ext.each(this.items, function(item) {
			Ext.applyIf(item, {
				border : false,
				bodyBorder : false,
			})
		});

		this.selection = [];

		App.usr.canvas.Ribbon.superclass.initComponent.apply(this, arguments);

		_.each(['toolsTab', 'insertTab', 'fillStroke', 'geometry', 'metaTab'], function(item) {
			this[item] = this.down('*[ref=' + item + ']');
		}, this);


		// allow ribbon tabs to invoke actions on the workspace
		this.items.each(function(item) {
			item.ribbon = this;
			this.mon(item, 'action', this.doAction, this);

			// Allow the tools tabs to manage the workspace tool
			if(item.getActiveTool) {
				this.mon(item, 'toolchange', this.setActiveTool, this);
				this.mon(item, 'save', this.saveWorkspace, this);
			}

			if(item.init) {
				item.init();
			}
		}, this);
		// allow workspace to be saved
	},
	/**
	 * Attaches this ribbon to a particular workspace
	 * @param {Workspace} workspace
	 */
	attachTo : function(workspace) {
		/**
		 * @property {Workspace}
		 * The workspace to which this ribbon is attached. The ribbon will monitor for selection events
		 * in this workspace and notify associated child {@link #items} appropriately.
		 */
		this.workspace = workspace;

		// bind ribbon to objects when selected in workspace
		this.mon(this.workspace, 'select', this.onSelectionChange, this, {
			buffer : 500,
		});
		this.mon(this.workspace, 'unselect', this.onSelectionChange, this, {
			buffer : 500,
		});
		this.mon(this.workspace, 'toolchange', this.onToolChange, this, {
			buffer : 500,
		})

	},
	/**
	 * Sets the active tool
	 * @param {String} tool Name of the {@link Workspace.tools.BaseTool} to switch to.
	 */
	setActiveTool : function(tool) {
		this.ignoreToolChange = true;
		this.workspace.setActiveTool(tool);
		this.ignoreToolChange = false;
	},
	onToolChange : function(tool, oldTool) {
		if(!this.ignoreToolChange) {
			var activate = [];
			this.items.each(function(item) {
				if(item.onToolChange) {
					if(item.onToolChange(tool, oldTool)) {
						activate.push(item);
					};
				}
			});
			if(activate.length == 1) {
				this.setActiveTab(activate[0]);
			} else if (activate.length > 1) {
				// meeeeh	
				this.setActiveTab(activate[0]);
			}
		}
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
	 * Handler which responds to a changed {@link #workspace workspace} {@link Workspace#selection}.
	 */
	onSelectionChange : function() {
		var toBind = _.difference(this.workspace.getSelection(), this.selection), toUnbind = _.difference(this.selection, this.workspace.getSelection());

		this.bind(toBind);
		this.unbind(toUnbind);

		// copy new items into this.selection
		this.selection = this.workspace.getSelection();
	},

	/**
	 * Binds the ribbon to the passed items
	 * @param {Workspace.objects.Object} item
	 */
	bind : function(items) {
		if(!_.isArray(items)) {
			items = [items];
		}

		// for each ribbon tab
		this.items.each(function(tab) {
			if(tab.bind && Ext.isFunction(tab.bind)) {

				// for each newly selected item
				_.each(items, function(item) {
					tab.bind(item);
				});
			}
		});

	},
	/**
	 * Unbinds the ribbon from the passed items
	 * @param {Workspace.objects.Object} item
	 */
	unbind : function(items) {
		if(!_.isArray(items)) {
			items = [items];
		}

		this.items.each(function(tab) {
			if(tab.unbind && Ext.isFunction(tab.unbind)) {
				// for each newly unselected item
				_.each(items, function(item) {
					tab.unbind(item);
				});
			}
		});
	},
	saveWorkspace : function() {
		this.canvas.saveWorkspace();
	}
});

// /**
// * @class App.lib.ux.Ribbon
// * @extend Ext.tab.Panel
// */
// Ext.define('App.lib.ux.Ribbon', {
// extend: 'Ext.tab.Panel',
// alias: 'widget.appuxribbon',
// cls: 'ui-ribbonbar',
// activeTab: 0,
// plain: true,
// unstyled: true,
// margin: '5 0 0 0',
// autoHeight: true,
//
// addTab: function (config, focus) {
// var tab = this.add(config);
// if (focus === true) this.setActiveTab(tab);
// },
//
// initComponent: function () {
// this.callParent(arguments);
// }
// });