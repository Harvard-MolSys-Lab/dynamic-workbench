////////////////////////////////////////////////////////////////////////////////////////////////
/**
 * @class Workspace.tools.SelectorBand
 * Used to select objects by clicking and dragging
 * @extends Ext.util.Observable
 */
Ext.define('Workspace.tools.SelectorBand', {
	constructor: function(workspace, config) {
		this.superclass.constructor.call(this);
		Ext.applyIf(config || {}, {
			shape: 'rect',
			x1: 0,
			y1: 0,
			width: 0,
			height: 0,
			anchor: 'tl'
		});
		Ext.apply(this, config, App.Stylesheet.Proxy);

		this.workspace = workspace;

		this.rect = workspace.paper.rect(this.x1, this.y1, this.width, this.height);
		this.rect.attr({
			'stroke': this.stroke,
			'stroke-width': this.strokeWidth,
			'fill': this.fill,
			'fill-opacity': this.fillOpacity,
			'opacity': this.opacity,
		});
	},
	extend:'Ext.util.Observable',

	adjustBand: function(x2, y2) {
		this.x2 = x2;
		this.y2 = y2;

		var attr = Workspace.tools.SelectorBand.calculateBandBox(this.x1, this.y1, x2, y2);

		this.x = attr.x;
		this.y = attr.y;
		//this.x1 = this.x;
		//this.y1 = this.y;
		this.width = attr.width;
		this.height = attr.height;
		this.anchor = attr.anchor;
		delete attr.anchor;

		this.rect.attr(attr);
	},
	/**
	 * Generates an {@link Ext.util.Region} to describe the rectangular area of the region
	 */
	getRegion: function() {
		var x = this.x, y = this.y, b = y + this.height, r = x + this.width;
		return new Ext.util.Region(y,r,b,x);
	},
	cacheRegions: function() {
		this.regions = {};
		this.workspace.objects.eachKey( function(id, item) {
			if (Ext.isFunction(item.getRegion) & !item.preventDragSelect) {
				var region = item.getRegion();
				this.regions[id] = region;

				// var x = (((this.x1 > box.tl.x) && (this.x2 < box.tr.x)) || ((box.tl.x > this.x1) && (box.tr.x < this.x2)));
				// var y = (((this.y1 > box.tl.y) && (this.y2 < box.bl.y)) || ((box.tl.y > this.y1) && (box.bl.y < this.x2)));
				// if (x && y) {
				// within.push(item);
				// }
			}
		},
		this);
	},
	getItemsWithin: function() {
		var within = [], regions = this.regions, region = this.getRegion();
		for(id in regions) {
			if(region.intersect(regions[id]))
				within.push(this.workspace.objects.get(id));
		}
		return within;
	},
	destroy: function() {
		this.rect.remove();
	},
	statics: {
		/**
		 * calculateBandBox
		 * Given two points, generates a bounding box, along with an anchor string describing the position of x1,y1
		 * @param {Number} x1
		 * @param {Number} y1
		 * @param {Number} x2
		 * @param {Number} y2
		 */
		calculateBandBox: function(x1, y1, x2, y2) {
			var attr = {};
			var x,
			y;

			attr.width = Math.abs(x2 - x1);
			if (x2 > x1) {
				x = 'l'
				attr.x = x1;
			} else {
				x = 'r'
				attr.x = x2;
			}

			attr.height = Math.abs(y2 - y1);
			if (y2 > y1) {
				y = 't'
				attr.y = y1;
			} else {
				y = 'b'
				attr.y = y2;
			}

			attr.anchor = x + y;
			return attr;
		}
	}
});
