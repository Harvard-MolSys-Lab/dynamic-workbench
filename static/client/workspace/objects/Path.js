/**
 * Represents a workspace object rendered by an SVG/VML `path` element.
 * 
 * # Updating paths
 * Path data may be updated in two ways: the #points property can be #set,
 * triggering {@link #interpolate interpolation} of the points into an SVG path 
 * string; or, the #path property can be updated directly, providing an SVG 
 * path string or Raphael array.
 * 
 * When #points or #interpolator are {@link #event-change changed}, #buildPath is 
 * called automatically. #buildPath calls #interpolate, which in turn invokes
 * the configured #interpolator with the value of #points. This generates an 
 * SVG path string or Raphael path array. The value of the #path property is 
 * then {@link #set} to the result returned by #interpolate. 
 * 
 * When #path is #set, either manually or by #buildPath, #updatePath is called,
 * which updates the #vectorElement with the appropriate SVG path string. #updatePath 
 * also recalculates the object's dimensions.
 * 
 * @extends Workspace.objects.VectorObject
 */
Ext.define('Workspace.objects.Path', {
	extend : 'Workspace.objects.VectorObject',
	constructor : function(config) {
		this.callParent(arguments);
		this.expose('path', true, true, true, false);
		this.expose('points', true, true, true, false);
		this.expose('interpolator', true, true, true, false);
	},
	requires : ['Workspace.objects.Interpolators'],
	alias : 'Workspace.VectorPathObject',
	wtype : 'Workspace.objects.Path',
	editor : 'vector',
	name : 'New Path',
	iconCls : 'path',
	shape : 'path',
	/**
	 * @cfg {String} interpolator
	 * Name of a {@link Workspace.objects.Interpolators interpolator} which can 
	 * generate an SVG path string from an array of #points.
	 */
	interpolator : 'linear',
	isResizable : false,
	/**
	 * @property {Array[]}
	 * Array of SVG path commands which form an SVG path string. 
	 */
	path : [],
	/**
	 * @property {Array[]}
	 * Array of points which define the path. Each point is an array containing 
	 * at least two numbers (x and y coordinates). Different 
	 * {@link #interpolator interpolators} may handle points with more than two 
	 * coordinates.
	 */
	points : [],
	/**
	 * @inheritdoc
	 */
	fillOpacity : 0,
	render : function() {
		if(!this.path || (this.points && this.points.length > 0)) {
			this.buildPath(this.points);
		}
		this.arguments = [this.path];
		this.callParent(arguments);
		this.on('change:interpolator', this.buildPath, this)
		this.on('change:path', this.updatePath, this);
		this.on('change:points', this.buildPath, this);
		this.updateDimensions();
	},
	/**
	 * Constructs a highlight {@link Workspace.Proxy} configured to follow this 
	 * object. Automatically invoked by {@link #highlight}; should not be 
	 * called directly.
	 * @private
	 * @return {Workspace.Proxy} proxy
	 */
	getHighlightProxy : function() {
		return Ext.create('Workspace.Proxy',Ext.applyIf({
			path : this.path,
			shape : this.shape,
			strokeWidth : this.strokeWidth + App.Stylesheet.Highlight.strokeWidth,
			workspace : this.workspace,
		}, App.Stylesheet.Highlight));
	},
	updateHighlightProxy : function() {
		if(this.highlightProxy)
			this.highlightProxy.path = this.path;
	},
	/**
	 * Called when {@link #points} changes; builds the SVG path string.
	 */
	buildPath : function() {
		this.set('path', this.interpolate(this.get('points')));
	},
	/**
	 * Generates an SVG path string with the configured {@link #interpolator}
	 */
	interpolate : function(points) {
		if(points) {
			return ['M',points[0][0],',',points[0][1],' ',Workspace.objects.Interpolators[this.get('interpolator')](points)].join('');
		} else {
			return ''
		}
	},
	/**
	 * Sets this object's path to the passed path specification and recalculates its dimensions
	 * @param {Array} path Raphael path specification (e.g. [['M',x,y],['L',x,y]...])
	 */
	updatePath : function(path) {
		this.path = path;
		this.vectorElement.attr({
			path : path
		});
		this.updateDimensions();
		this.updateHighlightProxy();
	},
	/**
=	 * Sets this object's x, y, width, and height properties to match that of the bounding box of the object's path.
	 * Automatically invoked by updatePath and render()
	 * @private
	 */
	updateDimensions : function() {
		var box = this.vectorElement.getBBox(true);
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
	appendPoint : function(point) {
		this.path.push(point);
		this.updatePath(this.path);
	},
	translate : function(dx, dy) {
		var i;
		if(this.points && this.points.length > 0) {
			var points = this.points;
			for(i = 0; i<points.length;i++) {
				points[i][0]+=dx;
				points[i][1]+=dy;
			}
			this.set('points',points);
		} else {
			this.path = Raphael.pathToRelative(this.path);
	            this.path[0][1] = this.path[0][1]+dx;
	            this.path[0][2] = this.path[0][2]+dy;
			this.updatePath(this.path);
		}
		/*
		 this.x = this.getX();
		 this.y = this.getY();
		 */
		this.fireEvent('move', this.getX(), this.getY());
	},
	/**
	 * sets the position of this path by calculating the delta and translating the path
	 * @param {Object} x
	 * @param {Object} y
	 */
	setPosition : function(x, y) {
		var delta = this.getDelta(x, y);
		this.translate(delta.dx, delta.dy);
	},
	setDimensions : function(w, h) {

	}
}, function() {
	Workspace.reg('Workspace.objects.Path', Workspace.objects.Path);
});
