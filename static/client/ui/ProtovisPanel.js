/**
 * Allows ProtoVis visualizations to be automatically sized and displayed 
 * within a {@link Ext.panel.Panel panel}
 */
Ext.define('App.ui.ProtovisPanel', {
	alias: 'widget.pvpanel',
	extend: 'Ext.panel.Panel',
	/**
	 * @cfg pan {Boolean} 
	 * true to automatically allow panning of the display (defaults to true)
	 */
	pan: true,
	/**
	 * @cfg zoom {Number} if >0, mousewheel events on the visualization will 
	 * zoom with this speed; false to disable zooming (defaults to 1)
	 */
	zoom: 1,
	bpadding: 20,
	visPadding: 10,
	/**
	 * @cfg autoRender {Boolean} 
	 * true to automatically render the visualization after the component 
	 * renders; false to render manually using {@link #afterrender} (defaults 
	 * to false)
	 */
	autoRender: false,
	/**
	 * @cfg autoSize {Boolean} true to automatically scale the visualization to
	 * the size of the panel's body element (defaults to true)
	 */
	autoSize: true,
	initComponent: function() {
		//this.on('afterrender',this.afterrender,this);
		this.callParent(arguments);
		if(this.autoRender) {
			this.on('afterrender',this.afterrender,this, {
				single: true
			});
		}
	},
	/**
	 * Renders the visualization. Called automatically if {@link #autoRender} 
	 * is true
	 */
	afterrender: function() {
		if(!this.built) {
			this.buildVis();
			if(!this.collapsed) {
				this.renderVis();
			}
			this.on('collapse',this.hideVis,this);
			this.on('expand',this.resizeVis,this);
			this.on('resize',this.resizeVis,this);
			this.built = true;
		}
	},
	/**
	 * @return {Number} width of the body element in pixels
	 */
	getBodyWidth: function() {
		return this.body.getWidth();
	},
	/**
	 * @return {Number} height of the body element in pixels
	 */
	getBodyHeight: function() {
		return this.body.getHeight();
	},
	/**
	 * Updates the size (if {@link #autoSize} is true) of the visualization on 
	 * panel resize. Calls user-defined {@link #updateVis}
	 */
	resizeVis: function(p,w,h) {
		if(this.autoSize) {
			this.doAutoSize();
		}
		this.updateVis();
		this.vis.render();
	},
	doAutoSize: function() {
		this.vis.width(this.getBodyWidth()-this.visPadding).height(this.getBodyHeight()-this.visPadding).top(this.visPadding).left(this.visPadding);
	},
	/**
	 * Renders the visualization. Do not override this method; override 
	 * {@link #buildVis} to specify your visualization.
	 */
	renderVis: function() {
		if(this.vis) {
			this.vis.visible(true);
			this.vis.render();
		}
	},
	/**
	 * Override this method to provide custom logic upon panel resize (such as 
	 * updating visualization parameters other than width and height)
	 */
	updateVis: function() {
	},
	/**
	 * Hides the visualization.
	 */
	hideVis: function() {
		if(this.vis) {
			//this.vis.visible(false);
			this.vis.render();
		}
	},
	/**
	 * Override this method to provide your custom visualization logic
	 */
	buildVis: function() {
		return this.getCanvas();
	},
	/**
	 * Builds the visualization panel, sizes, and sets pan and zoom events if 
	 * specified.
	 * @returns {pv.Panel} panel the visualization panel
	 */
	getCanvas: function() {
		/**
		 * @property {pv.Panel} vis 
		 * The visualization panel to which you can write. Ensure it is built 
		 * by calling {@link #getCanvas}.
		 */
		if(!this.vis) {
			this.vis = new pv.Panel()
			.canvas(this.body.dom);
			if(this.autoSize) {
				this.doAutoSize();
				// this.vis
				// .width(this.body.getWidth())
				// .height(this.body.getHeight());
			}
			if(this.pan) {
				this.vis.event("mousedown", pv.Behavior.pan());
			}
			if(this.zoom) {
				this.vis.event("mousewheel", pv.Behavior.zoom(this.zoom));

			}
		}
		return this.vis;
	},
})