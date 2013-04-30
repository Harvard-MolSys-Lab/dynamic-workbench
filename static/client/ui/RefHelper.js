/**
 * Small mixin to attach references to all child components with a 'ref' 
 * property to `this`.
 */
Ext.define('App.ui.RefHelper',{
	init:function() {
		_.each(this.query('*[ref]'), function(cmp) {
			this[cmp.ref] = cmp;
		}, this);
	}
})
