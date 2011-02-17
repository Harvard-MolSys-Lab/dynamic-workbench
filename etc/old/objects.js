

////////////////////////////////////////////////////////////////////////////////////////////////

var WorkspaceObject = function(workspace, config) {
	WorkspaceObject.superclass.constructor.call(this);
	
	Ext.applyIf(config,{
		x: 0,
		y: 0,
		id: App.nextId(),
		workspace: App.getDefaultWorkspace(),
		isSelectable: true,
		isEditable: false,
		isMovable: true,
		parent: false,
		children: [],
		selectChildren: false,
		editChildren: false,
		moveChildren: true
	});
	
	Ext.apply(this,config);
	
	this.workspace = workspace;
	
	this.state = {
		selected: false,
		dragging: false,
		editing: false	
	};
	
	this.addEvents(
		'move',
		'select',
		'unselect'
	);
	
	this.expose('x','getX','number');
	this.expose('y','getY','number');
	this.expose('id','getId','string');
};

Ext.extend(WorkspaceObject, InfoMachineNoun, {
	getId: function() {
		if(this.id) {
			return this.id;
		} else {
			this.id = App.nextId();
			return this.id;	
		}
	},
	getX: function() {
		return this.x;	
	},
	getY: function() {
		return this.y;	
	},
	setX: function(x) {
		this.x = x;
		this.fireEvent('move',this.x,this.y);
	},
	setY: function(y) {
		this.y = y;
		this.fireEvent('move',this.x,this.y);
	},
	getPosition: function() {
		return {x: this.x, y: this.y};	
	},
	setPosition: function(x,y) {
		this.setX(x); this.setY(y);
	},
	getAbsolutePosition: function() {
		var pos = this.getPosition();
		pos.x+=this.workspace.element.getX();
		pos.y+=this.workspace.element.getY();
		return pos;
	},
	moveTo: function(x,y) {
		this.setPosition(x,y);
		// this.fireEvent('move',this,this.getX(),this.getY());
	},
	translate: function(dx,dy) {
		this.setX(this.getX()+dx);
		this.setY(this.getY()+dy);
		// this.fireEvent('move',this,this.getX(),this.getY());
	},
	move: function(dx,dy) {
		this.translate(dx,dy)	
	},
	serialize: function() {
		var obj = {};
		var field, val;
		for(field in this) {
			if(typeof this[field] == 'function') {
				if(typeof field.serialize == 'function') {
					val = field.serialize();
				}	
			} else {
				val = this[field];
			}
		}	
	},
	setState: function(field,value) {
		this.state[field] = value;	
	},
	is: function(field) {
		return this.state[field];	
	}
});



////////////////////////////////////////////////////////////////////////////////////////////////

var WorkspaceObject2d = function(workspace,config) {
	
	Ext.applyIf(config,{
		x: 0,
		y: 0,
		width: 0,
		height: 0
	});
	
	WorkspaceObject2d.superclass.constructor.call(this,workspace,config);
	
	this.addEvents(
		'resize'
	);
	
	this.expose('width','getWidth','number');
	this.expose('height','getHeight','number');
};

Ext.extend(WorkspaceObject2d, WorkspaceObject, {
	getDimensions: function() {
		return {'width': this.getWidth(), 'width': this.getHeight()};	
	},
	getWidth: function() {
		return this.width;	
	},
	getHeight: function() {
		return this.height;	
	},
	setWidth: function(w) {
		this.width = w;
		this.fireEvent('resize',this.width,this.height);
	},
	setHeight: function(h) {
		this.height = h;
		this.fireEvent('resize',this.width,this.height);
	},
	setDimensions: function(w,h) {
		this.setWidth(w); this.setHeight(h);	
	},
	getBox: function() {
		return { 
			'tl': { x: this.getX(), y: this.getY() },
			'tr': { x: this.getX()+this.getWidth(), y: this.getY() },
			'bl': { x: this.getX(), y: this.getY()+this.getHeight() },
			'br': { x: this.getX()+this.getWidth(), y: this.getY()+this.getHeight() }
		};
	},
	setBox: function(x1,y1,x2,y2) {
		this.setPosition(x1,y1);
		this.setDimensions(x2-x1,y2-y1);
	},
	select: function() {
		this.workspace.select(this);		
	},
	unselect: function() {
		this.workspace.unselect(this);	
	},
	invertSelection: function() {
		if(this.is('selected')) {
			this.unselect();	
		} else {
			this.select();	
		}
	},
	type: 'WorkspaceObject2d'
});

////////////////////////////////////////////////////////////////////////////////////////////////

