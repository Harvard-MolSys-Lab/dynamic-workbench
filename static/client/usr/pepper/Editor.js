/**
 * Allows editing of Pepper scripts.
 */
Ext.define('App.usr.pepper.Editor', {
	extend: 'App.usr.text.Editor',
	title: 'Pepper',
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
						node: this.getDocumentPath()
					});
				},
				scope: this,
			}]
		});
		this.callParent(arguments);
	}
});