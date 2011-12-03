Ext.define('App.ui.secondary.HomeTab', {
	extend: 'App.ui.ToolsTab',
	alias: 'widget.secondary-hometab',
	generateConfig: function() {
		return {
			dockedItems: [{
				xtype:'toolbar',
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
					title: 'Domains',
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
						toolName: 'strand',
						iconCls: 'polyline',
						text: 'Strand',
						rowspan: 1,
						tooltip: {
							title: 'Strand',
							text: 'Click to begin drawing a strand. While drawing, click to indicate a boundary between domains. Double-click to finish.',
						},
					},{
						enableToggle: true,
						toggleGroup: 'toolbox',
						iconCls: 'line',
						toolName: 'domain',
						text: 'Domain',
						rowspan: 1,
						tooltip: {
							title: 'Domain',
							text: 'TBD.'
						}
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
				},'->',{

					// 'Workspace' group
					xtype: 'buttongroup',
					title: 'Workspace',
					columns: 1,
					defaults: {
						// cellCls: 'table-cell-padded'
					},
					items: [{
						scale: 'small',
						iconCls: 'save',
						text: 'Save',
						rowspan: 1,
						//iconAlign: 'top',
						handler: this.saveWorkspace,
						scope: this,
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
			}]
		}
	},
});