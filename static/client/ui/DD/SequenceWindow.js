Ext.define('App.ui.dd.SequenceWindow',{
	extend: 'Ext.window.Window',
	width: 800,
	height: 600,
	layout: 'fit',
	title: 'Add specific sequences to DD',
	closeAction: 'hide',
	buttonText: 'Add Domains',
	buttonIconCls: 'tick',
	value: '',
	handler: function(value) {
		this.designer.addDomains(value.split('\n'));
	},
	initComponent: function() {
		this.sequenceEditor = Ext.create('App.ui.CodeMirror',{mode: 'sequence',border: false});
		Ext.apply(this,{
			items: [this.sequenceEditor],
			buttons: [{
				text: this.buttonText,
				iconCls: this.buttonIconCls,
				handler: this.addDomains,
				scope: this,
			}]
		});
		this.callParent(arguments);
		this.sequenceEditor.setValue(this.value);
	},
	addDomains: function() {
		var data = this.getValue();
		if(this.scope) { this.handler.call(this.scope,data); }
		else { this.handler(data); }
		this.close();
	},
	setValue: function(value) {
		this.sequenceEditor.setValue(value);
	},
	getValue: function() {
		return this.sequenceEditor.getValue();
	}
})