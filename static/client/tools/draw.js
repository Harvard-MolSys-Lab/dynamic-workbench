/***********************************************************************************************
 * InfoMachine
 *
 *
 * Copyright (c) 2010-2011 Casey Grun
 *
 ***********************************************************************************************
 * ~/client/tools/draw.js
 *
 * Defines subclasses of {Workspace.tools.BaseTool} which allow the user to draw and modify
 * various vector-graphic shapes (e.g. rectangles, ellipses, lines)
 ***********************************************************************************************/

////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * @class Workspace.tools.PencilTool
 * Allows the user to draw free-hand paths
 * @extends Workspace.tools.BaseTool
 * @param {Object} workspace
 * @param {Object} config
 */
Ext.define('Workspace.tools.PencilTool', {
	constructor: function(workspace, config) {
		this.workspace = workspace;
		Ext.apply(this, config, {

		});

		Workspace.tools.PencilTool.superclass.constructor.call(this, workspace, config);
		this.dragging = false;
		this.currentPath = false;
		this.currentShape = false;
	},
	extend:'Workspace.tools.BaseTool',
	click: function(e, item) {

	},
	dblclick: function(e, item) {

	},
	mousedown: function(e, item) {
		this.dragging = true;
		pos = this.getAdjustedXY(e);
		this.currentPath = [['M', pos.x, pos.y]];
		this.currentShape = this.workspace.paper.path(this.currentPath);
		this.currentShape.attr(App.Stylesheet.Draw);
	},
	mouseup: function(e, item) {
		this.dragging = false;
		var obj = this.workspace.createObject(Workspace.objects.Path, {
			path: this.currentPath,

			'stroke-width': '5px'
		});
		this.currentShape.remove();
		this.currentPath = false;
		this.currentShape = false;
		this.workspace.setSelection([obj]);
	},
	mousemove: function(e, item) {
		if (this.dragging) {
			pos = this.getAdjustedXY(e);
			this.currentPath.push(['L', pos.x, pos.y]);
			this.currentShape.attr({
				path: this.currentPath
			});
		}
	}
}, function() {
	Workspace.Tools.register('pencil', Workspace.tools.PencilTool);
});
////////////////////////////////////////////////////////////////////////////////////////////////
// not implemented
Ext.define('Workspace.tools.PaintbrushTool', {
	constructor: function(workspace, config) {
		this.workspace = workspace;
		Ext.apply(this, config, {

		});
		this.dragging = false;
		Workspace.tools.PaintbrushTool.superclass.constructor.call(this, workspace, config);
	},
	extend:'Workspace.tools.BaseTool',
	click: function(e, item) {
		// Relevant item
		if (Ext.type(item.select) == 'function') {
			item.select();
		} else {
			this.workspace.deselect();
		}

		e.stopEvent();
	},
	dblclick: function(e, item) {
		// Relevant item
		if (Ext.type(item.edit) == 'function') {
			item.edit();
		} else {
			if (Ext.type(item.select) == 'function') {
				item.select();
			} else {
				this.workspace.deselect();
			}
		}

		e.stopEvent();
	},
	mousedown: function(e, item) {
		this.dragging = true;
	},
	mouseup: function(e, item) {
		this.dragging = false;
	},
	mousemove: function(e, item) {
		if (this.dragging) {

		}
	}
}, function() {
	Workspace.Tools.register('paintbrush', Workspace.tools.PaintbrushTool);
});
////////////////////////////////////////////////////////////////////////////////////////////////

// not implemented
/**
 * @class Workspace.tools.VectorTool
 * @extends Workspace.tools.BaseTool
 * @param {Object} workspace
 * @param {Object} config
 */
