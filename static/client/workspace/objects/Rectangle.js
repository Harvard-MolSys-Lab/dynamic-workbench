////////////////////////////////////////////////////////////////////////////////////////////////
/**
 * @class Workspace.objects.Rectangle
 * Represents a workspace object rendered as an SVG/VML rectangle
 * @extends Workspace.objects.VectorObject
 */
Ext.define('Workspace.objects.Rectangle', {
	constructor: function(workspace, config) {
		Workspace.objects.Rectangle.superclass.constructor.call(this, workspace, config);

		Ext.applyIf(this, {

			// x: 0, y: 0, width: 0, height: 0,
		});

		this.expose('r', true, true, true, false);
	},
	alias: 'Workspace.VectorRectObject',
	extend: 'Workspace.objects.VectorObject',
	wtype: 'Workspace.objects.Rectangle',
	name: 'New Rectangle',
	iconCls: 'rect',
	shape: 'rect',
	r: 0,

	isResizable: true,
	render: function() {
		if(!this.arguments) this.arguments = [this.x, this.y, this.width, this.height, this.r];
		Workspace.objects.Rectangle.superclass.render.call(this);
	}
}, function() {
	Workspace.reg('Workspace.objects.Rectangle', Workspace.objects.Rectangle);
});