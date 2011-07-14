/**
 * @class Workspace.idea.VListLayout
 * Orders items in a vertical list
 * @abstract
 * @extends Workspace.idea.FreeLayout
 */
Ext.define('Workspace.idea.VListLayout', {
	constructor: function(config) {
		Workspace.idea.VListLayout.superclass.constructor.apply(this,arguments);
	},
	extend: 'Workspace.idea.FreeLayout',
	doLayout: function(applyToChildren) {
		Workspace.idea.VListLayout.superclass.doLayout.apply(this,arguments);
	},
	doFirstLayout: function() {
		var width, w, h, f;
		this.getObjects().sort('ASC', function(a,b) {
			w = a.get('width');
			width = (w > width ? w : width);
			return a.get('y') - b.get('y');
		});
		f = this.getObjects().first();
		if(f) {
			h = f.get('y');
		}
		this.getObjects().each( function(a) {
			a.set('width',width);
			a.set('y',h);
			h+=a.get('height');
		});
		Workspace.idea.VListLayout.superclass.doFirstLayout.apply(this,arguments);
	},
	/*
	 addNextChild: function() {

	 }*/
});

Workspace.Layouts.register('Workspace.idea.VListLayout',Workspace.idea.VListLayout);
