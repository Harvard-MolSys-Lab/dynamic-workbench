/**
 * @class App.usr.nodal.ws.objects.StrandLayout
 * @extends Workspace.idea.BaseLayout
 */
Ext.define('App.usr.nodal.ws.objects.StrandLayout', {
	extend : 'Workspace.idea.BaseLayout',
	doLayout : function() {
		if(!this.ignore) {
			this.ignore = true;
			this.idea.children.each(function(child) {
				// bit of a hack;
				// TODO: Make sure doLayout isn't applied before children are rendered
				if(child.is('rendered')) {
					child.setPosition(parseInt(cx + Math.cos(theta) * rx -   child.getWidth()) + this.paddingTop,   // HACK
					parseInt(cy + Math.sin(theta) * ry -   child.getHeight()) + this.paddingLeft);
					theta = (theta + dtheta) % (2 * Math.PI);
				}
			}, this);
			this.ignore = false;
		}
	},
	childrenMovable : false,
	paddingTop : 5,
	paddingLeft : 5,
}, function() {
	Workspace.Layouts.register('App.usr.nodal.ws.objects.StrandLayout', App.usr.nodal.ws.objects.StrandLayout);
	Workspace.Layouts.register('Workspace.objects.dna.StrandLayout', App.usr.nodal.ws.objects.StrandLayout);
});