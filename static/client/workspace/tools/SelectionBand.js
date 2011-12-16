/**
 * @class Workspace.tools.SelectionBand
 * This class displays a band around the currently selected item(s) to indicate they are selected.
 * @extends Ext.util.Observable
 */
Ext.define('Workspace.tools.SelectionBand', {
	constructor: function(config) {
		Workspace.tools.SelectionBand.superclass.constructor.call(this);

		config = config || {};

		Ext.applyIf(config, {
			shape: 'rect',
			strokeWidth: 0.25,
			// stroke: '#ddd',
			// fill: '#99BBE8',
			// fillOpacity: 0.5,
			padding: 10,
			r: 5,
		});
		Ext.apply(this,App.Stylesheet.Proxy);
		Ext.apply(this, config);
		var item = this.item;
		// this.item = item;
		// this.workspace = workspace;

		var dims = this.item.getDimensions(),
		pos = this.item.getPosition();
		var x = (pos.x - this.padding),
		y = (pos.y - this.padding),
		w = (dims.width + 2 * this.padding),
		h = (dims.height + 2 * this.padding);

		this.rect = this.workspace.paper.rect(x, y, w, h);
		this.rect.attr({
			'stroke': this.stroke,
			'fill': this.fill,
			'fill-opacity': this.fillOpacity,
			'stroke-width': this.strokeWidth,
			'opacity': this.opacity,
			'r':this.r,
		});
		if (this.item.vectorElement) {
			this.rect.insertBefore(this.item.vectorElement);
		} 
		// else {
			// this.rect.toBack();
		// }
		this.item.on('move', this.adjustBand, this);
		this.item.on('resize', this.adjustBand, this);

		this.adjustBand();
	},
	extend:'Ext.util.Observable',
	adjustBand: function() {
		var item = this.item;
		var dims = item.getDimensions(),
		pos = item.getPosition();
		var x = (pos.x - this.padding),
		y = (pos.y - this.padding),
		w = (dims.width + 2 * this.padding),
		h = (dims.height + 2 * this.padding),
		rotation = item.get('rotation');
		
		this.rect.attr({
			x: x,
			y: y,
			width: w,
			height: h,
			rotation: rotation,
		});
		/*
		 this.element.setLocation(x-this.padding,y-this.padding)
		 .setSize(w+(2*this.padding),h+(2*this.padding));
		 */
	},
	destroy: function() {
		this.rect.remove();
		this.item.un('move', this.adjustBand, this);
		this.item.un('resize', this.adjustBand, this);
	}
});
