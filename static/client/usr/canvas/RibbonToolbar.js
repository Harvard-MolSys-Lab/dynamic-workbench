Ext.define('App.usr.canvas.RibbonToolbar',{
	extend: 'Ext.toolbar.Toolbar',
	setHeight: function(height) {
		this.callParent([height+1]);
	}
})
