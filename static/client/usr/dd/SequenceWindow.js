Ext.define('App.usr.dd.SequenceWindow',{
	extend: 'App.ui.SequenceWindow',
	title: 'Add specific sequences to DD',
	buttonText: 'Add Domains',
	value: '',
	handler: function(domains,value) {
		this.designer.addDomains(value.split('\n'));
	},
})