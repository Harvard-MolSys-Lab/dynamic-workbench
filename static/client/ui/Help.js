/**
 * 
 */
Ext.define('App.ui.Help',{
	extend: 'App.ui.Browser',
	title: 'Help',
	iconCls: 'help',
	trigger: 'index',
	constructor: function(config) {
		this.url = App.path.join(['help',config.triggers[0] || 'index']);
		this.callParent(arguments);
	}
})
