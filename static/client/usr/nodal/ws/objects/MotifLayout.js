/**
 * Handles layout of {@link App.usr.nodal.ws.Motif} objects.
 */
Ext.define('App.usr.nodal.ws.objects.MotifLayout', {
	extend : 'Workspace.idea.BaseLayout',
	doLayout : function() {
		if(!this.ignore) {
			var objects = this.getObjects().getRange();
			var groups = _.groupBy(objects, function(child) {
				if(child.hasWType(['App.usr.nodal.ws.objects.InputPort', 'App.usr.nodal.ws.objects.OutputPort', 'App.usr.nodal.ws.objects.BridgePort'])) {
					return 'ports'
				} else {
					return 'others'
				}
			});
			var ports = groups.ports || [], others = groups.others || [];

			// Free layout
			if(others.length > 0) {
				var union = false;
				//(union !== false);
				applyToChildren = false;
				//applyToChildren = (applyToChildren !== false);
				box = Workspace.Utils.getBox(others);
				box = Workspace.Utils.padBox(box, this.idea.padding);
				if(union)
					box = Workspace.Utils.boxUnion(box, this.idea.getBox())
				this.ignore = true;
				this.idea.setBox(box, applyToChildren);
				this.ignore = false;
			}

			// Circular layout for ports
			var count = ports.length;
			if(count > 0) {
				var theta = this.idea.get('theta'), dtheta = 360 / count, //
				cx = this.idea.getCenterX(), cy = this.idea.getCenterY(), //
				rx = this.idea.getRadiusX(), ry = this.idea.getRadiusY();
				this.ignore = true;
				_.each(ports, function(child) {
					// bit of a hack;
					// TODO: Make sure doLayout isn't applied before children are rendered
					if(child.is('rendered')) {
						child.setPosition(parseInt(cx + Math.cos(Raphael.rad(theta)) * rx - child.getWidth()) + this.paddingTop, // HACK
						parseInt(cy + Math.sin(Raphael.rad(theta)) * ry - child.getHeight()) + this.paddingLeft);
						child.set('rotation', theta + (child.dtheta ? child.dtheta : 0 ));
						theta = (theta + dtheta) % (360);
					}
				}, this);
				this.ignore = false;
			}
		}
	},
	childrenMovable : false,
	paddingTop : 5,
	paddingLeft : 5,
}, function() {
	Workspace.Layouts.register('App.usr.nodal.ws.objects.MotifLayout', App.usr.nodal.ws.objects.MotifLayout);
	Workspace.Layouts.register('Workspace.objects.dna.MotifLayout', App.usr.nodal.ws.objects.MotifLayout);
});
////////////////////////////////////////////////////////////////////////////////////////////////