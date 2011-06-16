/***********************************************************************************************
 * InfoMachine
 *
 *
 * Copyright (c) 2010 Casey Grun
 *
 ***********************************************************************************************
 * ~/client/objects/objects.js
 *
 * Defines {Workspace.Object} and core subclasses, including Workspace.Object2d,
 * {Workspace.ElementObject} and {Workspace.VectorObject}. Also defines important interface
 * classes related to {Workspace.Object}s
 ***********************************************************************************************/

/**
 * @class Workspace.Proxy
 * Renders a simplified version of a workspace object that can be more rapidly translated and resized
 * @extends Ext.util.Observable
 */
Workspace.Proxy = function(config) {
	Ext.apply(this, config);
	Workspace.Proxy.superclass.constructor.apply(this, arguments);
};
Ext.extend(Workspace.Proxy, Ext.util.Observable, {
	/**
 	* @cfg {String} shape
 	* Name of a Raphael member function to use to create a vector element
 	*/
	shape: 'rect',
	/**
 	* @cfg {Number} strokeWidth
 	* Width of the vector stroke
 	*/
	strokeWidth: 1,
	/**
 	* @cfg {String} stroke
 	* Color of the vector stroke
 	*/
	stroke: '#ddd',
	/**
 	* @cfg {String} fill
 	* Color of the fill
 	*/
	fill: '#99BBE8',
	/**
 	* @cfg {Number} fillOpacity
 	* Opacity of the fill
 	*/
	fillOpacity: 0.5,
	/**
 	* @cfg {Number} opacity
 	*/
	opacity: 0.7,
	/**
 	* @cfg {Number} padding
 	*/
	padding: 10,
	/**
 	* @cfg {Number} x
 	*/
	x: 0,
	/**
 	* @cfg {Number} y
 	*/
	y: 0,
	/**
 	* @cfg {Number} width
 	*/
	width: 0,
	/**
 	* @cfg {Number} height
 	*/
	height: 0,

	rendered: false,
	/**
 	* render
 	* Renders the proxy to the workspace
 	* @param {RaphaelElement} behind The vector element behind which to render this proxy
 	*/
	render: function(behind) {
		if(!this.rendered) {
			this.vectorElement = this.workspace.paper[this.shape](this.x, this.y, this.width, this.height);
			if(behind) {
				this.vectorElement.insertBefore(behind)
			}
			this.vectorElement.attr(this.attributes());
			this.rendered = true;
		}
	},
	getX: function() {
		return this.x;
	},
	getY: function() {
		return this.y;
	},
	getWidth: function() {
		return this.width;
	},
	getHeight: function() {
		return this.height;
	},
	/**
 	* updatePath
 	* Sets this object's path to the passed path specification and recalculates its dimensions
 	* @param {Array} path Raphael path specification (e.g. [['M',x,y],['L',x,y]...])
 	*/
	updatePath: function(path) {
		this.path = path;
		this.vectorElement.attr({
			path: path
		});
		this.updateDimensionProps();
	},
	/**
 	* updateDimensionProps
 	* Sets this object's x, y, width, and height properties to match that of the bounding box of the object's path.
 	* Automatically invoked by updatePath and render()
 	* @private
 	*/
	updateDimensionProps: function() {
		var box = this.vectorElement.getBBox();
		this.x = (box.x);
		this.y = (box.y);
		this.height = (box.height);
		this.width = (box.width);
	},
	/**
 	* setPosition
 	* @param {Number} x
 	* @param {Number} y
 	*/
	setPosition: function(x, y) {

		// this.vectorElement.attr({
		//     x: x,
		//     y: y
		// });
		if(this.shape == 'ellipse') {
			this.vectorElement.attr({
				cx: x + this.width/2,
				cy: y + this.height/2
			});
			this.x = x;
			this.y = y;
			this.fireEvent('move', this.x, this.y);
		} else if(this.shape == 'rect') {
			this.vectorElement.attr({
				x: x,
				y: y
			});
			this.x = x;
			this.y = y;
			this.fireEvent('move', this.x, this.y);
		} else {
			var d = this.getDelta(x,y);
			this.translate(d.dx,d.dy);
		}
	},
	/**
 	* getDelta
 	* Calculates difference between position of object and the provided coordinates.
 	* @param {Object} x2
 	* @param {Object} y2
 	* @return {Object} delta Hash containing <var>dx</var> and <var>dy</var>
 	*/
	getDelta: function(x2, y2) {
		return{
			dx: (x2 - this.getX()),
			dy: (y2 - this.getY())
		};
	},
	getScaleFactor: function(w2, h2) {
		var w = this.getWidth(), h = this.getHeight();
		return {
			dw: (w != 0) ? (w2 / w) : 1,
			dh: (h != 0) ? (h2 / h) : 1
		}
	},
	/**
 	* translate
 	* @param {Number} dx
 	* @param {Number} dy
 	*/
	translate: function(dx, dy) {
		//this.setPosition(this.x + dx, this.y + dy);
		this.x += dx;
		this.y += dy;
		if(dx != 0 || dy != 0) {
			this.vectorElement.translate(dx,dy);
		}
		this.fireEvent('move', this.x, this.y);
	},
	scale: function(dw,dh) {
		this.width*=dw;
		this.height*=dh;
		this.vectorElement.scale(dw,dh);
		this.fireEvent('resize',this.width,this.height);
	},
	/**
 	* setDimensions
 	* @param {Number} width
 	* @param {Number} height
 	*/
	setDimensions: function(w, h) {
		this.width = w;
		this.height = h;
		if(this.shape == 'ellipse') {
			this.vectorElement.attr({
				rx: w/2,
				ry: h/2
			});
		} else {
			this.vectorElement.attr({
				width: w,
				height: h
			});
		}
		this.fireEvent('resize', w, h)
		// var d = this.getScaleFactor(w,h);
		// if(this.getWidth() == 0) { this.vectorElement.attr({width: w}); this.width = w; }
		// if(this.getHeight() == 0) { this.vectorElement.attr({height: h }); this.height = h; }
		// this.scale(d.dw,d.dh);
	},
	/**
 	* getBox
 	* Gets a four-cornered bounding box for this proxy
 	* @return {Object} box An object with <var>tl</var>, <var>tr</var>, <var>bl</var>, and <var>br</var>
 	* properties, corresponding to each corner of the box. Each key contains an object with <var>x</var> and <var>y</var> properties.
 	*/
	getBox: function() {
		return{
			'tl': {
				x: this.getX(),
				y: this.getY()
			},
			'tr': {
				x: this.getX() + this.getWidth(),
				y: this.getY()
			},
			'bl': {
				x: this.getX(),
				y: this.getY() + this.getHeight()
			},
			'br': {
				x: this.getX() + this.getWidth(),
				y: this.getY() + this.getHeight()
			}
		};
	},
	/**
 	* setBox
 	* Adjusts the position and dimensions of the proxy's bounding box
 	* @param {Object} box A four-cornered box
 	*/
	setBox: function(x1, y1, x2, y2) {
		if (arguments.length == 4) {
			this.setPosition(x1, y1);
			this.setDimensions(x2 - x1, y2 - y1);
		} else {
			var box = arguments[0];
			this.setDimensions(box.tr.x - box.tl.x, box.bl.y - box.tl.y);
			this.setPosition(box.tl.x, box.tl.y);
		}
	},
	/**
 	* attributes
 	* Returns a serialized hash of properties to be passed to a Raphael attr() function
 	* @private
 	* @param {String[]} attrArray A list of property names (in dasherized form)
 	* @param
 	*/
	attributes: function(attrArray) {
		var attr = {};
		if (!attrArray) {
			var attrArray = ['clip-rect', 'fill', 'fill-opacity', 'font', 'font-family', 'font-size', 'font-weight',
			'height', 'opacity', 'path', 'r', 'rotation', 'rx', 'ry', /*'scale',*/ 'src', 'stroke', 'stroke-dasharray',
			'stroke-linecap', 'stroke-linejoin', 'stroke-miterlimit', 'stroke-opacity', 'stroke-width',
			'translation', 'width', 'x', 'y'];
		}
		for (var i = 0, l = attrArray.length; i < l; i++) {
			var param = attrArray[i],
			value = this[param.camelize().uncapitalize()];
			//value = this.get(param) || this.get(param.underscore().camelize()) || this[param] || this[param.underscore().camelize()];
			if (value) {
				attr[param] = value;
			}
		}
		return attr;
	},
	updateBox: function() {
		if(this.attached) {
			this.setBox(Workspace.Utils.padBox(this.attached.getBox(),this.padding));
		}
	},
	/**
 	* updatePosition
 	* Helper method to recieve 'move' events from attached object
 	*/
	updatePosition: function(x,y) {
		this.setPosition(x,y);
	},
	/**
 	* updateDimensions
 	* Helper method to recieve 'resize' events from attached object
 	*/
	updateDimensions: function(w,h) {
		this.setDimensions(w,h);
	},
	/**
 	* attachTo
 	* Binds this proxy to a given object, responding to its move, resize, and destroy events
 	*/
	attachTo: function(obj) {
		if(this.attached && this.attached.getId) {
			if(this.attached.getId()!=obj.getId()) {
				this.detach();
			} else {
				if(this.path) {
					this.updatePath(obj.get('path'));
				} else {
					this.setBox(Workspace.Utils.padBox(obj.getBox(),this.padding));
				}
				return;
			}
		}
		this.attached = obj;
		obj.on('move',this.updateBox,this);
		obj.on('resize',this.updateBox,this);
		obj.on('destroy',this.destroy,this);
		if(this.path) {
			this.updatePath(obj.get('path'));
		} else {
			this.setBox(Workspace.Utils.padBox(obj.getBox(),this.padding));
		}
	},
	/**
 	* detach
 	* Unbinds event listeners on this proxy's {@link #attached} object
 	*/
	detach: function() {
		if(this.attached) {
			this.attached.un('move',this.updateBox,this);
			this.attached.un('resize',this.updateBox,this);
			this.attached.un('destroy',this.destroy,this);
			this.attached = false;
		}
	},
	show: function() {
		if (this.vectorElement)
			this.vectorElement.show();
	},
	hide: function() {
		if (this.vectorElement)
			this.vectorElement.hide();
	},
	destroy: function() {
		if (this.vectorElement)
			this.vectorElement.remove();
	}
});

