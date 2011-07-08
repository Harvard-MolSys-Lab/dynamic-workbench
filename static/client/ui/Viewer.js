Ext.define('App.ui.Viewer', {
	extend: 'App.ui.Browser',
	editorType: 'Viewer',
	iconCls: 'application',
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