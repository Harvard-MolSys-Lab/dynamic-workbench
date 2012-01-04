////////////////////////////////////////////////////////////////////////////////////////////////
/**
 * @class Workspace.tools.Handle
 * Creates a shape on the workspace that can be dragged and dropped to manipulate a Workspace.Object
 * @extends Ext.util.Observable
 * @param {Object} workspace
 * @param {Object} config
 */
Ext.define('Workspace.tools.Handle', {
	forceFront : false,
	constructor : function(workspace, config) {

		// Call Observable Constructor
		Workspace.tools.Handle.superclass.constructor.call(this);

		// Configuration
		this.addEvents('dragstart', 'drag', 'dragend');

		Ext.applyIf(config, {
			x : 0,
			y : 0,
			x1 : 0,
			y1 : 0,
			shape : 'rect',
			width : 10,
			stroke : '#ccc', //'#11f',
			strokeWidth : 1,
			fill : '#fff',
			r : 2,
		});
		Ext.apply(this, config);

		this.workspace = workspace;
		this.dragging = false;

		// Create visual representation in workspace
		if(this.shape == 'rect') {
			this.handleShape = this.workspace.paper.rect(this.x - (this.width / 2), this.y - (this.width / 2), this.width, this.width);
			this.handleShape.attr({
				'stroke' : this.stroke,
				'stroke-width' : this.strokeWidth,
				'fill' : this.fill
			});
		} else if(this.shape == 'circle') {
			this.handleShape = this.workspace.paper.circle(this.x, this.y, (this.width / 2));
			this.handleShape.attr({
				'stroke' : this.stroke,
				'stroke-width' : this.strokeWidth,
				'fill' : this.fill
			});
		}

		if((this.item) && (this.item.vectorElement)) {
			this.handleShape.insertAfter(this.item.vectorElement);
		} else {
			this.handleShape.toFront();
		}
		if(this.forceFront) {
			this.toFront();
		}

		var handle = this;
		Ext.get(this.handleShape.node).on('mousedown', this.dragStartHandler, this);
		this.workspace.on('mouseup', this.dragEndHandler, this);
		this.workspace.on('mousemove', this.dragHandler, this);
	},
	extend : '',
	mixins : {
		highlightable : 'Workspace.tools.Highlightable',
	},
	extend : 'Ext.util.Observable',
	xMax : false,
	yMax : false,
	xMin : false,
	yMin : false,
	destroy : function() {
		Ext.get(this.handleShape.node).un('mousedown', this.dragStartHandler, this);
		this.workspace.un('mouseup', this.dragEndHandler, this);
		this.workspace.un('mousemove', this.dragHandler, this);
		this.handleShape.remove();
	},
	getAdjustedXY : function(e) {
		return Workspace.tools.BaseTool.prototype.getAdjustedXY.call(this, e);
	},
	getAdjustedXYcoords : function(x, y) {
		return Workspace.tools.BaseTool.prototype.getAdjustedXYcoords.apply(this, arguments);
	},
	getPosition : function() {
		return {
			x : this.x,
			y : this.y
		};
	},
	antiAlias : function(v) {
		return Math.round(v) + 0.5;
	},
	setPosition : function(x, y) {
		this.x = x;
		this.y = y;
		if(this.handleShape) {
			this.handleShape.attr({
				x : this.antiAlias(this.x - (this.width / 2)),
				y : this.antiAlias(this.y - (this.width / 2)),
			});
		}
	},
	accept : function() {
		return false;
	},
	toFront : function() {
		if (this.handleShape) this.handleShape.toFront();
	},
	dragStartHandler : function(e) {
		this.dragging = true;
		var pos = this.getAdjustedXY(e);

		// remember initial position to calculate delta x/y
		this.x1 = pos.x;
		this.y1 = pos.y;
		this.fireEvent('dragstart');
		this.toFront();

		// watch for mouseover/out events so we can highlight, etc.
		this.workspace.on('mouseover', this.mouseover, this);
		this.workspace.on('mouseout', this.mouseout, this);
		e.stopEvent();
	},
	dragHandler : function(e) {
		if(this.dragging) {
			/* calculate mouse delta to avoid strange snapping when user doesn't click on the
			 * center of the handle
			 */
			pos = this.snap(this.getAdjustedXY(e),e);
			var dx = pos.x - this.x1, dy = pos.y - this.y1;

			// set new initial position, check configured handle movement bounds
			// (e.g. prevent user from resizing objects outside specified bounds;
			// bounds are updated by the managing {@link Workspace.tools.BaseTool})
			this.x1 = this.bounds(this.x1 + dx, this.xMax, this.xMin);
			this.y1 = this.bounds(this.y1 + dy, this.yMax, this.yMin);
			this.setPosition(this.x1, this.y1);

			// perform actual drag logic
			this.fireEvent('drag', e, pos.x, pos.y);
			if(Ext.isFunction(this.drag)) {
				this.drag(e, pos.x, pos.y);
			}
		}
	},
	snap : function(pos,e) {
		if(e.hasModifier()) {
			
		}
	},
	dragEndHandler : function(e) {
		if(this.dragging) {
			this.dragging = false;

			// ignore subsequent mouseover/out events
			this.workspace.un('mouseover', this.mouseover, this);
			this.workspace.un('mouseout', this.mouseout, this);
			this.fireEvent('dragend');
		}
	},
	bounds : function(v, max, min) {
		return Workspace.Utils.bounds(v, min, max);
	}
});