////////////////////////////////////////////////////////////////////////////////////////////////
/*
 * @class Workspace.Shim
 * Renders an object (such as an idea label) which follows the movement of a Workspace.Object
 * @extends Ext.util.Observable
 * @see Workspace.Label
 */
Workspace.Shim = function(config) {
	Workspace.Shim.superclass.constructor.apply(this, arguments);
	Ext.apply(this, config, {
		/**
 		* @cfg {Object} elementSpec
 		* An Ext.DomHelper spec used to create the shim's element
 		*/
		elementSpec: { },
		cls: 'workspace-label',
		// offsets: [0,0]
	});

	Ext.applyIf(this.elementSpec,{
		tag: 'div',
		cls: this.cls
	});
}
Ext.extend(Workspace.Shim, Ext.util.Observable, {
	position: 'tl-bl?',
	animate: false,
	/**
 	* applyTo
 	* Links this shim to a {@link Workspace.Object}
 	* @param {Workspace.Object} object
 	*/
	applyTo: function(obj) {
		if (obj.getEl) {
			this.object = obj;
			obj.on('move', this.onMove, this);
			obj.on('hide', this.hide, this);
			obj.on('show', this.show, this);
			obj.on('destroy', this.destroy, this);
			if (obj.is('rendered')) {
				this.render();
			} else {
				obj.on('render', this.render, this, {
					single: true
				});
			}
		}
	},
	/**
 	* onMove
 	* Invoked when the element moves; repositions the shim
 	* @private
 	*/
	onMove: function() {
		if (this.object) {
			var oEl = this.object.getEl();
			if (oEl) {
				var el = this.getEl();
				//el.alignTo(Ext.fly(oEl),this.position,this.offsets,this.animate);
				el.position('absolute');
				el.setLeftTop(this.object.getX() + this.offsets[0], this.object.getY() - el.getHeight() + this.offsets[1]);
			}
		}
	},
	/**
 	* render
 	* Creates an element for the shim in the DOM. Automatically applied or scheduled by {@link #applyTo}
 	* @private
 	*/
	render: function() {
		this.element = this.object.workspace.addElement(this.elementSpec);
		this.element.position('absolute');
	},
	/**
 	* getEl
 	*/
	getEl: function() {
		return this.element;
	},
	/**
 	* hide
 	*/
	hide: function() {
		if (this.element)
			this.getEl().hide();
	},
	/**
 	* show
 	*/
	show: function() {
		if (this.element)
			this.getEl().show();
	},
	/**
 	* destroy
 	*/
	destroy: function() {
		if (this.element)
			Ext.destroy(this.element);
	}
})

