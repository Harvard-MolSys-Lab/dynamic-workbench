Ext.define('App.ui.dd.SequenceWindow',{
	extend: 'Ext.window.Window',
	width: 800,
	height: 600,
	layout: 'fit',
	title: 'Add specific sequences to DD',
	closeAction: 'hide',
	value: '',
	initComponent: function() {
		this.sequenceEditor = Ext.create('App.ui.CodeMirror',{mode: 'sequence',border: false});
		Ext.apply(this,{
			items: [this.sequenceEditor],
			buttons: [{
				text: 'Add Domains',
				iconCls: 'tick',
				handler: this.addDomains,
				scope: this,
			}]
		});
		this.callParent(arguments);
		this.sequenceEditor.setValue(this.value);
	},
	addDomains: function() {
		this.designer.addDomains(this.sequenceEditor.getValue().split('\n'));
		this.close();
	}
})