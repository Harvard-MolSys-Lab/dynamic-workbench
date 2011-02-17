var SelectionBand = function(item, workspace, config) {
	SelectionBand.superclass.constructor.call(this);
	
	config = config || {};
	
	Ext.applyIf(config,{
		shape: 'rect',
		strokeWidth: 1,
		stroke: '#ddd',
		fill: '#99BBE8',
		padding: 10
	});
	
	Ext.apply(this,config);
	
	this.item = item;
	this.workspace = workspace;
	
	var dims = item.getDimensions(), pos = item.getPosition();
	var x = (pos.x-this.padding), y = (pos.y-this.padding), w = (dims.width+2*this.padding), h = (dims.height+2*this.padding);
	
	this.rect = workspace.paper.rect(x,y,w,h).toBack();
	this.rect.attr({fill:this.fill,stroke:this.stroke,'stroke-width':this.strokeWidth});

	/*
	this.element = workspace.addElement({tag:'div',cls:'selection-band'})
		.setLocation(x-this.padding,y-this.padding)
		.setSize(w+(2*this.padding),h+(2*this.padding));
	
	this.resizable = new Ext.Resizable(this.element,{
		draggable: true, dynamic: true
	});		
	this.resizable.on('resize', this.adjustItem, this);
	*/
	
	this.item.on('move', this.adjustBand, this);
	this.item.on('resize', this.adjustBand, this);
};

Ext.extend(SelectionBand, Ext.util.Observable, {
	adjustBand: function() {
		var item = this.item;
		var dims = item.getDimensions(), pos = item.getPosition();
		var x = (pos.x-this.padding), y = (pos.y-this.padding), w = (dims.width+2*this.padding), h = (dims.height+2*this.padding);
		this.rect.attr({x:x, y:y, width:w, height:h});
		/*
		this.element.setLocation(x-this.padding,y-this.padding)
		.setSize(w+(2*this.padding),h+(2*this.padding));
		*/
	},
	destroy: function() {
		this.rect.remove();	
		this.item.un('move', this.adjustBand, this);
		this.item.un('resize', this.adjustBand, this);
	}
});

////////////////////////////////////////////////////////////////////////////////////////////////

var SelectorBand = function(workspace, config) {
	this.superclass.constructor.call(this);
	Ext.applyIf(config || {},{
		shape: 'rect',
		strokeWidth: 10,
		stroke: '#ddd',
		fill: '#99BBE8',
		fillOpacity: 0.5,
		x1: 0,
		y1: 0,
		width: 0,
		height: 0,
		anchor: 'tl'
	});
	Ext.apply(this,config);
	
	this.workspace = workspace;
	
	this.rect = workspace.paper.rect(this.x1,this.y1,this.width,this.height);
	this.rect.attr({'stroke': this.stroke,'fill': this.fill, 'fill-opacity': this.fillOpacity});
	/*
	this.element = workspace.addElement({tag:'div',cls:'selection-band'})
		.setLocation(x-this.padding,y-this.padding)
		.setSize(w+(2*this.padding),h+(2*this.padding));
	
	this.resizable = new Ext.Resizable(this.element,{
		draggable: true, dynamic: true
	});		
	this.resizable.on('resize', this.adjustItem, this);
	*/
};

Ext.extend(SelectorBand, Ext.util.Observable, {

	adjustBand: function(x2,y2) {
		this.x2 = x2;
		this.y2 = y2;
		
		var attr = SelectorBand.calculateBandBox(this.x1,this.y1,x2,y2);
		
		this.x = attr.x;
		this.y = attr.y;
		this.width = attr.width;
		this.height = attr.height;
		this.anchor = attr.anchor;
		delete attr.anchor;
		
		this.rect.attr(attr);
	},
	getItemsWithin: function() {
		var within = [];
		
		this.workspace.objects.eachKey(function(id,item) {
			if(Ext.isFunction(item.getBox)) {
				var box = item.getBox();
				var x = (((this.x1 > box.tl.x) && (this.x2 < box.tr.x)) || ((box.tl.x > this.x1) && (box.tr.x < this.x2)));
				var y = (((this.y1 > box.tl.y) && (this.y2 < box.bl.y)) || ((box.tl.y > this.y1) && (box.bl.x < this.x2)));
				if(x && y) {
					within.push(item);	
				}
			}
		},this);	
		
		return within;
	},
	destroy: function() {
		this.rect.remove();	
	}
});