/**
 * @class Ext.ux.LabelEditor
 * Allows in-place plain text editing on elements
 * @extends Ext.Editor
 * @see Workspace.Label
 */
Ext.ux.LabelEditor = Ext.extend(Ext.Editor, {
	alignment: "tl-tl",
	hideEl: false,
	cls: "x-small-editor",
	shim: false,
	completeOnEnter: true,
	cancelOnEsc: true,

	constructor: function(cfg, field) {
		Ext.ux.LabelEditor.superclass.constructor.call(this,
		field || new Ext.form.TextField({
			allowBlank: false,
			growMin: 90,
			growMax: 240,
			grow: true,
			selectOnFocus: true
		}), cfg
		);
	},
	/**
 	* attachTo
 	* Links this editor to a DOM node
 	* @param {Ext.Element} targetEl The DOM node to which this editor should be applied
 	*/
	attachTo: function(targetEl, renderEl) {
		this.targetEl = targetEl;
		this.renderEl = renderEl;
		targetEl.on('click', this.startEdit, this);

	},
	/**
 	* startEdit
 	* Begins editing the label
 	*/
	startEdit: function() {
		if (this.renderEl) {
			Ext.ux.LabelEditor.superclass.startEdit.call(this, this.targetEl);
			//this.renderEl,this.targetEl.innerHTML);
		}
	}
});

/**
 * @class Workspace.Label
 * Allows in-place plain text editing of idea labels
 * @extends Workspace.Shim
 */
Workspace.Label = function() {
	Ext.applyIf(this, {
		elementSpec: {
			tag: 'div',
			cls: 'workspace-label'
		},
		/**
 		* @cfg {Array} offsets
 		* Pixels by which to offset the shim
 		*/
		offsets: [0, 1],
		padding: 8,
		/**
 		* @cfg {Workspace.Object} object
 		* The object to which to bind this shim
 		*/
	})
	Workspace.Label.superclass.constructor.apply(this, arguments);
}
Ext.extend(Workspace.Label, Workspace.Shim, {
	property: 'name',
	render: function() {
		Workspace.Label.superclass.render.apply(this, arguments);

		// attach editor to DOM node
		this.editor = new Ext.ux.LabelEditor({
			labelSelector: '#' + this.getEl().id
		});
		this.editor.attachTo(this.getEl(), this.object.workspace.getEl());
		this.editor.on('complete', this.onSave, this);

		// pre-build metrics object to perform sizing in #updateSize
		this.metrics = Ext.util.TextMetrics.createInstance(this.getEl());

		// load data into label
		var val = this.object.get(this.property);
		this.onChange(this.property, val);
		this.onMove();
	},
	/**
 	* onSave
 	* Invoked when the attached Ext.ux.LabelEditor finishes editing; updates the attached object
 	* @private
 	* @param {Ext.ux.LabelEditor} ed
 	* @param {Mixed} value
 	*/
	onSave: function(ed, value) {
		if (this.property && this.object) {
			this.object.set(this.property, value);
		}
	},
	applyTo: function() {
		Workspace.Label.superclass.applyTo.apply(this, arguments);
		if (this.object) {
			this.object.on('change', this.onChange, this);
			this.object.on('resize', this.onMove, this);
		}
	},
	/**
 	* updateSize
 	* Invoked automatically to set the height of the shim
 	* @private
 	*/
	updateSize: function(val) {
		this.getEl().setHeight(this.metrics.getHeight(val) + this.padding);
	},
	onMove: function() {
		this.updateSize(this.object.get(this.property));
		Workspace.Label.superclass.onMove.apply(this, arguments);
	},
	/**
 	* onChange
 	* Invoked when the attached object property changes; updates the attached element
 	* @param {String} prop The property which changes
 	* @param {Mixed} val The value which changes
 	*/
	onChange: function(prop, val) {
		if (prop == this.property && !this.ignoreNext) {
			this.getEl().update(val);
			this.updateSize(val);
		}
	},
	destroy: function() {
		this.object.un('change', this.onChange, this);
		this.object.un('resize', this.onMove, this);
		this.editor.destroy();
		Workspace.Label.superclass.destroy.apply(this, arguments);
	}
})

