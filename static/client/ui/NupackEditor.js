Ext.define('App.ui.NupackEditor', {
	extend: 'App.ui.TextEditor',
	iconCls:'nupack',
	editorType: 'NUPACK',
	mode: 'nupack',
	initComponent: function() {
		Ext.apply(this, {
			tbar: [{
				xtype: 'splitbutton',
				text: 'Open NUPACK',
				iconCls: 'nupack-icon',
				handler: App.ui.Launcher.makeLauncher('nupack'),
				menu: new App.ui.NupackMenu({}),
			},{
				text: 'Edit',
				iconCls: 'pencil',
				menu: [{
					text: 'Thread segments to sequences',
					handler: this.threadStrands
				},]
			},'->',{
				text: 'Save',
				iconCls: 'save',
				handler: function() {
					this.saveFile();
				},
				scope: this,
			}]
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