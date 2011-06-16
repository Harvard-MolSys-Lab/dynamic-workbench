/***********************************************************************************************
 * InfoMachine
 *
 *
 * Copyright (c) 2010 Casey Grun
 *
 ***********************************************************************************************
 * ~/client/objects/vector.js
 *
 * Defines {Workspace.objects.VectorObject} subclasses ({Workspace.Object}s rendered as native browse
 * vector graphics (SVG or VML) using Raphael).
 ***********************************************************************************************/

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
		this.arguments = [this.x, this.y, this.width, this.height, this.r];
		Workspace.objects.Rectangle.superclass.render.call(this);
	}
}, function() {
	Workspace.reg('Workspace.objects.Rectangle', Workspace.objects.Rectangle);
});
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
////////////////////////////////////////////////////////////////////////////////////////////////
/*
 * @class Workspace.objects.Path
 * Represents a workspace object rendered by an SVG/VML path
 * @extends Workspace.objects.VectorObject
 */
Ext.define('Workspace.objects.Path', {
	constructor: function(config) {
		Workspace.objects.Path.superclass.constructor.apply(this, arguments);
	},
	alias: 'Workspace.VectorPathObject',
	extend: 'Workspace.objects.VectorObject',
	wtype: 'Workspace.objects.Path',
	name: 'New Path',
	iconCls: 'path',
	shape: 'path',
	isResizable: false,
	path: [],
	fillOpacity: 0,
	render: function() {
		this.arguments = [this.path];
		Workspace.objects.Path.superclass.render.call(this);
		this.updateDimensions();
	},
	/**
	 * getHighlightProxy
	 * Constructs a highlight {@link Workspace.Proxy} configured to follow this object. Automatically invoked by {@link #highlight}; should not be called directly.
	 * @private
	 * @return {Workspace.Proxy} proxy
	 */
	getHighlightProxy: function() {
		return new Workspace.Proxy(Ext.applyIf({
			path: this.path,
			shape: this.shape,
			strokeWidth: this.strokeWidth + App.Stylesheet.Highlight.strokeWidth,
			workspace: this.workspace,
		},App.Stylesheet.Highlight));
	},
	updateHighlightProxy: function() {
		if(this.highlightProxy)
			this.highlightProxy.path = this.path;
	},
	/**
	 * updatePath
	 * Sets this object's path to the passed path specification and recalculates its dimensions
	 * @param {Array} path Raphael path specification (e.g. [['M',x,y],['L',x,y]...])
	 */
	updatePath: function(path) {
		this.path = path;
		this.vectorElement.attr({
			path: path
		});
		this.updateDimensions();
		this.updateHighlightProxy();
	},
	/**
	 * updateDimensions
	 * Sets this object's x, y, width, and height properties to match that of the bounding box of the object's path.
	 * Automatically invoked by updatePath and render()
	 * @private
	 */
	updateDimensions: function() {
		var box = this.vectorElement.getBBox();
		this.set('x', box.x);
		this.set('y', box.y);
		this.set('height', box.height);
		this.set('width', box.width);
	},
	/**
	 * appendPoint
	 * Adds a new point to this object's path
	 * @param {Array} point Raphael path point specification (e.g. ['M',x,y])
	 */
	appendPoint: function(point) {
		this.path.push(point);
		this.updatePath(this.path);
	},
	translate: function(dx, dy) {
		var point;
		for (i = 0, l = this.path.length; i < l; i++) {
			point = this.path[i];
			switch (point[0]) {
				case 'C':
					point[5] = point[5] + dx;
					point[6] = point[6] + dy;
				case 'S':
					point[3] = point[3] + dx;
					point[4] = point[4] + dy;
				case 'M':
				case 'L':
				case 'T':
					point[1] = point[1] + dx;
					point[2] = point[2] + dy;
					break;
				default:
					break;
			}
		}
		this.updatePath(this.path);
		/*
		 this.x = this.getX();
		 this.y = this.getY();
		 */
		this.fireEvent('move', this.getX(), this.getY());
	},
	/**
	 * setPosition
	 * sets the position of this path by calculating the delta and translating the path
	 * @param {Object} x
	 * @param {Object} y
	 */
	setPosition: function(x, y) {
		var delta = this.getDelta(x, y);
		this.translate(delta.dx, delta.dy);
	},
	// not implemented
	setDimensions: function(w, h) {

	}
}, function() {
	Workspace.reg('Workspace.objects.Path', Workspace.objects.Path);
});