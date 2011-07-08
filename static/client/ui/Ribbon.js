/**
 * @class App.ui.Ribbon
 * Provides tabbed, dynamic toolbar which responds to user selection
 * @extends Ext.TabPanel
 */
Ext.define('App.ui.Ribbon', {
	extend:'Ext.tab.Panel',
	requires: ['App.ui.ToolsTab','App.ui.InsertTab','App.ui.FillStrokeTab','App.ui.GeometryTab','App.ui.MetaTab'],
	plain: true,
	border: false,
	bodyBorder: true,
	tabPosition: 'bottom',
	initComponent: function() {
		Ext.applyIf(this, {
			activeTab: 0,
			defaults: {
				border: true,
			},
			tabBar: {
				border: false,
				bodyBorder: false,
			}
		});
		if(!this.items) {
			this.items = [new App.ui.ToolsTab({
				title: 'Tools',
				ref: 'toolsTab',
			}), new App.ui.InsertTab({
				title: 'Insert',
				ref: 'insertTab',
			}), new App.ui.FillStrokeTab({
				title: 'Fill and Stroke',
				ref: 'fillStroke'
			}), new App.ui.GeometryTab({
				title: 'Geometry',
				ref: 'geometry'
			}), new App.ui.MetaTab({
				title: 'Meta',
				ref: 'metaTab'
			})];
		}
		Ext.each(this.items, function(item) {
			Ext.applyIf(item, {
				border: false,
				bodyBorder: false,
			})
		});
		App.ui.Ribbon.superclass.initComponent.apply(this, arguments);

		_.each(['toolsTab', 'insertTab','fillStroke','geometry','metaTab'], function(item) {
			this[item] = this.down('*[ref='+item+']');
		},this);
		/*
		// Allow the tools tab to manage the workspace tool
		this.mon(this.toolsTab, 'toolChange', this.setActiveTool, this);
		this.mon(this.insertTab, 'toolChange', this.setActiveTool, this);
		*/

		// allow ribbon tabs to invoke actions on the workspace
		this.items.each( function(item) {
			item.ribbon = this;
			this.mon(item, 'action', this.doAction, this);

			// Allow the tools tabs to manage the workspace tool
			if(item.getActiveTool) {
				this.mon(item,'toolChange',this.setActiveTool,this);
				this.mon(item, 'save', this.saveWorkspace, this);
			}
		},
		this);

		// allow workspace to be saved
	},
	attachTo: function(workspace) {
		this.workspace = workspace;

		// bind ribbon to objects when selected in workspace
		this.mon(this.workspace, 'select', this.bind, this);
		this.mon(this.workspace, 'unselect', this.unbind, this);

	},
	setActiveTool: function(tool) {
		this.workspace.setActiveTool(tool);
	},
	/**
	 * doAction
	 * Invokes the passed {@link WorkspaceAction} on the {@link #workspace}
	 * @param {WorkspaceAction} action
	 */
	doAction: function(action) {
		var undoAction = action.getUndo();
		this.workspace.doAction(action);
	},
	/**
	 * bind
	 * Binds the ribbon to the passed items
	 * @param {Workspace.Object} item
	 */
	bind: function(item) {
		this.items.each( function(tab) {
			if (tab.bind && Ext.isFunction(tab.bind))
				tab.bind(item);
		});
	},
	/**
	 * unbind
	 * Unbinds the ribbon from the passed items
	 * @param {Workspace.Object} item
	 */
	unbind: function(item) {
		this.items.each( function(tab) {
			if (tab.unbind && Ext.isFunction(tab.unbind))
				tab.unbind(item);
		});
	},
	saveWorkspace: function() {
		this.canvas.saveWorkspace();
	}
})