Ext.define('Workspace.tools.VectorTool', {
	constructor: function(workspace, config) {
		this.workspace = workspace;
		Ext.apply(this, config, {

		});
		Workspace.tools.VectorTool.superclass.constructor.call(this, workspace, config);

		this.dragging = false;
	},
	extend:'Workspace.tools.BaseTool',
	click: function(e, item) {
		// Relevant item
		if (Ext.type(item.select) == 'function') {
			item.select();
		} else {
			this.workspace.deselect();
		}

		e.stopEvent();
	},
	dblclick: function(e, item) {
		// Relevant item
		if (Ext.type(item.edit) == 'function') {
			item.edit();
		} else {
			if (Ext.type(item.select) == 'function') {
				item.select();
			} else {
				this.workspace.deselect();
			}
		}

		e.stopEvent();
	},
	mousedown: function(e, item) {
		this.dragging = true;
	},
	mouseup: function(e, item) {
		this.dragging = false;
	},
	mousemove: function(e, item) {
		if (this.dragging) {

		}
	}
}, function() {
	Workspace.Tools.register('vector', Workspace.tools.VectorTool);
});
////////////////////////////////////////////////////////////////////////////////////////////////
/**
 * @class Workspace.tools.RectTool
 * Draws rectangles
 * @extends Workspace.tools.BaseTool
 * @param {Object} workspace
 * @param {Object} config
 */
Ext.define('Workspace.tools.RectTool', {
	constructor: function(workspace, config) {
		this.workspace = workspace;
		Ext.apply(this, config, {
			parameters: {}
		});

		Workspace.tools.RectTool.superclass.constructor.call(this, workspace, config);

		Ext.apply(this.parameters, App.Stylesheet.Draw);

		this.dragging = false;
		this.proto = false;
		this.x1 = 0;
		this.y1 = 0;
	},
	extend:'Workspace.tools.BaseTool',
	minWidth: 10,
	maxWidth: false,
	minHeight: 10,
	maxHeight: false,
	click: function(e, item) {

		e.stopEvent();
	},
	dblclick: function(e, item) {

		e.stopEvent();
	},
	mousedown: function(e, item) {
		this.dragging = true;
		if (this.proto) {
			this.proto.remove();
		}

		this.createProto(e);
	},
	mouseup: function(e, item) {
		this.dragging = false;

		if (this.proto) {

			var pos = this.getAdjustedXY(e);
			this.x2 = pos.x;
			this.y2 = pos.y;
			var attr = Workspace.tools.SelectorBand.calculateBandBox(this.x1, this.y1, this.x2, this.y2);

			var obj = this.workspace.createObject(Workspace.VectorRectObject, {
				x: attr.x,
				y: attr.y,
				width: Workspace.Utils.bounds(attr.width, this.minWidth, this.maxWidth),
				height: Workspace.Utils.bounds(attr.height, this.minHeight, this.maxHeight)
			});
			this.workspace.setSelection([obj]);

			this.proto.remove();
		}
	},
	mousemove: function(e, item) {
		if (this.dragging) {
			if (!this.proto) {
				this.createProto(e);
			}

			var pos = this.getAdjustedXY(e);
			this.x2 = pos.x;
			this.y2 = pos.y;
			var attr = Workspace.tools.SelectorBand.calculateBandBox(this.x1, this.y1, this.x2, this.y2);

			this.x = attr.x;
			this.y = attr.y;
			this.width = attr.width;
			this.height = attr.height;
			this.anchor = attr.anchor;
			delete attr.anchor;

			this.proto.attr(attr);
		}
	},
	createProto: function(e) {
		var pos = this.getAdjustedXY(e);
		this.x1 = pos.x;
		this.y1 = pos.y;

		this.proto = this.workspace.paper.rect(this.x1, this.y1, 0, 0);
		this.proto.attr(this.parameters);
	},
	deactivate: function() {

	}
}, function() {
	Workspace.Tools.register('rect', Workspace.tools.RectTool);
});
////////////////////////////////////////////////////////////////////////////////////////////////
/**
 * @class Workspace.tools.EllipseTool
 * Draws ellipses
 * @extends Workspace.tools.BaseTool
 * @param {Object} workspace
 * @param {Object} config
 */
