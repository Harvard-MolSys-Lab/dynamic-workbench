Ext.define('App.ui.SequenceWindow',{
	extend: 'Ext.window.Window',
	width: 600,
	height: 500,
	layout: 'border',
	bodyBorder: false,
	border: false,
	title: 'Add sequences',
	closeAction: 'hide',
	buttonText: 'Add Sequences',
	buttonIconCls: 'tick',
	value: '',
	helpIcon: 'help',
	helpText: 'Type sequences in any format (NUPACK, FASTA, Multisubjective), with or without names',
	handler: function(domains,value) {
	},
	initComponent: function() {
		this.sequenceEditor = Ext.create('App.ui.CodeMirror',{mode: 'sequence',border: false,region:'center'});
		Ext.apply(this,{
			items: [{
				html: this.helpText,
				frame: true,
				region: 'north',
			},this.sequenceEditor],
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
		var data = this.getValue(),
			domains = DNA.parseNamedSequences(data);
		if(this.scope) { this.handler.call(this.scope,data); }
		else { this.handler(domains,data); }
		this.close();
	},
	setValue: function(value) {
		this.sequenceEditor.setValue(value);
	},
	getValue: function() {
		return this.sequenceEditor.getValue();
	}
})