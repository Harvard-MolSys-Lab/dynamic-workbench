////////////////////////////////////////////////////////////////////////////////////////////////
/**
 * @class Workspace.tools.PolygonTool
 * Draws closed polygons
 * @extends Workspace.tools.PolyLineTool
 * @param {Object} workspace
 * @param {Object} config
 */
Ext.define('Workspace.tools.PolygonTool', {
	constructor: function(workspace, config) {
		this.workspace = workspace;
		Workspace.tools.PolygonTool.superclass.constructor.call(this, workspace, config);

		Ext.apply(this.protoProps, App.Stylesheet.Draw);
	},
	extend:'Workspace.tools.PolyLineTool',
	dblclick: function(e, item) {
		this.drawing = false;
		this.dragging = false;
		this.currentPath.pop();
		this.currentPath.pop();
		this.currentPath.push(['L', this.x1, this.y1]);
		var o = this.workspace.createObject(Workspace.objects.Path, {
			path: this.currentPath,
			fillOpacity: 1
		});
		this.currentShape.remove();
		this.currentPath = false;
		this.currentShape = false;
		this.workspace.setSelection([o]);
		e.stopEvent();
	},
}, function() {
	Workspace.Tools.register('polygon', Workspace.tools.PolygonTool);
});