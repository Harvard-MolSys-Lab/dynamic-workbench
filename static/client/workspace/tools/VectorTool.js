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