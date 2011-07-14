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