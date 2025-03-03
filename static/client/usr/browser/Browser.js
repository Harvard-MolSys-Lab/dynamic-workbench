/**
 * Opens an {@link App.ui.Application application} tab containing an iframe with the configured #url
 */
Ext.define('App.usr.browser.Browser', {
	extend: 'Ext.panel.Panel',
	title: 'Browser',
	mixins: {
		app: 'App.ui.Application',
	},
	constructor: function() {
		this.mixins.app.constructor.apply(this,arguments);
		this.callParent(arguments);
	},
	initComponent: function() {
		/**
		 * @property url
		 * URL to open in this tab
		 */
		Ext.apply(this, {
			html: '<iframe src="'+this.url+'" style="width:100%;height:100%;border:none;position:absolute;" height="100%"></iframe>'
		});
		this.callParent(arguments);
	}
});