Ext.define('Workspace.tools.EllipseTool', {
	constructor: function(workspace, config) {
		this.workspace = workspace;
		Ext.apply(this, config, {
			parameters: {}
		});
		Workspace.tools.EllipseTool.superclass.constructor.call(this, workspace, config);

		Ext.apply(this.parameters, App.Stylesheet.Draw);

		this.dragging = false;
		this.proto = false;
		this.x1 = 0;
		this.y1 = 0;
	},
	extend:'Workspace.tools.BaseTool',
	click: function(e, item) {

		e.stopEvent();
	},
	dblclick: function(e, item) {

		e.stopEvent();
	},
	mousedown: function(e, item) {
		this.dragging = true;
		if (this.proto) {
			this.proto.remove();
			delete this.proto;
		}

		this.createProto(e);
	},
	mouseup: function(e, item) {
		this.dragging = false;

		if (this.proto) {

			var pos = this.getAdjustedXY(e);
			this.x2 = pos.x;
			this.y2 = pos.y;
			var attr = Workspace.tools.SelectorBand.calculateBandBox(this.x1, this.y1, this.x2, this.y2);

			var o = this.workspace.createObject(Workspace.VectorEllipseObject, {
				x: (attr.x),
				y: (attr.y),
				width: (attr.width),
				height: (attr.height),
				fill: this.parameters.fill,
				stroke: this.parameters.stroke
			});
			this.workspace.setSelection([o]);

			this.proto.remove();
			delete this.proto;
			return false;
		}
	},
	mousemove: function(e, item) {
		if (this.dragging) {
			if (!this.proto) {
				this.createProto(e);
			}

			var pos = this.getAdjustedXY(e);
			this.x2 = pos.x;
			this.y2 = pos.y;
			var attr = SelectorBand.calculateBandBox(this.x1, this.y1, this.x2, this.y2);
			var ellipseAttr = {
				cx: attr.x + (attr.width / 2),
				cy: attr.y + (attr.height / 2),
				rx: (attr.width / 2),
				ry: (attr.height / 2)
			};

			this.x = attr.x;
			this.y = attr.y;
			this.width = attr.width;
			this.height = attr.height;
			this.anchor = attr.anchor;
			delete attr.anchor;

			this.proto.attr(ellipseAttr);
		}
	},
	createProto: function(e) {
		var pos = this.getAdjustedXY(e);
		this.x1 = pos.x;
		this.y1 = pos.y;

		this.proto = this.workspace.paper.ellipse(this.x1, this.y1, 0, 0);
		this.proto.attr(this.parameters);
	}
}, function() {
	Workspace.Tools.register('ellipse', Workspace.tools.EllipseTool);
});
////////////////////////////////////////////////////////////////////////////////////////////////
/**
 * @class Workspace.tools.LineTool
 * Draws straight lines
 * @extends Workspace.tools.BaseTool
 * @param {Object} workspace
 * @param {Object} config
 */
Ext.define('Workspace.tools.LineTool', {
	constructor: function(workspace, config) {
		this.workspace = workspace;
		Ext.apply(this, config, {
			parameters: {}
		});
		Workspace.tools.LineTool.superclass.constructor.call(this, workspace, config);

		Ext.apply(this.parameters, App.Stylesheet.Draw);

		this.dragging = false;
		this.proto = false;
		this.x1 = 0;
		this.y1 = 0;
	},
	extend:'Workspace.tools.BaseTool',
	click: function(e, item) {

		e.stopEvent();
	},
	dblclick: function(e, item) {

		e.stopEvent();
	},
	mousedown: function(e, item) {
		this.dragging = true;
		if (this.proto) {
			this.proto.remove();
		}

		this.createProto(e);
	},
	mouseup: function(e, item) {
		this.dragging = false;

		if (this.proto) {

			var pos = this.getAdjustedXY(e);
			this.x2 = pos.x;
			this.y2 = pos.y;

			var o = this.workspace.createObject(Workspace.objects.Path, {
				path: [['M', this.x1, this.y1], ['L', this.x2, this.y2]]
			})

			this.proto.remove();
			this.workspace.setSelection([o]);
		}
	},
	mousemove: function(e, item) {
		if (this.dragging) {
			if (!this.proto) {
				this.createProto(e);
			}

			var pos = this.getAdjustedXY(e);
			this.x2 = pos.x;
			this.y2 = pos.y;

			this.proto.attr({
				path: [['M', this.x1, this.y1], ['L', this.x2, this.y2]]
			});
		}
	},
	createProto: function(e) {
		var pos = this.getAdjustedXY(e);
		this.x1 = pos.x;
		this.y1 = pos.y;

		this.proto = this.workspace.paper.path([['M', this.x1, this.y1]]);
		this.proto.attr(this.parameters);
	}
}, function() {
	Workspace.Tools.register('line', Workspace.tools.LineTool);
});
////////////////////////////////////////////////////////////////////////////////////////////////
/**
 * @class Workspace.tools.ConnectorTool
 * Draws curved connectors between objects
 * @extends Workspace.tools.BaseTool
 * @param {Object} workspace
 * @param {Object} config
 */
