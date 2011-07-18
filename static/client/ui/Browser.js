/**
 * Opens an {@link App.ui.Application} tab containing an iframe with the configured {@link #url}
 */
Ext.define('App.ui.Browser', {
	extend: 'Ext.panel.Panel',
	mixins: {
		app: 'App.ui.Application',
	},
	constructor: function() {
		this.mixins.app.constructor.apply(this,arguments);
		this.callParent();
	},
	initComponent: function() {
		/**
		 * @property url
		 * URL to open in this tab
		 */
		Ext.apply(this, {
			html: '<iframe src="'+this.url+'" style="width:100%;height:100%;border:none;"></iframe>'
		});
		this.callParent(arguments);
	}
});