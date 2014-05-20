/**
 * Allows editing of PIL scripts.
 */
Ext.define('App.usr.pepper.PilEditor', {
	extend: 'App.usr.text.Editor',
	requires: ['App.usr.enum.RunButton', 'App.ui.ConvertButton'],
	title: 'PIL',
	initComponent: function() {
		Ext.applyIf(this, {
			tbar: [
			Ext.create('App.usr.enum.RunButton',{app: this}),
			Ext.create('App.ui.ConvertButton',{app:this, fromMode: 'pil'}),
			 '->', Ext.create('App.ui.SaveButton', {
				app: this
			})]
		});
		this.callParent(arguments);
	}
});