SelectorBand.calculateBandBox = function(x1,y1,x2,y2) {
	var attr = {};	
	var x,y;
	
	attr.width = Math.abs(x2-x1);
	if (x2>x1) {
		x = 'l'
		attr.x = x1;
	} else {
		x = 'r'
		attr.x = x2;	
	}
	
	attr.height = Math.abs(y2-y1);
	if (y2>y1) {
		y = 't'
		attr.y = y1;
	} else {
		y = 'b'
		attr.y = y2;	
	}
	
	attr.anchor = x+y;
	return attr;
}


////////////////////////////////////////////////////////////////////////////////////////////////

var WorkspaceHandle = function(workspace, config) {
	
	// Call Observable Constructor
	this.superclass.constructor.call(this);
	
	// Configuration
	this.addEvents(
		'dragstart',
		'drag',
		'dragend'
	);
	
	Ext.applyIf(config,{
		x:0,
		y:0,
		x1:0,
		y1:0,
		shape: 'rect',
		width: 10,
		stroke: '#11f',
		strokeWidth: 1,
		fill: '#fff'
	});
	Ext.apply(this,config);
	
	this.workspace = workspace;
	this.dragging = false;
	
	// Create objects
	if(this.shape=='rect') { 
		this.handleShape = this.workspace.paper.rect(this.x-(this.width/2),this.y-(this.width/2),this.width,this.width);
		this.handleShape.attr({'stroke': this.stroke,'stroke-width': this.strokeWidth, 'fill': this.fill });
	} else if (this.shape=='circle') { 
		this.handleShape = this.workspace.paper.circle(this.x,this.y,(this.width/2));
		this.handleShape.attr({'stroke': this.stroke,'stroke-width': this.strokeWidth, 'fill': this.fill });
	}
	
	if(this.vectorElement) { this.handleShape.insertAfter(this.vectorElement); }
	else { this.handleShape.toFront(); }
	
	var handle = this;
	Ext.get(this.handleShape.node).on('mousedown',this.dragStartHandler,this);
	this.workspace.on('mouseup',this.dragEndHandler,this);
	this.workspace.on('mousemove',this.dragHandler,this);
};

Ext.extend(WorkspaceHandle, Ext.util.Observable, {
	destroy: function() {
		Ext.get(this.handleShape.node).un('mousedown',this.dragStartHandler,this);
		this.workspace.un('mouseup',this.dragEndHandler,this);
		this.workspace.un('mousemove',this.dragHandler,this);
		this.handleShape.remove();	
	},
	getAdjustedXY: function(e) {
		var pos = {x:(e.getPageX()-this.workspace.element.getX()), y:(e.getPageY()-this.workspace.element.getY())};	
		return pos;
	},
	getPosition: function() {
		return {x: this.x, y: this.y};
	},
	setPosition: function(x,y) {
		this.x = x; this.y = y;
		
		this.handleShape.attr({x: this.x-(this.width/2), y: this.y-(this.width/2)});
	},
	dragStartHandler: function(e) {
		this.dragging = true;
		var pos = this.getAdjustedXY(e);
		this.x1 = pos.x; this.y1 = pos.y;
		this.fireEvent('dragstart');
		e.stopEvent();
	},
	dragHandler: function(e) {
		if(this.dragging) {
			pos = this.getAdjustedXY(e);
			var dx = pos.x-this.x1, dy = pos.y-this.y1;
			this.x1 = this.x1+dx; this.y1 = this.y1+dy;
			this.setPosition(this.x+dx,this.y+dy);
			this.fireEvent('drag',e,pos.x,pos.y);
			if(Ext.isFunction(this.drag)) {
				this.drag(e,pos.x,pos.y);
			}
			e.stopEvent();
		}
	},
	dragEndHandler: function(e) {
		this.dragging = false;
		this.fireEvent('dragend');
		e.stopEvent();
	}
});

////////////////////////////////////////////////////////////////////////////////////////////////

