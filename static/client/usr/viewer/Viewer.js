/**
 * Allows content to be viewed with an iframe
 */
Ext.define('App.usr.viewer.Viewer', {
	extend: 'App.usr.browser.Browser',
	editorType: 'Viewer',
	iconCls: 'application',
	autoHideLoadingMask: true,
	mixins: {
		app: 'App.ui.Application'
	},
	constructor: function(config) {
		this.mixins.app.constructor.apply(this,arguments);

		this.url = Ext.urlAppend(App.getEndpoint('load'),Ext.Object.toQueryString({
			'node':this.getPath()
		}));
		this.callParent(arguments);
		//this.on('afterrender',this.updateTitle,this,{single: true});
	}
});