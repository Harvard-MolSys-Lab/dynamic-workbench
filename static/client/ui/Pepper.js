Ext.define('App.ui.Pepper', {
	extend: 'App.ui.TextEditor',
	initComponent: function() {
		Ext.applyIf(this, {
			tbar: [{
				text: 'Save',
				iconCls: 'save',
				handler: function() {
					this.saveFile();
				},
				scope: this,
			},{
				text: 'Compile',
				iconCls: 'compile',
				handler: function() {
					App.runTask('Pepper', {
						node: this.getPath()
					});
				},
				scope: this,
			}]
		});
		this.callParent(arguments);
	}
});