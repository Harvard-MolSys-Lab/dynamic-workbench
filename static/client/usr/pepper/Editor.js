/**
 * Allows editing of Pepper scripts.
 */
Ext.define('App.usr.pepper.Editor', {
	extend: 'App.usr.text.Editor',
	title: 'Pepper',
	initComponent: function() {
		this.argsField = Ext.create('Ext.form.field.Text',{
			indent: true,
			allowBlank:true
		});
		Ext.applyIf(this, {
			tbar: [{
				text: 'Compile',
				iconCls: 'compile',
				xtype: 'splitbutton',
				menu: [{
					text: 'Arguments:',
					canActivate: false,
				},this.argsField,{
					text: 'Compile',
					iconCls: 'compile',
					handler: this.runPepper,
					scope: this
				}],
				handler: this.runPepper,
				scope: this,
			},'->',{
				text: 'Help',
				iconCls: 'help',
				handler: App.ui.Launcher.makeLauncher('help:pepper'),
			}, Ext.create('App.ui.SaveButton',{
				text: 'Save',
				iconCls: 'save',
				app: this,
			})]
		});
		this.callParent(arguments);
	},
	runPepper: function() {
		App.runTask('Pepper', {
			node: this.getDocumentPath(),
			args: this.argsField.getValue()
		});
	}
});