var ResizeHandle = function(workspace, config) {
		
	Ext.applyIf(config,{
		location: 'tl'
	});
	
	if(this.item) { 
		if(this.item.vectorElement) { 
			this.vectorElement = this.item.vectorElement;	
		} 
	}
	
		// Call Observable Constructor
	ResizeHandle.superclass.constructor.call(this,workspace,config);
	
	// Configuration
	this.addEvents(

	);
	
	this.item.on('move',this.move,this);
	this.item.on('resize',this.move,this);
};

Ext.extend(ResizeHandle,WorkspaceHandle, {
	drag: function() {
		var box = this.item.getBox();
		var pos = this.getPosition();

		switch(this.location) {
			case 'tl':
				this.item.setBox(pos.x, pos.y, box.br.x, box.br.y);
				break;
			case 'tr':
				this.item.setBox(box.tl.x,pos.y, pos.x,box.br.y);
				break;
			case 'bl':
				this.item.setBox(pos.x,box.tl.y,box.br.x,pos.y);
				break;
			case 'br':
				this.item.setBox(box.tl.x,box.tl.y,pos.x,pos.y);
				break;
		}
	},
	move: function() {
		var box = this.item.getBox();
		switch(this.location) {
			case 'tl':
				this.setPosition(box.tl.x,box.tl.y);
				break;
			case 'tr':
				this.setPosition(box.tr.x,box.tr.y);
				break;
			case 'bl':
				this.setPosition(box.bl.x,box.bl.y);
				break;
			case 'br':
				this.setPosition(box.br.x,box.br.y);
				break;
		}
	},
	destroy: function() {
		ResizeHandle.superclass.destroy.call(this);	
		this.item.un('move',this.move,this);
	}
});




////////////////////////////////////////////////////////////////////////////////////////////////

var Tool = function(workspace, config) {
	Ext.apply(this,config,{
		keyMapping: false
	});
	this.workspace = workspace;
	if(this.keyMapping) {
		this.keyMap	= new Ext.KeyMap(this.workspace.element,this.keyMapping);
		this.keyMap.stopEvent = true;
		this.keyMap.disable();	
	}
};

Ext.extend(Tool, Ext.util.Observable, {
	click: function(e, item) {
		
	},
	dblclick: function(e, item) {
		
	},
	mousedown: function(e, item) {
		
	},
	mouseup: function(e, item) {
		
	},
	mousemove: function(e, item) {
			
	},
	getAdjustedXY: function(e) {
		var pos = {x:(e.getPageX()-this.workspace.element.getX()), y:(e.getPageY()-this.workspace.element.getY())};	
		return pos;
	},
	getAdjustedXYcoords: function(x,y) {
		var pos = {x: (x-this.workspace.element.getX()), y:(y-this.workspace.element.getY())};
		return pos;
	},
	activate: function() {
		if(this.keyMap) this.keyMap.enable();
	},
	deactivate: function() {
		if(this.keyMap) this.keyMap.disable();
	}
});

////////////////////////////////////////////////////////////////////////////////////////////////

var PointerTool = function(workspace, config) {
	Ext.applyIf(config,{
		keyMap: [{
			key: [Ext.EventManager.BACKSPACE,Ext.EventManager.DELETE],
			fn: this.deleteSelection,
			scope: this
		}]
	});
	
	PointerTool.superclass.constructor.call(this,workspace,config);
	
	this.dragging = false;
	this.selectorBand = false;
	this.selectionBands = new Ext.util.MixedCollection();
	this.handles = new Ext.util.MixedCollection();
	this.inspectors = new Ext.util.MixedCollection();
	this.itemsWithinBand = new Ext.util.MixedCollection();
};

