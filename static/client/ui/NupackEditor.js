Ext.define('App.ui.NupackEditor', {
	extend: 'App.ui.TextEditor',
	iconCls:'nupack',
	editorType: 'NUPACK',
	mode: 'nupack',
	showNupackButton:true,
	showEditButton:true,
	showSaveButton:true,
	initComponent: function() {
		this.extraTbarItems = (this.extraTbarItems || []); 
		var tbar = this.extraTbarItems.concat([]);
		if(this.showNupackButton) {
			tbar.push({
				xtype: 'splitbutton',
				text: 'Open NUPACK',
				iconCls: 'nupack-icon',
				handler: App.ui.Launcher.makeLauncher('nupack'),
				menu: new App.ui.NupackMenu({}),
			});
		}
		if(this.showEditButton) {
			tbar.push({
				text: 'Edit',
				iconCls: 'pencil',
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
	threadStrands: function() {
		var win = new App.ui.SequenceThreader();
		win.show();
		win.setStrands(this.getSelection());
	},
	getSelection: function() {
		return this.editor.codemirror.getSelection();
	},
}
)