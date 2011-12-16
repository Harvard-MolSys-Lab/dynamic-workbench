////////////////////////////////////////////////////////////////////////////////////////////////
/**
 * @class Workspace.tools.PointerTool
 * Allows selection, movement, and resizing of objects
 * @extends Workspace.tools.BaseTool
 * @param {Object} workspace
 * @param {Object} config
 */
Ext.define('Workspace.tools.PointerTool', {
	constructor: function(workspace, config) {
		Ext.applyIf(config, {
			keyMap: [{
				key: [Ext.EventManager.BACKSPACE, Ext.EventManager.DELETE, Ext.EventManager.D],
				fn: this.deleteSelection,
				scope: this
			}]
		});

		Workspace.tools.PointerTool.superclass.constructor.call(this, workspace, config);

		this.dragging = false;
		this.selectorBand = false;
		this.selectionBands = new Ext.util.MixedCollection();
		this.handles = new Ext.util.MixedCollection();
		this.inspectors = new Ext.util.MixedCollection();
		this.itemsWithinBand = new Ext.util.MixedCollection();
		// this.objectInspector = new Ext.ux.Workspace.Workspace.VectorObjectInspector();
		this.mixins.highlightable.constructor.apply(this,arguments);
	},
	extend:'Workspace.tools.BaseTool',
	requires: ['Workspace.tools.SelectionBand','Workspace.tools.SelectorBand','Workspace.tools.ResizeHandle'],
	mixins: {
		highlightable:'Workspace.tools.Highlightable'
	},
	proxified: false,
	dragged: false,
	threshold: 10,
	dragCount: 0,
	click: function(e, item) {
		if(!item) {
			this.workspace.deselect();
			e.stopEvent();
		} else {
			e.stopEvent();
		}

		// Relevant item
		// if (this.dragCount < this.threshold) {
		// if (Ext.type(item.select) == 'function') {
		//
		// } else {
		// this.workspace.deselect();
		// e.stopEvent();
		// }
		// }
		// this.dragCount = 0;

		//e.stopEvent();
	},
	dblclick: function(e, item) {
		console.log('Workspace.tools.PointerTool.click');

		// Relevant item
		if (item.editor && this.workspace.hasTool(item.editor)) {
			//Ext.type(item.edit)=='function') {
			this.workspace.edit(item);
			e.stopEvent();
		} else {
			if (Ext.type(item.select) == 'function') {
				item.select();
				e.stopEvent();
			} else {
				this.workspace.deselect();
				e.stopEvent();
			}
		}

		//e.stopEvent();
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
		if(item) {
			if (Ext.isFunction(item.select) && !item.is('selected')) {
				if(e.shiftKey) { // && this.workspace.hasSelection()) {
					item.select();
				} else {
					this.workspace.setSelection([item]);
				}
			}
			e.stopEvent()
		} else {
			this.selectorBand = new Workspace.tools.SelectorBand(this.workspace, {
				x1: pos.x,
				y1: pos.y
			});
			this.selectorBand.cacheRegions();
			if(!e.shiftKey) {
				this.workspace.deselect();
			}
			this.itemsWithinBand.clear();
			e.stopEvent();
		}

		//e.stopEvent();
	},
	mouseup: function(e, item) {
		this.dragging = false;
		if (this.selectorBand) {
			this.selectorBand.destroy();
			this.selectorBand = false;
			e.stopEvent();
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
		if (this.proxified)
			this.deproxify();

		//e.stopEvent();
		//return false;
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
					remainder.removeAtKey(item.getId());
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
							//selection[i].getProxy().translate(dx, dy);
							selection[i].translate(dx, dy);
						}
					}

					e.stopEvent();
				}
			}
		}
	},
	// hack
	mouseover: function(e,item) {
		this.mixins.highlightable.mouseover.apply(this,arguments);
	},
	mouseout: function(e,item) {
		this.mixins.highlightable.mouseout.apply(this,arguments);
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
		return;
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
		return;
		var selection = this.workspace.getSelection();
		Ext.each(selection, function(selected) {
			if (selected.proxified)
				selected.deproxify(!selected.get('movable'));
		});
		this.proxified = false;
	},
	/**
	 * selectHandler
	 * listener invoked by workspace on select; creates {@link Workspace.tools.ResizeHandle}s and {@link Workspace.tools.SelectionBand}s
	 * @param {Object} item
	 */
	selectHandler: function(item) {
		this.addSelectionBand(item);
		this.addHandles(item);
		var id = item.getId();
	},
	/**
	 * unselectHandler
	 * listener invoked by workspace on deselect; destroys {@link Workspace.tools.ResizeHandle}s and {@link Workspace.tools.SelectionBand}s
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
			this.selectionBands.add(item.getId(), new Workspace.tools.SelectionBand({
				item:item,
				workspace:this.workspace
			}));
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
					this.selectionBands.removeAtKey(itemId);
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
					tl: new Workspace.tools.ResizeHandle(this.workspace, {
						location: 'tl',
						item: item,
						x: box.tl.x,
						y: box.tl.y,
						item: item
					}),
					tr: new Workspace.tools.ResizeHandle(this.workspace, {
						location: 'tr',
						item: item,
						x: box.tr.x,
						y: box.tr.y,
						item: item
					}),
					bl: new Workspace.tools.ResizeHandle(this.workspace, {
						location: 'bl',
						item: item,
						x: box.bl.x,
						y: box.bl.y,
						item: item
					}),
					br: new Workspace.tools.ResizeHandle(this.workspace, {
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
					left: new Workspace.tools.ConnectorHandle(this.workspace, {
						item: item,
						location: 'left'
					}),
					right: new Workspace.tools.ConnectorHandle(this.workspace, {
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
					this.handles.removeAtKey(itemId);
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
	deleteSelection: function(e) {
		this.workspace.deleteObjects(this.workspace.getSelection());
		e.stop();
	},
	activate: function() {
		Workspace.tools.PointerTool.superclass.activate.call(this);
		this.workspace.on('select', this.selectHandler, this);
		this.workspace.on('unselect', this.unselectHandler, this);

		Ext.each(this.workspace.getSelection(), function(item) {
			this.selectHandler(item);
		},
		this);
	},
	deactivate: function() {
		// hack to remove phantom highlights
		this.mixins.highlightable.mouseout.apply(this,arguments);
		
		Workspace.tools.PointerTool.superclass.deactivate.call(this);
		this.workspace.un('select', this.selectHandler, this);
		this.workspace.un('unselect', this.unselectHandler, this);
		if (this.selectorBand)
			this.selectorBand.destoy();
		this.removeHandles();
		this.removeSelectionBand();
		// this.objectInspector.unbind();
		// this.destroyInspectors();
	}
}, function() {
	Workspace.Tools.register('pointer', Workspace.tools.PointerTool);
});