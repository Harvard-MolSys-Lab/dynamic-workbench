////////////////////////////////////////////////////////////////////////////////////////////////
/**
 * @class Workspace.tools.PolyLineTool
 * Draws straight polylines
 * @extends Workspace.tools.BaseTool
 * @param {Object} workspace
 * @param {Object} config
 */
Ext.define('Workspace.tools.PolyLineTool', {
	constructor: function(workspace, config) {
		this.workspace = workspace;
		Ext.apply(this, config, {
			protoProps: App.Stylesheet.Draw
		});
		Workspace.tools.PolyLineTool.superclass.constructor.call(this, workspace, config);

		this.drawing = false;
		this.dragging = false;
		this.currentPath = false;
		this.currentPoints = false;
		this.currentShape = false;
	},
	extend:'Workspace.tools.BaseTool',
	requires: ['Workspace.tools.VectorTool','Workspace.objects.Path','Workspace.objects.SegmentedPath'],
	click: function(e, item) {
		if (this.drawing) {
			var pos = this.getAdjustedXY(e);
			this.x = parseInt(pos.x);
			this.y = parseInt(pos.y);
			this.currentPoints.push([this.x,this.y]);
			this.currentPath.push(['L', this.x, this.y]);
			this.points.push([this.x,this.y]);
			this.currentShape.attr({
				path: this.currentPath
			});
		} else {
			this.drawing = true;
			var pos = this.getAdjustedXY(e);
			this.x1 = parseInt(pos.x);
			this.y1 = parseInt(pos.y);
			this.currentPoints = [[this.x1,this.y1]];
			this.currentPath = [['M', this.x1, this.y1]];
			this.currentPath.push(['L', this.x1, this.y1]);
			this.points = [[this.x1,this.y1]];
			this.currentShape = this.workspace.paper.path(this.currentPath);
			this.currentShape.attr(this.protoProps);
		}
		e.stopEvent();
	},
	dblclick: function(e, item) {
		this.drawing = false;
		this.dragging = false;
		this.currentPoints.pop();
		this.currentPath.pop();
		this.points.pop();
		var o = this.workspace.createObject(this.buildObject());
		this.currentShape.remove();
		this.currentPath = false;
		this.currentShape = false;
		this.currentPoints = false;
		this.points = false;
		this.workspace.setSelection([o]);
		e.stopEvent();
	},
	buildObject: function() {
		return {
			wtype: 'Workspace.objects.SegmentedPath',
			points: this.currentPoints,
			//path: this.currentPath,
			fillOpacity: 0.1
		};
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
		if (this.drawing) {
			pos = this.getAdjustedXY(e);
			this.currentPath.pop();
			this.currentPath.push(['L', parseInt(pos.x), parseInt(pos.y)]);
			this.currentShape.attr({
				path: this.currentPath
			});
		}
		e.stopEvent();
	},
	deactivate: function() {
		if(this.currentShape) {
			this.currentShape.remove();
		}
		this.callParent(arguments);
	}
}, function() {
	Workspace.Tools.register('polyline', Workspace.tools.PolyLineTool);
});