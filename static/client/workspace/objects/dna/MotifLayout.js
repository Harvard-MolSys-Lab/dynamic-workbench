////////////////////////////////////////////////////////////////////////////////////////////////

Ext.define('Workspace.objects.dna.MotifLayout', {
	extend : 'Workspace.idea.BaseLayout',
	doLayout : function() {
		if(!this.ignore) {
			var ports = [], otherChildren = [];
			var objects = this.getObjects();
			objects.each(function(child) {
				if(child.hasWType('Workspace.objects.dna.InputPort') || //
				child.hasWType('Workspace.objects.dna.OutputPort') || //
				child.hasWType('Workspace.objects.dna.BridgePort')) {
					ports.push(child);
				} else {
					otherChildren.push(child);
				}
			});

			// Free layout
			var union = false;
			//(union !== false);
			applyToChildren = false;
			//applyToChildren = (applyToChildren !== false);
			box = Workspace.Utils.getBox(otherChildren);
			box = Workspace.Utils.padBox(box, this.idea.padding);
			if(union)
				box = Workspace.Utils.boxUnion(box, this.idea.getBox())
			this.ignore = true;
			this.idea.setBox(box, applyToChildren);
			this.ignore = false;

			// Circular layout for ports
			var count = ports.length, theta = this.idea.get('theta'), dtheta = 360 / count, // 
			cx = this.idea.getCenterX(), cy = this.idea.getCenterY(), //
			rx = this.idea.getRadiusX(), ry = this.idea.getRadiusY();
			this.ignore = true;
			_.each(function(child) {
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
	},
	childrenMovable : false,
	paddingTop : 5,
	paddingLeft : 5,
}, function() {
	Workspace.Layouts.register('Workspace.objects.dna.MotifLayout', Workspace.objects.dna.MotifLayout);
});
////////////////////////////////////////////////////////////////////////////////////////////////