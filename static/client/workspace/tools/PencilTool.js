////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * @class Workspace.tools.PencilTool
 * Allows the user to draw free-hand paths
 * @extends Workspace.tools.BaseTool
 * @param {Object} workspace
 * @param {Object} config
 */
Ext.define('Workspace.tools.PencilTool', {
	constructor: function(workspace, config) {
		this.workspace = workspace;
		Ext.apply(this, config, {

		});

		Workspace.tools.PencilTool.superclass.constructor.call(this, workspace, config);
		this.dragging = false;
		this.currentPath = false;
		this.currentShape = false;
	},
	extend:'Workspace.tools.BaseTool',
	click: function(e, item) {

	},
	dblclick: function(e, item) {

	},
	mousedown: function(e, item) {
		this.dragging = true;
		pos = this.getAdjustedXY(e);
		this.currentPath = [['M', pos.x, pos.y]];
		this.currentShape = this.workspace.paper.path(this.currentPath);
		this.currentShape.attr(App.Stylesheet.Draw);
	},
	mouseup: function(e, item) {
		this.dragging = false;
		var obj = this.workspace.createObject(Workspace.objects.Path, {
			path: this.currentPath,

			'stroke-width': '5px'
		});
		this.currentShape.remove();
		this.currentPath = false;
		this.currentShape = false;
		this.workspace.setSelection([obj]);
	},
	mousemove: function(e, item) {
		if (this.dragging) {
			pos = this.getAdjustedXY(e);
			this.currentPath.push(['L', pos.x, pos.y]);
			this.currentShape.attr({
				path: this.currentPath
			});
		}
	}
}, function() {
	Workspace.Tools.register('pencil', Workspace.tools.PencilTool);
});