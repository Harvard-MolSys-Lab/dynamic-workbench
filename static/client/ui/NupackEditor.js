/**
 * Allows editing of scripts for the NUPACK multi-objective designer
 */
Ext.define('App.ui.NupackEditor', {
	extend: 'App.ui.TextEditor',
	iconCls:'nupack',
	editorType: 'NUPACK',
	mode: 'nupack',
	alias: 'widget.nupack',
	requires: ['App.ui.SequenceThreader','App.ui.NupackMenu'],
	/**
	 * @cfg
	 * True to show the #nupackButton
	 */
	showNupackButton:true,
	/**
	 * @cfg
	 * True to show the edit button
	 */
	showEditButton:true,
	/**
	 * @cfg
	 * True to show the save button
	 */
	showSaveButton:true,
	
	dockedItems: [{
		xtype: 'cite',
		cite: 'zadeh_etal_2011',
	}],
	
	/**
	 * @cfg
	 * Enable additional multisubjective syntax
	 */
	multisubjective: false,
	
	initComponent: function() {
		if(this.multisubjective) {
			this.mode = {
				name: 'nupack',
				multisubjective: true,
			}
		}
		
		this.extraTbarItems = (this.extraTbarItems || []); 
		var tbar = this.extraTbarItems.concat([]);
		if(this.showNupackButton) {
			tbar.push({
				xtype: 'splitbutton',
				/**
				 * @property {Ext.button.Button} nupackButton
				 * Shows a menu allowing the user to open NUPACK
				 */
				ref :'nupackButton',
				text: 'Open NUPACK',
				iconCls: 'nupack-icon',
				handler: App.ui.Launcher.makeLauncher('nupack'),
				menu: Ext.create('App.ui.NupackMenu',{
					listeners : {
						'designwindow': {
							fn: this.populateDesignWindow,
							scope: this,
						}
					}
				}),
			});
		}
		if(this.showEditButton) {
			tbar.push({
				text: 'Edit',
				iconCls: 'pencil',
				/**
				 * @property {Ext.button.Button} editButton
				 * Shows a small edit menu
				 */
				ref: 'editButton',
				menu: [{
					text: 'Thread segments to sequences',
					handler: this.threadStrands
				},]
			})
		}
		if(this.showSaveButton) {
			tbar = tbar.concat(['->',Ext.create('App.ui.SaveButton',{
				app: this,
			})]);
		}
		Ext.apply(this, {
			tbar: tbar
		})
		this.callParent(arguments);
	},
	populateDesignWindow: function(menu,designWindow) {
		designWindow.updateDesign(this.getValue());
	},
	/**
	 * Opens a {@link App.ui.SequenceThreader sequence threader}, allowing the 
	 * user to thread together sequences based on a sequence specification into
	 * full strands.
	 */
	threadStrands: function() {
		var win = Ext.create('App.ui.SequenceThreader');
		win.show();
		win.setStrands(this.getSelection());
	},
}
)