Workspace.ConnectionLabel = Ext.extend(Workspace.Label,{
	constructor: function() {
		Ext.applyIf(this,{
			elementSpec: {
				tag:'div',
				cls: 'workspace-label-center'
			}
		});
		Workspace.ConnectionLabel.superclass.constructor.apply(this.arguments);
	},
	/**
 	* onMove
 	* Invoked when the element moves; repositions the shim
 	* @private
 	*/
	onMove: function() {
		if (this.object) {
			var oEl = this.object.getEl();
			if (oEl) {
				var el = this.getEl();
				//el.alignTo(Ext.fly(oEl),this.position,this.offsets,this.animate);
				el.position('absolute');
				el.setLeftTop((this.object.getX()+this.object.getWidth()/2 - el.getWidth()/2),
				(this.object.getY()+this.object.getHeight()/2 - el.getHeight()/2));
			}
		}
	},
});

////////////////////////////////////////////////////////////////////////////////////////////////
/**
 * @class Workspace.ObjectCollection
 * Represents a collection of objects in the workspace
 * @extends Ext.util.MixedCollection
 */
Workspace.ObjectCollection = Ext.extend(Ext.util.MixedCollection,{
	getCommonWType: function() {
		var wtype = false, t = false;
		this.each( function(item) {
			if(!wtype) {
				wtype = item.wtype;
				t = Workspace.Components.getType(wtype);
			} else {
				while (!item.isWType(wtype) && t.superclass) {
					wtype = t.superclass.wtype;
					t = Workspace.Components.getType(wtype);
				}
			}
		});
		return wtype;
	}
})

////////////////////////////////////////////////////////////////////////////////////////////////
/**
 * @class Workspace.Object
 * Represents an object in the workspace
 * @extends SerializableObject
 * @abstract
 */
