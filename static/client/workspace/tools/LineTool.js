////////////////////////////////////////////////////////////////////////////////////////////////
/**
 * @class Workspace.tools.LineTool
 * Draws straight lines
 * @extends Workspace.tools.BaseTool
 * @param {Object} workspace
 * @param {Object} config
 */
Ext.define('Workspace.tools.LineTool', {
	requires: ['Workspace.objects.Path', ], //'Workspace.objects.secondary.Domain'],
	constructor: function(workspace, config) {
		this.workspace = workspace;
		Ext.apply(this, config, {
			parameters: {}
		});
		Workspace.tools.LineTool.superclass.constructor.call(this, workspace, config);

		Ext.apply(this.parameters, App.Stylesheet.Draw);

		this.dragging = false;
		this.proto = false;
		this.x1 = 0;
		this.y1 = 0;
	},
	extend:'Workspace.tools.BaseTool',
	targetWType: 'Workspace.objects.Path',
	//targetWType: 'Workspace.objects.Path',
	//targetWType: 'Workspace.objects.secondary.Domain',
	
	click: function(e, item) {

		e.stopEvent();
	},
	dblclick: function(e, item) {

		e.stopEvent();
	},
	mousedown: function(e, item) {
		this.dragging = true;
		if (this.proto) {
			this.proto.remove();
		}

		this.createProto(e);
	},
	mouseup: function(e, item) {
		this.dragging = false;

		if (this.proto) {

			var pos = this.getAdjustedXY(e);
			this.x2 = pos.x;
			this.y2 = pos.y;

			var o = this.workspace.createObject({
				wtype: this.targetWType,
				//path: [['M', this.x1, this.y1], ['L', this.x2, this.y2]]
				points: [[this.x1, this.y1], [this.x2, this.y2]]
			})
			this.proto.remove();
			this.workspace.setSelection([o]);
		}
	},
	mousemove: function(e, item) {
		if (this.dragging) {
			if (!this.proto) {
				this.createProto(e);
			}

			var pos = this.getAdjustedXY(e);
			this.x2 = pos.x;
			this.y2 = pos.y;

			this.proto.attr({
				path: [['M', this.x1, this.y1], ['L', this.x2, this.y2]]
			});
		}
	},
	createProto: function(e) {
		var pos = this.getAdjustedXY(e);
		this.x1 = pos.x;
		this.y1 = pos.y;

		this.proto = this.workspace.paper.path([['M', this.x1, this.y1]]);
		this.proto.attr(this.parameters);
	}
}, function() {
	Workspace.Tools.register('line', Workspace.tools.LineTool);
});
