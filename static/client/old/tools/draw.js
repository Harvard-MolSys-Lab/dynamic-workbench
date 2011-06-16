/***********************************************************************************************
 * InfoMachine
 * 
 * 
 * Copyright (c) 2010-2011 Casey Grun
 * 
 ***********************************************************************************************
 * ~/client/tools/draw.js
 * 
 * Defines subclasses of {Workspace.tool.BaseTool} which allow the user to draw and modify 
 * various vector-graphic shapes (e.g. rectangles, ellipses, lines)
 ***********************************************************************************************/


////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * @class Workspace.tool.PencilTool
 * Allows the user to draw free-hand paths
 * @extends Workspace.tool.BaseTool
 * @param {Object} workspace
 * @param {Object} config
 */
Workspace.tool.PencilTool = function(workspace, config){
    this.workspace = workspace;
    Ext.apply(this, config, {

        });

    Workspace.tool.PencilTool.superclass.constructor.call(this, workspace, config);
    this.dragging = false;
    this.currentPath = false;
    this.currentShape = false;
};

Ext.extend(Workspace.tool.PencilTool, Workspace.tool.BaseTool, {
    click: function(e, item){

        },
    dblclick: function(e, item){

        },
    mousedown: function(e, item){
        this.dragging = true;
        pos = this.getAdjustedXY(e);
        this.currentPath = [['M', pos.x, pos.y]];
        this.currentShape = this.workspace.paper.path(this.currentPath);
        this.currentShape.attr({
            'stroke': '#000',
            'stroke-width': '5px'
        });
    },
    mouseup: function(e, item){
        this.dragging = false;
        var obj = this.workspace.createObject(Workspace.VectorPathObject, {
            path: this.currentPath,
            'stroke': '#000',
            'stroke-width': '5px'
        });
        this.currentShape.remove();
        this.currentPath = false;
        this.currentShape = false;
        this.workspace.setSelection([obj]);
    },
    mousemove: function(e, item){
        if (this.dragging){
            pos = this.getAdjustedXY(e);
            this.currentPath.push(['L', pos.x, pos.y]);
            this.currentShape.attr({
                path: this.currentPath
            });
        }
    }
});

Workspace.Tools.register('pencil', Workspace.tool.PencilTool);


////////////////////////////////////////////////////////////////////////////////////////////////
// not implemented
Workspace.tool.PaintbrushTool = function(workspace, config){
    this.workspace = workspace;
    Ext.apply(this, config, {

        });
    this.dragging = false;
    Workspace.tool.PaintbrushTool.superclass.constructor.call(this, workspace, config);
};

Ext.extend(Workspace.tool.PaintbrushTool, Workspace.tool.BaseTool, {
    click: function(e, item){
        // Relevant item
        if (Ext.type(item.select) == 'function'){
            item.select();
        } else{
            this.workspace.deselect();
        }

        e.stopEvent();
    },
    dblclick: function(e, item){
        // Relevant item
        if (Ext.type(item.edit) == 'function'){
            item.edit();
        } else{
            if (Ext.type(item.select) == 'function'){
                item.select();
            } else{
                this.workspace.deselect();
            }
        }

        e.stopEvent();
    },
    mousedown: function(e, item){
        this.dragging = true;
    },
    mouseup: function(e, item){
        this.dragging = false;
    },
    mousemove: function(e, item){
        if (this.dragging){

            }
    }
});

Workspace.Tools.register('paintbrush', Workspace.tool.PaintbrushTool);

////////////////////////////////////////////////////////////////////////////////////////////////

// not implemented
/**
 * @class Workspace.tool.VectorTool
 * @extends Workspace.tool.BaseTool
 * @param {Object} workspace
 * @param {Object} config
 */
Workspace.tool.VectorTool = function(workspace, config){
    this.workspace = workspace;
    Ext.apply(this, config, {

        });
    Workspace.tool.VectorTool.superclass.constructor.call(this, workspace, config);

    this.dragging = false;
};

Ext.extend(Workspace.tool.VectorTool, Workspace.tool.BaseTool, {
    click: function(e, item){
        // Relevant item
        if (Ext.type(item.select) == 'function'){
            item.select();
        } else{
            this.workspace.deselect();
        }

        e.stopEvent();
    },
    dblclick: function(e, item){
        // Relevant item
        if (Ext.type(item.edit) == 'function'){
            item.edit();
        } else{
            if (Ext.type(item.select) == 'function'){
                item.select();
            } else{
                this.workspace.deselect();
            }
        }

        e.stopEvent();
    },
    mousedown: function(e, item){
        this.dragging = true;
    },
    mouseup: function(e, item){
        this.dragging = false;
    },
    mousemove: function(e, item){
        if (this.dragging){

            }
    }
});

