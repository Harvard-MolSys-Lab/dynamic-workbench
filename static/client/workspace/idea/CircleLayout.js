/**
 * @class Workspace.idea.CircleLayout
 * Arranges children of a {@link Workspace.objects.IdeaObject} in a circle
 * @abstract
 * @extends Workspace.idea.BaseLayout
 */
Ext.define('Workspace.idea.CircleLayout', {
	extend: 'Workspace.idea.BaseLayout',
	constructor: function(config) {
		Workspace.idea.BaseLayout.superclass.constructor.apply(this,arguments);
		Ext.apply(this,config);
		this.defaultChildConfig = {
			wtype: this.defaultChildType,
			width: 100,
			height: 100
		};
	},
	doLayout: function() {
		if(!this.ignore) {
			var count = this.getObjects().getCount(),
			theta = this.idea.get('theta'),
			dtheta = 2*Math.PI / count,
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
					parseInt(cx + Math.cos(theta) * rx - child.getWidth()) + this.paddingTop, // HACK
					parseInt(cy + Math.sin(theta) * ry - child.getHeight()) + this.paddingLeft
					);
					child.set('rotation',Raphael.deg(theta)+(child.dtheta ? child.dtheta : 0 ));
					theta = (theta + dtheta) % (2 * Math.PI);
				}
			},this);
			this.ignore = false;
		}
	},
	paddingTop: 5,
	paddingLeft: 5,
});
