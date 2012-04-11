Ext.define('App.ui.Attribution', {
	extend : 'Ext.window.Window',
	width: 500,
	height: 500,
	bodyStyle:'padding:10px; background-color: white;',
	autoScroll: true,
	closeAction: 'hide',
	title: 'About',
	initComponent : function() {
		Ext.apply(this, {
			autoLoad : {
				url : '/attribution',
				callback : this.initAttribution,
				scope : this
			},
		});
		this.callParent(arguments);
	},
	initAttribution : function() {

	}
})
