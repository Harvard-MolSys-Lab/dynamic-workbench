/**
 * Displays a window allowing the user to enter sequences in a flexible input format, based on {@link DNA#parseNamedSequences}.
 */
Ext.define('App.ui.SequenceWindow',{
	extend: 'App.ui.EditorWindow',
	title: 'Add sequences',
	closeAction: 'hide',
	buttonText: 'Add Sequences',
	helpText: 'Type sequences in any format (NUPACK, FASTA, Multisubjective), with or without names',
	handler: function(domains,value) {
	},
	initComponent: function () {
		this.callParent(arguments);
		this.sequenceEditor = this.editor;
	},
	buttonHandler: function() {
		var data = this.getValue(),
			domains = DNA.parseNamedSequences(data);
		if(this.scope) { this.handler.call(this.scope,data); }
		else { this.handler(domains,data); }
		this.close();
	},
})