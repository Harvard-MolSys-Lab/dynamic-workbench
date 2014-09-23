/**
 * Displays a window allowing the user to enter text
 */
Ext.define('App.ui.EditorWindow',{
	extend: 'Ext.window.Window',
	width: 600,
	height: 500,
	layout: 'border',
	bodyBorder: false,
	border: false,
	closeAction: 'hide',
	buttonText: 'Save',
	buttonIconCls: 'tick',
	value: '',
	helpIcon: 'help',
	helpText: '',
	mode: 'text',
	trackSaves: false,
	buttonHandler: function() {
		
	},
	initComponent: function() {
		this.editor = Ext.create('App.ui.CodeMirror',{mode: this.mode,border: false,region:'center'});
		Ext.apply(this,{
			items: [{
				html: this.helpText,
				frame: true,
				region: 'north',
			},this.editor],
			buttons: [{
				text: this.buttonText,
				iconCls: this.buttonIconCls,
				handler: this.buttonHandler,
				scope: this,
			}]
		});
		this.callParent(arguments);
		this.editor.setValue(this.value);
	},
	setValue: function(value) {
		this.editor.setValue(value);
	},
	getValue: function() {
		return this.editor.getValue();
	}
})