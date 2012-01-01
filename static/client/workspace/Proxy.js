/**
 * @class Workspace.Proxy
 * Renders a simplified version of a workspace object that can be more rapidly translated and resized
 * @extends Ext.util.Observable
 */
Workspace.Proxy = {};
Ext.define('Workspace.Proxy', {
	constructor : function(config) {
		Ext.apply(this, config, App.Stylesheet.Proxy);
		Workspace.Proxy.superclass.constructor.apply(this, arguments);
	},
	extend : 'Ext.util.Observable',
	/**
	 * @cfg {Boolean}
	 * Force the proxy to push itself to the back whenever shown (useful for highlight proxies)
	 */
	forceBack : false,
	/**
	 * @cfg {String} shape
	 * Name of a Raphael member function to use to create a vector element
	 */
	shape : 'rect',
	/**
	 * @cfg {Number} strokeWidth
	 * Width of the vector stroke
	 */
	strokeWidth : 1,
	/**
	 * @cfg {String} stroke
	 * Color of the vector stroke
	 */
	stroke : '#99BBE8',
	/**
	 * @cfg {String} fill
	 * Color of the fill
	 */
	fill : '#99BBE8',
	/**
	 * @cfg {Number} fillOpacity
	 * Opacity of the fill
	 */
	fillOpacity : 0.5,
	/**
	 * @cfg {Number} opacity
	 */
	opacity : 0.7,
	/**
	 * @cfg {Number} padding
	 */
	padding : 10,
	/**
	 * @cfg {Number} x
	 */
	x : 0,
	/**
	 * @cfg {Number} y
	 */
	y : 0,
	rx: 0,
	ry: 0,
	/**
	 * @cfg {Number} width
	 */
	width : 0,
	/**
	 * @cfg {Number} height
	 */
	height : 0,

	rendered : false,
	/**
	 * render
	 * Renders the proxy to the workspace
	 * @param {RaphaelElement} behind The vector element behind which to render this proxy
	 */
	render : function(behind) {
		if(!this.rendered) {
			this.vectorElement = this.workspace.paper[this.shape](this.x, this.y, this.width, this.height);
			if(behind) {
				this.vectorElement.insertBefore(behind)
			}
			if(this.forceBack) {
				this.vectorElement.toBack();
			}
			this.vectorElement.attr(this.attributes());
			this.rendered = true;
		}
	},
	getX : function() {
		return this.x;
	},
	getY : function() {
		return this.y;
	},
	getWidth : function() {
		return this.width;
	},
	getHeight : function() {
		return this.height;
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
		this.updateDimensionProps();
	},
	/**
	 * updateDimensionProps
	 * Sets this object's x, y, width, and height properties to match that of the bounding box of the object's path.
	 * Automatically invoked by updatePath and render()
	 * @private
	 */
	updateDimensionProps : function() {
		var box = this.vectorElement.getBBox(true);
		this.x = (box.x);
		this.y = (box.y);
		this.height = (box.height);
		this.width = (box.width);
	},
	/**
	 * setPosition
	 * @param {Number} x
	 * @param {Number} y
	 */
	setPosition : function(x, y) {

		// this.vectorElement.attr({
		//     x: x,
		//     y: y
		// });
		if(this.shape == 'ellipse') {
			this.vectorElement.attr({
				cx : x + this.width / 2,
				cy : y + this.height / 2
			});
			this.x = x;
			this.y = y;
			this.fireEvent('move', this.x, this.y);
		} else if(this.shape == 'rect') {
			this.vectorElement.attr({
				x : x,
				y : y
			});
			this.x = x;
			this.y = y;
			this.fireEvent('move', this.x, this.y);
		} else {
			var d = this.getDelta(x, y);
			this.translate(d.dx, d.dy);
		}
	},
	/**
	 * getDelta
	 * Calculates difference between position of object and the provided coordinates.
	 * @param {Object} x2
	 * @param {Object} y2
	 * @return {Object} delta Hash containing <var>dx</var> and <var>dy</var>
	 */
	getDelta : function(x2, y2) {
		return {
			dx : (x2 - this.getX()),
			dy : (y2 - this.getY())
		};
	},
	getScaleFactor : function(w2, h2) {
		var w = this.getWidth(), h = this.getHeight();
		return {
			dw : (w != 0) ? (w2 / w) : 1,
			dh : (h != 0) ? (h2 / h) : 1
		}
	},
	/**
	 * translate
	 * @param {Number} dx
	 * @param {Number} dy
	 */
	translate : function(dx, dy) {
		//this.setPosition(this.x + dx, this.y + dy);
		this.x += dx;
		this.y += dy;
		if(dx != 0 || dy != 0) {
			if(this.shape == 'path') {
				var path = Raphael.pathToRelative(this.vectorElement.attr('path'));
				path[0][1] += +dx;
				path[0][2] += +dy;
				this.updatePath(this.path);
			} else {
				this.vectorElement.attr({
					x : this.x,
					y : this.y,
				});
			}
			//this.vectorElement.translate(dx, dy);
		}
		this.fireEvent('move', this.x, this.y);
	},
	scale : function(dw, dh) {
		this.width *= dw;
		this.height *= dh;
		this.vectorElement.scale(dw, dh);
		this.fireEvent('resize', this.width, this.height);
	},
	/**
	 * setDimensions
	 * @param {Number} width
	 * @param {Number} height
	 */
	setDimensions : function(w, h) {
		this.width = w;
		this.height = h;
		if(this.shape == 'ellipse') {
			this.vectorElement.attr({
				rx : w / 2,
				ry : h / 2
			});
		} else {
			this.vectorElement.attr({
				width : w,
				height : h
			});
		}
		this.fireEvent('resize', w, h);
	},
	/**
	 * getBox
	 * Gets a four-cornered bounding box for this proxy
	 * @return {Object} box An object with <var>tl</var>, <var>tr</var>, <var>bl</var>, and <var>br</var>
	 * properties, corresponding to each corner of the box. Each key contains an object with <var>x</var> and <var>y</var> properties.
	 */
	getBox : function() {
		return {
			'tl' : {
				x : this.getX(),
				y : this.getY()
			},
			'tr' : {
				x : this.getX() + this.getWidth(),
				y : this.getY()
			},
			'bl' : {
				x : this.getX(),
				y : this.getY() + this.getHeight()
			},
			'br' : {
				x : this.getX() + this.getWidth(),
				y : this.getY() + this.getHeight()
			}
		};
	},
	/**
	 * setBox
	 * Adjusts the position and dimensions of the proxy's bounding box
	 * @param {Object} box A four-cornered box
	 */
	setBox : function(x1, y1, x2, y2) {
		if(arguments.length == 4) {
			this.setPosition(x1, y1);
			this.setDimensions(x2 - x1, y2 - y1);
		} else {
			var box = arguments[0];
			this.setDimensions(box.tr.x - box.tl.x, box.bl.y - box.tl.y);
			this.setPosition(box.tl.x, box.tl.y);
		}
	},
	/**
	 * attributes
	 * Returns a serialized hash of properties to be passed to a Raphael attr() function
	 * @private
	 * @param {String[]} attrArray A list of property names (in dasherized form)
	 * @param
	 */
	attributes : function(attrArray) {
		var attr = {};
		if(!attrArray) {
			var attrArray = Workspace.objects.VectorObject.attrArray;
		}
		for(var i = 0, l = attrArray.length; i < l; i++) {
			var param = attrArray[i], value = this[param.camelize().uncapitalize()];
			//value = this.get(param) || this.get(param.underscore().camelize()) || this[param] || this[param.underscore().camelize()];
			if(value) {
				attr[param] = value;
			}
		}
		return attr;
	},
	updateBox : function() {
		if(this.attached) {
			this.setBox(Workspace.Utils.padBox(this.attached.getBox(), this.padding));
		}
	},
	/**
	 * updatePosition
	 * Helper method to recieve 'move' events from attached object
	 */
	updatePosition : function(x, y) {
		this.setPosition(x, y);
	},
	/**
	 * updateDimensions
	 * Helper method to recieve 'resize' events from attached object
	 */
	updateDimensions : function(w, h) {
		this.setDimensions(w, h);
	},
	updateTransform : function(source) {
		this.vectorElement.attr('transform', "R" + (+source.get('rotation')));
		// this.vectorElement.attr('scale',source.get('scale'));
	},
	/**
	 * attachTo
	 * Binds this proxy to a given object, responding to its move, resize, and destroy events
	 */
	attachTo : function(obj) {
		if(this.attached && this.attached.getId) {
			if(this.attached.getId() != obj.getId()) {
				this.detach();
			} else {
				if(this.path) {
					this.updatePath(obj.get('path'));
				} else {
					this.setBox(Workspace.Utils.padBox(obj.getBox(), this.padding));
				}
				return;
			}
		}
		this.attached = obj;
		obj.on('move', this.updateBox, this);
		obj.on('resize', this.updateBox, this);
		obj.on('destroy', this.destroy, this);
		if(this.path) {
			this.updatePath(obj.get('path'));
		} else {
			this.setBox(Workspace.Utils.padBox(obj.getBox(), this.padding));
		}
		this.updateTransform(obj);
	},
	/**
	 * detach
	 * Unbinds event listeners on this proxy's {@link #attached} object
	 */
	detach : function() {
		if(this.attached) {
			this.attached.un('move', this.updateBox, this);
			this.attached.un('resize', this.updateBox, this);
			this.attached.un('destroy', this.destroy, this);
			this.attached = false;
		}
	},
	show : function() {
		if(this.vectorElement) {
			this.vectorElement.show();
			if(this.forceBack) {
				this.vectorElement.toBack();
			}
		}
	},
	hide : function() {
		if(this.vectorElement)
			this.vectorElement.hide();
	},
	destroy : function() {
		if(this.vectorElement)
			this.vectorElement.remove();
	}
});
