/**
 * @class Workspace.objects.Object
 * Represents an object in the workspace
 * @extends Machine.core.Serializable
 * @abstract
 */
Ext.define('Workspace.objects.Object', {
	constructor : function(config) {
		Workspace.objects.Object.superclass.constructor.apply(this, arguments);

		Ext.apply(this, config);
		Ext.applyIf(this, {
			/**
			 * @cfg {String} id
			 */
			id : App.nextId(),
			/**
			 * @cfg {Workspace} workspace
			 */
			workspace : App.getDefaultWorkspace()
		});

		this.exposeAll(config);

		this._children = this.children;
		/**
		 * @property {Ext.util.MixedCollection} children
		 */
		this.children = Ext.create('Ext.util.MixedCollection');

		/**
		 * @property {Object} state
		 * Hash containing a number of properties which reflect the temporal state 
		 * of this object. Use #is to determine the value of these state parameters:
		 * 
		 * - selected
		 * - dragging
		 * - editing
		 * - rendered
		 * - destroyed
		 *  
		 */
		this.state = {
			selected : false,
			dragging : false,
			editing : false,
			rendered : false,
			destroyed : false,
		};

		this.addEvents(
		/**
		 * @event move
		 * Fires when the object's x or y property changes
		 */'move',
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
		 * @param {Workspace.objects.Object} this
		 */
		'destroy');

		this.expose('children', true, false, true, false);
		this.expose('x', true, true, true, false);
		this.expose('y', true, true, true, false);
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
	},
	editable : true,
	extend : 'Machine.core.Serializable',
	/**
	 * @cfg {String} wtype
	 * The configured wtype with which to instantiate this object
	 */
	wtype : 'Workspace.objects.Object',
	/**
	 * @cfg {Number}
	 */
	x : 0,
	/**
	 * @cfg {Number}
	 */
	y : 0,
	/**
	 * @cfg {Boolean}
	 */
	isSelectable : true,
	/**
	 * @cfg {Boolean}
	 */
	isEditable : false,
	/**
	 * @cfg {Boolean}
	 */
	isMovable : true,
	/**
	 * @property {Workspace.objects.Object}
	 */
	parent : false,
	/**
	 * @cfg {Boolean}
	 */
	selectChildren : false,
	/**
	 * @cfg {Boolean}
	 */
	editChildren : false,
	/**
	 * @cfg {Boolean}
	 */
	moveChildren : true,
	/**
	 * @cfg {String}
	 */
	name : 'New Object',

	/**
	 * Realizes properties containing complex objects (such as {@link #parent}) which may have been serialized.
	 * Invoked automatically by the {@link Workspace} after all components have been instantiated
	 */
	initialize : function() {
		if(this.parent) {
			this.set('parent', Workspace.Components.realize(this.parent));
		}
		this.buildChildren();
	},
	/**
	 * Gets the #parent object
	 * @return {Workspace.objects.Object} parent
	 */
	getParent : function() {
		return this.get('parent');
	},
	/**
	 * Sets the #parent of this object to another object
	 * @param {Workspace.objects.Object} parent
	 */
	setParent : function(parent) {
		this.set('parent', parent);
	},
	/**
	 * Determines whether this object is a child of another object by 
	 * examining the #parent property
	 */
	hasParent : function() {
		return this.get('parent') != false;
	},
	/**
	 * unsets {@link #parent}
	 */
	orphan : function() {
		var parent = this.getParent();
		if(parent) {
			parent.removeChild(this);
		}
		this.set('parent', false);
	},
	/**
	 * Realizes child objects passed to constructor. Automatically invoked by initialize
	 * @private
	 */
	buildChildren : function() {
		var children = this._children;
		if(Ext.isArray(children)) {
			Ext.each(children, function(child) {
				this.addChild(Workspace.Components.realize(child));
			}, this)
		} else if(Ext.isObject(children)) {
			var child;
			for(var id in children) {
				child = children[id];
				this.addChild(Workspace.Components.realize(child))
			}
		}
	},
	/**
	 * Adds a child to this object
	 * @param {Workspace.objects.Object} child
	 */
	addChild : function(child) {
		this.children.add(child);
		child.setParent(this);
	},
	/**
	 * Alias for {@link #addChild}
	 */
	adopt : function() {
		this.addChild.apply(this, arguments);
	},
	/**
	 * Removes a child from this idea
	 * @param {Workspace.objects.Object} child
	 */
	removeChild : function(child) {
		this.children.remove(child);
		//.getId());
	},
	childCanMove : function(child) {
		return true;
	},
	/**
	 * select
	 * invokes {@link Workspace#select} for this object
	 */
	select : function() {
		this.workspace.select(this);
		return this;
	},
	/**
	 * unselect
	 * invokes {@link Workspace#select} for this object
	 */
	unselect : function() {
		this.workspace.unselect(this);
		return this;
	},
	/**
	 * deselect
	 * alias for {@link #select}
	 */
	deselect : function() {
		return this.unselect.apply(this, arguments);
	},
	/**
	 * unselectAncestors
	 * invokes this method on this object's parent, then unselects it. Automatically invoked by {@link Workspace#select}
	 */
	unselectAncestors : function() {
		var p = this.getParent()
		if(p) {
			p.unselectAncestors();
			p.unselect();
		}
		return this;
	},
	/**
	 * unselectDescendents
	 * invokes this method on all of this object's children, then unselects them. Automatically invoked by {@link Workspace#select}
	 */
	unselectDescendents : function() {
		if(!this.selectChildren && this.children && this.children.each) {
			this.children.each(function(child) {
				child.unselect();
				child.unselectDescendents();
			});
		}
		return this;
	},
	/**
	 * If selected, unselects; else, selects.
	 */
	invertSelection : function() {
		if(this.is('selected')) {
			this.unselect();
		} else {
			this.select();
		}
	},
	/**
	 * Gets all {@link #children}
	 */
	getChildren : function() {
		var children = this.get('children');
		if(children) {
			return children.getRange();
		}
	},
	/**
	 * Returns the object's x position relative to another workspace object
	 * @param {Workspace.objects.Object} rel Another object to whose position this object should be compared
	 */
	getX : function(rel) {
		if(!rel) {
			return this.get('x');
		} else {
			return this.get('x') - rel.getX();
		}
	},
	/**
	 * Returns the object's y position relative to another workspace object
	 * @param {Workspace.objects.Object} rel Another object to whose position this object should be compared
	 */
	getY : function(rel) {
		if(!rel) {
			return this.get('y');
		} else {
			return this.get('y') - rel.getY();
		}
	},
	/**
	 * Invoked by change:x; fires move event
	 * @private
	 * @param {Number} x
	 */
	updateX : function(x) {
		this.fireEvent('move', x, this.getY());
	},
	/**
	 * Invoked by change:y; fires move event
	 * @private
	 * @param {Number} y
	 */
	updateY : function(y) {
		this.fireEvent('move', this.getX(), y);
	},
	/**
	 * Returns the object's x,y position
	 * @returns {Object} pos Hash containing <var>x</var> and <var>y</var>
	 */
	getPosition : function() {
		return {
			x : this.get('x'),
			y : this.get('y')
		};
	},
	/**
	 * Sets this object's x and y position (and optionally that of its children)
	 * @param {Object} x
	 * @param {Object} y
	 * @param {Object} applyToChildren (Optional) True to shift the position of all children as well, false to retain their position (defaults to true)
	 */
	setPosition : function(x, y, applyToChildren) {
		applyToChildren = applyToChildren !== false;

		// calculate amount to shift children
		var d = this.getDelta(x, y);

		// update x,y properties
		this.set('x', x);
		this.set('y', y);

		// prevent event duplication; will keep parent objects (like WorkspaceIdea) from recalculating layout
		this.ignoreTranslateChildren = true;

		// apply translation to children
		if(applyToChildren && this.moveChildren && this.children && this.children.each) {
			this.children.each(function(child) {
				child.translate(d.dx, d.dy);
			})
		}
		this.ignoreTranslateChildren = false;
		this.fireEvent('move', this, x, y);
	},
	/**
	 * @deprecated
	 */
	getAbsolutePosition : function() {
		var pos = this.getPosition();
		pos.x += this.workspace.element.getX();
		pos.y += this.workspace.element.getY();
		return pos;
	},
	/**
	 * Alias for {@link #setPosition}
	 * @param {Object} x
	 * @param {Object} y
	 */
	moveTo : function(x, y) {
		this.setPosition(x, y);
		// this.fireEvent('move',this,this.getX(),this.getY());
	},
	/**
	 * Moves this object (and optionally its children) by the specified amount
	 * @param {Object} dx
	 * @param {Object} dy
	 * @param {Object} [applyToChildren=true] True to shift the position of all children as well, false to retain their position.
	 */
	translate : function(dx, dy, applyToChildren) {
		// default
		applyToChildren = (applyToChildren !== false);

		//this.suspendEvents();
		var x = this.getX() + dx, y = this.getY() + dy;
		this.set('x', x);
		this.set('y', y);

		// prevent event duplication; will keep parent objects (like WorkspaceIdea) from recalculating layout
		this.ignoreTranslateChildren = true;

		// apply translation to children
		if(applyToChildren && this.moveChildren && this.children && this.children.each) {
			this.children.each(function(child) {
				child.translate(dx, dy);
			})
		}
		this.ignoreTranslateChildren = false;
		this.fireEvent('move', this, this.getX(), this.getY());
	},
	/**
	 * Alias for {@link #translate}
	 * @param {Object} dx
	 * @param {Object} dy
	 */
	move : function(dx, dy) {
		this.translate(dx, dy)
	},
	/**
	 * Calculates difference between position of object and the provided coordinates.
	 * @param {Object} x2
	 * @param {Object} y2
	 * @return {Object} delta Hash containing:
	 * @return {Number} delta.dx
	 * @return {Number} delta.dy
	 */
	getDelta : function(x2, y2) {
		return {
			dx : (x2 - this.getX()),
			dy : (y2 - this.getY())
		};
	},
	/**
	 * Changes properties in {@link #state}
	 * @param {String} field
	 * @param {Mixed} value
	 */
	setState : function(field, value) {
		this.state[field] = value;
	},
	/**
	 * Queries properties in {@link #state}
	 * @param {String} field Name of a field of `this`#state
	 * @returns {Mixed} fieldState
	 */
	is : function(field) {
		return this.state[field];
	},
	/**
	 * Links the provided shim to this object
	 * @param {Workspace.Shim} shim
	 */
	addShim : function(shim) {
		if(this.getEl) {
			shim.applyTo(this);
		}
	},
	/**
	 * Fires the {@link #event-render} event, updates #state.
	 */
	render : function() {
		// bind listeners to update position
		this.on('change:x', this.updateX, this);
		this.on('change:y', this.updateY, this);
		this.setState('rendered', true);
		this.fireEvent('render');
	},
	/**
	 * Destroys the component and all children;
	 */
	destroy : function() {
		if(!this.is('destroyed')) {
			if(this.children && this.children.getCount() > 0) {
				this.children.each(function(child) {
					child.orphan();
				});
			}
			if(this.parent) {
				this.orphan();
			}
			this.fireEvent('destroy', this);
			this.setState('destroyed', true);
		}
	}
}, function() {
	Workspace.reg('Workspace.objects.Object', Workspace.objects.Object);
});
