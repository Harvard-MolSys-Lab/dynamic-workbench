/********************************************
 * InfoMachine
 * 
 * Copyright (c) 2010 Casey Grun
 *********************************************/

/**
 * @class SelectionBand
 * This class displays a band around the currently selected item(s) to indicate they are selected.
 * @extends Ext.util.Observable
 */
var SelectionBand = function(item, workspace, config) {
	SelectionBand.superclass.constructor.call(this);
	
	config = config || {};
	
	Ext.applyIf(config,{
		shape: 'rect',
		strokeWidth: 1,
		stroke: '#ddd',
		fill: '#99BBE8',
		fillOpacity: 0.5,
		padding: 10
	});
	
	Ext.apply(this,config);
	
	this.item = item;
	this.workspace = workspace;
	
	var dims = item.getDimensions(), pos = item.getPosition();
	var x = (pos.x-this.padding), y = (pos.y-this.padding), w = (dims.width+2*this.padding), h = (dims.height+2*this.padding);
	
	this.rect = workspace.paper.rect(x,y,w,h);
	this.rect.attr({'stroke': this.stroke,'fill': this.fill, 'fill-opacity': this.fillOpacity});
	if(item.vectorElement) { this.rect.insertBefore(item.vectorElement); }

	this.item.on('move', this.adjustBand, this);
	this.item.on('resize', this.adjustBand, this);
	
	this.adjustBand();
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

/**
 * @class SelectorBand
 * Used to select objects by clicking and dragging
 * @extends Ext.util.Observable
 */	
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
};

