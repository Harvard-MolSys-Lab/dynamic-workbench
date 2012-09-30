/**
 * Allows the user to browse help documentation
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

Ext.define('App.ui.HelpButton',{
	extend: 'Ext.button.Button',
	iconCls: 'help',
	text: 'Help',
	xtype: 'helpbutton',
	/**
	 * @cfg {String} topic
	 * Name of the help topic to open upon click
	 */
	
	initComponent: function() {
		Ext.apply(this,{
			handler: App.ui.Launcher.makeLauncher(this.topic)
		});
		this.callParent(arguments);
	}
})