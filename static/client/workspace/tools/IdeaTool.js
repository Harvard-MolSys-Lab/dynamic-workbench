////////////////////////////////////////////////////////////////////////////////////////////////
/**
 * @class Workspace.tools.IdeaTool
 * Allows objects to be grouped into sematic ideas
 * @extends Workspace.tools.BaseTool
 * @param {Object} workspace
 * @param {Object} config
 */
Ext.define('Workspace.tools.IdeaTool', {
	constructor: function(workspace, config) {
		Ext.applyIf(config, {
			keyMap: []
		});

		Workspace.tools.IdeaTool.superclass.constructor.call(this, workspace, config);

		this.dragging = false;
		this.selectorBand = false;
		this.selectionBands = new Ext.util.MixedCollection();
	},
	requires: ['Workspace.tools.IdeaAdderTool',],
	extend:'Workspace.tools.BaseTool',
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
		this.selectorBand = new Workspace.tools.SelectorBand(this.workspace, {
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
	deleteSelection: function() {
		this.workspace.deleteObjects(this.workspace.getSelection());
	},
	activate: function() {
		Workspace.tools.IdeaTool.superclass.activate.call(this);
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
		Workspace.tools.IdeaTool.superclass.deactivate.call(this);
		this.workspace.un('select', this.selectHandler, this);
		this.workspace.un('unselect', this.unselectHandler, this);
		if (this.selectorBand)
			this.selectorBand.destoy();
		this.removeSelectionBand();
	}
}, function() {
	Workspace.Tools.register('idea', Workspace.tools.IdeaTool);
});