Ext.define('Workspace.tools.ConnectorTool', {
	
	/**
	 * @constructor
	 * @param {Workspace} workspace
	 * @param {Object} config
	 */
	constructor: function(workspace, config) {
		this.workspace = workspace;
		Ext.apply(this, config, {
			parameters: {}
		});
		Workspace.tools.ConnectorTool.superclass.constructor.call(this, workspace, config);

		Ext.apply(this.parameters, App.Stylesheet.Draw);

		this.dragging = false;
		this.proto = false;
		this.x1 = 0;
		this.y1 = 0;
	},
	extend:'Workspace.tools.BaseTool',
	mixins: {
		highlightable: 'Workspace.tools.Highlightable'
	},
	/**
	 * @cfg {String} targetWType the wtype of the {@link Workspace.object.Object} to create upon mouseup
	 */
	targetWType: 'Workspace.objects.Connection',
	/**
	 * @cfg {Boolean} showLabel true to show an editable label on created connections (defaults to true)
	 */
	showLabel: true,
	/**
	 * accept
	 * Determines whether the given item will be highlighted. This method calls {@link #acceptLeft} and {@link #acceptRight}
	 * to determine whether the proposed connection is valid.
	 * @param {Workspace.objects.Object} item
	 * @return {Boolean} valid
	 */
	accept: function(item) {
    	return (this.dragging) ? this.acceptRight(item) : this.acceptLeft(item);
    },
    
    /**
     * acceptLeft
     * Determines whether the given item is a valid target to begin a connection. Override to provide custom logic.
	 * @param {Workspace.objects.Object} item
	 * @return {Boolean} valid
     */
	acceptLeft: function(left) {
    	return true;
    },
    /**
     * acceptLeft
     * Determines whether the given item is a valid target to end a connection. Override to provide custom logic.
	 * @param {Workspace.objects.Object} item
	 * @return {Boolean} valid
     */
    acceptRight: function(right) {
    	return true;
    },
    /**
     * Called upon mouseup to determine whether the two items given can be connected. Override to provide custom logic.
     * @param {Workspace.objects.Object} left
     * @param {Workspace.objects.Object} right
     */
    canConnect: function(left,right) {
    	return true;
    },
    /**
     * Called upon item creation
     * @param {Workspace.objects.Connection} obj The newly created connection
     * @param {Workspace.objects.Object} left
     * @param {Workspace.objects.Object} right 
     */
    onConnect: function(obj,left,right) {
    	
    },
    click: function(e, item){
        e.stopEvent();
    },
    dblclick: function(e, item){

        e.stopEvent();
    },
    mousedown: function(e, item){
        if(this.acceptLeft(item)) {
	        this.dragging = true;
	        if (this.proto){
	            this.proto.remove();
	        }
			
	        this.createProto(e, item);
	        e.stopEvent();
        } else {
        	this.fireEvent('reject',item,this);
        	// if (this.proto){
	            // this.proto.remove();
	        // }
        }
    },
    mouseup: function(e, item){
    	if(this.dragging) {
	        this.dragging = false;
	
	        if (this.proto){
	
	            var p = this.getAdjustedXY(e);
	            if (item){
	                this.rightObject = item;
	            } else{
	                this.rightObject = Workspace.objects.Connection.getPoint(p.x, p.y);
	            }
	            
	            if(this.acceptRight(this.rightObject) && this.canConnect(this.leftObject,this.rightObject)) {
		            var o = this.workspace.createObject({
		            	wtype: this.targetWType,
		                leftObject: this.leftObject,
		                rightObject: this.rightObject
		                //path: [['M',this.x1,this.y1],['L',this.x2,this.y2]]
		            });
		            this.onConnect(o,this.leftObject,this.rightObject);
	            } else {
	            	this.fireEvent('reject',item,this);
	            } 
	            
	            delete this.leftObject;
	            delete this.rightObject;
	            
	            this.proto.remove();
	        }
	        e.stopEvent();
        }
    },
    mousemove: function(e, item){
        if (this.dragging){
            if (!this.proto){
                this.createProto(e);
            }

            var pos = this.getAdjustedXY(e), mouseRadius = 8, theta = Math.atan2(pos.y-this.y1,pos.x-this.x1);
            this.x2 = pos.x - Math.cos(theta)*mouseRadius;
            this.y2 = pos.y - Math.sin(theta)*mouseRadius;

            this.proto.attr({
                path: [['M', this.x1, this.y1], ['L', this.x2, this.y2]]
            });
        }
        e.stopEvent();
    },
    createProto: function(e, item){
        var p = this.getAdjustedXY(e);
        this.x1 = p.x;
        this.y1 = p.y;
        if (item){
            this.leftObject = item;
        } else{
            this.leftObject = Workspace.objects.Connection.getPoint(p.x, p.y);
        }

        this.proto = this.workspace.paper.path([['M', this.x1, this.y1]]);
        this.proto.attr(this.parameters);
    },

	// hack
	mouseover: function(e,item) {
		this.mixins.highlightable.mouseover.apply(this,arguments);
	},
	mouseout: function(e,item) {
		this.mixins.highlightable.mouseout.apply(this,arguments);
	}
}, function() {
	Workspace.Tools.register('connector', Workspace.tools.ConnectorTool);
});
////////////////////////////////////////////////////////////////////////////////////////////////
// not implemented
Ext.define('Workspace.tools.CurveTool', {
	constructor: function(workspace, config) {
		this.workspace = workspace;
		Ext.apply(this, config, {

		});
		Workspace.tools.CurveTool.superclass.constructor.call(this, workspace, config);

		this.drawing = false;
		this.dragging = false;
		this.currentPath = false;
		this.currentShape = false;
	},
	extend:'Workspace.tools.BaseTool',
	click: function(e, item) {
		if (this.drawing) {
			var pos = this.getAdjustedXY(e);
			this.x1 = parseInt(pos.x);
			this.y1 = parseInt(pos.y);
			this.currentPath.push(['T', this.x1, this.y1]);
			this.currentShape.attr({
				path: this.currentPath
			});
		} else {
			this.drawing = true;
			var pos = this.getAdjustedXY(e);
			this.x1 = parseInt(pos.x);
			this.y1 = parseInt(pos.y);
			this.currentPath = [['M', this.x1, this.y1]];
			this.currentPath.push(['T', this.x1, this.y1]);
			this.currentShape = this.workspace.paper.path(this.currentPath);
			this.currentShape.attr(App.Stylesheet.Draw);
		}
		e.stopEvent();
	},
	dblclick: function(e, item) {
		this.drawing = false;
		this.dragging = false;
		var o = this.workspace.createObject(Workspace.objects.Path, {
			path: this.currentPath,
			'stroke': '#000',
			'stroke-width': '5px'
		});
		this.currentShape.remove();
		this.currentPath = false;
		this.currentShape = false;
		this.workspace.setSelection([o]);
		e.stopEvent();
	},
	mousedown: function(e, item) {
		this.dragging = true;
		var pos = this.getAdjustedXY(e);
		e.stopEvent();
	},
	mouseup: function(e, item) {
		e.stopEvent();
	},
	mousemove: function(e, item) {
		if (this.drawing) {
			pos = this.getAdjustedXY(e);
			this.currentPath.pop();
			this.currentPath.push(['T', parseInt(pos.x), parseInt(pos.y)]);
			this.currentShape.attr({
				path: this.currentPath
			});
		}
		e.stopEvent();
	}
}, function() {
	Workspace.Tools.register('curve', Workspace.tools.CurveTool);
});
////////////////////////////////////////////////////////////////////////////////////////////////
/**
 * @class Workspace.tools.PolyLineTool
 * Draws straight polylines
 * @extends Workspace.tools.BaseTool
 * @param {Object} workspace
 * @param {Object} config
 */