Ext.extend(SelectorBand, Ext.util.Observable, {

	adjustBand: function(x2,y2) {
		this.x2 = x2;
		this.y2 = y2;
		
		var attr = SelectorBand.calculateBandBox(this.x1,this.y1,x2,y2);
		
		this.x = attr.x;
		this.y = attr.y;
		//this.x1 = this.x;
		//this.y1 = this.y;
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
				var y = (((this.y1 > box.tl.y) && (this.y2 < box.bl.y)) || ((box.tl.y > this.y1) && (box.bl.y < this.x2)));
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

/**
 * calculateBandBox
 * Given two points, generates a bounding box, along with an anchor string describing the position of x1,y1
 * @param {Number} x1
 * @param {Number} y1
 * @param {Number} x2
 * @param {Number} y2
 */
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

/**
 * @class WorkspaceHandle
 * Creates a shape on the workspace that can be dragged and dropped to manipulate a WorkspaceObject
 * @extends Ext.util.Observable
 * @param {Object} workspace
 * @param {Object} config
 */
var WorkspaceHandle = function(workspace, config) {
	
	// Call Observable Constructor
	WorkspaceHandle.superclass.constructor.call(this);
	
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
	
	if((this.item) && (this.item.vectorElement)) { this.handleShape.insertAfter(this.item.vectorElement); }
	else { this.handleShape.toFront(); }
	
	var handle = this;
	Ext.get(this.handleShape.node).on('mousedown',this.dragStartHandler,this);
	this.workspace.on('mouseup',this.dragEndHandler,this);
	this.workspace.on('mousemove',this.dragHandler,this);
};

Ext.extend(WorkspaceHandle, Ext.util.Observable, {
	xMax: false,
	yMax: false,
	xMin: false,
	yMin: false,
	destroy: function(){
		Ext.get(this.handleShape.node).un('mousedown', this.dragStartHandler, this);
		this.workspace.un('mouseup', this.dragEndHandler, this);
		this.workspace.un('mousemove', this.dragHandler, this);
		this.handleShape.remove();
	},
	getAdjustedXY: function(e){
		var pos = {
			x: (e.getPageX() - this.workspace.element.getX()),
			y: (e.getPageY() - this.workspace.element.getY())
		};
		return pos;
	},
	getPosition: function(){
		return {
			x: this.x,
			y: this.y
		};
	},
	setPosition: function(x, y){
		this.x = x;
		this.y = y;
		
		this.handleShape.attr({
			x: this.x - (this.width / 2),
			y: this.y - (this.width / 2)
		});
	},
	dragStartHandler: function(e){
		this.dragging = true;
		var pos = this.getAdjustedXY(e);
		this.x1 = pos.x;
		this.y1 = pos.y;
		this.fireEvent('dragstart');
		e.stopEvent();
	},
	dragHandler: function(e){
		if (this.dragging) {
			pos = this.getAdjustedXY(e);
			var dx = pos.x - this.x1, dy = pos.y - this.y1;
			this.x1 = this.bounds(this.x1 + dx, this.xMax, this.xMin);
			this.y1 = this.bounds(this.y1 + dy, this.yMax, this.yMin);
			this.setPosition(this.x1, this.y1);
			// this.setPosition(this.x+dx,this.y+dy);
			this.fireEvent('drag', e, pos.x, pos.y);
			if (Ext.isFunction(this.drag)) {
				this.drag(e, pos.x, pos.y);
			}
		}
	},
	dragEndHandler: function(e){
		if (this.dragging) {
			this.dragging = false;
			this.fireEvent('dragend');
		}
	},
	bounds: function(v, max, min){
		return Workspace.Utils.bounds(v, min, max);
	}
});

////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * @class ResizeHandle
 * @extends WorkspaceHandle
 * @param {Object} workspace
 * @param {Object} config
 */
var ResizeHandle = function(workspace, config) {
  ResizeHandle.superclass.constructor.call(this,workspace,config);

  Ext.applyIf(this,{
    location: 'tl'
  });
  
  if(this.item) { 
    if(this.item.vectorElement) { 
      this.vectorElement = this.item.vectorElement; 
    } 
  }
    
  this.addEvents();
  
  this.item.on('move',this.onItemMove,this);
  this.item.on('resize',this.onItemMove,this);
  this.proxy = this.item.getProxy();
  this.proxy.on('move',this.onProxyMove,this);
  this.proxy.on('resize',this.onProxyMove,this);
  
  this.onItemMove();
};

Ext.extend(ResizeHandle,WorkspaceHandle, {
  drag: function() {
    var box = this.item.getBox();
    var pos = this.getPosition();

    switch(this.location) {
      case 'tl':
        this.proxy.setBox(pos.x, pos.y, box.br.x, box.br.y);
        break;
      case 'tr':
        this.proxy.setBox(box.tl.x,pos.y, pos.x,box.br.y);
        break;
      case 'bl':
        this.proxy.setBox(pos.x,box.tl.y,box.br.x,pos.y);
        break;
      case 'br':
        this.proxy.setBox(box.tl.x,box.tl.y,pos.x,pos.y);
        break;
    }
  },
  dragStartHandler: function() {
    this.item.applyProxy();
    ResizeHandle.superclass.dragStartHandler.apply(this,arguments);
  },
  dragEndHandler: function() {
    if(this.dragging) {
      this.item.restoreFromProxy();
      ResizeHandle.superclass.dragEndHandler.apply(this,arguments);
      return false;
    }
  },
  onItemMove: function() {
    this.move(this.item.getBox());
  },
  onProxyMove: function() {
    this.move(this.proxy.getBox());
  },
  move: function(box) {
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
    this.proxy.un('move',this.move,this);
    this.proxy.un('resize',this.move,this);
  }
});



////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * @class WorkspaceTool
 * Base class for all user interactions with the workspace. A tool represents a set of functions to handle
 * various mouse-based interactions with the workspace, as well as an optional Ext.KeyMap. Each of the mouse
 * handler functions below is invoked by the workspace, and is passed the Ext.EventObject for the event,
 * as well as a reference to a WorkspaceObject, if the event occurred in a workspace object.
 * @extends Ext.util.Observable
 * @param {Object} workspace
 * @param {Object} config
 */
var WorkspaceTool = function(workspace, config) {
	WorkspaceTool.superclass.constructor.apply(this,arguments);
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

Ext.extend(WorkspaceTool, Ext.util.Observable, {
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
	mouseover: function(e, item) {
			
	},
	mouseout: function(e, item) {
			
	},
	getAdjustedXY: function(e) {
		var pos = {x:(e.getPageX()-this.workspace.element.getX()), y:(e.getPageY()-this.workspace.element.getY())};	
		return pos;
	},
	getAdjustedXYcoords: function(x,y) {
		var pos = {x: (x-this.workspace.element.getX()), y:(y-this.workspace.element.getY())};
		return pos;
	},
	/**
	 * activate
	 * Performs a tool's set-up
	 */
	activate: function() {
		if(this.keyMap) this.keyMap.enable();
	},
	/**
	 * deactivate
	 * Performs a tool's clean-up before another tool takes over
	 */
	deactivate: function() {
		if(this.keyMap) this.keyMap.disable();
	}
});

////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * @class AlohaTool
 * Allows {@link RichTextObject}s to be edited using the Aloha HTML5 editor.
 * Node: AlohaTool and MathQuillTool are a special subset of tools called 'editor tools'. A separate
 * subclass is forthcoming, but essentially they have two extra methods, attach and detach, which are
 * used to link and delink them to single, specific objects (ie: rich text boxes, math equations).
 * @extends WorkspaceTool
 * @param {Object} workspace
 * @param {Object} config
 */
var AlohaTool = function(workspace, config) {
	AlohaTool.superclass.constructor.call(this,workspace,config);
};

Ext.extend(AlohaTool, WorkspaceTool, {
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
	/**
	 * attach
	 * Assosciates the editor with the passed object
	 * @param {WorkspaceObject} item
	 */
	attach: function(item) {
		if(item.element) {
			// save reference to the attached item and the Aloha.Editable object
			this.item = item;
			this.editable = new GENTICS.Aloha.Editable($(Ext.fly(item.element).dom).attr('contentEditable',false));
			//this.editable = new GENTICS.Aloha.Editable($(Ext.fly(item.element).dom));
			
			// watch for the user to click outside the aloha element
			var tool = this; // because fucking aloha doesn't have a real event binding system
			this.endEditFunction = function() { tool.workspace.endEdit(); };
			$(this.editable).bind('editableDeactivated', this.endEditFunction);
			
			// activate this editable
			this.editable.enable();
			this.editable.activate();
			// this.editable.focus();
		}	
	},
	/**
	 * detach
	 * called before the editor is dissociated from the passed object
	 */
	detach: function() {
		if(this.item) {
			$(Ext.fly(this.item.element).dom).attr('contentEditable',false);
			if(this.endEditFunction) {
				// unbind the function watching for blur
				$(this.editable).unbind('editableDeactivated', this.endEditFunction);
				this.endEditFunction = false;
			}
			if(this.editable) {
				this.editable.disable();
				this.editable.destroy();
				this.editable = false;	
			}
			
			// rebuild events because somehow between aloha and contentEditable they usually get clobbered
			if(this.item.buildEvents) { this.item.buildEvents(); }
			
			this.item.set('text',this.item.getEl().dom.innerHTML);
			this.item = false;
		}
	},
	activate: function() {
		AlohaTool.superclass.activate.call(this);
	},
	deactivate: function() {
		AlohaTool.superclass.deactivate.call(this);
		this.detach();
	}
});

Workspace.Tools.register('aloha',AlohaTool);

////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * @class MathQuillTool
 * Allows LaTeX equations to be edited inline with MathQuill
 * @extends WorkspceTool
 * @param {Object} workspace
 * @param {Object} config
 */
var MathQuillTool = function(workspace, config) {
  MathQuillTool.superclass.constructor.call(this,workspace,config);
};

Ext.extend(MathQuillTool, WorkspaceTool, {
  click: function(e, item) {
    
  },
  dblclick: function(e, item) {
    if(!item || (item && item.getId && item.getId() != this.item.getId())) {
      this.workspace.endEdit();
    }
  },
  mousedown: function(e, item) {
    
  },
  mouseup: function(e, item) {
    
  },
  mousemove: function(e, item) {
      
  },
  attach: function(item) {
    if(item.element) {
      // save reference to the attached item and the Aloha.Editable object
      this.item = item;
      this.item.activate();
    } 
  },
  detach: function() {
    if(this.item) {
      this.item.deactivate();
      
      // rebuild events because somehow between aloha and contentEditable they usually get clobbered
      if(this.item.buildEvents) { this.item.buildEvents(); }
      this.item = false;
    }
  },
  activate: function() {
    MathQuillTool.superclass.activate.call(this);
  },
  deactivate: function() {
    MathQuillTool.superclass.deactivate.call(this);
    this.detach();
  }
});

Workspace.Tools.register('mathquill',MathQuillTool);

////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * @class PointerTool
 * Allows selection, movement, and resizing of objects
 * @extends WorkspaceTool
 * @param {Object} workspace
 * @param {Object} config
 */
var PointerTool = function(workspace, config) {
	Ext.applyIf(config,{
		keyMap: [{
			key: [Ext.EventManager.BACKSPACE,Ext.EventManager.DELETE,Ext.EventManager.D],
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
	// this.objectInspector = new Ext.ux.VectorObjectInspector();
};

Ext.extend(PointerTool, WorkspaceTool, {
  proxified:false,
  dragged: false,
  threshold: 10,
  dragCount: 0,
	click: function(e, item) {
		
		// Relevant item
		if(this.dragCount < this.threshold) {
  		if(Ext.type(item.select)=='function') {
  			
  		} else {
  			this.workspace.deselect();
  		}
		}
		this.dragCount = 0;
		
		e.stopEvent();
	},
	dblclick: function(e, item) {
		console.log('PointerTool.click');
		
		// Relevant item
		if(item.editor && this.workspace.hasTool(item.editor)) {//Ext.type(item.edit)=='function') {
			this.workspace.edit(item);
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
				// this.proxify();
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
		
		// TODO: determine if this is necessary ###
		/*
		if(item) {
			if(Ext.type(item.select)=='function') {
				item.select();
			}
		}
		//*/
		
		// restore objects
		if(this.proxified)
		  this.deproxify();

		e.stopEvent();
		return false;
	},
	mousemove: function(e, item){
		if (this.dragging) {
			this.dragCount++;
			
			// this.objectInspector.hide();
			var selection = this.workspace.getSelection();
			if (this.selectorBand) {
			
				// Get mouse position and move the selectorBand
				pos = this.getAdjustedXY(e);
				this.selectorBand.adjustBand(pos.x, pos.y);
				
				// Get items within the selectorBand, and compare them to items at last consideration.
				var containedItems = this.selectorBand.getItemsWithin(), // items currently within the band
 					remainder = this.itemsWithinBand.clone(), // we'll progressively remove items from this collection
 					itemsWithin = new Ext.util.MixedCollection(), // we'll persist items within the band here
 					item;
				
				// If items have been added, invert their selection
				for (var i = 0, l = containedItems.length; i < l; i++) {
					item = containedItems[i];
					
					// "new" item this cycle
					if (!this.itemsWithinBand.contains(item)) {
						item.invertSelection();
					}
					
					// item was already in the band
					itemsWithin.add(item.getId(), item);
					
					// either way, note that the item is in the band
					remainder.removeKey(item.getId());
				}
				
				// If items have been removed, invert their selection
				remainder.eachKey(function(itemId, item){
					item.invertSelection();
				});
				
				this.itemsWithinBand = itemsWithin;
				
			}
			else {
				// replace objects with proxies if it's not already been done
				if (this.workspace.hasSelection()) {
					if (!this.proxified) {
						this.proxify();
					}
					
					// move selection
					pos = this.getAdjustedXY(e);
					var dx = pos.x - this.x1, dy = pos.y - this.y1;
					this.x1 = pos.x, this.y1 = pos.y;
					
					for (var i = 0, l = selection.length; i < l; i++) {
						if (Ext.isFunction(selection[i].translate)) {
							selection[i].getProxy().translate(dx, dy);
						}
					}
				}
			}
		}
	},
	mouseover: function(e, item) {
		if(item.element) {
			Ext.fly(item.element).addClass('hover');
		}
		e.stopEvent();
	},
	mouseout: function(e, item) {
		if(item.element) {
			Ext.fly(item.element).removeClass('hover');
		}
		e.stopEvent();
	},
	/**
	 * proxify
	 * replaces objects in the selection with {@link WorkspaceProxy}s
	 */
	proxify: function(){
		var selection = this.workspace.getSelection();
		Ext.each(selection, function(selected){
			selected.proxify();
		});
		this.proxified = true;
	},
	/**
	 * deproxify
	 * restores objects in the selection from {@link WorkspaceProxy}s
	 */
	deproxify: function() {
	  var selection = this.workspace.getSelection();
	  Ext.each(selection,function(selected){
	    if(selected.proxified)
  	    selected.deproxify(!selected.isMovable);
	  });
	  this.proxified = false;
	},
	/**
	 * selectHandler
	 * listener invoked by workspace on select; creates {@link ResizeHandle}s and {@link SelectionBand}s
	 * @param {Object} item
	 */
	selectHandler: function(item) {
		this.addSelectionBand(item);
		this.addHandles(item);
		var id = item.getId();
	},
	/**
	 * unselectHandler
	 * listener invoked by workspace on deselect; destroys {@link ResizeHandle}s and {@link SelectionBand}s
	 * @param {Object} item
	 */
	unselectHandler: function(item) {
		this.removeSelectionBand(item.getId());
		this.removeHandles(item.getId());
		// this.objectInspector.unbind(item);
		
		// this.destroyInspectors(item.getId());
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
		// if no argument, remove all selection bands
		} else {
			this.selectionBands.each(function(band) {
				band.destroy();
			});	
			this.selectionBands.clear();
		}
	},
	/**
	 * onHandleDragEnd
	 * listener invoked by resize handle when dropped. Resets bounds of movement of the handle to prevent objects from being
	 * negative-sized
	 * @param {Object} handle
	 */
	onHandleDragEnd: function(handle) {
		var item = handle.item, id, handles;
		if(item) {
			id = item.getId();
			handles = this.handles.get(id);
			if(id && handles) {
				this.setHandleBounds(item,handles);
			}
		}
		
	},
	/**
	 * setHandleBounds
	 * see {@link #onHandleDragEnd}
	 * @param {Object} item
	 * @param {Object} handles
	 */
	setHandleBounds: function(item,handles) {
		var box = item.getBox();
		Ext.apply(handles.tl,{ xMin: false, xMax: box.tr.x, yMin: false, yMax: box.bl.y });
		Ext.apply(handles.tr,{ xMin: box.tl.x, xMax: false, yMin: false, yMax: box.bl.y });
		Ext.apply(handles.bl,{ xMin: false, xMax: box.tr.x, yMin: box.tl.y, yMax: false });
		Ext.apply(handles.br,{ xMin: box.tl.x, xMax: false, yMin: box.tl.y, yMax: false });
	},	
	addHandles: function(item) {
		if(!this.handles.containsKey(item.getId())) {
			if((Ext.isFunction(item.getBox)) && (item.isResizable)) {
				var box = item.getBox();
				var handles = {
					tl: new ResizeHandle(this.workspace,{location:'tl',item:item, x:box.tl.x, y:box.tl.y,item:item}),
					tr: new ResizeHandle(this.workspace,{location:'tr',item:item, x:box.tr.x, y:box.tr.y,item:item}),
					bl: new ResizeHandle(this.workspace,{location:'bl',item:item, x:box.bl.x, y:box.bl.y,item:item}),
					br: new ResizeHandle(this.workspace,{location:'br',item:item, x:box.br.x, y:box.br.y,item:item})
				};
								
				this.handles.add(item.getId(),handles);
				this.setHandleBounds(item,handles)			
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
		
	},
	deleteSelection: function() {
		this.workspace.deleteObjects(this.workspace.getSelection());
	},
	activate: function() {
		PointerTool.superclass.activate.call(this);
		this.workspace.on('select',this.selectHandler,this);
		this.workspace.on('unselect',this.unselectHandler,this);
		
		Ext.each(this.workspace.getSelection(),function(item) {
			this.selectHandler(item);
		},this);
	},
	deactivate: function() {
		PointerTool.superclass.deactivate.call(this);
		this.workspace.un('select',this.selectHandler,this);
		this.workspace.un('unselect',this.unselectHandler,this);
		if(this.selectorBand) this.selectorBand.destoy();
		this.removeHandles();	
		this.removeSelectionBand();
		// this.objectInspector.unbind();
		// this.destroyInspectors();
	}
});

Workspace.Tools.register('pointer',PointerTool);

////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * @class IdeaTool
 * Allows objects to be grouped into sematic ideas
 * @extends WorkspaceTool
 * @param {Object} workspace
 * @param {Object} config
 */
var IdeaTool = function(workspace, config) {
  Ext.applyIf(config,{
    keyMap: []
  });
  
  IdeaTool.superclass.constructor.call(this,workspace,config);
  
  this.dragging = false;
  this.selectorBand = false;
  this.selectionBands = new Ext.util.MixedCollection();
};

Ext.extend(IdeaTool, WorkspaceTool, {
  click: function(e, item) {
    
  },
  dblclick: function(e, item) {
    
  },
  mousedown: function(e, item) {
    this.dragging = true;
    pos = this.getAdjustedXY(e);
    this.x1 = pos.x, this.y1 = pos.y;
    if(this.selectorBand) { this.selectorBand.destroy(); this.selectorBand = false; }
    this.selectorBand = new SelectorBand(this.workspace,{x1: pos.x, y1: pos.y});  
    
    e.stopEvent();
  },
  mouseup: function(e, item) {
    this.dragging = false;
    if(this.selectorBand) {
      this.selectorBand.destroy();
      this.selectorBand = false;  
    }
    if(item) {
      if(Ext.type(item.select)=='function') {
        item.select();
      }
    }
    var children = this.workspace.getSelection();
	
	if (children.length > 0) {
		var idea = this.workspace.createObject(WorkspaceIdeaObject, {
			children: children
		});
		idea.toBack();
		this.workspace.changeTool('pointer');
	}
    e.stopEvent();
  },
  mousemove: function(e, item) {
    if(this.dragging) {
      
      var selection = this.workspace.getSelection();
      if(this.selectorBand) {
        
        // Get mouse position and move the selectorBand
        pos = this.getAdjustedXY(e);
        this.selectorBand.adjustBand(pos.x,pos.y);
        
        // Get items within the selectorBand, and select them
        var containedItems = this.selectorBand.getItemsWithin(); // items currently within the band
        for(var i=0,l=containedItems.length;i<l;i++) {
          containedItems[i].select(); 
        }
            
      }
    }
  },
  mouseover: function(e, item) {
    if(item.element) {
      Ext.fly(item.element).addClass('hover');
    }
    e.stopEvent();
  },
  mouseout: function(e, item) {
    if(item.element) {
      Ext.fly(item.element).removeClass('hover');
    }
    e.stopEvent();
  },
  selectHandler: function(item) {
    this.addSelectionBand(item);
  },

  unselectHandler: function(item) {
    this.removeSelectionBand(item.getId());
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
    // if no argument, remove all selection bands
    } else {
      this.selectionBands.each(function(band) {
        band.destroy();
      }); 
      this.selectionBands.clear();
    }
  },

  deleteSelection: function() {
    this.workspace.deleteObjects(this.workspace.getSelection());
  },
  activate: function() {
    IdeaTool.superclass.activate.call(this);
    this.workspace.deselect();
    this.workspace.on('select',this.selectHandler,this);
    this.workspace.on('unselect',this.unselectHandler,this);
    /*
    Ext.each(this.workspace.getSelection(),function(item) {
      this.selectHandler(item);
    },this);
    */
  },
  deactivate: function() {
    IdeaTool.superclass.deactivate.call(this);
    this.workspace.un('select',this.selectHandler,this);
    this.workspace.un('unselect',this.unselectHandler,this);
    if(this.selectorBand) this.selectorBand.destoy();
    this.removeSelectionBand();
  }
});

Workspace.Tools.register('idea',IdeaTool);

////////////////////////////////////////////////////////////////////////////////////////////////

var IdeaAdderTool = function() {
	IdeaAdderTool.superclass.constructor.apply(this,arguments);
}

Ext.extend(IdeaAdderTool, WorkspaceTool, {
	click: function(e, item) {
		if(item && item.wtype=='WorkspaceIdeaObject') {
			this.workspace.doAction(new Workspace.Actions.AdoptObjectAction({
				subjects: this.workspace.getSelection(),
				parent: item
			}));
			this.workspace.changeTool('pointer');
		}
	},
	dblclick: function(e, item) {
		
	},
	mousedown: function(e, item) {
		
	},
	mouseup: function(e, item) {
		
	},
	mousemove: function(e, item) {
			
	},
	mouseover: function(e, item) {
			
	},
	mouseout: function(e, item) {
			
	},
	deactivate: function(e, item) {
	  this.workspace.deselect();
	}

});

Workspace.Tools.register('idea-add',IdeaAdderTool);

////////////////////////////////////////////////////////////////////////////////////////////////


/**
 * @class PencilTool
 * Allows the user to draw free-hand paths
 * @extends WorkspaceTool
 * @param {Object} workspace
 * @param {Object} config
 */
var PencilTool = function(workspace, config) {
	this.workspace = workspace;
	Ext.apply(this,config,{
		
	});
	
	PencilTool.superclass.constructor.call(this,workspace,config);
	this.dragging = false;
	this.currentPath = false;
	this.currentShape = false;
};

Ext.extend(PencilTool, WorkspaceTool, {
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
		var obj = this.workspace.createObject(VectorPathObject,{path:this.currentPath,'stroke':'#000','stroke-width':'5px'});
		this.currentShape.remove();
		this.currentPath = false;
		this.currentShape = false;
		this.workspace.setSelection([obj]);
	},
	mousemove: function(e, item) {
		if(this.dragging) {
			pos = this.getAdjustedXY(e);
			this.currentPath.push(['L',pos.x,pos.y]);
			this.currentShape.attr({path:this.currentPath});
		}
	}
});

Workspace.Tools.register('pencil',PencilTool);


////////////////////////////////////////////////////////////////////////////////////////////////

// not implemented
var PaintbrushTool = function(workspace, config) {
	this.workspace = workspace;
	Ext.apply(this,config,{
		
	});
	this.dragging = false;
	PaintbrushTool.superclass.constructor.call(this,workspace,config);
};

Ext.extend(PaintbrushTool, WorkspaceTool, {
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

Workspace.Tools.register('paintbrush',PaintbrushTool);

////////////////////////////////////////////////////////////////////////////////////////////////


// not implemented
/**
 * @class VectorTool
 * @extends WorkspaceTool
 * @param {Object} workspace
 * @param {Object} config
 */
var VectorTool = function(workspace, config) {
	this.workspace = workspace;
	Ext.apply(this,config,{
		
	});
	VectorTool.superclass.constructor.call(this,workspace,config);

	this.dragging = false;
};

Ext.extend(VectorTool, WorkspaceTool, {
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

Workspace.Tools.register('vector',VectorTool);

////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * @class RectTool
 * Draws rectangles
 * @extends WorkspaceTool
 * @param {Object} workspace
 * @param {Object} config
 */
var RectTool = function(workspace, config) {
	this.workspace = workspace;
	Ext.apply(this,config,{
		parameters: {}
	});
	
	RectTool.superclass.constructor.call(this,workspace,config);
	
	Ext.apply(this.parameters,{
		fill: '#fff',
		stroke: '#000'
	});
	
	this.dragging = false;
	this.proto = false;
	this.x1 = 0;
	this.y1 = 0;
};

Ext.extend(RectTool, WorkspaceTool, {
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
			
			var obj = this.workspace.createObject(VectorRectObject,{
				x: attr.x,
				y: attr.y,
				width: Workspace.Utils.bounds(attr.width,this.minWidth,this.maxWidth),
				height: Workspace.Utils.bounds(attr.height,this.minHeight,this.maxHeight)
			});
			this.workspace.setSelection([obj]);
			
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
	},
	deactivate: function() {
	  
	}
});

Workspace.Tools.register('rect',RectTool);


////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * @class EllipseTool
 * Draws ellipses
 * @extends WorkspaceTool
 * @param {Object} workspace
 * @param {Object} config
 */
var EllipseTool = function(workspace, config) {
	this.workspace = workspace;
	Ext.apply(this,config,{
		parameters: {}
	});
	EllipseTool.superclass.constructor.call(this,workspace,config);

	
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

Ext.extend(EllipseTool, WorkspaceTool, {
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
			delete this.proto;	
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
			
			var o = this.workspace.createObject(VectorEllipseObject,{
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
		if(this.dragging) {
			if(!this.proto) {
				this.createProto(e);
			}
			
			var pos = this.getAdjustedXY(e);
			this.x2 = pos.x;
			this.y2 = pos.y;
			var attr = SelectorBand.calculateBandBox(this.x1,this.y1,this.x2,this.y2);
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
		
		this.proto = this.workspace.paper.ellipse(this.x1,this.y1,0,0);
		this.proto.attr(this.parameters);
	}
});

Workspace.Tools.register('ellipse',EllipseTool);

////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * @class LineTool
 * Draws straight lines
 * @extends WorkspaceTool
 * @param {Object} workspace
 * @param {Object} config
 */
var LineTool = function(workspace, config) {
	this.workspace = workspace;
	Ext.apply(this,config,{
		parameters: {}
	});
	LineTool.superclass.constructor.call(this,workspace,config);
	
	Ext.apply(this.parameters,{
		stroke: '#000'
	});
	
	this.dragging = false;
	this.proto = false;
	this.x1 = 0;
	this.y1 = 0;
};

Ext.extend(LineTool, WorkspaceTool, {
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
			
			var o = this.workspace.createObject(VectorPathObject,{
				path: [['M',this.x1,this.y1],['L',this.x2,this.y2]]
			})
			
			this.proto.remove();	
			this.workspace.setSelection([o]);
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

Workspace.Tools.register('line',LineTool);

////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * @class ConnectorTool
 * Draws curved connectors between objects
 * @extends WorkspaceTool
 * @param {Object} workspace
 * @param {Object} config
 */
var ConnectorTool = function(workspace, config) {
  this.workspace = workspace;
  Ext.apply(this,config,{
    parameters: {}
  });
  ConnectorTool.superclass.constructor.call(this,workspace,config);
  
  Ext.apply(this.parameters,{
    stroke: '#000'
  });
  
  this.dragging = false;
  this.proto = false;
  this.x1 = 0;
  this.y1 = 0;
};

Ext.extend(ConnectorTool, WorkspaceTool, {
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
      
    this.createProto(e,item);
    e.stopEvent();
  },
  mouseup: function(e, item) {
    this.dragging = false;
    
    if(this.proto) {
      
      var p =this.getAdjustedXY(e);
      if(item) {
        this.rightObject = item;
      } else {
        this.rightObject = WorkspaceConnectionObject.getPoint(p.x, p.y);
      }
      
      this.workspace.createObject(WorkspaceConnectionObject,{
        leftObject: this.leftObject,
        rightObject: this.rightObject
        //path: [['M',this.x1,this.y1],['L',this.x2,this.y2]]
      })
      
      this.proto.remove();  
    }
    e.stopEvent();
  },
  mousemove: function(e, item) {
    if(this.dragging) {
      if(!this.proto) {
        this.createProto(e);
      }
      
      var pos = this.getAdjustedXY(e);
      this.x2 = pos.x-1;
      this.y2 = pos.y-1;
      
      this.proto.attr({path: [['M',this.x1,this.y1],['L',this.x2,this.y2]]});
    }
    e.stopEvent();
  },
  createProto: function(e,item) {
    var p =this.getAdjustedXY(e);
    this.x1 = p.x;
    this.y1 = p.y;
    if(item) {
      this.leftObject = item;
    } else {
      this.leftObject = WorkspaceConnectionObject.getPoint(p.x, p.y);
    }
    
    this.proto = this.workspace.paper.path([['M',this.x1,this.y1]]);
    this.proto.attr(this.parameters);
  }
});

Workspace.Tools.register('connector',ConnectorTool);


////////////////////////////////////////////////////////////////////////////////////////////////

// not implemented
var CurveTool = function(workspace, config) {
	this.workspace = workspace;
	Ext.apply(this,config,{
		
	});
	CurveTool.superclass.constructor.call(this,workspace,config);

	this.drawing = false;
	this.dragging = false;
	this.currentPath = false;
	this.currentShape = false;
};

Ext.extend(CurveTool, WorkspaceTool, {
	click: function(e, item) {
		if(this.drawing) { 
			var pos = this.getAdjustedXY(e);
			this.x1 = parseInt(pos.x); this.y1 = parseInt(pos.y); 
			this.currentPath.push(['T',this.x1,this.y1]);
			this.currentShape.attr({path:this.currentPath});
		} else {
			this.drawing = true;
			var pos = this.getAdjustedXY(e);
			this.x1 = parseInt(pos.x); this.y1 = parseInt(pos.y); 
			this.currentPath = [['M',this.x1,this.y1]];
			this.currentPath.push(['T',this.x1,this.y1]);
			this.currentShape = this.workspace.paper.path(this.currentPath);
			this.currentShape.attr({'stroke':'#000','stroke-width':'5px'});
		}
		e.stopEvent();
	},
	dblclick: function(e, item) {
		this.drawing = false;
		this.dragging = false;
		var o = this.workspace.createObject(VectorPathObject,{path:this.currentPath,'stroke':'#000','stroke-width':'5px'});
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
		if(this.drawing) {
			pos = this.getAdjustedXY(e);
			this.currentPath.pop();
			this.currentPath.push(['T',parseInt(pos.x),parseInt(pos.y)]);
			this.currentShape.attr({path:this.currentPath});
		}
		e.stopEvent();
	}
});

Workspace.Tools.register('curve',CurveTool);


////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * @class PolyLineTool
 * Draws straight polylines
 * @extends WorkspaceTool
 * @param {Object} workspace
 * @param {Object} config
 */
var PolyLineTool = function(workspace, config) {
	this.workspace = workspace;
	Ext.apply(this,config,{
		protoProps: {'stroke':'#000','stroke-width':'5px'}
	});
	PolyLineTool.superclass.constructor.call(this,workspace,config);

	this.drawing = false;
	this.dragging = false;
	this.currentPath = false;
	this.currentShape = false;
};

Ext.extend(PolyLineTool, WorkspaceTool, {
	click: function(e, item) {
		if(this.drawing) { 
			var pos = this.getAdjustedXY(e);
			this.x = parseInt(pos.x); this.y = parseInt(pos.y); 
			this.currentPath.push(['L',this.x,this.y]);
			this.currentShape.attr({path:this.currentPath});
		} else {
			this.drawing = true;
			var pos = this.getAdjustedXY(e);
			this.x1 = parseInt(pos.x); this.y1 = parseInt(pos.y); 
			this.currentPath = [['M',this.x1,this.y1]];
			this.currentPath.push(['L',this.x1,this.y1]);
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
		var o = this.workspace.createObject(VectorPathObject,{path:this.currentPath,fillOpacity: 0.1});
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
		if(this.drawing) {
			pos = this.getAdjustedXY(e);
			this.currentPath.pop();
			this.currentPath.push(['L',parseInt(pos.x),parseInt(pos.y)]);
			this.currentShape.attr({path:this.currentPath});
		}
		e.stopEvent();
	}
});

Workspace.Tools.register('polyline',PolyLineTool);

////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * @class PolygonTool
 * Draws closed polygons
 * @extends PolyLineTool
 * @param {Object} workspace
 * @param {Object} config
 */
var PolygonTool = function(workspace, config) {
	this.workspace = workspace;
	PolygonTool.superclass.constructor.call(this,workspace,config);
	
	Ext.apply(this.protoProps,{'stroke':'#000','stroke-width':'5px', 'fill': '#FFF', 'fill-opacity':'0.5'});
};

Ext.extend(PolygonTool, PolyLineTool, {
	dblclick: function(e, item) {
		this.drawing = false;
		this.dragging = false;
		this.currentPath.pop();
		this.currentPath.pop();
		this.currentPath.push(['L',this.x1,this.y1]);
		var o = this.workspace.createObject(VectorPathObject,{path:this.currentPath,fillOpacity: 1});
		this.currentShape.remove();
		this.currentPath = false;
		this.currentShape = false;
		this.workspace.setSelection([o]);
		e.stopEvent();
	},
});

Workspace.Tools.register('polygon',PolygonTool);

////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * @class TextTool
 * Builds {@link RichTextObject}s
 * @extends WorkspaceTool
 * @param {Object} workspace
 * @param {Object} config
 */
var TextTool = function(workspace, config) {
	this.workspace = workspace;
	Ext.apply(this,config,{
		parameters: {}
	});
	TextTool.superclass.constructor.call(this,workspace,config);
	
	Ext.apply(this.parameters,{
		fill: '#fff',
		stroke: '#000'
	});
	
	this.dragging = false;
	this.proto = false;
	this.x1 = 0;
	this.y1 = 0;
};

Ext.extend(TextTool, WorkspaceTool, {
  minWidth: 75,
  maxWidth: false,
  minHeight: 20,
  maxHeight: false,
	click: function(e, item) {
	    if(item && item.wtype == 'RichTextObject') {
		  if (this._item) {
		  	this.workspace.deleteObjects(this._item);
			delete this._item;
		  }
		  this.workspace.edit(item);
		  return false;
	    }
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
		
		e.stopEvent();
	},
	mouseup: function(e, item) {
		this.dragging = false;
		
		if(this.proto) {
			
			var pos = this.getAdjustedXY(e);
			this.x2 = pos.x;
			this.y2 = pos.y;
			var attr = SelectorBand.calculateBandBox(this.x1,this.y1,this.x2,this.y2);
			
			this._item = this.workspace.createObject(RichTextObject,{
				x: attr.x,
				y: attr.y,
        		width: Workspace.Utils.bounds(attr.width,this.minWidth,this.maxWidth),
        		height: Workspace.Utils.bounds(attr.height,this.minHeight,this.maxHeight)
			});
			this.proto.remove();	
			this.workspace.edit(this._item);
		}
		e.stopEvent();
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
  		e.stopEvent();
		}
	},
	createProto: function(e) {
		var pos = this.getAdjustedXY(e);
		this.x1 = pos.x;
		this.y1 = pos.y;
		
		this.proto = this.workspace.paper.rect(this.x1,this.y1,0,0);
		this.proto.attr(this.parameters);
	},
	deactivate: function() {
	  if(this.proto) {
	    this.proto.remove();
	    this.proto = false;
	  }
	  this._item = false;
	}
});

Workspace.Tools.register('textbox',TextTool);

////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * @class MathTool
 * Builds {@link MathEquationObject}s
 * @extends WorkspaceTool
 * @param {Object} workspace
 * @param {Object} config
 */
var MathTool = function(workspace, config) {
  this.workspace = workspace;
  Ext.apply(this,config,{
    parameters: {}
  });
  MathTool.superclass.constructor.call(this,workspace,config);
  
  Ext.apply(this.parameters,{
    fill: '#fff',
    stroke: '#000'
  });
  
  this.dragging = false;
  this.proto = false;
  this.x1 = 0;
  this.y1 = 0;
};

Ext.extend(MathTool, WorkspaceTool, {
  minWidth: 75,
  maxWidth: false,
  minHeight: 30,
  maxHeight: false,
  click: function(e, item) {
    if(item && item.wtype == 'MathEquationObject') {
      this.workspace.edit(item);
    }
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
    
    e.stopEvent();
  },
  mouseup: function(e, item) {
    this.dragging = false;
    
    if(this.proto) {
      
      var pos = this.getAdjustedXY(e);
      this.x2 = pos.x;
      this.y2 = pos.y;
      var attr = SelectorBand.calculateBandBox(this.x1,this.y1,this.x2,this.y2);
      
      var obj = this.workspace.createObject(MathEquationObject,{
        x: attr.x,
        y: attr.y,
        width: Workspace.Utils.bounds(attr.width,this.minWidth,this.maxWidth),
        height: Workspace.Utils.bounds(attr.height,this.minHeight,this.maxHeight)
      })
      
      this.proto.remove();  
      this.workspace.edit(obj);
    }
    e.stopEvent();
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
      e.stopEvent();
    }
  },
  createProto: function(e) {
    var pos = this.getAdjustedXY(e);
    this.x1 = pos.x;
    this.y1 = pos.y;
    
    this.proto = this.workspace.paper.rect(this.x1,this.y1,0,0);
    this.proto.attr(this.parameters);
  },
  deactivate: function() {
    if(this.proto) {
      this.proto.remove();
      this.proto = false;
    }
  }
});

Workspace.Tools.register('math',MathTool);
////////////////////////////////////////////////////////////////////////////////////////////////
