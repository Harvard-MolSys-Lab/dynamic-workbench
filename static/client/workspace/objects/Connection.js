////////////////////////////////////////////////////////////////////////////////////////////////
/**
 * @class Workspace.objects.Connection
 * Represents a workspace object connecting two other {@link Workspace.objects.Object}s together
 * @extends Workspace.VectorObject
 */
Ext.define('Workspace.objects.Connection', {
	statics : {
		/**
		 * getPoint
		 * Gets an imitation {@link Workspace.object.Object} suitable *only* to be passed to a
		 * {@link Workspace.objects.Connection} as one of its anchors.
		 * @static
		 * @param {Object} x
		 * @param {Object} y
		 */
		getPoint : function(x, y) {
			return {
				x : x,
				y : y,
				width : 0,
				height : 0,
				getBBox : function() {
					return this;
				},
				on : function() {
				},
				un : function() {
				},
				get : function() {
				},
				set : function() {
				},
			}
		},
	},
	constructor : function() {
		Workspace.objects.Connection.superclass.constructor.apply(this, arguments);
		/**
		 * @cfg {Workspace.Object} leftObject
		 * The first object to connect
		 */
		this.expose('leftObject', true, true, true, false);
		/**
		 * @cfg {Workspace.Object} rightObject
		 * The second object to connect
		 */
		this.expose('rightObject', true, true, true, false);

		/**
		 * @cfg {String} property
		 * The property of leftObject to monitor
		 */
		this.expose('property', true, true, true, false);

		// set up the label editor
		if(this.showLabel) {
			this.addShim(new Workspace.ConnectionLabel({
				property : 'name'
			}));
		}
	},
	extend : 'Workspace.objects.VectorObject',
	requires : ['Workspace.objects.Path'],
	shape : 'path',
	isMovable : false,
	name : 'New Connection',
	iconCls : 'connector',
	wtype : 'Workspace.objects.Connection',
	fillOpacity : 0.1,
	initialize : function() {
		if(this.leftObject.id) {
			this.set('leftObject', Workspace.Components.realize(this.leftObject));
		} else {
			this.leftObject = Workspace.objects.Connection.getPoint(this.leftObject.x, this.leftObject.y);
		}
		if(this.rightObject.id) {
			this.set('rightObject', Workspace.Components.realize(this.rightObject));
		} else {
			this.rightObject = Workspace.objects.Connection.getPoint(this.rightObject.x, this.rightObject.y);
		}
		if(this.property) {
			this.updateProperty();
		}
	},
	unBindObject : function(old) {
		old.un('move', this.onObjectMove, this);
		old.un('hide', this.hide, this);
		old.un('show', this.show, this);
		old.un('destroy', this.destruct, this);
	},
	reBindObject : function(o, old) {
		this.unBindObject(old);
		this.bindObject(o);
		this.updateProperty();
	},
	bindObject : function(o) {
		o.on('move', this.onObjectMove, this);
		o.on('hide', this.hide, this);
		o.on('show', this.show, this);
		o.on('destroy', this.destruct, this);
	},
	updateProperty : function() {
		var left = this.get('leftObject'), right = this.get('rightObject');
		if(left && left.set) {
			left.set(this.property, right);
		}
		if(this.setBoth) {
			if(right && right.set) {
				right.set(this.property, left);
			}
		}
	},
	canConnect : function(left, right) {
		return true;
	},
	acceptLeft : function(left) {
		return true;
	},
	acceptRight : function(right) {
		return true;
	},
	render : function() {
		var o1 = this.get('leftObject');
		var o2 = this.get('rightObject');

		// watch for object movement, showing/hiding, and destroying
		this.bindObject(o1);
		this.bindObject(o2);

		// watch for left and right object to be changed so we can re-attach those events
		this.on('change:leftObject', this.reBindObject, this);
		this.on('change:rightObject', this.reBindObject, this);

		this.path = this.buildPath(o1, o2);
		this.arguments = [this.path];
		Workspace.objects.Connection.superclass.render.apply(this, arguments);
		this.updateDimensions();
		//this.vectorElement.attr({"arrow-end":"classic-wide-long",});
	},
	getHighlightProxy : function() {
		return new Workspace.Proxy(Ext.applyIf({
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
	 * onObjectMove
	 * Rebuilds the path
	 * @private
	 */
	onObjectMove : function() {
		this.rebuildPath();
	},
	applyPath : function(path) {
		this.path = path;
		this.vectorElement.attr({
			path : path
		});
		this.updateHighlightProxy();
	},
	/**
	 * rebuildPath
	 * Calculates the path between the two configured objects and recalculates this object's layout
	 */
	rebuildPath : function() {
		this.path = this.buildPath(this.get('leftObject'), this.get('rightObject'));
		this.vectorElement.attr({
			path : this.path
		});
		this.updateHighlightProxy();
		var box = this.vectorElement.getBBox();
		this.set('x', box.x);
		this.set('y', box.y);
		this.set('height', box.height);
		this.set('width', box.width);
	},
	/**
	 * buildPath
	 * Calculates a path betwen two objects
	 * Adapted from http://raphaeljs.com/graffle.html
	 * @param {Object} obj1
	 * @param {Object} obj2
	 */
	buildPath : function(obj1, obj2) {
		var bb1 = obj1.getBBox(), bb2 = obj2.getBBox(), p = [{
			x : bb1.x + bb1.width / 2,
			y : bb1.y - 1
		}, {
			x : bb1.x + bb1.width / 2,
			y : bb1.y + bb1.height + 1
		}, {
			x : bb1.x - 1,
			y : bb1.y + bb1.height / 2
		}, {
			x : bb1.x + bb1.width + 1,
			y : bb1.y + bb1.height / 2
		}, {
			x : bb2.x + bb2.width / 2,
			y : bb2.y - 1
		}, {
			x : bb2.x + bb2.width / 2,
			y : bb2.y + bb2.height + 1
		}, {
			x : bb2.x - 1,
			y : bb2.y + bb2.height / 2
		}, {
			x : bb2.x + bb2.width + 1,
			y : bb2.y + bb2.height / 2
		}], d = {}, dis = [];
		
		if(this.thetaProperty && obj1.has(this.thetaProperty) && obj2.has(this.thetaProperty)) {
			var c1 = {
				x: bb1.x + bb1.width / 2,
				y: bb1.y + bb1.height / 2,
				r: bb1.width / 2,
			}, c2 = {
				x: bb2.x + bb2.width / 2,
				y: bb2.y + bb2.height / 2,
				r: bb2.width / 2,
			};
			var theta1 = obj1.get(this.thetaProperty)*Math.PI/180, theta2 = obj2.get(this.thetaProperty)*Math.PI/180;
			var l = 30;
			var path = ["M",c1.x+Math.cos(theta1)*c1.r, c1.y+Math.sin(theta1)*c1.r,
				// first control point
				'C',c1.x+Math.cos(theta1)*(c1.r+l), c1.y+Math.sin(theta1)*(c1.r+l),
				
				// second control point
				c2.x+Math.cos(theta2)*(c2.r+l), c2.y+Math.sin(theta2)*(c2.r+l),
				
				// endpoint
				c2.x+Math.cos(theta2)*(c2.r), c2.y+Math.sin(theta2)*(c2.r)
			];
		} else {
			for(var i = 0; i < 4; i++) {
				for(var j = 4; j < 8; j++) {
					var dx = Math.abs(p[i].x - p[j].x), dy = Math.abs(p[i].y - p[j].y);
					if((i == j - 4) || (((i != 3 && j != 6) || p[i].x < p[j].x) && ((i != 2 && j != 7) || p[i].x > p[j].x) && ((i != 0 && j != 5) || p[i].y > p[j].y) && ((i != 1 && j != 4) || p[i].y < p[j].y))) {
						dis.push(dx + dy);
						d[dis[dis.length - 1]] = [i, j];
					}
				}
			}
			if(dis.length == 0) {
				var res = [0, 4];
			} else {
				res = d[Math.min.apply(Math, dis)];
			}
			var x1 = p[res[0]].x, y1 = p[res[0]].y, x4 = p[res[1]].x, y4 = p[res[1]].y;
			dx = Math.max(Math.abs(x1 - x4) / 2, 10);
			dy = Math.max(Math.abs(y1 - y4) / 2, 10);
			var x2 = [x1, x1, x1 - dx, x1 + dx][res[0]].toFixed(3), //
			y2 = [y1 - dy, y1 + dy, y1, y1][res[0]].toFixed(3), //
			x3 = [0, 0, 0, 0, x4, x4, x4 - dx, x4 + dx][res[1]].toFixed(3), //
			y3 = [0, 0, 0, 0, y1 + dy, y1 - dy, y4, y4][res[1]].toFixed(3);
			var path = ["M", x1.toFixed(3), y1.toFixed(3), "C", x2, y2, x3, y3, x4.toFixed(3), y4.toFixed(3)];
			//.join(",");
		}
		return path;
	},
	getLeftPoint : function() {
		var path = this.path, point = [path[1], path[2]];
		return point;
	},
	getRightPoint : function() {
		var path = this.path, point = [path[path.length - 2], path[path.length - 1]];
		return point;
	},
	destruct : function() {
		this.workspace.deleteObjects([this]);
	},
	destroy : function() {
		if(!this.is('destroyed')) {

			if(this.property) {
				this.get('leftObject').set(this.property, false);
				if(this.setBoth) {
					this.get('rightObject').set(this.property, false);
				}
			}
			this.unBindObject(this.get('leftObject'));
			this.unBindObject(this.get('rightObject'));
			this.callParent(arguments);
		}
	}
}, function() {
	Workspace.objects.Connection.borrow(Workspace.objects.Path, ['updatePath', 'updateDimensions'])
	Workspace.reg('Workspace.objects.Connection', Workspace.objects.Connection);
});