Ext.extend(PointerTool, Tool, {
	click: function(e, item) {
		// Relevant item
		if(Ext.type(item.select)=='function') {
			
		} else {
			this.workspace.deselect();
		}
		
		e.stopEvent();
	},
	dblclick: function(e, item) {
		// Relevant item
		if(Ext.type(item.edit)=='function') {
			item.edit();
		} else {
			if(Ext.type(item.select)=='function') {
				item.select();
			} else {
				this.workspace.deselect();
			}
		}
		
		e.stopEvent();
	},
	mousedown: function(e, item) {
		this.dragging = true;
		pos = this.getAdjustedXY(e);
		this.x1 = pos.x, this.y1 = pos.y;
		if(this.selectorBand) { this.selectorBand.destroy(); this.selectorBand = false; }
		if(item) {
			if(Ext.type(item.select)=='function') {
				item.select();
			}
		} else {
			this.selectorBand = new SelectorBand(this.workspace,{x1: pos.x, y1: pos.y});	
		}
		
		e.stopEvent();
	},
	mouseup: function(e, item) {
		this.dragging = false;
		if(this.selectorBand) {
			this.selectorBand.destroy();
			this.selectorBand = false;	
		}
		
		e.stopEvent();
	},
	mousemove: function(e, item) {
		if(this.dragging) {
			var selection = this.workspace.getSelection();
			if(this.selectorBand) {
				pos = this.getAdjustedXY(e);
				this.selectorBand.adjustBand(pos.x,pos.y);
				// var added = [], lost = [];
				
				// Get items within the selectorBand, and compare them to items at last consideration.
				var containedItems = this.selectorBand.getItemsWithin();
				var remainder = this.itemsWithinBand.clone(), itemsWithin = new Ext.util.MixedCollection(), item;
				
				// If items have been added, invert their selection
				for(var i=0,l=containedItems.length; i<l; i++) {
					item = containedItems[i];
					if(!this.itemsWithinBand.contains(item)) {
						item.invertSelection();
						remainder.removeKey(item);
					}
					itemsWithin.add(item.getId(), item);
				}
				
				// If items have been removed, invert their selection
				remainder.eachKey(function(itemId, item) {
					item.invertSelection();
				});
				
				this.itemsWithinBand = itemsWithin;
				
				/*
				Ext.each(containedItems,function(item) {
					if(!this.itemsWithinBand.contains(item)) {
						item.invertSelection();
					}
				},this);
				Ext.each(this.itemsWithinBand,function(item) {
					if(!this.containedItems.contains(item)) {
						item.invertSelection();
					}
				},this);
				*/			
			} else {
				if(this.workspace.hasSelection()) {
					pos = this.getAdjustedXY(e);
					var dx = pos.x-this.x1, dy = pos.y-this.y1;
					this.x1 = pos.x, this.y1 = pos.y;
					
					for(var i=0,l=selection.length; i<l; i++) {
						if(Ext.isFunction(selection[i].translate)) {
							selection[i].translate(dx,dy);
						}	
					}
				}
			}
		}
	},
	
	selectHandler: function(item) {
		this.addSelectionBand(item);
		this.addHandles(item);
		var id = item.getId();
		if(this.inspectors.containsKey(id)) {
			this.inspectors.get(id).position();
		} else {
			var inspector = new Ext.ux.Inspector({item: item});
			inspector.show();
			this.inspectors.add(id,inspector);
		}
	},

	unselectHandler: function(item) {
		this.removeSelectionBand(item.getId());
		this.removeHandles(item.getId());
		this.destroyInspectors(item.getId());
	},	

	addSelectionBand: function(item) {
		if(!this.selectionBands.containsKey(item.getId())) { 
			this.selectionBands.add(item.getId(),new SelectionBand(item, this.workspace));
		}
	},
	removeSelectionBand: function(itemId) {
		// if an itemId is given, remove its selectionBand
		if(itemId) {
			if(!Ext.isString(itemId) && Ext.isFunction(itemId.getId)) {
				itemId = itemId.getId();	
			}
			if(Ext.isString(itemId)) {
				if(this.selectionBands.containsKey(itemId)) {
					this.selectionBands.get(itemId).destroy();
					this.selectionBands.removeKey(itemId);
				}
			}
		// if no argument, remove all handles
		} else {
			this.selectionBands.each(function(band) {
				band.destroy();
			});	
			this.selectionBands.clear();
		}
	},
	addHandles: function(item) {
		if(!this.handles.containsKey(item.getId())) {
			if((Ext.isFunction(item.getBox)) && (item.isResizable)) {
				var box = item.getBox();
				var tl = new ResizeHandle(this.workspace,{location:'tl',item:item, x:box.tl.x, y:box.tl.y}),
					tr = new ResizeHandle(this.workspace,{location:'tr',item:item, x:box.tr.x, y:box.tr.y}),
					bl = new ResizeHandle(this.workspace,{location:'bl',item:item, x:box.bl.x, y:box.bl.y}),
					br = new ResizeHandle(this.workspace,{location:'br',item:item, x:box.br.x, y:box.br.y});
								
				this.handles.add(item.getId(),{
					'tl': tl,
					'tr': tr,
					'bl': bl,
					'br': br
				});				
			}
		}
	},
	removeHandles: function(itemId) {
		// if an itemId is given, remove all its handles
		if(itemId) {
			if(!Ext.isString(itemId) && Ext.isFunction(itemId.getId)) {
				itemId = itemId.getId();	
			}
			if(Ext.isString(itemId)) {
				if(this.handles.containsKey(itemId)) {
					handles = this.handles.get(itemId);
					for(position in handles) {
						handles[position].destroy();	
					}
					this.handles.removeKey(itemId);
				}
			}
		// if no argument, remove all handles
		} else {
			this.handles.each(function(handlesForItem) {
				for(handle in handlesForItem) {
					if (Ext.isFunction(handlesForItem[handle].destroy)) handlesForItem[handle].destroy();	
				}
			});	
			this.handles.clear();
		}
	},
	destroyInspectors: function(id) {
		if(id) {
			if(this.inspectors.containsKey(id)) {
				var i = this.inspectors.get(id);
				i.close();
				this.inspectors.removeKey(id);
			}
		} else {
			this.inspectors.each(function(inspector) {
				inspector.close();
			});	
			this.inspectors.clear();
		}	
	},
	deleteSelection: function() {
		this.workspace.deleteObjects(this.workspace.getSelection());
	},
	activate: function() {
		PointerTool.superclass.activate.call(this);
		this.workspace.on('select',this.selectHandler,this);
		this.workspace.on('unselect',this.unselectHandler,this);
	},
	deactivate: function() {
		PointerTool.superclass.deactivate.call(this);
		this.workspace.un('select',this.selectHandler,this);
		this.workspace.un('unselect',this.unselectHandler,this);
		if(this.selectorBand) this.selectorBand.destoy();
		this.removeHandles();	
		this.removeSelectionBand();
		this.destroyInspectors();
	}
});