Workspace.Tools.register('vector', Workspace.tool.VectorTool);

////////////////////////////////////////////////////////////////////////////////////////////////
/**
 * @class Workspace.tool.RectTool
 * Draws rectangles
 * @extends Workspace.tool.BaseTool
 * @param {Object} workspace
 * @param {Object} config
 */
Workspace.tool.RectTool = function(workspace, config){
    this.workspace = workspace;
    Ext.apply(this, config, {
        parameters: {}
    });

    Workspace.tool.RectTool.superclass.constructor.call(this, workspace, config);

    Ext.apply(this.parameters, {
        fill: '#fff',
        stroke: '#000'
    });

    this.dragging = false;
    this.proto = false;
    this.x1 = 0;
    this.y1 = 0;
};

Ext.extend(Workspace.tool.RectTool, Workspace.tool.BaseTool, {
    minWidth: 10,
    maxWidth: false,
    minHeight: 10,
    maxHeight: false,
    click: function(e, item){

        e.stopEvent();
    },
    dblclick: function(e, item){

        e.stopEvent();
    },
    mousedown: function(e, item){
        this.dragging = true;
        if (this.proto){
            this.proto.remove();
        }

        this.createProto(e);
    },
    mouseup: function(e, item){
        this.dragging = false;

        if (this.proto){

            var pos = this.getAdjustedXY(e);
            this.x2 = pos.x;
            this.y2 = pos.y;
            var attr = Workspace.tool.SelectorBand.calculateBandBox(this.x1, this.y1, this.x2, this.y2);

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
    mousemove: function(e, item){
        if (this.dragging){
            if (!this.proto){
                this.createProto(e);
            }

            var pos = this.getAdjustedXY(e);
            this.x2 = pos.x;
            this.y2 = pos.y;
            var attr = Workspace.tool.SelectorBand.calculateBandBox(this.x1, this.y1, this.x2, this.y2);

            this.x = attr.x;
            this.y = attr.y;
            this.width = attr.width;
            this.height = attr.height;
            this.anchor = attr.anchor;
            delete attr.anchor;

            this.proto.attr(attr);
        }
    },
    createProto: function(e){
        var pos = this.getAdjustedXY(e);
        this.x1 = pos.x;
        this.y1 = pos.y;

        this.proto = this.workspace.paper.rect(this.x1, this.y1, 0, 0);
        this.proto.attr(this.parameters);
    },
    deactivate: function(){

        }
});

Workspace.Tools.register('rect', Workspace.tool.RectTool);


////////////////////////////////////////////////////////////////////////////////////////////////
/**
 * @class Workspace.tool.EllipseTool
 * Draws ellipses
 * @extends Workspace.tool.BaseTool
 * @param {Object} workspace
 * @param {Object} config
 */
Workspace.tool.EllipseTool = function(workspace, config){
    this.workspace = workspace;
    Ext.apply(this, config, {
        parameters: {}
    });
    Workspace.tool.EllipseTool.superclass.constructor.call(this, workspace, config);


    Ext.apply(this.parameters, {
        fill: '#fff',
        stroke: '#000',
        'stroke-width': 1
    });

    this.dragging = false;
    this.proto = false;
    this.x1 = 0;
    this.y1 = 0;
};

Ext.extend(Workspace.tool.EllipseTool, Workspace.tool.BaseTool, {
    click: function(e, item){

        e.stopEvent();
    },
    dblclick: function(e, item){

        e.stopEvent();
    },
    mousedown: function(e, item){
        this.dragging = true;
        if (this.proto){
            this.proto.remove();
            delete this.proto;
        }

        this.createProto(e);
    },
    mouseup: function(e, item){
        this.dragging = false;

        if (this.proto){

            var pos = this.getAdjustedXY(e);
            this.x2 = pos.x;
            this.y2 = pos.y;
            var attr = Workspace.tool.SelectorBand.calculateBandBox(this.x1, this.y1, this.x2, this.y2);

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
    mousemove: function(e, item){
        if (this.dragging){
            if (!this.proto){
                this.createProto(e);
            }

            var pos = this.getAdjustedXY(e);
            this.x2 = pos.x;
            this.y2 = pos.y;
            var attr = Workspace.tool.SelectorBand.calculateBandBox(this.x1, this.y1, this.x2, this.y2);
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
    createProto: function(e){
        var pos = this.getAdjustedXY(e);
        this.x1 = pos.x;
        this.y1 = pos.y;

        this.proto = this.workspace.paper.ellipse(this.x1, this.y1, 0, 0);
        this.proto.attr(this.parameters);
    }
});

Workspace.Tools.register('ellipse', Workspace.tool.EllipseTool);

////////////////////////////////////////////////////////////////////////////////////////////////
/**
 * @class Workspace.tool.LineTool
 * Draws straight lines
 * @extends Workspace.tool.BaseTool
 * @param {Object} workspace
 * @param {Object} config
 */
Workspace.tool.LineTool = function(workspace, config){
    this.workspace = workspace;
    Ext.apply(this, config, {
        parameters: {}
    });
    Workspace.tool.LineTool.superclass.constructor.call(this, workspace, config);

    Ext.apply(this.parameters, {
        stroke: '#000'
    });

    this.dragging = false;
    this.proto = false;
    this.x1 = 0;
    this.y1 = 0;
};

Ext.extend(Workspace.tool.LineTool, Workspace.tool.BaseTool, {
    click: function(e, item){

        e.stopEvent();
    },
    dblclick: function(e, item){

        e.stopEvent();
    },
    mousedown: function(e, item){
        this.dragging = true;
        if (this.proto){
            this.proto.remove();
        }

        this.createProto(e);
    },
    mouseup: function(e, item){
        this.dragging = false;

        if (this.proto){

            var pos = this.getAdjustedXY(e);
            this.x2 = pos.x;
            this.y2 = pos.y;

            var o = this.workspace.createObject(Workspace.VectorPathObject, {
                path: [['M', this.x1, this.y1], ['L', this.x2, this.y2]]
            })

            this.proto.remove();
            this.workspace.setSelection([o]);
        }
    },
    mousemove: function(e, item){
        if (this.dragging){
            if (!this.proto){
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
    createProto: function(e){
        var pos = this.getAdjustedXY(e);
        this.x1 = pos.x;
        this.y1 = pos.y;

        this.proto = this.workspace.paper.path([['M', this.x1, this.y1]]);
        this.proto.attr(this.parameters);
    }
});

Workspace.Tools.register('line', Workspace.tool.LineTool);

////////////////////////////////////////////////////////////////////////////////////////////////
/**
 * @class Workspace.tool.ConnectorTool
 * Draws curved connectors between objects
 * @extends Workspace.tool.BaseTool
 * @param {Object} workspace
 * @param {Object} config
 */
Workspace.tool.ConnectorTool = function(workspace, config){
    this.workspace = workspace;
    Ext.apply(this, config, {
        parameters: {}
    });
    Workspace.tool.ConnectorTool.superclass.constructor.call(this, workspace, config);

    Ext.apply(this.parameters, {
        stroke: '#000'
    });

    this.dragging = false;
    this.proto = false;
    this.x1 = 0;
    this.y1 = 0;
};

Ext.extend(Workspace.tool.ConnectorTool, Workspace.tool.BaseTool, {
	targetWType: 'Workspace.ConnectionObject',
    acceptLeft: function(left) {
    	return true;
    },
    acceptRight: function(right) {
    	return true;
    },
    canConnect: function(left,right) {
    	return true;
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
	                this.rightObject = Workspace.ConnectionObject.getPoint(p.x, p.y);
	            }
	            
	            if(this.acceptRight(this.rightObject) && this.canConnect(this.leftObject,this.rightObject)) {
		            this.workspace.createObject({
		            	wtype: this.targetWType,
		                leftObject: this.leftObject,
		                rightObject: this.rightObject
		                //path: [['M',this.x1,this.y1],['L',this.x2,this.y2]]
		            });
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

            var pos = this.getAdjustedXY(e);
            this.x2 = pos.x + 4;
            this.y2 = pos.y + 4;

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
            this.leftObject = Workspace.ConnectionObject.getPoint(p.x, p.y);
        }

        this.proto = this.workspace.paper.path([['M', this.x1, this.y1]]);
        this.proto.attr(this.parameters);
    }
});

App.mixin(Workspace.tool.ConnectorTool, Workspace.tool.Highlightable);

Ext.override(Workspace.tool.ConnectorTool,{
	accept: function(item) {
    	return (this.dragging) ? this.acceptRight(item) : this.acceptLeft(item);
    },
});
Workspace.Tools.register('connector', Workspace.tool.ConnectorTool);


////////////////////////////////////////////////////////////////////////////////////////////////
// not implemented
Workspace.tool.CurveTool = function(workspace, config){
    this.workspace = workspace;
    Ext.apply(this, config, {

        });
    Workspace.tool.CurveTool.superclass.constructor.call(this, workspace, config);

    this.drawing = false;
    this.dragging = false;
    this.currentPath = false;
    this.currentShape = false;
};

Ext.extend(Workspace.tool.CurveTool, Workspace.tool.BaseTool, {
    click: function(e, item){
        if (this.drawing){
            var pos = this.getAdjustedXY(e);
            this.x1 = parseInt(pos.x);
            this.y1 = parseInt(pos.y);
            this.currentPath.push(['T', this.x1, this.y1]);
            this.currentShape.attr({
                path: this.currentPath
            });
        } else{
            this.drawing = true;
            var pos = this.getAdjustedXY(e);
            this.x1 = parseInt(pos.x);
            this.y1 = parseInt(pos.y);
            this.currentPath = [['M', this.x1, this.y1]];
            this.currentPath.push(['T', this.x1, this.y1]);
            this.currentShape = this.workspace.paper.path(this.currentPath);
            this.currentShape.attr({
                'stroke': '#000',
                'stroke-width': '5px'
            });
        }
        e.stopEvent();
    },
    dblclick: function(e, item){
        this.drawing = false;
        this.dragging = false;
        var o = this.workspace.createObject(Workspace.VectorPathObject, {
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
    mousedown: function(e, item){
        this.dragging = true;
        var pos = this.getAdjustedXY(e);
        e.stopEvent();
    },
    mouseup: function(e, item){
        e.stopEvent();
    },
    mousemove: function(e, item){
        if (this.drawing){
            pos = this.getAdjustedXY(e);
            this.currentPath.pop();
            this.currentPath.push(['T', parseInt(pos.x), parseInt(pos.y)]);
            this.currentShape.attr({
                path: this.currentPath
            });
        }
        e.stopEvent();
    }
});

Workspace.Tools.register('curve', Workspace.tool.CurveTool);


////////////////////////////////////////////////////////////////////////////////////////////////
/**
 * @class Workspace.tool.PolyLineTool
 * Draws straight polylines
 * @extends Workspace.tool.BaseTool
 * @param {Object} workspace
 * @param {Object} config
 */
Workspace.tool.PolyLineTool = function(workspace, config){
    this.workspace = workspace;
    Ext.apply(this, config, {
        protoProps: {
            'stroke': '#000',
            'stroke-width': '5px'
        }
    });
    Workspace.tool.PolyLineTool.superclass.constructor.call(this, workspace, config);

    this.drawing = false;
    this.dragging = false;
    this.currentPath = false;
    this.currentShape = false;
};

Ext.extend(Workspace.tool.PolyLineTool, Workspace.tool.BaseTool, {
    click: function(e, item){
        if (this.drawing){
            var pos = this.getAdjustedXY(e);
            this.x = parseInt(pos.x);
            this.y = parseInt(pos.y);
            this.currentPath.push(['L', this.x, this.y]);
            this.currentShape.attr({
                path: this.currentPath
            });
        } else{
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
    dblclick: function(e, item){
        this.drawing = false;
        this.dragging = false;
        this.currentPath.pop();
        this.currentPath.pop();
        var o = this.workspace.createObject(Workspace.VectorPathObject, {
            path: this.currentPath,
            fillOpacity: 0.1
        });
        this.currentShape.remove();
        this.currentPath = false;
        this.currentShape = false;
        this.workspace.setSelection([o]);
        e.stopEvent();
    },
    mousedown: function(e, item){
        this.dragging = true;
        var pos = this.getAdjustedXY(e);
        e.stopEvent();
    },
    mouseup: function(e, item){
        e.stopEvent();
    },
    mousemove: function(e, item){
        if (this.drawing){
            pos = this.getAdjustedXY(e);
            this.currentPath.pop();
            this.currentPath.push(['L', parseInt(pos.x), parseInt(pos.y)]);
            this.currentShape.attr({
                path: this.currentPath
            });
        }
        e.stopEvent();
    }
});

Workspace.Tools.register('polyline', Workspace.tool.PolyLineTool);

////////////////////////////////////////////////////////////////////////////////////////////////
/**
 * @class Workspace.tool.PolygonTool
 * Draws closed polygons
 * @extends Workspace.tool.PolyLineTool
 * @param {Object} workspace
 * @param {Object} config
 */
Workspace.tool.PolygonTool = function(workspace, config){
    this.workspace = workspace;
    Workspace.tool.PolygonTool.superclass.constructor.call(this, workspace, config);

    Ext.apply(this.protoProps, {
        'stroke': '#000',
        'stroke-width': '5px',
        'fill': '#FFF',
        'fill-opacity': '0.5'
    });
};

Ext.extend(Workspace.tool.PolygonTool, Workspace.tool.PolyLineTool, {
    dblclick: function(e, item){
        this.drawing = false;
        this.dragging = false;
        this.currentPath.pop();
        this.currentPath.pop();
        this.currentPath.push(['L', this.x1, this.y1]);
        var o = this.workspace.createObject(Workspace.VectorPathObject, {
            path: this.currentPath,
            fillOpacity: 1
        });
        this.currentShape.remove();
        this.currentPath = false;
        this.currentShape = false;
        this.workspace.setSelection([o]);
        e.stopEvent();
    },
});

Workspace.Tools.register('polygon', Workspace.tool.PolygonTool);