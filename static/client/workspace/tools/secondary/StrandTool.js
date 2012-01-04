////////////////////////////////////////////////////////////////////////////////////////////////
/**
 * @class Workspace.tools.secondary.StrandTool
 * Draws multi-domain strands
 */
Ext.define('Workspace.tools.secondary.StrandTool', {
	constructor : function(workspace, config) {
		this.callParent(arguments);
		Ext.apply(this.parameters, {
			//"arrow-end" : 'classic-wide-long',
			"stroke" : "#aaa",
			"stroke-width" : 2,
			"stroke-dasharray" : '',
		})
		this.bases = [];
	},
	extend : 'Workspace.tools.PolyLineTool',
	requires : ['Workspace.objects.secondary.Strand'],

	baseSpacing : 10,
	baseRadius : 3,
	buildObject : function() {
		return {
			wtype : 'Workspace.objects.secondary.Strand',
			points : this.currentPoints,
			//path: this.currentPath,
			fillOpacity : 0.1,
			baseSpacing : 10,
		};
	},
	getDistance : function(pos1, pos2) {
		function dist(p1, p2) {
			return Math.sqrt(Math.pow(p1[0] - p2[0], 2) + Math.pow(p1[1] - p2[1], 2));
		};

		return dist([pos1.x, pos1.y], [pos2.x, pos2.y]);
	},
	snapDistance : function(distance) {
		return this.baseSpacing * this.countBases(distance);
	},
	countBases : function(distance) {
		return Math.floor(distance / this.baseSpacing);
	},
	nextPosition : function(lastPos, angle, distance) {
		return {
			x : lastPos.x + Math.cos(angle) * distance,
			y : lastPos.y + Math.sin(angle) * distance,
		};
	},
	snapXY : function(pos, lastPos) {

		if(lastPos) {
			var distance = this.getDistance(pos, lastPos), snapDistance = this.snapDistance(distance), angle = Math.atan2(pos.y - lastPos.y, pos.x - lastPos.x);
			//Raphael.rad(Raphael.angle(,pos.y,lastPos.x,lastPos.y));

			return this.nextPosition(lastPos, angle, snapDistance);
		}
		return pos;
	},
	makeBase : function() {
		var circle = this.workspace.paper.circle(0, 0, this.baseRadius);
		circle.attr({
			fill : this.parameters.stroke,
			stroke : this.parameters.stroke,
		});
		return circle;
	},
	moveBase : function(base, x, y) {
		base.attr({
			cx : x,
			cy : y,
		});
	},
	addPoint : function(pos) {
		this.callParent(arguments);
		this.bases = this.bases.concat(this.segmentBases);
		this.segmentBases = [];
	},
	updateDrawing : function(pos) {
		this.callParent(arguments);
		var distance = this.snapDistance(this.getDistance(pos, this.lastPos));
		var baseCount = this.countBases(distance), angle = Math.atan2(pos.y - this.lastPos.y, pos.x - this.lastPos.x);

		// make new bases if we need more
		if(baseCount > this.segmentBases.length) {
			// for each new base
			for(var i = 0, l = baseCount - this.segmentBases.length; i < l; i++) {
				this.segmentBases.push(this.makeBase());
			}

			// remove old bases if we've got too many
		} else if(baseCount < this.segmentBases.length) {
			for(var i = 0, l = this.segmentBases.length - baseCount; i < l; i++) {
				var base = this.segmentBases.pop();
				base.remove();
			}
		}

		var point = this.nextPosition(this.lastPos, angle, this.baseSpacing / 2);
		for(var i = 0; i < baseCount; i++) {
			this.moveBase(this.segmentBases[i], point.x, point.y);
			point = this.nextPosition(point, angle, this.baseSpacing);
		}
	},
	startDrawing : function() {
		this.callParent(arguments);
		this.bases = [];
		this.segmentBases = [];
	},
	stopDrawing : function() {
		this.callParent(arguments);
		_.each(this.bases, function(base) {
			base.remove();
		});
		this.bases = [];
	}
}, function() {
	Workspace.Tools.register('strand', Workspace.tools.secondary.StrandTool);
});
