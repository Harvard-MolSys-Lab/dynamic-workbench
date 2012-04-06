////////////////////////////////////////////////////////////////////////////////////////////////
/**
 * @class Workspace.tools.PolyLineTool
 * Draws straight polylines
 * @extends Workspace.tools.BaseTool
 * @param {Object} workspace
 * @param {Object} config
 */
Ext.define('Workspace.tools.PolyLineTool', {
	targetWType: 'Workspace.objects.Path',//'Workspace.objects.SegmentedPath',
	
	constructor : function(workspace, config) {
		this.workspace = workspace;
		Ext.apply(this, config, {
			parameters : App.Stylesheet.Draw
		});
		Workspace.tools.PolyLineTool.superclass.constructor.call(this, workspace, config);

		this.drawing = false;
		this.dragging = false;
		this.currentPath = false;
		this.currentPoints = false;
		this.currentShape = false;
	},
	extend : 'Workspace.tools.BaseTool',
	requires : ['Workspace.tools.VectorTool', 'Workspace.objects.Path', 'Workspace.objects.SegmentedPath'],

	startDrawing : function(pos) {
		this.drawing = true;
		this.x1 = parseInt(pos.x);
		this.y1 = parseInt(pos.y);

		this.lastPos = pos;
		this.currentPoints = [[this.x1, this.y1]];
		this.currentPath = [['M', this.x1, this.y1]];
		this.currentPath.push(['L', this.x1, this.y1]);
		this.points = [[this.x1, this.y1]];

		this.currentShape = this.workspace.paper.path(this.currentPath);
		this.currentShape.attr(this.parameters);
	},
	addPoint : function(pos) {
		this.x = parseInt(pos.x);
		this.y = parseInt(pos.y);

		this.lastPos = {
			x : this.x,
			y : this.y
		};
		this.currentPoints.push([this.x, this.y]);
		this.currentPath.push(['L', this.x, this.y]);
		this.points.push([this.x, this.y]);

		this.currentShape.attr({
			path : this.currentPath
		});
	},
	mousedown : function(e, item) {
		this.dragging = true;
		var pos = this.snapXY(this.getAdjustedXY(e), this.lastPos);
		this.mousedownPos = pos;
		e.stopEvent();
	},
	mouseup : function(e, item) {
		this.dragging = false;
		var pos = this.snapXY(this.getAdjustedXY(e), this.lastPos);
		this.mouseupPos = pos;
		if(this.drawing) {
			this.addPoint(this.mouseupPos, this.mousedownPos);
		} else {
			this.startDrawing(pos);
		}
		e.stopEvent();
		this.mousedownPos = false;
		this.mouseupPos = false;
	},
	dblclick : function(e, item) {

		this.currentPoints.pop();
		this.currentPath.pop();
		this.points.pop();

		var o = this.workspace.createObject(this.buildObject());

		this.stopDrawing();

		this.workspace.setSelection([o]);
		e.stopEvent();
	},
	stopDrawing : function() {
		this.drawing = false;
		this.dragging = false;

		if(this.currentShape) {
			this.currentShape.remove();
		}

		this.currentPath = false;
		this.currentShape = false;
		this.currentPoints = false;
		this.lastPos = null;
		this.points = false;

	},
	buildObject : function() {
		return {
			wtype : this.targetWType,
			points : this.currentPoints,
			//path: this.currentPath,
			fillOpacity : 0.1
		};
	},
	mousemove : function(e, item) {
		if(this.drawing) {
			var pos = this.snapXY(this.getAdjustedXY(e), this.lastPos);
			this.updateDrawing(pos,this.mousedownPos);
		}
		e.stopEvent();
	},
	/**
	 * @param {Object} currentPosition Current position of the cursor
	 * @param {Object} mousedownPosition Position of the cursor on #event-mousedown. Allows custom logic for dragging
	 */
	updateDrawing : function(pos,mousedownPos) {
		this.currentPath.pop();
		this.currentPath.push(['L', parseInt(pos.x), parseInt(pos.y)]);
		this.currentShape.attr({
			path : this.currentPath
		});
	},
	deactivate : function() {
		this.stopDrawing();
		this.callParent(arguments);
	},
	/**
	 * Snaps the passed position to a particular value. Override to provide
	 * custom snapping logic across the component.
	 * @param {Object} pos Position to snap
	 * @param {Number} pos.x
	 * @param {Number} pos.y
	 * @param {Object} lastPos Previous position, or null if this is the first position
	 * @param {Number} lastPos.x
	 * @param {Number} lastPos.y
	 */
	snapXY : function(pos, lastPos) {
		return pos;
	},
}, function() {
	Workspace.Tools.register('polyline', Workspace.tools.PolyLineTool);
});
