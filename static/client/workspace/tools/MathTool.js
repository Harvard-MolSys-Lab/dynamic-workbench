////////////////////////////////////////////////////////////////////////////////////////////////
/**
 * @class Workspace.tools.MathTool
 * Builds {@link Workspace.objects.MathEquationObject}s
 * @extends Workspace.tools.BaseTool
 * @param {Object} workspace
 * @param {Object} config
 */
Ext.define('Workspace.tools.MathTool', {
	requires: ['Workspace.tools.SelectorBand','Workspace.tools.MathQuillTool','Workspace.objects.MathEquationObject'],
	constructor: function(workspace, config) {
		this.workspace = workspace;
		Ext.apply(this, config, {
			parameters: {}
		});
		Workspace.tools.MathTool.superclass.constructor.call(this, workspace, config);

		Ext.apply(this.parameters, {
			fill: '#fff',
			stroke: '#000'
		});

		this.dragging = false;
		this.proto = false;
		this.x1 = 0;
		this.y1 = 0;
	},
	extend: 'Workspace.tools.BaseTool',
	minWidth: 75,
	maxWidth: false,
	minHeight: 30,
	maxHeight: false,
	click: function(e, item) {
		if (item && item.wtype == 'MathEquationObject') {
			this.workspace.edit(item);
		}
		e.stopEvent();
	},
	dblclick: function(e, item) {

		e.stopEvent();
	},
	mousedown: function(e, item) {
		this.dragging = true;
		if (this.proto) {
			this.proto.remove();
			this.proto = false;
		}

		e.stopEvent();
	},
	mouseup: function(e, item) {
		this.dragging = false;

		if (this.proto) {

			var pos = this.getAdjustedXY(e);
			this.x2 = pos.x;
			this.y2 = pos.y;
			var attr = Workspace.tools.SelectorBand.calculateBandBox(this.x1, this.y1, this.x2, this.y2);

			var obj = this.workspace.createObject({
				wtype: 'Workspace.objects.MathEquationObject',
				x: attr.x,
				y: attr.y,
				width: Workspace.Utils.bounds(attr.width, this.minWidth, this.maxWidth),
				height: Workspace.Utils.bounds(attr.height, this.minHeight, this.maxHeight)
			})

			this.proto.remove();
			this.proto = false;
			this.workspace.edit(obj);
		}
		e.stopEvent();
	},
	mousemove: function(e, item) {
		if (this.dragging) {
			if (!this.proto) {
				this.createProto(e);
			}

			var pos = this.getAdjustedXY(e);
			this.x2 = pos.x;
			this.y2 = pos.y;
			var attr = Workspace.tools.SelectorBand.calculateBandBox(this.x1, this.y1, this.x2, this.y2);

			this.x = attr.x;
			this.y = attr.y;
			this.width = attr.width;
			this.height = attr.height;
			this.anchor = attr.anchor;
			delete attr.anchor;

			this.proto.attr(attr);
			e.stopEvent();
		}
	},
	createProto: function(e) {
		var pos = this.getAdjustedXY(e);
		this.x1 = pos.x;
		this.y1 = pos.y;

		this.proto = this.workspace.paper.rect(this.x1, this.y1, 0, 0);
		this.proto.attr(this.parameters);
	},
	deactivate: function() {
		if (this.proto) {
			this.proto.remove();
			this.proto = false;
		}
	}
}, function() {
	Workspace.Tools.register('math', Workspace.tools.MathTool);
});