App.Tools.register('pointer',PointerTool);

////////////////////////////////////////////////////////////////////////////////////////////////

var PencilTool = function(workspace, config) {
	this.workspace = workspace;
	Ext.apply(this,config,{
		
	});
	this.dragging = false;
	this.currentPath = false;
	this.currentShape = false;
};

Ext.extend(PencilTool, Tool, {
	click: function(e, item) {
		
	},
	dblclick: function(e, item) {
		
	},
	mousedown: function(e, item) {
		this.dragging = true;
		pos = this.getAdjustedXY(e);
		this.currentPath = [['M',pos.x,pos.y]];
		this.currentShape = this.workspace.paper.path(this.currentPath);
		this.currentShape.attr({'stroke':'#000','stroke-width':'5px'});
	},
	mouseup: function(e, item) {
		this.dragging = false;
		this.workspace.createObject(VectorPathObject,{path:this.currentPath,'stroke':'#000','stroke-width':'5px'});
		this.currentShape.remove();
		this.currentPath = false;
		this.currentShape = false;
	},
	mousemove: function(e, item) {
		if(this.dragging) {
			pos = this.getAdjustedXY(e);
			this.currentPath.push(['L',pos.x,pos.y]);
			this.currentShape.attr({path:this.currentPath});
		}
	}
});

App.Tools.register('pencil',PencilTool);


////////////////////////////////////////////////////////////////////////////////////////////////

var PaintbrushTool = function(workspace, config) {
	this.workspace = workspace;
	Ext.apply(this,config,{
		
	});
	this.dragging = false;
};

