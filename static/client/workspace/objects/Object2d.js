////////////////////////////////////////////////////////////////////////////////////////////////
/**
 * @class Workspace.objects.Object2d
 * Represents a two-dimensional object in the workspace
 * @extends Workspace.objects.Object
 * @abstract
 */
// Workspace.objects.Object2d = {};
Ext.define('Workspace.objects.Object2d', {
	constructor : function(config) {
		Workspace.objects.Object2d.superclass.constructor.apply(this, arguments);

		this.addEvents(
		/**
		 * @event hide
		 * Fired when the object is hidden (e.g. by {@link #proxify proxification})
		 */'hide',
		/**
		 * @event show
		 * Fired when the object is shown (e.g. by {@link #deproxify deproxification}). Does *not* fire upon creation
		 */
		'show',
		/**
		 * @event resize
		 * Fires when the width or height properties change
		 */
		'resize',
		/**
		 * @event click
		 * Fires when the object is clicked
		 */
		'click',
		/**
		 * @event dblclick
		 * Fires when the object is double-clicked
		 */
		'dblclick',
		/**
		 * @event mousedown
		 * Fires when the mouse is pressed down on this object
		 */
		'mousedown',
		/**
		 * @event mouseup
		 * Fires when the mouse is released on this object
		 */
		'mouseup',
		/**
		 * @event mousemove
		 * Fires when the mouse moves within this object
		 */
		'mousemove',
		/**
		 * @event mouseover
		 * Fires when the mouseover event occurs within the object
		 */
		'mouseover',
		/**
		 * @event mouseout
		 * Fires when the mouseout event occurs within the object
		 */
		'mouseout');

		this.expose('width', true, true, true, false);
		//'getWidth','updateWidth');
		this.expose('height', true, true, true, false);
		//,'getHeight','updateHeight');
		// subscribe to property change events to fire resize event
		this.on('change:width', this.updateWidth, this);
		this.on('change:height', this.updateHeight, this);
		
		
		if(this.showTitle) {			
			this.shimConfig = this.shimConfig || {};
			Ext.applyIf(this.shimConfig, {
				property: 'name'
			});
	
			// set up the label editor
			this.addShim(Ext.create('Workspace.Label',this.shimConfig));
		}
	},
	extend : 'Workspace.objects.Object',
	alias : 'Workspace.Object2d',
	wtype : 'Workspace.objects.Object2d',
	/**
	 * @cfg {Number} x
	 */
	x : 0,
	/**
	 * @cfg {Number} y
	 */
	y : 0,
	/**
	 * @cfg {Number} width
	 */
	width : 0,
	/**
	 * @cfg {Number} height
	 */
	height : 0,
	proxified : false,

	/**
	 * getProxy
	 * Generates and returns a {@link Workspace.Proxy} object bound to this object.
	 * If a Workspace.Proxy has already been created for this object, that proxy is returned.
	 * @param {Object} cfg Configuration object for the new {@link Workspace.Proxy}
	 * @param {Object} forceReposition (Optional) true to force the existing proxy to be repositioned to match this element's bounding box
	 * @return {Workspace.Proxy} proxy
	 */
	getProxy : function(cfg, forceReposition) {
		cfg = cfg || {};
		forceReposition = forceReposition || false;

		if(!this.dragProxy) {
			Ext.applyIf(cfg, {
				workspace : this.workspace
			});
			this.dragProxy = new Workspace.Proxy(cfg);
			this.dragProxy.render();
			this.dragProxy.hide();
			this.dragProxy.setBox(this.getBox());
		} else if(forceReposition) {
			this.dragProxy.setBox(this.getBox());
		}

		return this.dragProxy;
	},
	/**
	 * proxify
	 * Alias for {@link #applyProxy}
	 */
	proxify : function() {
		return this.applyProxy.apply(this, arguments);
	},
	/**
	 * deproxify
	 * Alias for {@link #restoreFromProxy}
	 */
	deproxify : function() {
		return this.restoreFromProxy.apply(this, arguments);
	},
	/**
	 * applyProxy
	 * Hides this object in the workspace and replaces it with a proxy
	 */
	applyProxy : function() {
		if(this.hide) {
			var proxy = this.getProxy(false, true);
			proxy.show();
			this.hide();
			this.proxified = true;
			return proxy;
		}
	},
	/**
	 * restoreFromProxy
	 * Updates this object's bounding box to match that of the proxy, then hides the proxy and shows the object
	 */
	restoreFromProxy : function(cancel) {
		if(this.dragProxy) {
			this.show();
			if(!cancel)
				this.setBox(this.dragProxy.getBox());
			this.dragProxy.hide();
			this.fireEvent('resize', this.getWidth(), this.getHeight());
			this.fireEvent('move', this.getX(), this.getY());
			this.proxified = false;
		}
	},
	/**
	 * getHighlightProxy
	 * Constructs a highlight {@link Workspace.Proxy} configured to follow this object. Automatically invoked by {@link #highlight}; should not be called directly.
	 * @private
	 * @return {Workspace.Proxy} proxy
	 */
	getHighlightProxy : function() {
		var proxy = new Workspace.Proxy(Ext.applyIf({
			shape : 'rect',
			workspace : this.workspace,
		}, App.Stylesheet.Highlight));
		return proxy;
	},
	/**
	 * highlight
	 * Draws a highlight around an element which will follow it when moved
	 */
	highlight : function() {
		if(this.is('rendered')) {
			if(!this.highlightProxy) {
				this.highlightProxy = this.getHighlightProxy();
			}
			this.highlightProxy.render(this.vectorElement);
			this.highlightProxy.attachTo(this);
			this.highlightProxy.show();
		}
	},
	/**
	 * unhighlight
	 * Hides the highlight around an element and detaches events
	 * @param {Boolean} destroy true to destroy the proxy, false to leave it entact. (Defaults to false).
	 */
	unhighlight : function(destroy) {
		if(this.highlightProxy) {
			this.highlightProxy.hide();
			this.highlightProxy.detach();
			if(destroy) {
				this.highlightProxy.destroy();
				this.highlightProxy = false;
			}
		}
	},
	/**
	 * getDimensions
	 * @returns {Object} dimesnions Hash containing <var>width</var> and <var>height</var> properties
	 */
	getDimensions : function() {
		return {
			'width' : this.getWidth(),
			'width' : this.getHeight()
		};
	},
	getWidth : function() {
		return this.get('width');
	},
	getHeight : function() {
		return this.get('height');
	},
	/**
	 * updateWidth
	 * Fires resize event
	 * @private
	 * @param {Object} w
	 */
	updateWidth : function(w) {
		this.fireEvent('resize', this.width, this.height);
	},
	/**
	 * updateHeight
	 * Fires resize event
	 * @private
	 * @param {Object} h
	 */
	updateHeight : function(h) {
		this.fireEvent('resize', this.width, this.height);
	},
	/**
	 * setDimensions
	 * Sets the width and height of an object
	 * @param {Object} w
	 * @param {Object} h
	 */
	setDimensions : function(w, h) {
		this.set('width', w);
		this.set('height', h);
	},
	/**
	 * getRegion
	 * Generates an {@link Ext.util.Region} to describe the rectangular area of the region
	 */
	getRegion : function() {
		var x = this.get('x'), y = this.get('y'), b = y + this.get('height'), r = x + this.get('width');
		return new Ext.util.Region(y, r, b, x);
	},
	/**
	 * getBBox
	 * Returns this object's position and dimensions in a single object
	 * @return {Object} bbox A hash containing <var>x</var>, <var>y</var>, <var>width</var>, and <var>height</var> properties.
	 */
	getBBox : function() {
		return {
			x : this.getX(),
			y : this.getY(),
			width : this.getWidth(),
			height : this.getHeight()
		};
	},
	/**
	 * getBox
	 * Gets a four-cornered bounding box for this proxy
	 * @return {Object} box An object with <var>tl</var>, <var>tr</var>, <var>bl</var>, and <var>br</var>
	 * properties, corresponding to each corner of the box. Each key contains an object with <var>x</var> and <var>y</var> properties.
	 */
	getBox : function() {
		return {
			'tl' : {
				x : this.getX(),
				y : this.getY()
			},
			'tr' : {
				x : this.getX() + this.getWidth(),
				y : this.getY()
			},
			'bl' : {
				x : this.getX(),
				y : this.getY() + this.getHeight()
			},
			'br' : {
				x : this.getX() + this.getWidth(),
				y : this.getY() + this.getHeight()
			}
		};
	},
	/**
	 * setBox
	 * Updates this object's position and dimensions to match the given four-cornered bounding box.
	 * @param {Object} box A four-cornered bounding box (as would be returned by {@link #getBox}
	 * @param {Object} applyToChildren (Optional) True to shift the position of all children as well, false to retain their position (defaults to true)
	 */
	setBox : function(x1, y1, x2, y2) {
		if(arguments.length == 4) {
			applyToChildren = (arguments[4] !== false)
			this.setPosition(x1, y1);
			this.setDimensions( x2 - x1, y2 - y1);
		} else {
			var box = arguments[0], applyToChildren = arguments[1] !== false;

			this.setPosition(box.tl.x, box.tl.y, applyToChildren);
			this.setDimensions(box.tr.x - box.tl.x, box.bl.y - box.tl.y);
		}
	},
	/**
	 * show
	 * Shows the object and all children if it has been hidden
	 */
	show : function() {
		if(this.getEl && this.is('rendered')) {
			var el = this.getEl();
			if(el) {
				el.show();
				this.fireEvent('show', this);
			}
			if(this.children) {
				this.children.each(function(child) {
					child.show();
				})
			}
		}
	},
	/**
	 * hide
	 * Hides the object and all children if it is visible
	 */
	hide : function() {
		if(this.getEl && this.is('rendered')) {
			var el = this.getEl();
			if(el) {
				el.hide();
				this.fireEvent('hide', this);
			}
			if(this.children) {
				this.children.each(function(child) {
					child.hide();
				})
			}
		}
	},
	click : function(e, t, o) {
		this.fireEvent('click');
		this.workspace.click(e, this);
	},
	dblclick : function(e, t, o) {
		this.fireEvent('dblclick');
		this.workspace.dblclick(e, this);
	},
	mousedown : function(e, t, o) {
		this.fireEvent('mousedown');
		this.workspace.mousedown(e, this);
	},
	mouseup : function(e, t, o) {
		this.fireEvent('mouseup');
		this.workspace.mouseup(e, this);
	},
	mousemove : function(e, t, o) {
		this.fireEvent('mousemove');
		this.workspace.mousemove(e, this);
	},
	mouseover : function(e, t, o) {
		this.fireEvent('mouseover');
		this.workspace.mouseover(e, this);
	},
	mouseout : function(e, t, o) {
		this.fireEvent('mouseout');
		this.workspace.mouseout(e, this);
	},
	destroy : function() {
		if(this.dragProxy)
			this.dragProxy.destroy();
		Workspace.objects.Object2d.superclass.destroy.apply(this, arguments);
	}
}, function() {
	Workspace.reg('Workspace.objects.Object2d', Workspace.objects.Object2d);
});