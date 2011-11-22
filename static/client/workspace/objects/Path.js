////////////////////////////////////////////////////////////////////////////////////////////////
/*
 * @class Workspace.objects.Path
 * Represents a workspace object rendered by an SVG/VML path
 * @extends Workspace.objects.VectorObject
 */
Ext.define('Workspace.objects.Path', {
	constructor : function(config) {
		this.callParent(arguments);
		this.expose('path', true, true, true, false);
		this.expose('points', true, true, true, false);
		this.expose('interpolator', true, true, true, false);
		//Workspace.objects.Path.superclass.constructor.apply(this, arguments);
	},
	requires : ['Workspace.objects.Interpolators'],
	alias : 'Workspace.VectorPathObject',
	extend : 'Workspace.objects.VectorObject',
	wtype : 'Workspace.objects.Path',
	editor : 'vector',
	name : 'New Path',
	iconCls : 'path',
	shape : 'path',
	interpolator : 'linear',
	isResizable : false,
	path : [],
	points : [],
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
	 * getHighlightProxy
	 * Constructs a highlight {@link Workspace.Proxy} configured to follow this object. Automatically invoked by {@link #highlight}; should not be called directly.
	 * @private
	 * @return {Workspace.Proxy} proxy
	 */
	getHighlightProxy : function() {
		return new Workspace.Proxy(Ext.applyIf({
			path : this.path,
			shape : this.shape,
			strokeWidth : this.strokeWidth + App.Stylesheet.Highlight.strokeWidth,
			workspace : this.workspace,
			//forceBack : true,
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
	 * updatePath
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
	 * updateDimensions
	 * Sets this object's x, y, width, and height properties to match that of the bounding box of the object's path.
	 * Automatically invoked by updatePath and render()
	 * @private
	 */
	updateDimensions : function() {
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
			// var point;
			// for( i = 0, l = this.path.length; i < l; i++) {
				// point = this.path[i];
				// switch (point[0]) {
					// case 'C':
						// point[5] = point[5] + dx;
						// point[6] = point[6] + dy;
					// case 'S':
						// point[3] = point[3] + dx;
						// point[4] = point[4] + dy;
					// case 'M':
					// case 'L':
					// case 'T':
						// point[1] = point[1] + dx;
						// point[2] = point[2] + dy;
						// break;
					// default:
						// break;
				// }
			// }
			this.path = Raphael.pathToRelative(this.path);
	            this.path[0][1] = this.path[0][1]+dx;
	            this.path[0][2] = this.path[0][2]+dy;
			//this.set('path',this.path);
			this.updatePath(this.path);
		}
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
	setPosition : function(x, y) {
		var delta = this.getDelta(x, y);
		this.translate(delta.dx, delta.dy);
	},
	// not implemented
	setDimensions : function(w, h) {

	}
}, function() {
	Workspace.reg('Workspace.objects.Path', Workspace.objects.Path);
});