var ElementObject = function(workspace,config) {
	Ext.applyIf(config,{
		elementSpec: {}
	});
	
	ElementObject.superclass.constructor.call(this,workspace,config);
	
	Ext.apply(this.elementSpec,{
		tag: 'div',
		cls: ''
	});
	
	
	this.addEvents(
		'click',
		'dblclick',
		'mousedown',
		'mouseup',
		'mousemove'
	);
	
	this.element = this.workspace.addElement(this.elementSpec);
	this.element.on('click',this.click,this);
	this.element.on('dblclick',this.dblclick,this);
	this.element.on('mouseup',this.mouseup,this);
	this.element.on('mousedown',this.mousedown,this);
	this.element.on('mousemove',this.mousemove,this);
};

Ext.extend(ElementObject, WorkspaceObject2d, {
	click: function(e,t,o) {
		this.fireEvent('click');
		this.workspace.click(e,this);
	},
	dblclick: function(e,t,o) {
		this.fireEvent('dblclick');
		this.workspace.dblclick(e,this);
	},
	mousedown: function(e,t,o) {
		this.fireEvent('mousedown');
		this.workspace.mousedown(e,this);
	},
	mouseup: function(e,t,o) {
		this.fireEvent('mouseup');
		this.workspace.mouseup(e,this);
	},
	mousemove: function(e,t,o) {
		this.fireEvent('mousemove');
		this.workspace.mousemove(e,this);
	},
	setX: function(x) {
		this.element.setX(x);
		ElementObject.superclass.setX.call(this,x);	
	},
	setY: function(y) {
		this.element.setY(y);
		ElementObject.superclass.setY.call(this,y);	
	},
	setWidth: function(w) {
		this.element.setWidth(w);
		ElementObject.superclass.setWidth.call(this,w);	
	},
	setHeight: function(h) {
		this.element.setHeight(h);
		ElementObject.superclass.setHeight.call(this,h);	
	},
	
	// Should probably override getX, getY, various permutations of getDimensions etc. too
	
	destroy: function() {
		Ext.destroy(this.element);	
	}
});

////////////////////////////////////////////////////////////////////////////////////////////////

var VectorObject = function(workspace,config) {

	Ext.applyIf(config,{
		type: 'rect',
		shape:'rect',
		arguments: [],
		fill: '#fff',
		stroke: '#000',
		strokeWidth: 1
	});
	
	VectorObject.superclass.constructor.call(this,workspace,config);

	
	this.addEvents(
		'click',
		'dblclick',
		'mousedown',
		'mouseup',
		'mousemove'
	);
	
	this.expose('fill','fill','color');
	this.expose('stroke','stroke','color');
	this.expose('strokeWidth','strokeWidth','number');
	this.expose('fillOpacity','fillOpacity','number');
	this.expose('opacity','opacity','number');
	
	this.on('change',this.updateObject,this);
};

Ext.extend(VectorObject, WorkspaceObject2d, {
	buildObject: function() {
		if(Ext.isFunction(this.workspace.paper[this.shape])) {
			this.vectorElement = this.workspace.paper[this.shape].call(this.workspace.paper, this.arguments);
			this.vectorElement.attr(this.attributes());
		
			this.element = Ext.get(this.vectorElement.node);
			this.element.on('click',this.click,this);
			this.element.on('dblclick',this.dblclick,this);
			this.element.on('mouseup',this.mouseup,this);
			this.element.on('mousedown',this.mousedown,this);
			this.element.on('mousemove',this.mousemove,this);
		}
	},
	
	updateObject: function() {
		this.vectorElement.attr(this.attributes());	
	},
	
	click: function(e,t,o) {
		this.fireEvent('click');
		this.workspace.click(e,this);
	},
	dblclick: function(e,t,o) {
		this.fireEvent('dblclick');
		this.workspace.dblclick(e,this);
	},
	mousedown: function(e,t,o) {
		this.fireEvent('mousedown');
		this.workspace.mousedown(e,this);
	},
	mouseup: function(e,t,o) {
		this.fireEvent('mouseup');
		this.workspace.mouseup(e,this);
	},
	mousemove: function(e,t,o) {
		this.fireEvent('mousemove');
		this.workspace.mousemove(e,this);
	},
	setX: function(x) {
		this.vectorElement.attr({x:x});
		VectorObject.superclass.setX.call(this,x);	
	},
	setY: function(y) {
		this.vectorElement.attr({y:y});
		VectorObject.superclass.setY.call(this,y);	
	},
	setWidth: function(width) {
		this.vectorElement.attr({width:width});
		VectorObject.superclass.setWidth.call(this,width);	
	},
	setHeight: function(height) {
		this.vectorElement.attr({height:height});
		VectorObject.superclass.setHeight.call(this,height);	
	},
	
	getPosition: function() {
		var box = this.vectorElement.getBBox();
		return {x: box.x, y: box.y};
	},
	getDimensions: function() {
		var box = this.vectorElement.getBBox();
		return {width: box.width, height: box.height};
	},
	
	getBox: function() {
		var box = this.vectorElement.getBBox();
		return { 
			'tl': { x: box.x, y: box.y },
			'tr': { x: box.x+box.width, y: box.y },
			'bl': { x: box.x, y: box.y+box.height },
			'br': { x: box.x+box.width, y: box.y+box.height }
		};
	},
	
	getX: function() {
		return this.getPosition().x;	
	},
	getY: function() {
		return this.getPosition().y;	
	},
	getWidth: function() {
		return this.getDimensions().width;	
	},
	getHeight: function() {
		return this.getDimensions().width;	
	},
		
	attributes: function(attrArray) {
		var attr = {};
		if(!attrArray) {
			var attrArray = ['clip-rect','fill','fill-opacity','font','font-family','font-size','font-weight',
				'height','opacity','path','r','rotation','rx','ry','scale','src','stroke','stroke-dasharray',
				'stroke-linecap','stroke-linejoin','stroke-miterlimit','stroke-opacity','stroke-width',
				'translation','width','x','y'];	
		}
		for(var i=0, l=attrArray.length; i<l; i++) {
			var param = attrArray[i],
				value = this[param] || this[param.underscore().camelize()];
			if(value) {
				attr[param] = value;
			}	
		}
		return attr;
	},
		
	destroy: function() {
		Ext.destroy(this.element);	
	}
});


