/***********************************************************************************************
 * InfoMachine
 *
 *
 * Copyright (c) 2010-2011 Casey Grun
 *
 ***********************************************************************************************
 * ~/client/tools/tools.js
 *
 * Defines classes in the {Workspace.tool} namespace including {Workspace.tool.BaseTool} which
 * provide various modes of user interaction (e.g. moving, inserting objects), as well as several
 * helper classes to standardize common interaction behaviors (e.g. handles for resizing, bands
 * for capturing and indicating selection), etc.
 ***********************************************************************************************/

/**
 * @class Workspace.tool.SelectionBand
 * This class displays a band around the currently selected item(s) to indicate they are selected.
 * @extends Ext.util.Observable
 */
Workspace.tool.SelectionBand = function(item, workspace, config) {
	Workspace.tool.SelectionBand.superclass.constructor.call(this);

	config = config || {};

	Ext.applyIf(config, {
		shape: 'rect',
		strokeWidth: 1,
		stroke: '#ddd',
		fill: '#99BBE8',
		fillOpacity: 0.5,
		padding: 10
	});

	Ext.apply(this, config);

	this.item = item;
	this.workspace = workspace;

	var dims = item.getDimensions(),
	pos = item.getPosition();
	var x = (pos.x - this.padding),
	y = (pos.y - this.padding),
	w = (dims.width + 2 * this.padding),
	h = (dims.height + 2 * this.padding);

	this.rect = workspace.paper.rect(x, y, w, h);
	this.rect.attr({
		'stroke': this.stroke,
		'fill': this.fill,
		'fill-opacity': this.fillOpacity
	});
	if (item.vectorElement) {
		this.rect.insertBefore(item.vectorElement);
	}

	this.item.on('move', this.adjustBand, this);
	this.item.on('resize', this.adjustBand, this);

	this.adjustBand();
};
Ext.extend(Workspace.tool.SelectionBand, Ext.util.Observable, {
	adjustBand: function() {
		var item = this.item;
		var dims = item.getDimensions(),
		pos = item.getPosition();
		var x = (pos.x - this.padding),
		y = (pos.y - this.padding),
		w = (dims.width + 2 * this.padding),
		h = (dims.height + 2 * this.padding);
		this.rect.attr({
			x: x,
			y: y,
			width: w,
			height: h
		});
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
 * @class Workspace.tool.SelectorBand
 * Used to select objects by clicking and dragging
 * @extends Ext.util.Observable
 */
Workspace.tool.SelectorBand = function(workspace, config) {
	this.superclass.constructor.call(this);
	Ext.applyIf(config || {},
	{
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
	Ext.apply(this, config);

	this.workspace = workspace;

	this.rect = workspace.paper.rect(this.x1, this.y1, this.width, this.height);
	this.rect.attr({
		'stroke': this.stroke,
		'fill': this.fill,
		'fill-opacity': this.fillOpacity
	});
};
Ext.extend(Workspace.tool.SelectorBand, Ext.util.Observable, {

	adjustBand: function(x2, y2) {
		this.x2 = x2;
		this.y2 = y2;

		var attr = Workspace.tool.SelectorBand.calculateBandBox(this.x1, this.y1, x2, y2);

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

		this.workspace.objects.eachKey( function(id, item) {
			if (Ext.isFunction(item.getBox)) {
				var box = item.getBox();
				var x = (((this.x1 > box.tl.x) && (this.x2 < box.tr.x)) || ((box.tl.x > this.x1) && (box.tr.x < this.x2)));
				var y = (((this.y1 > box.tl.y) && (this.y2 < box.bl.y)) || ((box.tl.y > this.y1) && (box.bl.y < this.x2)));
				if (x && y) {
					within.push(item);
				}
			}
		},
		this);

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
Workspace.tool.SelectorBand.calculateBandBox = function(x1, y1, x2, y2) {
	var attr = {};
	var x,
	y;

	attr.width = Math.abs(x2 - x1);
	if (x2 > x1) {
		x = 'l'
		attr.x = x1;
	} else {
		x = 'r'
		attr.x = x2;
	}

	attr.height = Math.abs(y2 - y1);
	if (y2 > y1) {
		y = 't'
		attr.y = y1;
	} else {
		y = 'b'
		attr.y = y2;
	}

	attr.anchor = x + y;
	return attr;
}
////////////////////////////////////////////////////////////////////////////////////////////////

Workspace.tool.Highlightable = function() {
};
Workspace.tool.Highlightable.prototype = {
	accept: function() {
		return true;
	},
	setHoverItem: function() {
	},
	mouseover: function(e,item) {
		if(item && item.highlight && this.accept(item)) {
			item.highlight();
			this.setHoverItem(item);
		}
		e.stopEvent();
	},
	mouseout: function(e,item) {
		if(item && item.unhighlight) {
			item.unhighlight();
			this.setHoverItem(false);
		}
		e.stopEvent();
	}
};

////////////////////////////////////////////////////////////////////////////////////////////////
/**
 * @class Workspace.tool.Handle
 * Creates a shape on the workspace that can be dragged and dropped to manipulate a Workspace.Object
 * @extends Ext.util.Observable
 * @param {Object} workspace
 * @param {Object} config
 */
Workspace.tool.Handle = function(workspace, config) {

	// Call Observable Constructor
	Workspace.tool.Handle.superclass.constructor.call(this);

	// Configuration
	this.addEvents(
	'dragstart',
	'drag',
	'dragend'
	);

	Ext.applyIf(config, {
		x: 0,
		y: 0,
		x1: 0,
		y1: 0,
		shape: 'rect',
		width: 10,
		stroke: '#11f',
		strokeWidth: 1,
		fill: '#fff'
	});
	Ext.apply(this, config);

	this.workspace = workspace;
	this.dragging = false;

	// Create visual representation in workspace
	if (this.shape == 'rect') {
		this.handleShape = this.workspace.paper.rect(this.x - (this.width / 2), this.y - (this.width / 2), this.width, this.width);
		this.handleShape.attr({
			'stroke': this.stroke,
			'stroke-width': this.strokeWidth,
			'fill': this.fill
		});
	} else if (this.shape == 'circle') {
		this.handleShape = this.workspace.paper.circle(this.x, this.y, (this.width / 2));
		this.handleShape.attr({
			'stroke': this.stroke,
			'stroke-width': this.strokeWidth,
			'fill': this.fill
		});
	}

	if ((this.item) && (this.item.vectorElement)) {
		this.handleShape.insertAfter(this.item.vectorElement);
	} else {
		this.handleShape.toFront();
	}

	var handle = this;
	Ext.get(this.handleShape.node).on('mousedown', this.dragStartHandler, this);
	this.workspace.on('mouseup', this.dragEndHandler, this);
	this.workspace.on('mousemove', this.dragHandler, this);
};
App.mixin(Workspace.tool.Handle,Workspace.tool.Highlightable);

Ext.extend(Workspace.tool.Handle, Ext.util.Observable, {
	xMax: false,
	yMax: false,
	xMin: false,
	yMin: false,
	destroy: function() {
		Ext.get(this.handleShape.node).un('mousedown', this.dragStartHandler, this);
		this.workspace.un('mouseup', this.dragEndHandler, this);
		this.workspace.un('mousemove', this.dragHandler, this);
		this.handleShape.remove();
	},
	getAdjustedXY: function(e) {
		return Workspace.tool.BaseTool.prototype.getAdjustedXY.call(this,e);
	},
	getAdjustedXYcoords: function(x,y) {
		return Workspace.tool.BaseTool.prototype.getAdjustedXYcoords.apply(this,arguments);
	},
	getPosition: function() {
		return{
			x: this.x,
			y: this.y
		};
	},
	setPosition: function(x, y) {
		this.x = x;
		this.y = y;

		this.handleShape.attr({
			x: this.x - (this.width / 2),
			y: this.y - (this.width / 2)
		});
	},
	accept: function() {
		return false;
	},
	dragStartHandler: function(e) {
		this.dragging = true;
		var pos = this.getAdjustedXY(e);

		// remember initial position to calculate delta x/y
		this.x1 = pos.x;
		this.y1 = pos.y;
		this.fireEvent('dragstart');

		// watch for mouseover/out events so we can highlight, etc.
		this.workspace.on('mouseover',this.mouseover,this);
		this.workspace.on('mouseout',this.mouseout,this);
		e.stopEvent();
	},
	dragHandler: function(e) {
		if (this.dragging) {
			/* calculate mouse delta to avoid strange snapping when user doesn't click on the
 			* center of the handle
 			*/
			pos = this.getAdjustedXY(e);
			var dx = pos.x - this.x1,
			dy = pos.y - this.y1;

			// set new initial position, check configured handle movement bounds
			// (e.g. prevent user from resizing objects outside specified bounds;
			// bounds are updated by the managing {@link Workspace.tool.BaseTool})
			this.x1 = this.bounds(this.x1 + dx, this.xMax, this.xMin);
			this.y1 = this.bounds(this.y1 + dy, this.yMax, this.yMin);
			this.setPosition(this.x1, this.y1);

			// perform actual drag logic
			this.fireEvent('drag', e, pos.x, pos.y);
			if (Ext.isFunction(this.drag)) {
				this.drag(e, pos.x, pos.y);
			}
		}
	},
	dragEndHandler: function(e) {
		if (this.dragging) {
			this.dragging = false;

			// ignore subsequent mouseover/out events
			this.workspace.un('mouseover',this.mouseover,this);
			this.workspace.un('mouseout',this.mouseout,this);
			this.fireEvent('dragend');
		}
	},
	bounds: function(v, max, min) {
		return Workspace.Utils.bounds(v, min, max);
	}
});

////////////////////////////////////////////////////////////////////////////////////////////////
/**
 * @class Workspace.tool.ResizeHandle
 * @extends Workspace.tool.Handle
 * @param {Object} workspace
 * @param {Object} config
 */
Workspace.tool.ResizeHandle = function(workspace, config) {
	Workspace.tool.ResizeHandle.superclass.constructor.call(this, workspace, config);

	Ext.applyIf(this, {
		location: 'tl'
	});

	if (this.item) {
		if (this.item.vectorElement) {
			this.vectorElement = this.item.vectorElement;
		}
	}

	this.addEvents();

	this.item.on('move', this.onItemMove, this);
	this.item.on('resize', this.onItemMove, this);
	this.proxy = this.item.getProxy();
	this.proxy.on('move', this.onProxyMove, this);
	this.proxy.on('resize', this.onProxyMove, this);

	this.onItemMove();
};
Ext.extend(Workspace.tool.ResizeHandle, Workspace.tool.Handle, {
	drag: function() {
		var box = this.item.getBox();
		var pos = this.getPosition();

		switch (this.location) {
			case 'tl':
				this.proxy.setBox(pos.x, pos.y, box.br.x, box.br.y);
				break;
			case 'tr':
				this.proxy.setBox(box.tl.x, pos.y, pos.x, box.br.y);
				break;
			case 'bl':
				this.proxy.setBox(pos.x, box.tl.y, box.br.x, pos.y);
				break;
			case 'br':
				this.proxy.setBox(box.tl.x, box.tl.y, pos.x, pos.y);
				break;
		}
	},
	dragStartHandler: function() {
		this.item.applyProxy();
		Workspace.tool.ResizeHandle.superclass.dragStartHandler.apply(this, arguments);
	},
	dragEndHandler: function() {
		if (this.dragging) {
			this.item.restoreFromProxy();
			Workspace.tool.ResizeHandle.superclass.dragEndHandler.apply(this, arguments);
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
		switch (this.location) {
			case 'tl':
				this.setPosition(box.tl.x, box.tl.y);
				break;
			case 'tr':
				this.setPosition(box.tr.x, box.tr.y);
				break;
			case 'bl':
				this.setPosition(box.bl.x, box.bl.y);
				break;
			case 'br':
				this.setPosition(box.br.x, box.br.y);
				break;
		}
	},
	destroy: function() {
		Workspace.tool.ResizeHandle.superclass.destroy.call(this);
		this.proxy.un('move', this.move, this);
		this.proxy.un('resize', this.move, this);
	}
});

////////////////////////////////////////////////////////////////////////////////////////////////
/**
 * @class Workspace.tool.ConnectorHandle
 * Allows connector objects to be retargeted
 * @extends Workspace.tool.Handle
 */

Workspace.tool.ConnectorHandle = Ext.extend(Workspace.tool.Handle,{
	constructor: function() {
		Workspace.tool.ConnectorHandle.superclass.constructor.apply(this,arguments);

		this.item.on('move', this.onItemMove, this);
		this.item.on('resize', this.onItemMove, this);

		this.onItemMove();
	},
	/**
 	* accept
 	* Determines whether to accept a hover/drop on an item;
 	* @param {Mixed} item The item to be tested
 	* @return true if an item is passed; false otherwise.
 	*/
	accept: function(item) {
		// TODO: reject leftobject
		return (item != null);
	},
	setHoverItem: function(item) {
		this.dropTarget = item;
	},
	drag: function() {
		var pos = this.getPosition(),
		point = Workspace.ConnectionObject.getPoint(pos.x,pos.y),
		left, right;
		switch(this.location) {
			case 'right':
				left = this.item.get('leftObject');
				right = point;
				break;
			case 'left':
				left = point;
				right = this.item.get('rightObject');
				break;
		}
		this.item.applyPath(this.item.buildPath(left,right));
	},
	dragEndHandler: function() {
		if(this.dragging) {
			Workspace.tool.ConnectorHandle.superclass.dragEndHandler.apply(this,arguments);
			if(!this.dropTarget) {
				var pos = this.getPosition();
				this.dropTarget = Workspace.ConnectionObject.getPoint(pos.x,pos.y);
			}
			if(this.dropTarget) {
				switch(this.location) {
					case 'right':
						this.item.set('rightObject',this.dropTarget);
						break;
					case 'left':
						this.item.set('leftObject',this.dropTarget);
						break;
				}
				this.item.rebuildPath();
			}
			this.dropTarget = false;
		}
	},
	onItemMove: function() {
		var point;
		switch(this.location) {
			case 'left':
				point = this.item.getLeftPoint();
				break;
			case 'right':
				point = this.item.getRightPoint();
				break;
		}
		this.setPosition(point[0],point[1]);
	},
	destroy: function() {
		Workspace.tool.ConnectorHandle.superclass.destroy.apply(this,arguments);
		this.item.un('move', this.onItemMove, this);
		this.item.un('resize', this.onItemMove, this);
	}
})

////////////////////////////////////////////////////////////////////////////////////////////////
/**
 * @class Workspace.tool.BaseTool
 * Base class for all user interactions with the workspace. A tool represents a set of functions to handle
 * various mouse-based interactions with the workspace, as well as an optional Ext.KeyMap. Each of the mouse
 * handler functions below is invoked by the workspace, and is passed the Ext.EventObject for the event,
 * as well as a reference to a Workspace.Object, if the event occurred in a workspace object.
 * @extends Ext.util.Observable
 * @param {Object} workspace
 * @param {Object} config
 */
Workspace.tool.BaseTool = function(workspace, config) {
	Workspace.tool.BaseTool.superclass.constructor.apply(this, arguments);
	Ext.apply(this, config, {
		keyMapping: false
	});
	this.workspace = workspace;
	if (this.keyMapping) {
		this.keyMap = new Ext.KeyMap(this.workspace.element, this.keyMapping);
		this.keyMap.stopEvent = true;
		this.keyMap.disable();
	}
};
Ext.extend(Workspace.tool.BaseTool, Ext.util.Observable, {
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
		return this.getAdjustedXYcoords(e.getPageX(), e.getPageY());
	},
	getAdjustedXYcoords: function(x, y) {
		var pos = this.workspace.lens.getAdjustedXYcoords(
		(x - this.workspace.element.getX()),
		(y - this.workspace.element.getY())
		);
		return pos;
	},
	/**
 	* activate
 	* Performs a tool's set-up
 	*/
	activate: function() {
		if (this.keyMap)
			this.keyMap.enable();
	},
	/**
 	* deactivate
 	* Performs a tool's clean-up before another tool takes over
 	*/
	deactivate: function() {
		if (this.keyMap)
			this.keyMap.disable();
	}
});

////////////////////////////////////////////////////////////////////////////////////////////////
/**
 * @class Workspace.tool.PointerTool
 * Allows selection, movement, and resizing of objects
 * @extends Workspace.tool.BaseTool
 * @param {Object} workspace
 * @param {Object} config
 */
Workspace.tool.PointerTool = function(workspace, config) {
	Ext.applyIf(config, {
		keyMap: [{
			key: [Ext.EventManager.BACKSPACE, Ext.EventManager.DELETE, Ext.EventManager.D],
			fn: this.deleteSelection,
			scope: this
		}]
	});

	Workspace.tool.PointerTool.superclass.constructor.call(this, workspace, config);

	this.dragging = false;
	this.selectorBand = false;
	this.selectionBands = new Ext.util.MixedCollection();
	this.handles = new Ext.util.MixedCollection();
	this.inspectors = new Ext.util.MixedCollection();
	this.itemsWithinBand = new Ext.util.MixedCollection();
	// this.objectInspector = new Ext.ux.Workspace.Workspace.VectorObjectInspector();
};
Ext.extend(Workspace.tool.PointerTool, Workspace.tool.BaseTool, {
	proxified: false,
	dragged: false,
	threshold: 10,
	dragCount: 0,
	click: function(e, item) {

		
	},
	dblclick: function(e, item) {
		console.log('Workspace.tool.PointerTool.click');

		// Relevant item
		if (item.editor && this.workspace.hasTool(item.editor)) {
			//Ext.type(item.edit)=='function') {
			this.workspace.edit(item);
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
		pos = this.getAdjustedXY(e);
		this.x1 = pos.x,
		this.y1 = pos.y;
		if (this.selectorBand) {
			this.selectorBand.destroy();
			this.selectorBand = false;
		}
		if (item) {
			if (Ext.isFunction(item.select) && !item.is('selected')) {
				if(e.shiftKey) { // && this.workspace.hasSelection()) {
					item.select();
				} else {
					this.workspace.setSelection([item]);
				}
				// this.proxify();
			}
		} else {
			this.selectorBand = new Workspace.tool.SelectorBand(this.workspace, {
				x1: pos.x,
				y1: pos.y
			});
		}

		e.stopEvent();
	},
	mouseup: function(e, item) {
		if(this.dragging) {
			this.dragging = false;
			if (this.selectorBand) {
				this.selectorBand.destroy();
				this.selectorBand = false;
				
			} 
			// Relevant item
			if (this.dragCount < this.threshold) {
				if (item && Ext.type(item.select) == 'function') {
	
				} else {
					this.workspace.deselect();
				}
			}
			this.dragCount = 0;
	
	
			// TODO: determine if this is necessary ###
			/*
			if(item) {
			if(Ext.type(item.select)=='function') {
			item.select();
			}
			}
			//*/
	
			// restore objects
			if (this.proxified)
				this.deproxify();
	
			e.stopEvent();
			return false;
		}
	},
	mousemove: function(e, item) {
		if (this.dragging) {
			this.dragCount++;

			// this.objectInspector.hide();
			var selection = this.workspace.getSelection();
			if (this.selectorBand) {

				// Get mouse position and move the selectorBand
				pos = this.getAdjustedXY(e);
				this.selectorBand.adjustBand(pos.x, pos.y);

				// Get items within the selectorBand, and compare them to items at last consideration.
				var containedItems = this.selectorBand.getItemsWithin(),
				// items currently within the band
				remainder = this.itemsWithinBand.clone(),
				// we'll progressively remove items from this collection
				itemsWithin = new Ext.util.MixedCollection(),
				// we'll persist items within the band here
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
				remainder.eachKey( function(itemId, item) {
					item.invertSelection();
				});
				this.itemsWithinBand = itemsWithin;

			} else {
				// replace objects with proxies if it's not already been done
				if (this.workspace.hasSelection()) {
					if (!this.proxified) {
						this.proxify();
					}

					// move selection
					pos = this.getAdjustedXY(e);
					var dx = pos.x - this.x1,
					dy = pos.y - this.y1;
					this.x1 = pos.x,
					this.y1 = pos.y;

					for (var i = 0, l = selection.length; i < l; i++) {
						if (Ext.isFunction(selection[i].translate)) {
							selection[i].getProxy().translate(dx, dy);
						}
					}
				}
			}
		}
	},
	/*
	mouseover: function(e, item){
	if(item.highlight && Ext.isFunction(item.highlight)) item.highlight();
	// if (item.element){
	//     Ext.fly(item.element).addClass('hover');
	// }
	e.stopEvent();
	},
	mouseout: function(e, item){
	if(item.unhighlight && Ext.isFunction(item.unhighlight)) item.unhighlight();
	// if (item.element){
	//     Ext.fly(item.element).removeClass('hover');
	// }
	e.stopEvent();
	},
	*/
	/**
 	* proxify
 	* replaces objects in the selection with {@link Workspace.Proxy}s
 	*/
	proxify: function() {
		var selection = this.workspace.getSelection();
		Ext.each(selection, function(selected) {
			if(selected.get('movable')) {
				selected.proxify();
			}
		});
		this.proxified = true;
	},
	/**
 	* deproxify
 	* restores objects in the selection from {@link Workspace.Proxy}s
 	*/
	deproxify: function() {
		var selection = this.workspace.getSelection();
		Ext.each(selection, function(selected) {
			if (selected.proxified)
				selected.deproxify(!selected.get('movable'));
		});
		this.proxified = false;
	},
	/**
 	* selectHandler
 	* listener invoked by workspace on select; creates {@link Workspace.tool.ResizeHandle}s and {@link Workspace.tool.SelectionBand}s
 	* @param {Object} item
 	*/
	selectHandler: function(item) {
		this.addSelectionBand(item);
		this.addHandles(item);
		var id = item.getId();
	},
	/**
 	* unselectHandler
 	* listener invoked by workspace on deselect; destroys {@link Workspace.tool.ResizeHandle}s and {@link Workspace.tool.SelectionBand}s
 	* @param {Object} item
 	*/
	unselectHandler: function(item) {
		this.removeSelectionBand(item.getId());
		this.removeHandles(item.getId());
		// this.objectInspector.unbind(item);
		// this.destroyInspectors(item.getId());
	},
	addSelectionBand: function(item) {
		if (!this.selectionBands.containsKey(item.getId())) {
			this.selectionBands.add(item.getId(), new Workspace.tool.SelectionBand(item, this.workspace));
		}
	},
	removeSelectionBand: function(itemId) {
		// if an itemId is given, remove its selectionBand
		if (itemId) {
			if (!Ext.isString(itemId) && Ext.isFunction(itemId.getId)) {
				itemId = itemId.getId();
			}
			if (Ext.isString(itemId)) {
				if (this.selectionBands.containsKey(itemId)) {
					this.selectionBands.get(itemId).destroy();
					this.selectionBands.removeKey(itemId);
				}
			}
			// if no argument, remove all selection bands
		} else {
			this.selectionBands.each( function(band) {
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
		var item = handle.item,
		id,
		handles;
		if (item) {
			id = item.getId();
			handles = this.handles.get(id);
			if (id && handles) {
				this.setHandleBounds(item, handles);
			}
		}

	},
	/**
 	* setHandleBounds
 	* see {@link #onHandleDragEnd}
 	* @param {Object} item
 	* @param {Object} handles
 	*/
	setHandleBounds: function(item, handles) {
		var box = item.getBox();
		Ext.apply(handles.tl, {
			xMin: false,
			xMax: box.tr.x,
			yMin: false,
			yMax: box.bl.y
		});
		Ext.apply(handles.tr, {
			xMin: box.tl.x,
			xMax: false,
			yMin: false,
			yMax: box.bl.y
		});
		Ext.apply(handles.bl, {
			xMin: false,
			xMax: box.tr.x,
			yMin: box.tl.y,
			yMax: false
		});
		Ext.apply(handles.br, {
			xMin: box.tl.x,
			xMax: false,
			yMin: box.tl.y,
			yMax: false
		});
	},
	addHandles: function(item) {
		if (!this.handles.containsKey(item.getId())) {
			var handles;
			if ((Ext.isFunction(item.getBox)) && (item.isResizable)) {
				var box = item.getBox();
				handles = {
					tl: new Workspace.tool.ResizeHandle(this.workspace, {
						location: 'tl',
						item: item,
						x: box.tl.x,
						y: box.tl.y,
						item: item
					}),
					tr: new Workspace.tool.ResizeHandle(this.workspace, {
						location: 'tr',
						item: item,
						x: box.tr.x,
						y: box.tr.y,
						item: item
					}),
					bl: new Workspace.tool.ResizeHandle(this.workspace, {
						location: 'bl',
						item: item,
						x: box.bl.x,
						y: box.bl.y,
						item: item
					}),
					br: new Workspace.tool.ResizeHandle(this.workspace, {
						location: 'br',
						item: item,
						x: box.br.x,
						y: box.br.y,
						item: item
					})
				};
				this.setHandleBounds(item, handles)
			} else if (Workspace.Components.isWType(item,'Workspace.ConnectionObject')) {
				handles = {
					left: new Workspace.tool.ConnectorHandle(this.workspace,{
						item: item,
						location: 'left'
					}),
					right: new Workspace.tool.ConnectorHandle(this.workspace,{
						item: item,
						location: 'right'
					}),
				};
			}
			this.handles.add(item.getId(), handles);
		}
	},
	removeHandles: function(itemId) {
		// if an itemId is given, remove all its handles
		if (itemId) {
			if (!Ext.isString(itemId) && Ext.isFunction(itemId.getId)) {
				itemId = itemId.getId();
			}
			if (Ext.isString(itemId)) {
				if (this.handles.containsKey(itemId)) {
					handles = this.handles.get(itemId);
					for (position in handles) {
						handles[position].destroy();
					}
					this.handles.removeKey(itemId);
				}
			}
			// if no argument, remove all handles
		} else {
			this.handles.each( function(handlesForItem) {
				for (handle in handlesForItem) {
					if (Ext.isFunction(handlesForItem[handle].destroy))
						handlesForItem[handle].destroy();
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
		Workspace.tool.PointerTool.superclass.activate.call(this);
		this.workspace.on('select', this.selectHandler, this);
		this.workspace.on('unselect', this.unselectHandler, this);

		Ext.each(this.workspace.getSelection(), function(item) {
			this.selectHandler(item);
		},
		this);
	},
	deactivate: function() {
		Workspace.tool.PointerTool.superclass.deactivate.call(this);
		this.workspace.un('select', this.selectHandler, this);
		this.workspace.un('unselect', this.unselectHandler, this);
		if (this.selectorBand)
			this.selectorBand.destoy();
		this.removeHandles();
		this.removeSelectionBand();
		// this.objectInspector.unbind();
		// this.destroyInspectors();
	}
});
App.mixin(Workspace.tool.PointerTool, Workspace.tool.Highlightable);

Workspace.Tools.register('pointer', Workspace.tool.PointerTool);

////////////////////////////////////////////////////////////////////////////////////////////////
/**
 * @class Workspace.tool.IdeaTool
 * Allows objects to be grouped into sematic ideas
 * @extends Workspace.tool.BaseTool
 * @param {Object} workspace
 * @param {Object} config
 */
Workspace.tool.IdeaTool = function(workspace, config) {
	Ext.applyIf(config, {
		keyMap: []
	});

	Workspace.tool.IdeaTool.superclass.constructor.call(this, workspace, config);

	this.dragging = false;
	this.selectorBand = false;
	this.selectionBands = new Ext.util.MixedCollection();
};
Ext.extend(Workspace.tool.IdeaTool, Workspace.tool.BaseTool, {
	click: function(e, item) {

	},
	dblclick: function(e, item) {

	},
	mousedown: function(e, item) {
		this.dragging = true;
		pos = this.getAdjustedXY(e);
		this.x1 = pos.x,
		this.y1 = pos.y;
		if (this.selectorBand) {
			this.selectorBand.destroy();
			this.selectorBand = false;
		}
		this.selectorBand = new Workspace.tool.SelectorBand(this.workspace, {
			x1: pos.x,
			y1: pos.y
		});

		e.stopEvent();
	},
	mouseup: function(e, item) {
		this.dragging = false;
		if (this.selectorBand) {
			this.selectorBand.destroy();
			this.selectorBand = false;
		}
		if (item) {
			if (Ext.type(item.select) == 'function') {
				item.select();
			}
		}

		var idea = this.buildIdeaFromSelection();
		if(idea) {
			idea.select();
			this.workspace.changeTool('pointer');
		}

		e.stopEvent();
	},
	buildIdeaFromSelection: function() {
		var children = this.workspace.getSelection();

		if (children.length > 0) {
			var idea = this.workspace.createObject(Workspace.IdeaObject, {
				children: children
			});
			idea.toBack();
		}
		return idea;
	},
	mousemove: function(e, item) {
		if (this.dragging) {

			var selection = this.workspace.getSelection();
			if (this.selectorBand) {

				// Get mouse position and move the selectorBand
				pos = this.getAdjustedXY(e);
				this.selectorBand.adjustBand(pos.x, pos.y);

				// Get items within the selectorBand, and select them
				var containedItems = this.selectorBand.getItemsWithin();
				// items currently within the band
				for (var i = 0, l = containedItems.length; i < l; i++) {
					containedItems[i].select();
				}

			}
		}
	},
	mouseover: function(e, item) {
		if (item.element) {
			Ext.fly(item.element).addClass('hover');
		}
		e.stopEvent();
	},
	mouseout: function(e, item) {
		if (item.element) {
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
		if (!this.selectionBands.containsKey(item.getId())) {
			this.selectionBands.add(item.getId(), new Workspace.tool.SelectionBand(item, this.workspace));
		}
	},
	removeSelectionBand: function(itemId) {
		// if an itemId is given, remove its selectionBand
		if (itemId) {
			if (!Ext.isString(itemId) && Ext.isFunction(itemId.getId)) {
				itemId = itemId.getId();
			}
			if (Ext.isString(itemId)) {
				if (this.selectionBands.containsKey(itemId)) {
					this.selectionBands.get(itemId).destroy();
					this.selectionBands.removeKey(itemId);
				}
			}
			// if no argument, remove all selection bands
		} else {
			this.selectionBands.each( function(band) {
				band.destroy();
			});
			this.selectionBands.clear();
		}
	},
	deleteSelection: function() {
		this.workspace.deleteObjects(this.workspace.getSelection());
	},
	activate: function() {
		Workspace.tool.IdeaTool.superclass.activate.call(this);
		this.workspace.deselect();
		this.workspace.on('select', this.selectHandler, this);
		this.workspace.on('unselect', this.unselectHandler, this);
		/*
 		Ext.each(this.workspace.getSelection(),function(item) {
 		this.selectHandler(item);
 		},this);
 		*/
	},
	deactivate: function() {
		Workspace.tool.IdeaTool.superclass.deactivate.call(this);
		this.workspace.un('select', this.selectHandler, this);
		this.workspace.un('unselect', this.unselectHandler, this);
		if (this.selectorBand)
			this.selectorBand.destoy();
		this.removeSelectionBand();
	}
});

Workspace.Tools.register('idea', Workspace.tool.IdeaTool);

////////////////////////////////////////////////////////////////////////////////////////////////
Workspace.tool.IdeaAdderTool = function() {
	Workspace.tool.IdeaAdderTool.superclass.constructor.apply(this, arguments);
}
Ext.extend(Workspace.tool.IdeaAdderTool, Workspace.tool.BaseTool, {
	click: function(e, item) {
		if (item && item.wtype == 'Workspace.IdeaObject') {
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
		if(item && item.wtype=='Workspace.IdeaObject' && item.highlight && Ext.isFunction(item.highlight))
			item.highlight();
		// if (item.element){
		//     Ext.fly(item.element).addClass('hover');
		// }
		e.stopEvent();
	},
	mouseout: function(e, item) {
		if(item && item.unhighlight && Ext.isFunction(item.unhighlight))
			item.unhighlight();
		// if (item.element){
		//     Ext.fly(item.element).removeClass('hover');
		// }
		e.stopEvent();
	},
	deactivate: function(e, item) {
		this.workspace.deselect();
	}
});

Workspace.Tools.register('idea-add', Workspace.tool.IdeaAdderTool);