Ext.define('Workspace.objects.Object',{
	mixins: {
		serializable: 'SerializableObject'
	},

	constructor: function(config) {
		this.mixins.serializable.constructor.apply(this,arguments);
		
		//Workspace.Object.superclass.constructor.apply(this, arguments);
		this.callParent(arguments);

		Ext.apply(this, config);
		Ext.applyIf(this, {
			/**
 			* @cfg {String} id
 			*/
			id: App.nextId(),
			/**
 			* @cfg {Workspace} workspace
 			*/
			workspace: App.getDefaultWorkspace()
		});

		this.exposeAll(config);

		this.state = {
			selected: false,
			dragging: false,
			editing: false,
			rendered: false
		};

		this.addEvents(
		/**
 		* @event move
 		* Fires when the object's x or y property changes
 		*/
		'move',
		/**
 		* @event select
 		* Fires when the object is selected
 		*/
		'select',
		/**
 		* @event unselect
 		* Fires when the object is unselected
 		*/
		'unselect',
		/**
 		* @event render
 		* Fires after the object is rendered
 		*/
		'render',
		/**
 		* @event destroy
 		* Fires when the object is destroyed
 		* @param {Workspace.Object} this
 		*/
		'destroy'
		);

		this.expose('x', true, true, true, false);
		//'getX','updateX');
		this.expose('y', true, true, true, false);
		//,'getY','updateY');
		this.expose('id', 'getId', false, true, false);
		this.expose('parent', true, true, true, false);
		this.expose('name', true, true, true, false);
		this.expose('iconCls', true, true, true, false);
		this.expose('movable', function() {
			var m = this.isMovable;
			if(this.parent) {
				m = m && this.parent.childCanMove(this);
			}
			return m;
		}, false, false, false);
		// bind listeners to update position
		this.on('change_x', this.updateX, this);
		this.on('change_y', this.updateY, this);
	},
	/**
 	* @cfg {String} wtype
 	* The configured wtype with which to instantiate this object
 	*/
	wtype: 'Workspace.Object',
	/**
 	* @cfg {Number} x
 	*/
	x: 0,
	/**
 	* @cfg {Number} y
 	*/
	y: 0,
	isSelectable: true,
	isEditable: false,
	isMovable: true,
	parent: false,
	selectChildren: false,
	editChildren: false,
	moveChildren: true,
	name: 'New Object',

	/**
 	* initialize
 	* Realizes properties containing complex objects (such as {@link #parent}) which may have been serialized.
 	* Invoked automatically by the {@link Workspace} after all components have been instantiated
 	*/
	initialize: function() {
		if (this.parent) {
			this.set('parent', Workspace.Components.realize(this.parent));
		}
	},
	/**
 	* getParent
 	* @return {Workspace.Object} parent
 	*/
	getParent: function() {
		return this.get('parent');
	},
	/**
 	* setParent
 	* @param {Workspace.Object} parent
 	*/
	setParent: function(parent) {
		this.set('parent', parent);
	},
	/**
 	* hasParent
 	*/
	hasParent: function() {
		return this.get('parent') != false;
	},
	/**
 	* orphan
 	* unsets {@link #parent}
 	*/
	orphan: function() {
		var parent = this.getParent();
		if (parent) {
			parent.removeChild(this);
		}
		this.set('parent', false);
	},
	/**
 	* select
 	* invokes {@link Workspace#select} for this object
 	*/
	select: function() {
		this.workspace.select(this);
		return this;
	},
	/**
 	* unselect
 	* invokes {@link Workspace#select} for this object
 	*/
	unselect: function() {
		this.workspace.unselect(this);
		return this;
	},
	/**
 	* deselect
 	* alias for {@link #select}
 	*/
	deselect: function() {
		return this.unselect.apply(this, arguments);
	},
	/**
 	* unselectAncestors
 	* invokes this method on this object's parent, then unselects it. Automatically invoked by {@link Workspace#select}
 	*/
	unselectAncestors: function() {
		var p = this.getParent()
		if (p) {
			p.unselectAncestors();
			p.unselect();
		}
		return this;
	},
	/**
 	* unselectDescendents
 	* invokes this method on all of this object's children, then unselects them. Automatically invoked by {@link Workspace#select}
 	*/
	unselectDescendents: function() {
		if (!this.selectChildren && this.children && this.children.each) {
			this.children.each( function(child) {
				child.unselect();
				child.unselectDescendents();
			});
		}
		return this;
	},
	/**
 	* invertSelection
 	* If selected, unselects; else, selects.
 	*/
	invertSelection: function() {
		if (this.is('selected')) {
			this.unselect();
		} else {
			this.select();
		}
	},
	/**
 	* getX
 	* Returns the object's x position relative to another workspace object
 	* @param {Workspace.Object} rel Another object to whose position this object should be compared
 	*/
	getX: function(rel) {
		if (!rel) {
			return this.get('x');
		} else {
			return this.get('x') - rel.getX();
		}
	},
	/**
 	* getY
 	* Returns the object's y position relative to another workspace object
 	* @param {Workspace.Object} rel Another object to whose position this object should be compared
 	*/
	getY: function(rel) {
		if (!rel) {
			return this.get('y');
		} else {
			return this.get('y') - rel.getY();
		}
	},
	/**
 	* updateX
 	* Invoked by change_x; fires move event
 	* @private
 	* @param {Number} x
 	*/
	updateX: function(x) {
		this.fireEvent('move', x, this.getY());
	},
	/**
 	* setT
 	* Invoked by change_y; fires move event
 	* @private
 	* @param {Number} y
 	*/
	updateY: function(y) {
		this.fireEvent('move', this.getX(), y);
	},
	/**
 	* getPosition
 	* Returns the object's x,y position
 	* @returns {Object} pos Hash containing <var>x</var> and <var>y</var>
 	*/
	getPosition: function() {
		return{
			x: this.get('x'),
			y: this.get('y')
		};
	},
	/**
 	* setPosition
 	* Sets this object's x and y position (and optionally that of its children)
 	* @param {Object} x
 	* @param {Object} y
 	* @param {Object} applyToChildren (Optional) True to shift the position of all children as well, false to retain their position (defaults to true)
 	*/
	setPosition: function(x, y, applyToChildren) {
		applyToChildren = applyToChildren !== false;

		// calculate amount to shift children
		var d = this.getDelta(x, y);

		// update x,y properties
		this.set('x', x);
		this.set('y', y);

		// prevent event duplication; will keep parent objects (like WorkspaceIdea) from recalculating layout
		this.ignoreTranslateChildren = true;

		// apply translation to children
		if (applyToChildren && this.moveChildren && this.children && this.children.each) {
			this.children.each( function(child) {
				child.translate(d.dx, d.dy);
			})
		}
		this.ignoreTranslateChildren = false;
		this.fireEvent('move', this, x, y);
	},
	/**
 	* getAbsolutePosition
 	* @deprecated
 	*/
	getAbsolutePosition: function() {
		var pos = this.getPosition();
		pos.x += this.workspace.element.getX();
		pos.y += this.workspace.element.getY();
		return pos;
	},
	/**
 	* moveTo
 	* Alias for {@link #setPosition}
 	* @param {Object} x
 	* @param {Object} y
 	*/
	moveTo: function(x, y) {
		this.setPosition(x, y);
		// this.fireEvent('move',this,this.getX(),this.getY());
	},
	/**
 	* translate
 	* Moves this object (and optionally its children) by the specified amount
 	* @param {Object} dx
 	* @param {Object} dy
 	* @param {Object} applyToChildren (Optional) True to shift the position of all children as well, false to retain their position (defaults to true)
 	*/
	translate: function(dx, dy, applyToChildren) {
		// default
		applyToChildren = (applyToChildren !== false);

		//this.suspendEvents();
		var x = this.getX() + dx,
		y = this.getY() + dy;
		this.set('x', x);
		this.set('y', y);

		// prevent event duplication; will keep parent objects (like WorkspaceIdea) from recalculating layout
		this.ignoreTranslateChildren = true;

		// apply translation to children
		if (applyToChildren && this.moveChildren && this.children && this.children.each) {
			this.children.each( function(child) {
				child.translate(dx, dy);
			})
		}
		this.ignoreTranslateChildren = false;
		this.fireEvent('move', this, this.getX(), this.getY());
	},
	/**
 	* move
 	* Alias for {@link #translate}
 	* @param {Object} dx
 	* @param {Object} dy
 	*/
	move: function(dx, dy) {
		this.translate(dx, dy)
	},
	/**
 	* getDelta
 	* Calculates difference between position of object and the provided coordinates.
 	* @param {Object} x2
 	* @param {Object} y2
 	* @return {Object} delta Hash containing <var>dx</var> and <var>dy</var>
 	*/
	getDelta: function(x2, y2) {
		return{
			dx: (x2 - this.getX()),
			dy: (y2 - this.getY())
		};
	},
	/**
 	* setState
 	* Changes properties in {@link #state}
 	* @param {String} field
 	* @param {Mixed} value
 	*/
	setState: function(field, value) {
		this.state[field] = value;
	},
	/**
 	* is
 	* Queries properties in {@link #state}
 	* @param {String} field
 	*/
	is: function(field) {
		return this.state[field];
	},
	/**
 	* addShim
 	* Links the provided shim to this object
 	* @param {Workspace.Shim} shim
 	*/
	addShim: function(shim) {
		if (this.getEl) {
			shim.applyTo(this);
		}
	},
	/**
 	* render
 	* Fires the render event, sets state to rendered.
 	*/
	render: function() {
		this.setState('rendered', true);
		this.fireEvent('render');
	},
	/**
 	* destroy
 	* Destroys the component and all children;
 	*/
	destroy: function() {
		if (this.children && this.children.getCount() > 0) {
			this.children.each( function(child) {
				child.orphan();
			});
		}
		if (this.parent) {
			this.orphan();
		}
		this.fireEvent('destroy', this);
		this.setState('destroyed', true);
	}
});

Workspace.reg('Workspace.Object', Workspace.Object);

////////////////////////////////////////////////////////////////////////////////////////////////
/**
 * @class Workspace.Object2d
 * Represents a two-dimensional object in the workspace
 * @extends Workspace.Object
 * @abstract
 */
