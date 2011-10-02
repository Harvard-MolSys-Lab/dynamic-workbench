
////////////////////////////////////////////////////////////////////////////////////////////////
/**
 * @class Workspace.Scoller
 * @extends Ext.util.Observable
 * Allows the workspace to be scrolled by hovering over the edge
 * @cfg {Workspace} Workspace
 * @cfg {String} side One of: 'top','bottom','left', or 'right
 */

Ext.define('Workspace.Scoller', {
	alias: 'WorkspaceScroller',
	extend: 'Ext.util.Observable',
	constructor: function(cfg) {
		WorkspaceScroller.superclass.constructor.apply(this, arguments);
		Ext.apply(this, cfg);
	},
	side: 'top',
	threshold: 20,
	delay: 1500,
	velocity: 20,
	animate: true,
	interval: 100,
	render: function() {
		this.element = Ext.get(Ext.core.DomHelper.append(document.body, {
			tagName: 'div',
			cls: 'scroller'
		}));
		this.element.unselectable();
		this.element.position('absolute');
		this.element.on('mouseover', this.mouseover, this);
		this.element.on('mouseout', this.mouseout, this);
		this.onResize();
		this.workspace.on('bodyresize', this.onResize, this);
	},
	onResize: function() {
		var el = this.workspace.getContainerEl();
		switch (this.side) {
			case 'top':
				this.element.setWidth(el.getWidth());
				this.element.setHeight(this.threshold);
				this.element.alignTo(el, 'tl-tl');
				break;
			case 'bottom':
				this.element.setWidth(el.getWidth());
				this.element.setHeight(this.threshold);
				this.element.alignTo(el, 'bl-bl');
				break;
			case 'left':
				this.element.setWidth(this.threshold);
				this.element.setHeight(el.getHeight());
				this.element.alignTo(el, 'tl-tl');
				break;
			case 'right':
				this.element.setWidth(this.threshold);
				this.element.setHeight(el.getHeight());
				this.element.alignTo(el, 'tr-tr');
				break;
		}
	},
	mouseover: function() {
		this.delayTask = new Ext.util.DelayedTask(this.startScroll, this);
		this.delayTask.delay(this.delay);
	},
	startScroll: function() {
		this.scrollTask = {
			run: this.doScroll,
			scope: this,
			interval: this.interval
		};
		this.scrollRunner = new Ext.util.TaskRunner();
		this.scrollRunner.start(this.scrollTask);
	},
	doScroll: function() {
		var scrolled = this.workspace.getEl().scroll(this.side, this.velocity, this.animate);
		// if not scrolled, expand workspace
	},
	mouseout: function() {
		if (this.delayTask) {
			this.delayTask.cancel();
			delete this.delayTask;
		}
		if (this.scrollRunner) {
			this.scrollRunner.stopAll();
		}
	},
	getEl: function() {
		return this.element;
	}
});