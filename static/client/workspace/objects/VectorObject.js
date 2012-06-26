/**
 * Represents a workspace object rendered by an SVG/VML (Raphael) element
 * @extends Workspace.objects.Object2d
 */
// Workspace.objects.VectorObject = {};
Ext.define('Workspace.objects.VectorObject', {
	alias : 'Workspace.VectorObject',
	statics : {
		attrArray : ['arrow-end', 'arrow-start', 'clip-rect', 'fill', 'fill-opacity', 'font', 'font-family', 'font-size', 'font-weight', 'height', 'opacity', 'path', 'r', 'rotation', 'rx', 'ry', /*'scale',*/'src', 'stroke', 'stroke-dasharray', 'stroke-linecap', 'stroke-linejoin', 'stroke-miterlimit', 'stroke-opacity', 'stroke-width', 'translation', 'width', 'x', 'y'],
	},
	constructor : function(workspace, config) {
		Workspace.objects.VectorObject.superclass.constructor.call(this, workspace, config);

		// expose a bunch of SVG properties
		this.expose('fill', true, true, true, false);
		//,'fill','color');
		this.expose('fillOpacity', true, true, true, false);
		//,'fillOpacity','number');
		this.expose('opacity', true, true, true, false);
		//,'opacity','number');
		this.expose('stroke', true, true, true, false);
		//,'stroke','color');
		this.expose('strokeWidth', true, true, true, false);
		//,'strokeWidth','number');
		this.expose('strokeDasharray', true, true, true, false);
		//,'strokeDasharray','string'); // ['', '-', '.', '-.', '-..', '. ', '- ', '--', '- .', '--.', '--..']
		this.expose('strokeLinecap', true, true, true, false);
		//,'strokeLinecap','string'); //['butt', 'square', 'round']
		this.expose('strokeLinejoin', true, true, true, false);
		//,'strokeLinejoin','string'); // ['bevel', 'round', 'miter']
		this.expose('strokeMiterlimit', true, true, true, false);
		//,'strokeMiterlimit', 'number');
		this.expose('strokeOpacity', true, true, true, false);
		//,'strokeOpacity', 'number');
		this.expose('path', true, true, true, false);
		//,'path','array');
		this.expose('shape', true, true, true, false);
		//,'shape','string');
		this.expose('rotation', true, true, true, false);
		this.expose('arrowEnd', true, true, true, false);
		this.expose('arrowStart', true, true, true, false);

	},
	requires : ['Workspace.Proxy'],
	extend : 'Workspace.objects.Object2d',
	wtype : 'Workspace.objects.VectorObject',
	iconCls : 'vector',
	/**
	 * @cfg {String} shape
	 * The name of a Raphael constructor function used to build this object
	 */
	shape : 'rect',
	/**
	 * @cfg {Array} arguments
	 * An array of arguments to be passed to the constructor specified in {@link #shape}
	 */
	arguments : [],
	/**
	 * @cfg {String} fill
	 * Fill color or gradient string
	 */
	fill : '#FFF',
	/**
	 * @cfg {Number} fillOpacity
	 * Number from 0-1 indicating opacity of the fill
	 */
	fillOpacity : 1,
	/**
	 * @cfg {String} stroke
	 * Color of the stroke
	 */
	stroke : '#000',
	/**
	 * @cfg {Number} strokeWidth
	 * Width of the stroke
	 */
	strokeWidth : 1,
	/**
	 * @cfg {String} strokeDasharray
	 * String composed of permutations of '.' '-' and ' ' indicating dash pattern
	 */
	strokeDasharray : '',
	/**
	 * @cfg
	 */
	strokeLinecap : 'square',
	/**
	 * @cfg
	 */
	strokeLinejoin : '',
	/**
	 * @cfg
	 */
	strokeMiterlimit : 1,
	/**
	 * @cfg {Number} strokeOpacity
	 * Number from 0-1 indicating opacity of the stroke
	 */
	strokeOpacity : 1,
	/**
	 * @cfg
	 */
	rotation : 0,

	render : function() {
		this.buildObject();
		// this.on('change', this.updateObject, this);
		this.buildEvents();
		Workspace.objects.VectorObject.superclass.render.apply(this, arguments);
	},
	/**
	 * Invokes the Raphael constructor specified in #shape, with the 
	 * arguments specified in #arguments. Constructs the #vectorElement.
	 * @private
	 */
	buildObject : function() {
		if(Ext.isFunction(this.workspace.paper[this.shape])) {
			
			// build the element
			/**
			 * @property {Raphael.Element} vectorElement
			 * A Raphael vector element representing the object.
			 */
			this.vectorElement = this.workspace.paper[this.shape].apply(this.workspace.paper, this.arguments);

			// apply attributes specified in config
			this.vectorElement.attr(this.attributes());

			// attach event listeners
			this.element = Ext.get(this.vectorElement.node);
			//this.element.addCls('workspace-object');
			this.element.dom.className = 'workspace-object';
			this.element.set({
				'objectId' : this.getId()
			});
			/*
			 this.vectorElement.dom.click(this.click.createDelegate(this));
			 this.vectorElement.dblclick(this.dblclick.createDelegate(this));
			 this.vectorElement.mouseup(this.mouseup.createDelegate(this));
			 this.vectorElement.mousedown(this.mousedown.createDelegate(this));
			 this.vectorElement.mousemove(this.mousemove.createDelegate(this));
			 this.vectorElement.mouseover(this.mouseover.createDelegate(this));
			 this.vectorElement.mouseout(this.mouseover.createDelegate(this));
			 */
			this.element.on('click', this.click, this);
			this.element.on('dblclick', this.dblclick, this);
			this.element.on('mouseup', this.mouseup, this);
			this.element.on('mousedown', this.mousedown, this);
			this.element.on('mousemove', this.mousemove, this);
			this.element.on('mouseover', this.mouseover, this);
			this.element.on('mouseout', this.mouseout, this);
		}
	},
	buildEvents : function() {
		_.each(Workspace.objects.VectorObject.attrArrayCamel, function(dash, camel) {
			this.on('change:' + camel, _.bind(this.updateAttr, this, dash))
		}, this);
	},
	getTransform : function() {
		return "r" + ((+this.get('rotation') || 0));
	},
	updateAttr : function(attrName, value) {
		// positioning attributes get treated differently
		if(attrName == 'x' || attrName == 'y' || attrName == 'width' || attrName == 'height') {

			// hack to prevent anti-aliasing for rectangular things
			if(attrName == 'x' || attrName == 'y') {
				value = Math.round(value) + 0.5;
			}
			this.vectorElement.transform("");
			this.vectorElement.attr(attrName, value);
			this.vectorElement.transform(this.getTransform());
			return;
		} else if(attrName == "rotation") {
			this.vectorElement.transform("");
			//this.vectorElement.rotate(value);
			this.vectorElement.transform("r" + (+value || 0));
			return;
		}
		this.vectorElement.attr(attrName, value);
	},
	/**
	 * getHighlightProxy
	 * Constructs a highlight {@link Workspace.Proxy} configured to follow this object. Automatically invoked by {@link #highlight}; should not be called directly.
	 * @private
	 * @return {Workspace.Proxy} proxy
	 */
	getHighlightProxy : function() {
		return Ext.create('Workspace.Proxy', Ext.applyIf({
			shape : this.shape,
			strokeWidth : this.strokeWidth + App.Stylesheet.Highlight.strokeWidth,
			workspace : this.workspace,
			stroke : App.Stylesheet.Highlight.fill
		}, App.Stylesheet.Highlight));
	},
	toBack : function() {
		this.vectorElement.toBack();
	},
	insertBefore : function(obj) {
		if(obj && obj.vectorElement)
			this.vectorElement.insertBefore(obj.vectorElement);
	},
	insertAfter : function(obj) {
		if(obj && obj.vectorElement)
			this.vectorElement.insertAfter(obj.vectorElement);
	},
	/**
	 * updateObject
	 * Sets the attributes of this object's vector graphic representation to those specified in its properties.
	 * Invoked automatically when properties are changed.
	 * @private
	 */
	updateObject : function() {
		this.vectorElement.attr(this.attributes());
	},
	updateX : function(x) {
		Workspace.objects.VectorObject.superclass.updateX.apply(this, arguments);
		// Anti-aliasing
		this.vectorElement.attr({
			x : Math.round(x) + 0.5
		});
		//this.x});
	},
	updateY : function(y) {
		Workspace.objects.VectorObject.superclass.updateY.apply(this, arguments);
		// Anti-aliasing
		this.vectorElement.attr({
			y : Math.round(y) + 0.5
		});
		//this.y});
	},
	updateWidth : function(width) {
		Workspace.objects.VectorObject.superclass.updateWidth.apply(this, arguments);
		this.vectorElement.attr({
			width : width
		});
		//this.width});
	},
	updateHeight : function(height) {
		Workspace.objects.VectorObject.superclass.updateHeight.apply(this, arguments);
		this.vectorElement.attr({
			height : height
		});
		//this.height});
	},
	getPosition : function() {
		//var box = this.vectorElement.getBBox();
		return {
			x : this.getX(),
			y : this.getY()
		};
		//{x: box.x, y: box.y};
	},
	getDimensions : function() {
		//var box = this.vectorElement.getBBox();
		return {
			width : this.getWidth(),
			height : this.getHeight()
		};
		//{width: box.width, height: box.height};
	},
	/**
	 * Searches this object for the provided attributes and returns a hash containing containing them.
	 * Used to quicky apply properties saved in this object to its vector representation. Automatically converts
	 * dashed property names to camelized property names stored in the object.
	 * @param {Object} attrArray (Optional) The list of proeprties to search for. Defaults to all allowed Raphael properties
	 */
	attributes : function(attrArray) {
		var attr = {};
		if(!attrArray) {
			var attrArray = Workspace.objects.VectorObject.attrArray;
		}
		for(var i = 0, l = attrArray.length; i < l; i++) {
			var param = attrArray[i], paramName = param.camelize().uncapitalize(),
			//param.underscore().camelize().uncapitalize(),
			value = this.get(paramName);
			//value = this.get(param) || this.get(param.underscore().camelize()) || this[param] || this[param.underscore().camelize()];
			if(value) {
				attr[param] = value;
			}
		}
		return attr;
	},
	/**
	 * getEl
	 * @return {Raphael} this object's Raphael object (#vectorElement)
	 */
	getEl : function() {
		return this.vectorElement;
	},
	destroy : function() {
		if(!this.is('destroyed')) {
			this.vectorElement.remove();
			this.callParent(arguments);
		}
	}
}, function() {
	Workspace.reg('Workspace.objects.VectorObject', Workspace.objects.VectorObject);
	Workspace.objects.VectorObject.attrArrayCamel = {};
	_.each(Workspace.objects.VectorObject.attrArray, function(value) {
		Workspace.objects.VectorObject.attrArrayCamel[value.camelize().uncapitalize()] = value;
	});
});
