/**
 * Allows the user to browse help documentation
 */
Ext.define('App.ui.Help',{
	extend: 'App.usr.browser.Browser',
	title: 'Help',
	iconCls: 'help',
	trigger: 'index',
	constructor: function(config) {
		this.url = App.path.join(['help',config.triggers[0] || 'index']);
		this.callParent(arguments);
	},
	statics: {
		/**
		 * Generates a javascript: URL pointing to a particular help topic
		 * @param  {String} topic Name of the help topic
		 * @return {String} URL
		 */
		getLink: function(topic) {
			return "javascript:App.ui.Launcher.launch('help:"+topic+"');"
		}
	}
})

/**
 * Creates a button linking to a particular help documentation topic
 */
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
			handler: App.ui.Launcher.makeLauncher('help:'+this.topic)
		});
		this.callParent(arguments);
	}
})