/**
 * Allows editing of scripts for the Multisubjective sequence designer
 */
Ext.define('App.usr.ms.Editor', {
	extend: 'App.usr.text.Editor',
	iconCls:'ms-icon',
	editorType: 'MS',
	mode: 'nupack',
	alias: 'widget.multisubjectiveedit',
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
		cite: {
			authors: ['John P. Sadowski', 'Peng Yin'],
			title: 'Multisubjective: better nucleic acid design through fast identification and removal of undesired secondary structure',
			publication: 'Unpublished'
		},
	}],
	
	/**
	 * @cfg
	 * Enable additional multisubjective syntax
	 */
	multisubjective: false,
	
	initComponent: function() {
		this.mode = {
				name: 'nupack',
				multisubjective: true,
			}
		
		this.extraTbarItems = (this.extraTbarItems || []); 
		var tbar = this.extraTbarItems.concat([{
			text: 'Run Multisubjective',
			iconCls: 'ms-icon',
			handler: this.runMS,
			scope: this,
			xtype: 'splitbutton',
			menu:[{
				text: 'Clean',
				iconCls: 'clean',
				handler: this.clean,
				scope:this
			}]

		}]);
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
	runMS: function() {
		App.runTask('Multisubjective', {
			node: this.getDocumentPath(),
			action: 'default'
		});
	},
	clean: function() {
		App.runTask('Multisubjective', {
			node: this.getDocumentPath(),
			action: 'clean'
		});
	},	populateDesignWindow: function(menu,designWindow) {
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
})