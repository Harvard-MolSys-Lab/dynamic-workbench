/**
 * @class App.ui.Browser
 */
Ext.define('App.ui.Browser', {
	extend: 'Ext.panel.Panel',
	initComponent: function() {
		Ext.apply(this, {
			html: '<iframe src="'+this.url+'" style="width:100%;height:100%;border:none;"></iframe>'
		});
		this.callParent(arguments);
	}
});