////////////////////////////////////////////////////////////////////////////////////////////////

var VectorRectObject = function(workspace,config) {	
	
	Ext.applyIf(config,{
		shape:'rect',
		type: 'rect',
		isResizable: true,
		// x: 0, y: 0, width: 0, height: 0,
		arguments: [this.x,this.y,this.width,this.height]
	});
	VectorRectObject.superclass.constructor.call(this,workspace,config);

	this.buildObject();	
};

Ext.extend(VectorRectObject, VectorObject, {
});


////////////////////////////////////////////////////////////////////////////////////////////////

var VectorEllipseObject = function(workspace,config) {	
	
	Ext.applyIf(config,{
		shape:'ellipse',
		type: 'ellipse',
		isResizable: true,
		x:0,
		y:0,
		width:0,
		height:0,
		// x: 0, y: 0, width: 0, height: 0,
		arguments: [(this.x-(this.width/2)),(this.y-(this.height/2)),(this.width/2),(this.height/2)]
	});
	VectorEllipseObject.superclass.constructor.call(this,workspace,config);

	this.buildObject();	
};

Ext.extend(VectorEllipseObject, VectorObject, {
	getRadiusX: function() {
		return (this.getWidth()/2);
	},
	getRadiusY: function() {
		return (this.getHeight()/2);
	},
	getCenterX: function() {
		return (this.getX()+this.getRadiusX());
	},
	getCenterY: function() {
		return (this.getY()+this.getRadiusY());
	}
});


////////////////////////////////////////////////////////////////////////////////////////////////


var VectorPathObject = function(workspace,config) {	
	
	Ext.applyIf(config,{
		shape:'path',
		isResizable: false,
		path: [],
		// x: 0, y: 0, width: 0, height: 0,
		arguments: [this.path]
	});
	VectorPathObject.superclass.constructor.call(this,workspace,config);

	this.buildObject();	
};

Ext.extend(VectorPathObject, VectorObject, {
	updatePath: function(path) {
		this.path = path;
		this.vectorElement.attr({path:path});
	},
	appendPoint: function(point) {
		this.path.push(point);
		this.updatePath(this.path);
	},
	translate: function(dx,dy) {
		var point;
		for(i=0,l=this.path.length; i<l; i++) {
			point = this.path[i];
			switch(point[0]) {
				case 'C':
					point[5] = point[5]+dx;
					point[6] = point[6]+dy;
				case 'S':
					point[3] = point[3]+dx;
					point[4] = point[4]+dy;
				case 'M':
				case 'L':
					point[1] = point[1]+dx;
					point[2] = point[2]+dy;
					break;
				default:
					break;
			}
		}
		this.updatePath(this.path);
		this.x = this.getX();
		this.y = this.getY();
		this.fireEvent('move',this.getX(),this.getY());
	},
	getDelta: function(x2,y2) {
		return {dx: (x2-this.getX()), dy: (y2-this.getY())};
	
	},
	setPosition: function(x,y) {
		var delta = this.getDelta();
		this.translate(delta.dx, delta.dy);
	}
});