Ext.define('Workspace.tools.PolyLineTool', {
	constructor: function(workspace, config) {
		this.workspace = workspace;
		Ext.apply(this, config, {
			protoProps: App.Stylesheet.Draw
		});
		Workspace.tools.PolyLineTool.superclass.constructor.call(this, workspace, config);

		this.drawing = false;
		this.dragging = false;
		this.currentPath = false;
		this.currentShape = false;
	},
	extend:'Workspace.tools.BaseTool',
	click: function(e, item) {
		if (this.drawing) {
			var pos = this.getAdjustedXY(e);
			this.x = parseInt(pos.x);
			this.y = parseInt(pos.y);
			this.currentPath.push(['L', this.x, this.y]);
			this.currentShape.attr({
				path: this.currentPath
			});
		} else {
			this.drawing = true;
			var pos = this.getAdjustedXY(e);
			this.x1 = parseInt(pos.x);
			this.y1 = parseInt(pos.y);
			this.currentPath = [['M', this.x1, this.y1]];
			this.currentPath.push(['L', this.x1, this.y1]);
			this.currentShape = this.workspace.paper.path(this.currentPath);
			this.currentShape.attr(this.protoProps);
		}
		e.stopEvent();
	},
	dblclick: function(e, item) {
		this.drawing = false;
		this.dragging = false;
		this.currentPath.pop();
		this.currentPath.pop();
		var o = this.workspace.createObject(Workspace.objects.Path, {
			path: this.currentPath,
			fillOpacity: 0.1
		});
		this.currentShape.remove();
		this.currentPath = false;
		this.currentShape = false;
		this.workspace.setSelection([o]);
		e.stopEvent();
	},
	mousedown: function(e, item) {
		this.dragging = true;
		var pos = this.getAdjustedXY(e);
		e.stopEvent();
	},
	mouseup: function(e, item) {
		e.stopEvent();
	},
	mousemove: function(e, item) {
		if (this.drawing) {
			pos = this.getAdjustedXY(e);
			this.currentPath.pop();
			this.currentPath.push(['L', parseInt(pos.x), parseInt(pos.y)]);
			this.currentShape.attr({
				path: this.currentPath
			});
		}
		e.stopEvent();
	}
}, function() {
	Workspace.Tools.register('polyline', Workspace.tools.PolyLineTool);
});
////////////////////////////////////////////////////////////////////////////////////////////////
/**
 * @class Workspace.tools.PolygonTool
 * Draws closed polygons
 * @extends Workspace.tools.PolyLineTool
 * @param {Object} workspace
 * @param {Object} config
 */
Ext.define('Workspace.tools.PolygonTool', {
	constructor: function(workspace, config) {
		this.workspace = workspace;
		Workspace.tools.PolygonTool.superclass.constructor.call(this, workspace, config);

		Ext.apply(this.protoProps, App.Stylesheet.Draw);
	},
	extend:'Workspace.tools.PolyLineTool',
	dblclick: function(e, item) {
		this.drawing = false;
		this.dragging = false;
		this.currentPath.pop();
		this.currentPath.pop();
		this.currentPath.push(['L', this.x1, this.y1]);
		var o = this.workspace.createObject(Workspace.objects.Path, {
			path: this.currentPath,
			fillOpacity: 1
		});
		this.currentShape.remove();
		this.currentPath = false;
		this.currentShape = false;
		this.workspace.setSelection([o]);
		e.stopEvent();
	},
}, function() {
	Workspace.Tools.register('polygon', Workspace.tools.PolygonTool);
});