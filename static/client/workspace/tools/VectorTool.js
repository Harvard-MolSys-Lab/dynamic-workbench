////////////////////////////////////////////////////////////////////////////////////////////////

// not implemented
/**
 * @class Workspace.tools.VectorTool
 * @extends Workspace.tools.BaseTool
 * @param {Object} workspace
 * @param {Object} config
 */
Ext.define('Workspace.tools.VectorTool', {
	constructor : function(workspace, config) {
		this.workspace = workspace;
		Ext.apply(this, config, {

		});
		this.callParent(arguments);

		this.dragging = false;
		this.handles = Ext.create('Ext.util.MixedCollection');
	},
	extend : 'Workspace.tools.BaseTool',
	requires: ['Workspace.tools.VectorHandle'],
	attach : function(item) {
		if(item.element) {
			if(item.unhighlight) item.unhighlight();
			this.addHandles(item)
			this.item = item;
		}
	},
	detach : function() {
		if(this.item) {
			this.removeHandles(this.item)
			this.item = false;
		}
	},
	addHandles: function(item) {
		if (!this.handles.containsKey(item.getId())) {
			var handles = [], points = item.get('points');
			if(points) {
				_.each(points,function(point,i) {
					handles.push(Ext.create('Workspace.tools.VectorHandle',this.workspace,{
						item:item,
						index: i,
					}));
				},this);
				this.handles.add(item.getId(),handles);
			}
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
	click: function(e, item) {

	},
	dblclick: function(e, item) {
		if (!item || (item && item.getId && item.getId() != this.item.getId())) {
			this.workspace.endEdit();
		}
	},
	mousedown: function(e, item) {

	},
	mouseup: function(e, item) {

	},
	mousemove: function(e, item) {

	},
	deactivate: function() {
		this.detach();
		this.callParent(arguments);
	}
}, function() {
	Workspace.Tools.register('vector', Workspace.tools.VectorTool);
});
