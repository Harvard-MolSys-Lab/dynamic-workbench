////////////////////////////////////////////////////////////////////////////////////////////////
/**
 * @class Workspace.objects.Ellipse
 * Represents a workspace object rendered by an ellipse
 * @extends Workspace.objects.VectorObject
 */
Ext.define('Workspace.objects.Ellipse', {
	constructor: function(workspace, config) {
		Workspace.objects.Ellipse.superclass.constructor.call(this, workspace, config);

	},
	extend: 'Workspace.objects.VectorObject',
	alias: 'Workspace.VectorEllipseObject',
	wtype: 'Workspace.objects.Ellipse',
	name: 'New Ellipse',
	iconCls: 'ellipse',
	shape: 'ellipse',
	isResizable: true,
	x: 0,
	y: 0,
	width: 0,
	height: 0,

	render: function() {
		this.arguments = [this.get('x') + this.getRadiusX(), this.get('y') + this.getRadiusY(), this.getRadiusX(), this.getRadiusY()];
		//[(this.x-(this.width/2)),(this.y-(this.height/2)),(this.width/2),(this.height/2)];
		Workspace.objects.Ellipse.superclass.render.call(this);
	},
	/**
	 * getRadiusX
	 * @return {Number} rx
	 */
	getRadiusX: function() {
		return (this.getWidth() / 2);
	},
	/**
	 * getRadiusY
	 * @return {Number} ry
	 */
	getRadiusY: function() {
		return (this.getHeight() / 2);
	},
	/**
	 * getCenterX
	 * @return {Number} cx
	 */
	getCenterX: function() {
		return (this.getX() + this.getRadiusX());
	},
	/**
	 * getCenterY
	 * @return {Number} cy
	 */
	getCenterY: function() {
		return (this.getY() + this.getRadiusY());
	},
	updateX: function(x) {
		Workspace.objects.VectorObject.superclass.updateX.apply(this, arguments);
		this.vectorElement.attr({
			cx: x + this.getRadiusX()
		})
	},
	updateY: function(y) {
		Workspace.objects.VectorObject.superclass.updateY.apply(this, arguments);
		this.vectorElement.attr({
			cy: y + this.getRadiusY()
		})
	},
	updateWidth: function(w) {
		this.vectorElement.attr({
			rx: this.getRadiusX()
		});
		this.updateX(this.getX());
	},
	updateHeight: function(w) {
		this.vectorElement.attr({
			ry: this.getRadiusY()
		})
		this.updateY(this.getY());
	}
}, function() {
	Workspace.reg('Workspace.objects.Ellipse', Workspace.objects.Ellipse);
});