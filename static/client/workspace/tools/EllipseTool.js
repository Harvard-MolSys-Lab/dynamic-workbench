////////////////////////////////////////////////////////////////////////////////////////////////
/**
 * @class Workspace.tools.EllipseTool
 * Draws ellipses
 * @extends Workspace.tools.BaseTool
 * @param {Object} workspace
 * @param {Object} config
 */
Ext.define('Workspace.tools.EllipseTool', {
	constructor: function(workspace, config) {
		this.workspace = workspace;
		Ext.apply(this, config, {
			parameters: {}
		});
		Workspace.tools.EllipseTool.superclass.constructor.call(this, workspace, config);

		Ext.apply(this.parameters, App.Stylesheet.Draw);

		this.dragging = false;
		this.proto = false;
		this.x1 = 0;
		this.y1 = 0;
	},
	extend:'Workspace.tools.BaseTool',
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
			delete this.proto;
		}

		this.createProto(e);
	},
	mouseup: function(e, item) {
		this.dragging = false;

		if (this.proto) {

			var pos = this.getAdjustedXY(e);
			this.x2 = pos.x;
			this.y2 = pos.y;
			var attr = Workspace.tools.SelectorBand.calculateBandBox(this.x1, this.y1, this.x2, this.y2);

			var o = this.workspace.createObject(Workspace.VectorEllipseObject, {
				x: (attr.x),
				y: (attr.y),
				width: (attr.width),
				height: (attr.height),
				fill: this.parameters.fill,
				stroke: this.parameters.stroke
			});
			this.workspace.setSelection([o]);

			this.proto.remove();
			delete this.proto;
			return false;
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
			var attr = SelectorBand.calculateBandBox(this.x1, this.y1, this.x2, this.y2);
			var ellipseAttr = {
				cx: attr.x + (attr.width / 2),
				cy: attr.y + (attr.height / 2),
				rx: (attr.width / 2),
				ry: (attr.height / 2)
			};

			this.x = attr.x;
			this.y = attr.y;
			this.width = attr.width;
			this.height = attr.height;
			this.anchor = attr.anchor;
			delete attr.anchor;

			this.proto.attr(ellipseAttr);
		}
	},
	createProto: function(e) {
		var pos = this.getAdjustedXY(e);
		this.x1 = pos.x;
		this.y1 = pos.y;

		this.proto = this.workspace.paper.ellipse(this.x1, this.y1, 0, 0);
		this.proto.attr(this.parameters);
	}
}, function() {
	Workspace.Tools.register('ellipse', Workspace.tools.EllipseTool);
});