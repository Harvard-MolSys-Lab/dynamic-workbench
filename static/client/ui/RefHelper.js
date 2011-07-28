Ext.define('App.ui.RefHelper',{
	init:function() {
		_.each(this.query('*[ref]'), function(cmp) {
			this[cmp.ref] = cmp;
		}, this);
	}
})
