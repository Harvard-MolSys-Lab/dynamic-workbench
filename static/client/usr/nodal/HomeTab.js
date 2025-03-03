/**
 * @class App.usr.nodal.HomeTab
 * Contains basic toolbox and actions for the {@link App.usr.nodal.Canvas Nodal canvas}
 */
Ext.define('App.usr.nodal.HomeTab', {
	extend: 'App.usr.canvas.ToolsTab',
	alias: 'widget.nodal-hometab',
	requires: ['Workspace.DDManager','Workspace.actions.UnwrapObjectsAction',],
	generateConfig: function() {
		return {
			// dockedItems: [{
				// 'xtype': 'toolbar',
				defaults: {
					xtype: 'buttongroup',
					headerPosition: 'bottom',
					margins: '3 0 5 3',
				},
				// setHeight: function(h) {
					// return this.callParent([h+1]);
				// },
				//border: false,
				items:[{
					// 'Tools' group
					xtype: 'buttongroup',
					title: 'Tools',
					columns: 2,
					defaults: {
						// cellCls: 'table-cell-padded'
					},
					items: [{
						iconCls: 'cursor-icon',
						enableToggle: true,
						toggleGroup: 'toolbox',
						toolName: 'pointer',
						pressed: true,
						tooltip: {
							title: 'Pointer Tool',
							text: 'Select, move, and resize objects. Click objects or drag boxes around them to select. Grab and drag to move. Drag hangles to resize (objects without handles can\'t be resized).'
						}
					},{
						iconCls: 'pencil',
						enableToggle: true,
						toggleGroup: 'toolbox',
						toolName: 'pencil',
						tooltip: {
							title: 'Pencil Tool',
							text: 'Draw freehand objects. Click and drag to start drawing; release to finish.'
						}
					},{
						iconCls: 'text-icon',
						enableToggle: true,
						toggleGroup: 'toolbox',
						toolName: 'textbox',
						tooltip: {
							title: 'Text Tool',
							text: 'Enter and edit text. Click or click and drag to insert a textbox. Click a textbox to edit text.'
						}
					},{
						iconCls: 'math-icon',
						toggleGroup: 'toolbox',
						enableToggle: true,
						toolName: 'math',
						tooltip: {
							title: 'Equations',
							text: 'Insert mathematical equations. Click and drag to draw an equation box.'
						}
					},]
				},{
					xtype: 'buttongroup',
					title: 'Nodes',
					columns: 2,
					defaults: {
						// cellCls: 'table-cell-padded'
					},
					items: [{
						enableToggle: true,
						toggleGroup: 'toolbox',
						toolName: 'complementarity',
						rowspan: 2,
						scale: 'medium',
						iconCls: 'arrow-24',
						iconAlign: 'top',
						text: 'Connect',
						tooltip: {
							title: 'Complementarity',
							text: 'Indicate complementary ports. Click and drag from an output port to an input port to create a complementarity relationship.'
						}
					},{
						enableToggle: true,
						toggleGroup: 'toolbox',
						toolName: 'node',
						iconCls: 'node-add',
						text: 'Add Node',
						rowspan: 1,
						tooltip: {
							title: 'Node',
							text: 'Click to add a new node with no ports',
						},
					},{
						enableToggle: true,
						toggleGroup: 'toolbox',
						iconCls: 'port-add',
						toolName: 'port',
						text: 'Add Port',
						rowspan: 1,
						tooltip: {
							title: 'Add Port',
							text: 'Click on a node to add an input port. Hold alt and click to create an output port.'
						}
					}]
				},{
					xtype: 'buttongroup',
					title: 'Motif',
					columns: 2,
					items: [{
						toolName: 'motif',
						enableToggle: true,
						toggleGroup: 'toolbox',
						scale: 'medium',
						rowspan: 2,
						iconAlign: 'top',
						iconCls: 'wrap-motif',
						text: 'Create Motif',
						tooltip: {
							title: 'Create Motif',
							text: 'Click on the workspace to create an empty motif, or click and drag to group nodes into a motif. '+
							'Your new motif will show up in the "Custom" tab of the motifs panel on the left; drag and drop it onto '+
							'the workspace to create a new node of your motif. If you make an empty motif, you can enter custon DyNAML '+
							'to define your motif. '
						}
					},{
						toolName: 'exposure',
						enableToggle: true,
						toggleGroup: 'toolbox',
						iconCls: 'port-expose',
						text: "Expose port",
						tooltip: {
							title: 'Expose Port',
							text: 'Click and drag from a port within a motif to the motif itself to "expose" that port as an input, output, or '+
							'bridge into the motif. When you create a node with your motif, you\'ll only be able to assign complementarities to '+
							'ports which have been exposed. '
						}
					},{
						iconCls: 'unwrap-motif',
						text: 'Unwrap motif',
						tooltip: {
							title: 'Destroy motif',
							text: 'Unwraps and destroys the selected motif(s). If there are nodes within the motif, those nodes will be re-added to the '+
							'workspace as regular nodes. If you wrote custom DyNAML within the motif, it will disappear, so be careful!'
						},
						handler: this.unwrapObjects,
						scope: this,
					}]
				},{

					// 'Object' group
					xtype: 'buttongroup',
					title: 'Object',
					columns: 2,
					defaults: {
						// cellCls: 'table-cell-padded'
					},
					items: [{
						scale: 'medium',
						rowspan: 2,
						iconAlign: 'top',
						iconCls: 'delete-24',
						text: 'Delete',
						handler: this.deleteObjects,
						scope: this,
						tooltip: {
							title: 'Delete',
							text: 'Deletes the selected objects.'
						},
						enableIf: function(com,bound) {
							return bound.getCount()>0;
						}
					},/*{
					 ref: '../../nameField',
					 // fieldLabel: 'Name',
					 objectBinding: 'name',
					 xtype: 'textfield',
					 width: 175,
					 tooltip: {
					 title: 'Name',
					 text: 'The object\'s name'
					 },
					 },{
					 ref: '../../typeField',
					 xtype: 'combo',
					 objectBinding: 'wtype',
					 store: Workspace.Components.getTypeStore(),
					 tpl: new Ext.XTemplate(
					 '<tpl for="."><div class="x-combo-list-item">',
					 '<img src="' + Ext.BLANK_IMAGE_URL + '" class="combo-icon {iconCls}" />&nbsp;<span>{wtype}</span>',
					 '</div></tpl>'
					 ),
					 valueField: 'wtype',
					 displayField: 'wtype',
					 typeAhead: true,
					 mode: 'local',
					 forceSelection: true,
					 triggerAction: 'all',
					 selectOnFocus: true,
					 width: 175,
					 tooltip: {
					 title: 'Type',
					 text: 'The object type.'
					 }
					 }*/]
				},{xtype:'tbfill'},{

					// 'Workspace' group
					xtype: 'buttongroup',
					title: 'Workspace',
					columns: 2,
					defaults: {
						// cellCls: 'table-cell-padded'
					},
					items: [
					// Ext.create('App.ui.SaveButton',{
					// 	app: this.ribbon.app,
					// }),
					{
						scale: 'small',
						iconCls: 'save-24',
						text: 'Save',
						scale: 'medium',
						rowspan: 2,
						iconAlign: 'top',
						handler: this.saveWorkspace,
						scope: this,
					},{
						text : 'Help',
						iconCls : 'help',
						handler : App.ui.Launcher.makeLauncher('help:nodal'),
					},{
						scale: 'small',
						iconCls: 'expand',
						text: 'Expand',
						rowspan: 1,
						//iconAlign: 'top',
						handler: this.expandWorkspace,
						scope: this,
					}]
				},]
			// }]
		}
	},
		/**
	 * Generates a WorkspaceAction to decouple the bound objects from their parent(s)
	 */
	unwrapObjects: function() {
		var action = new Workspace.actions.UnwrapObjectsAction({
			subjects: this.boundObjects.getRange()
		});
		this.fireEvent('action', action);
	},
},function() {

});