Ext.extend(PaintbrushTool, Tool, {
	click: function(e, item) {
		// Relevant item
		if(Ext.type(item.select)=='function') {
			item.select();
		} else {
			this.workspace.deselect();
		}
		
		e.stopEvent();
	},
	dblclick: function(e, item) {
		// Relevant item
		if(Ext.type(item.edit)=='function') {
			item.edit();
		} else {
			if(Ext.type(item.select)=='function') {
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
		if(this.dragging) {
				
		}
	}
});

App.Tools.register('paintbrush',PaintbrushTool);

////////////////////////////////////////////////////////////////////////////////////////////////

var VectorTool = function(workspace, config) {
	this.workspace = workspace;
	Ext.apply(this,config,{
		
	});
	this.dragging = false;
};

Ext.extend(VectorTool, Tool, {
	click: function(e, item) {
		// Relevant item
		if(Ext.type(item.select)=='function') {
			item.select();
		} else {
			this.workspace.deselect();
		}
		
		e.stopEvent();
	},
	dblclick: function(e, item) {
		// Relevant item
		if(Ext.type(item.edit)=='function') {
			item.edit();
		} else {
			if(Ext.type(item.select)=='function') {
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
		if(this.dragging) {
				
		}
	}
});

App.Tools.register('vector',VectorTool);

////////////////////////////////////////////////////////////////////////////////////////////////

var RectTool = function(workspace, config) {
	this.workspace = workspace;
	Ext.apply(this,config,{
		parameters: {}
	});
	
	Ext.apply(this.parameters,{
		fill: '#fff',
		stroke: '#000'
	});
	
	this.dragging = false;
	this.proto = false;
	this.x1 = 0;
	this.y1 = 0;
};

Ext.extend(RectTool, Tool, {
	click: function(e, item) {

		e.stopEvent();
	},
	dblclick: function(e, item) {
		
		e.stopEvent();
	},
	mousedown: function(e, item) {
		this.dragging = true;
		if(this.proto) {
			this.proto.remove();	
		}
		
		this.createProto(e);
	},
	mouseup: function(e, item) {
		this.dragging = false;
		
		if(this.proto) {
			
			var pos = this.getAdjustedXY(e);
			this.x2 = pos.x;
			this.y2 = pos.y;
			var attr = SelectorBand.calculateBandBox(this.x1,this.y1,this.x2,this.y2);
			
			this.workspace.createObject(VectorRectObject,{
				x: attr.x,
				y: attr.y,
				width: attr.width,
				height: attr.height	
			})
			
			this.proto.remove();	
		}
	},
	mousemove: function(e, item) {
		if(this.dragging) {
			if(!this.proto) {
				this.createProto(e);
			}
			
			var pos = this.getAdjustedXY(e);
			this.x2 = pos.x;
			this.y2 = pos.y;
			var attr = SelectorBand.calculateBandBox(this.x1,this.y1,this.x2,this.y2);
		
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
		
		this.proto = this.workspace.paper.rect(this.x1,this.y1,0,0);
		this.proto.attr(this.parameters);
	}
});

App.Tools.register('rect',RectTool);


////////////////////////////////////////////////////////////////////////////////////////////////

var EllipseTool = function(workspace, config) {
	this.workspace = workspace;
	Ext.apply(this,config,{
		parameters: {}
	});
	
	Ext.apply(this.parameters,{
		fill: '#fff',
		stroke: '#000',
		'stroke-width': 1
	});
	
	this.dragging = false;
	this.proto = false;
	this.x1 = 0;
	this.y1 = 0;
};

Ext.extend(EllipseTool, Tool, {
	click: function(e, item) {

		e.stopEvent();
	},
	dblclick: function(e, item) {
		
		e.stopEvent();
	},
	mousedown: function(e, item) {
		this.dragging = true;
		if(this.proto) {
			this.proto.remove();
			this.proto = false;	
		}
		
		this.createProto(e);
	},
	mouseup: function(e, item) {
		this.dragging = false;
		
		if(this.proto) {
			
			var pos = this.getAdjustedXY(e);
			this.x2 = pos.x;
			this.y2 = pos.y;
			var attr = SelectorBand.calculateBandBox(this.x1,this.y1,this.x2,this.y2);
			
			this.workspace.createObject(VectorEllipseObject,{
				x: (attr.x),
				y: (attr.y),
				width: (attr.width),
				height: (attr.height),
				fill: this.parameters.fill,
				stroke: this.parameters.stroke	
			})
			
			this.proto.remove();	
		}
	},
	mousemove: function(e, item) {
		if(this.dragging) {
			if(!this.proto) {
				this.createProto(e);
			}
			
			var pos = this.getAdjustedXY(e);
			this.x2 = pos.x;
			this.y2 = pos.y;
			var attr = SelectorBand.calculateBandBox(this.x1,this.y1,this.x2,this.y2);
			var ellipseAttr = {
				x: attr.x+(attr.width),
				y: attr.y+(attr.height),
				rx: (attr.width),
				ry: (attr.height)
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
		
		this.proto = this.workspace.paper.ellipse(this.x1,this.y1,0,0);
		this.proto.attr(this.parameters);
	}
});

App.Tools.register('ellipse',EllipseTool);

////////////////////////////////////////////////////////////////////////////////////////////////

var LineTool = function(workspace, config) {
	this.workspace = workspace;
	Ext.apply(this,config,{
		parameters: {}
	});
	
	Ext.apply(this.parameters,{
		stroke: '#000'
	});
	
	this.dragging = false;
	this.proto = false;
	this.x1 = 0;
	this.y1 = 0;
};

Ext.extend(LineTool, Tool, {
	click: function(e, item) {

		e.stopEvent();
	},
	dblclick: function(e, item) {
		
		e.stopEvent();
	},
	mousedown: function(e, item) {
		this.dragging = true;
		if(this.proto) {
			this.proto.remove();	
		}
		
		this.createProto(e);
	},
	mouseup: function(e, item) {
		this.dragging = false;
		
		if(this.proto) {
			
			var pos = this.getAdjustedXY(e);
			this.x2 = pos.x;
			this.y2 = pos.y;
			
			this.workspace.createObject(VectorPathObject,{
				path: [['M',this.x1,this.y1],['L',this.x2,this.y2]]
			})
			
			this.proto.remove();	
		}
	},
	mousemove: function(e, item) {
		if(this.dragging) {
			if(!this.proto) {
				this.createProto(e);
			}
			
			var pos = this.getAdjustedXY(e);
			this.x2 = pos.x;
			this.y2 = pos.y;
			
			this.proto.attr({path: [['M',this.x1,this.y1],['L',this.x2,this.y2]]});
		}
	},
	createProto: function(e) {
		var pos = this.getAdjustedXY(e);
		this.x1 = pos.x;
		this.y1 = pos.y;
		
		this.proto = this.workspace.paper.path([['M',this.x1,this.y1]]);
		this.proto.attr(this.parameters);
	}
});

App.Tools.register('line',LineTool);

////////////////////////////////////////////////////////////////////////////////////////////////

var PolyLineTool = function(workspace, config) {
	this.workspace = workspace;
	Ext.apply(this,config,{
		
	});
	this.drawing = false;
	this.dragging = false;
	this.currentPath = false;
	this.currentShape = false;
};

Ext.extend(PolyLineTool, Tool, {
	click: function(e, item) {
		if(this.drawing) { 
			var pos = this.getAdjustedXY(e);
			this.x1 = parseInt(pos.x); this.y1 = parseInt(pos.y); 
			this.currentPath.push(['L',this.x1,this.y1]);
			this.currentShape.attr({path:this.currentPath});
		} else {
			this.drawing = true;
			var pos = this.getAdjustedXY(e);
			this.x1 = parseInt(pos.x); this.y1 = parseInt(pos.y); 
			this.currentPath = [['M',this.x1,this.y1]];
			this.currentPath.push(['L',this.x1,this.y1]);
			this.currentShape = this.workspace.paper.path(this.currentPath);
			this.currentShape.attr({'stroke':'#000','stroke-width':'5px'});
		}
	},
	dblclick: function(e, item) {
		this.drawing = false;
		this.dragging = false;
		this.workspace.createObject(VectorPathObject,{path:this.currentPath,'stroke':'#000','stroke-width':'5px'});
		this.currentShape.remove();
		this.currentPath = false;
		this.currentShape = false;
	},
	mousedown: function(e, item) {
		this.dragging = true;
		var pos = this.getAdjustedXY(e);

	},
	mouseup: function(e, item) {
		
	},
	mousemove: function(e, item) {
		if(this.drawing) {
			pos = this.getAdjustedXY(e);
			this.currentPath.pop();
			this.currentPath.push(['L',parseInt(pos.x),parseInt(pos.y)]);
			this.currentShape.attr({path:this.currentPath});
		}
	}
});

App.Tools.register('polyline',PolyLineTool);


////////////////////////////////////////////////////////////////////////////////////////////////
