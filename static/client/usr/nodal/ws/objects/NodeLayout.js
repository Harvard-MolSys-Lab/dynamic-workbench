////////////////////////////////////////////////////////////////////////////////////////////////

Ext.define('App.usr.nodal.ws.objects.NodeLayout', {
	extend:'Workspace.idea.BaseLayout',
	doLayout: function() {
		if(!this.ignore) {
			var count = this.getObjects().getCount(),
			theta = this.idea.get('theta'),
			dtheta = 360 / count,
			cx = this.idea.getCenterX(),
			cy = this.idea.getCenterY(),
			rx = this.idea.getRadiusX(),
			ry = this.idea.getRadiusY();
			this.ignore = true;
			this.getObjects().each( function(child) {
				// bit of a hack;
				// TODO: Make sure doLayout isn't applied before children are rendered
				if(child.is('rendered')) {
					child.setPosition(
					parseInt(cx + Math.cos(Raphael.rad(theta)) * rx - child.getWidth()) + this.paddingTop, // HACK
					parseInt(cy + Math.sin(Raphael.rad(theta)) * ry - child.getHeight()) + this.paddingLeft
					);
					child.set('rotation',theta+(child.dtheta ? child.dtheta : 0 ));
					theta = (theta + dtheta) % (360);
				}
			},this);
			this.ignore = false;
		}
	},
	childrenMovable: false,
	paddingTop: 5,
	paddingLeft: 5,
}, function() {
	Workspace.Layouts.register('App.usr.nodal.ws.objects.NodeLayout',App.usr.nodal.ws.objects.NodeLayout);
	Workspace.Layouts.register('Workspace.objects.dna.NodeLayout',App.usr.nodal.ws.objects.NodeLayout);
});
////////////////////////////////////////////////////////////////////////////////////////////////