Workspace.Object2d = function(config) {
	Workspace.Object2d.superclass.constructor.apply(this, arguments);

	this.addEvents(
	/**
 	* @event hide
 	* Fired when the object is hidden (e.g. by {@link #proxify proxification})
 	*/
	'hide',
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
	'mouseout'
	);

	this.expose('width', true, true, true, false);
	//'getWidth','updateWidth');
	this.expose('height', true, true, true, false);
	//,'getHeight','updateHeight');
	// subscribe to property change events to fire resize event
	this.on('change_width', this.updateWidth, this);
	this.on('change_height', this.updateHeight, this);
};
Ext.extend(Workspace.Object2d, Workspace.Object, {
	wtype: 'Workspace.Object2d',
	/**
 	* @cfg {Number} x
 	*/
	x: 0,
	/**
 	* @cfg {Number} y
 	*/
	y: 0,
	/**
 	* @cfg {Number} width
 	*/
	width: 0,
	/**
 	* @cfg {Number} height
 	*/
	height: 0,
	proxified: false,

	/**
 	* getProxy
 	* Generates and returns a {@link Workspace.Proxy} object bound to this object.
 	* If a Workspace.Proxy has already been created for this object, that proxy is returned.
 	* @param {Object} cfg Configuration object for the new {@link Workspace.Proxy}
 	* @param {Object} forceReposition (Optional) true to force the existing proxy to be repositioned to match this element's bounding box
 	* @return {Workspace.Proxy} proxy
 	*/
	getProxy: function(cfg, forceReposition) {
		cfg = cfg || {};
		forceReposition = forceReposition || false;

		if (!this.dragProxy) {
			Ext.applyIf(cfg, {
				workspace: this.workspace
			});
			this.dragProxy = new Workspace.Proxy(cfg);
			this.dragProxy.render();
			this.dragProxy.hide();
			this.dragProxy.setBox(this.getBox());
		} else if (forceReposition) {
			this.dragProxy.setBox(this.getBox());
		}

		return this.dragProxy;
	},
	/**
 	* proxify
 	* Alias for {@link #applyProxy}
 	*/
	proxify: function() {
		return this.applyProxy.apply(this, arguments);
	},
	/**
 	* deproxify
 	* Alias for {@link #restoreFromProxy}
 	*/
	deproxify: function() {
		return this.restoreFromProxy.apply(this, arguments);
	},
	/**
 	* applyProxy
 	* Hides this object in the workspace and replaces it with a proxy
 	*/
	applyProxy: function() {
		if (this.hide) {
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
	restoreFromProxy: function(cancel) {
		if (this.dragProxy) {
			this.show();
			if (!cancel)
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
	getHighlightProxy: function() {
		var proxy = new Workspace.Proxy(Ext.applyIf({
			shape: 'rect',
			workspace: this.workspace,
		},App.Stylesheet.Highlight));
		return proxy;
	},
	/**
 	* highlight
 	* Draws a highlight around an element which will follow it when moved
 	*/
	highlight: function() {
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
	unhighlight: function(destroy) {
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
	getDimensions: function() {
		return{
			'width': this.getWidth(),
			'width': this.getHeight()
		};
	},
	getWidth: function() {
		return this.get('width');
	},
	getHeight: function() {
		return this.get('height');
	},
	/**
 	* updateWidth
 	* Fires resize event
 	* @private
 	* @param {Object} w
 	*/
	updateWidth: function(w) {
		this.fireEvent('resize', this.width, this.height);
	},
	/**
 	* updateHeight
 	* Fires resize event
 	* @private
 	* @param {Object} h
 	*/
	updateHeight: function(h) {
		this.fireEvent('resize', this.width, this.height);
	},
	/**
 	* setDimensions
 	* Sets the width and height of an object
 	* @param {Object} w
 	* @param {Object} h
 	*/
	setDimensions: function(w, h) {
		this.set('width', w);
		this.set('height', h);
	},
	/**
 	* getBBox
 	* Returns this object's position and dimensions in a single object
 	* @return {Object} bbox A hash containing <var>x</var>, <var>y</var>, <var>width</var>, and <var>height</var> properties.
 	*/
	getBBox: function() {
		return{
			x: this.getX(),
			y: this.getY(),
			width: this.getWidth(),
			height: this.getHeight()
		};
	},
	/**
 	* getBox
 	* Gets a four-cornered bounding box for this proxy
 	* @return {Object} box An object with <var>tl</var>, <var>tr</var>, <var>bl</var>, and <var>br</var>
 	* properties, corresponding to each corner of the box. Each key contains an object with <var>x</var> and <var>y</var> properties.
 	*/
	getBox: function() {
		return{
			'tl': {
				x: this.getX(),
				y: this.getY()
			},
			'tr': {
				x: this.getX() + this.getWidth(),
				y: this.getY()
			},
			'bl': {
				x: this.getX(),
				y: this.getY() + this.getHeight()
			},
			'br': {
				x: this.getX() + this.getWidth(),
				y: this.getY() + this.getHeight()
			}
		};
	},
	/**
 	* setBox
 	* Updates this object's position and dimensions to match the given four-cornered bounding box.
 	* @param {Object} box A four-cornered bounding box (as would be returned by {@link #getBox}
 	* @param {Object} applyToChildren (Optional) True to shift the position of all children as well, false to retain their position (defaults to true)
 	*/
	setBox: function(x1, y1, x2, y2) {
		if (arguments.length == 4) {
			applyToChildren = (arguments[4] !== false)
			this.setPosition(x1, y1);
			this.setDimensions(x2 - x1, y2 - y1);
		} else {
			var box = arguments[0],
			applyToChildren = arguments[1] !== false;

			this.setPosition(box.tl.x, box.tl.y, applyToChildren);
			this.setDimensions(box.tr.x - box.tl.x, box.bl.y - box.tl.y);
		}
	},
	/**
 	* show
 	* Shows the object and all children if it has been hidden
 	*/
	show: function() {
		if (this.getEl && this.is('rendered')) {
			var el = this.getEl();
			if (el) {
				el.show();
				this.fireEvent('show', this);
			}
			if (this.children) {
				this.children.each( function(child) {
					child.show();
				})
			}
		}
	},
	/**
 	* hide
 	* Hides the object and all children if it is visible
 	*/
	hide: function() {
		if (this.getEl && this.is('rendered')) {
			var el = this.getEl();
			if (el) {
				el.hide();
				this.fireEvent('hide', this);
			}
			if (this.children) {
				this.children.each( function(child) {
					child.hide();
				})
			}
		}
	},
	click: function(e, t, o) {
		this.fireEvent('click');
		this.workspace.click(e, this);
	},
	dblclick: function(e, t, o) {
		this.fireEvent('dblclick');
		this.workspace.dblclick(e, this);
	},
	mousedown: function(e, t, o) {
		this.fireEvent('mousedown');
		this.workspace.mousedown(e, this);
	},
	mouseup: function(e, t, o) {
		this.fireEvent('mouseup');
		this.workspace.mouseup(e, this);
	},
	mousemove: function(e, t, o) {
		this.fireEvent('mousemove');
		this.workspace.mousemove(e, this);
	},
	mouseover: function(e, t, o) {
		this.fireEvent('mouseover');
		this.workspace.mouseover(e, this);
	},
	mouseout: function(e, t, o) {
		this.fireEvent('mouseout');
		this.workspace.mouseout(e, this);
	},
	destroy: function() {
		if (this.dragProxy)
			this.dragProxy.destroy();
		Workspace.Object2d.superclass.destroy.apply(this, arguments);
	}
});

Workspace.reg('Workspace.Object2d', Workspace.Object2d);

////////////////////////////////////////////////////////////////////////////////////////////////
/**
 * @class Workspace.ElementObject
 * Represents a workspace object rendered by an HTML element
 * @extends Workspace.Object2d
 * @abstract
 */
Workspace.ElementObject = function(workspace, config) {
	Workspace.ElementObject.superclass.constructor.call(this, workspace, config);

	Ext.applyIf(this, {
		/**
 		* @cfg elementSpect
 		* An Ext.DomHelper spec describing the element to be created
 		*/
		elementSpec: {}
	});

	Ext.applyIf(this.elementSpec, {
		tag: 'div',
		cls: ''
	});

};
Ext.extend(Workspace.ElementObject, Workspace.Object2d, {
	wtype: 'Workspace.ElementObject',
	/**
 	* render
 	* Builds this object's element and sets its position
 	*/
	render: function() {
		this.element = this.workspace.addElement(this.elementSpec);
		this.element.position('absolute');
		this.element.setLeft(this.x);
		this.element.setTop(this.y);
		this.element.setWidth(this.width);
		this.element.setHeight(this.height);
		this.buildEvents();
		Workspace.ElementObject.superclass.render.apply(this, arguments);
	},
	/**
 	* buildEvents
 	* Attaches event handlers to the object to invoke appropriate methods.
 	* Should be called if contentEditable is changed on the element, which breaks attached event listeners
 	*/
	buildEvents: function() {
		this.element.un('click', this.click, this);
		this.element.un('dblclick', this.dblclick, this);
		this.element.un('mouseup', this.mouseup, this);
		this.element.un('mousedown', this.mousedown, this);
		this.element.un('mousemove', this.mousemove, this);
		this.element.un('mouseover', this.mouseover, this);
		this.element.un('mouseout', this.mouseout, this);

		this.element.on('click', this.click, this);
		this.element.on('dblclick', this.dblclick, this);
		this.element.on('mouseup', this.mouseup, this);
		this.element.on('mousedown', this.mousedown, this);
		this.element.on('mousemove', this.mousemove, this);
		this.element.on('mouseover', this.mouseover, this);
		this.element.on('mouseout', this.mouseout, this);

	},
	/**
 	* updateX
 	* Updates the element's position. Called automatically when x property is changed
 	* @private
 	* @param {Object} x
 	*/
	updateX: function(x) {
		this.element.setLeft(x);
		Workspace.ElementObject.superclass.updateX.call(this, x);
	},
	/**
 	* updateY
 	* Updates the element's position. Called automatically when y property is changed
 	* @private
 	* @param {Object} y
 	*/
	updateY: function(y) {
		this.element.setTop(y);
		Workspace.ElementObject.superclass.updateY.call(this, y);
	},
	/**
 	* updateWidth
 	* Updates the element's dimensions. Called automatically when width property is changed
 	* @private
 	* @param {Object} w
 	*/
	updateWidth: function(w) {
		this.element.setWidth(w);
		Workspace.ElementObject.superclass.updateWidth.call(this, w);
	},
	/**
 	* updateHeight
 	* Updates the element's dimensions. Called automatically when height property is changed
 	* @private
 	* @param {Object} h
 	*/
	updateHeight: function(h) {
		this.element.setHeight(h);
		Workspace.ElementObject.superclass.updateHeight.call(this, h);
	},
	/**
 	* getEl
 	* @return {Ext.Element}
 	*/
	getEl: function() {
		return this.element;
	},
	destroy: function() {
		Ext.destroy(this.element);
		Workspace.ElementObject.superclass.destroy.apply(this, arguments);
	}
});

Workspace.reg('Workspace.ElementObject', Workspace.ElementObject);

////////////////////////////////////////////////////////////////////////////////////////////////
/**
 * @class Workspace.VectorObject
 * Represents a workspace object rendered by an SVG/VML (Raphael) element
 * @extends Workspace.Object2d
 */
Workspace.VectorObject = function(workspace, config) {
	Workspace.VectorObject.superclass.constructor.call(this, workspace, config);

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
};
Ext.extend(Workspace.VectorObject, Workspace.Object2d, {
	wtype: 'Workspace.VectorObject',
	iconCls: 'vector',
	/**
 	* @cfg {String} shape
 	* The name of a Raphael constructor function used to build this object
 	*/
	shape: 'rect',
	/**
 	* @cfg {Array} arguments
 	* An array of arguments to be passed to the constructor specified in {@link #shape}
 	*/
	arguments: [],
	/**
 	* @cfg {String} fill
 	* Fill color or gradient string
 	*/
	fill: '#FFF',
	/**
 	* @cfg {Number} fillOpacity
 	* Number from 0-1 indicating opacity of the fill
 	*/
	fillOpacity: 1,
	/**
 	* @cfg {String} stroke
 	* Color of the stroke
 	*/
	stroke: '#000',
	/**
 	* @cfg {Number} strokeWidth
 	* Width of the stroke
 	*/
	strokeWidth: 1,
	/**
 	* @cfg {String} strokeDasharray
 	* String composed of permutations of '.' '-' and ' ' indicating dash pattern
 	*/
	strokeDasharray: '',
	strokeLinecap: 'square',
	strokeLinejoin: '',
	strokeMiterlimit: 1,
	/**
 	* @cfg {Number} strokeOpacity
 	* Number from 0-1 indicating opacity of the stroke
 	*/
	strokeOpacity: 1,

	render: function() {
		this.buildObject();
		this.on('change', this.updateObject, this);
		Workspace.VectorObject.superclass.render.apply(this, arguments);
	},
	/**
 	* buildObject
 	* Invokes the Raphael constructor specified in {@link #shape}, with the arguments specified in {@link #arguments}
 	* @private
 	*/
	buildObject: function() {
		if (Ext.isFunction(this.workspace.paper[this.shape])) {
			// build the element
			this.vectorElement = this.workspace.paper[this.shape].apply(this.workspace.paper, this.arguments);

			// apply attributes specified in config
			this.vectorElement.attr(this.attributes());

			// attach event listeners
			this.element = Ext.get(this.vectorElement.node);
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
	/**
 	* getHighlightProxy
 	* Constructs a highlight {@link Workspace.Proxy} configured to follow this object. Automatically invoked by {@link #highlight}; should not be called directly.
 	* @private
 	* @return {Workspace.Proxy} proxy
 	*/
	getHighlightProxy: function() {
		return new Workspace.Proxy(Ext.applyIf({
			shape: this.shape,
			strokeWidth: this.strokeWidth + App.Stylesheet.Highlight.strokeWidth,
			workspace: this.workspace,
			stroke: App.Stylesheet.Highlight.fill
		},App.Stylesheet.Highlight));
	},
	toBack: function() {
		this.vectorElement.toBack();
	},
	/**
 	* updateObject
 	* Sets the attributes of this object's vector graphic representation to those specified in its properties.
 	* Invoked automatically when properties are changed.
 	* @private
 	*/
	updateObject: function() {
		this.vectorElement.attr(this.attributes());
	},
	updateX: function(x) {
		Workspace.VectorObject.superclass.updateX.apply(this, arguments);
		this.vectorElement.attr({
			x: x
		});
		//this.x});
	},
	updateY: function(y) {
		Workspace.VectorObject.superclass.updateY.apply(this, arguments);
		this.vectorElement.attr({
			y: y
		});
		//this.y});
	},
	updateWidth: function(width) {
		Workspace.VectorObject.superclass.updateWidth.apply(this, arguments);
		this.vectorElement.attr({
			width: width
		});
		//this.width});
	},
	updateHeight: function(height) {
		Workspace.VectorObject.superclass.updateHeight.apply(this, arguments);
		this.vectorElement.attr({
			height: height
		});
		//this.height});
	},
	getPosition: function() {
		//var box = this.vectorElement.getBBox();
		return{
			x: this.getX(),
			y: this.getY()
		};
		//{x: box.x, y: box.y};
	},
	getDimensions: function() {
		//var box = this.vectorElement.getBBox();
		return{
			width: this.getWidth(),
			height: this.getHeight()
		};
		//{width: box.width, height: box.height};
	},
	/**
 	* attributes
 	* Searches this object for the provided attributes and returns a hash containing containing them.
 	* Used to quicky apply properties saved in this object to its vector representation. Automatically converts
 	* dashed property names to camelized property names stored in the object.
 	* @param {Object} attrArray (Optional) The list of proeprties to search for. Defaults to all allowed Raphael properties
 	*/
	attributes: function(attrArray) {
		var attr = {};
		if (!attrArray) {
			var attrArray = ['clip-rect', 'fill', 'fill-opacity', 'font', 'font-family', 'font-size', 'font-weight', 'height', 'opacity', 'path', 'r', 'rotation', 'rx', 'ry', /*'scale',*/ 'src', 'stroke', 'stroke-dasharray', 'stroke-linecap', 'stroke-linejoin', 'stroke-miterlimit', 'stroke-opacity', 'stroke-width', 'translation', 'width', 'x', 'y'];
		}
		for (var i = 0, l = attrArray.length; i < l; i++) {
			var param = attrArray[i],
			paramName = param.camelize().uncapitalize(),
			//param.underscore().camelize().uncapitalize(),
			value = this.get(paramName);
			//value = this.get(param) || this.get(param.underscore().camelize()) || this[param] || this[param.underscore().camelize()];
			if (value) {
				attr[param] = value;
			}
		}
		return attr;
	},
	/**
 	* getEl
 	* @return {Raphael} this object's Raphael object
 	*/
	getEl: function() {
		return this.vectorElement;
	},
	destroy: function() {
		this.vectorElement.remove();
		Workspace.VectorObject.superclass.destroy.apply(this, arguments);
	}
});

Workspace.reg('Workspace.VectorObject', Workspace.VectorObject);

