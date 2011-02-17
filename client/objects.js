/********************************************
 * InfoMachine
 * 
 * Copyright (c) 2010 Casey Grun
 *********************************************/

/**
 * @class WorkspaceProxy
 * Renders a simplified version of a workspace object that can be more rapidly translated and resized
 * @extends Ext.util.Observable
 */
var WorkspaceProxy = function(config) {
  Ext.apply(this,config);
  WorkspaceProxy.superclass.constructor.apply(this,arguments);
};

Ext.extend(WorkspaceProxy,Ext.util.Observable,{
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
  
  /**
   * render
   * Renders the proxy to the workspace
   */
  render: function() {
	this.vectorElement = this.workspace.paper[this.shape](this.x,this.y,this.width,this.height);
	this.vectorElement.attr(this.attributes());
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
   * setPosition
   * @param {Number} x
   * @param {Number} y
   */
  setPosition: function(x,y) {
	this.x = x; this.y = y;
	this.vectorElement.attr({x: x, y: y});
	this.fireEvent('move',x,y);
  },
  /**
   * translate
   * @param {Number} dx
   * @param {Number} dy
   */
  translate: function(dx,dy) {
	this.setPosition(this.x+dx,this.y+dy);
  },
  /**
   * setDimensions
   * @param {Number} width
   * @param {Number} height
   */
  setDimensions: function(w,h) {
	this.width = w;
	this.height = h;
	this.vectorElement.attr({width:w, height:h}); 
	this.fireEvent('resize',w,h)
  },
  /**
   * getBox
   * Gets a four-cornered bounding box for this proxy
   * @return {Object} box An object with <var>tl</var>, <var>tr</var>, <var>bl</var>, and <var>br</var> 
   * properties, corresponding to each corner of the box. Each key contains an object with <var>x</var> and <var>y</var> properties.
   */
  getBox: function() {
	return { 
	  'tl': { x: this.getX(), y: this.getY() },
	  'tr': { x: this.getX()+this.getWidth(), y: this.getY() },
	  'bl': { x: this.getX(), y: this.getY()+this.getHeight() },
	  'br': { x: this.getX()+this.getWidth(), y: this.getY()+this.getHeight() }
	};
  },
  /**
   * setBox
   * Adjusts the position and dimensions of the proxy's bounding box
   * @param {Object} box A four-cornered box
   */
  setBox: function(x1,y1,x2,y2) {
	if(arguments.length == 4) {
	  this.setPosition(x1,y1);
	  this.setDimensions(x2-x1,y2-y1);
	} else {
	  var box = arguments[0];
	  this.setPosition(box.tl.x,box.tl.y);
	  this.setDimensions(box.tr.x-box.tl.x,box.bl.y-box.tl.y);
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
	if(!attrArray) {
	  var attrArray = ['clip-rect','fill','fill-opacity','font','font-family','font-size','font-weight',
		'height','opacity','path','r','rotation','rx','ry','scale','src','stroke','stroke-dasharray',
		'stroke-linecap','stroke-linejoin','stroke-miterlimit','stroke-opacity','stroke-width',
		'translation','width','x','y']; 
	}
	for(var i=0, l=attrArray.length; i<l; i++) {
	  var param = attrArray[i],
		value = this[param.underscore().camelize().uncapitalize()];
		//value = this.get(param) || this.get(param.underscore().camelize()) || this[param] || this[param.underscore().camelize()];
	  if(value) {
		attr[param] = value;
	  } 
	}
	return attr;
  },
  show: function() {
	if(this.vectorElement) this.vectorElement.show();
  },
  hide: function() {
	if(this.vectorElement) this.vectorElement.hide();
  },
  destroy: function() {
	if(this.vectorElement)
	  this.vectorElement.remove();
  }
});

////////////////////////////////////////////////////////////////////////////////////////////////

/*
 * @class WorkspaceShim
 * Renders an object (such as an idea label) which follows the movement of a WorkspaceObject
 * @extends Ext.util.Observable
 * @see WorkspaceLabel
 */
var WorkspaceShim = function(config) {
  WorkspaceShim.superclass.constructor.apply(this,arguments);
  Ext.apply(this,config,{
	/**
	 * @cfg {Object} elementSpec
	 * An Ext.DomHelper spec used to create the shim's element
	 */
	elementSpec: {
	  tag: 'div',
	  cls: 'workspace-label'
	},
	// offsets: [0,0]  
  });
}

Ext.extend(WorkspaceShim,Ext.util.Observable,{
  position:'tl-bl?',
  animate: false,
  /**
   * applyTo
   * Links this shim to a {@link WorkspaceObject}
   * @param {WorkspaceObject} object
   */
  applyTo: function(obj) {
	if(obj.getEl) {
	  this.object = obj;
	  obj.on('move',this.onMove,this);
	  obj.on('hide',this.hide,this);
	  obj.on('show',this.show,this);
	  obj.on('destroy',this.destroy,this);
	  if(obj.is('rendered')) {
		this.render();
	  } else {
		obj.on('render',this.render,this,{single: true});
	  }
	}
  },
  /**
   * onMove
   * Invoked when the element moves; repositions the shim
   * @private
   */
  onMove: function() {
	if(this.object) {
	  var oEl = this.object.getEl();
	  if(oEl) {
		var el = this.getEl();
		//el.alignTo(Ext.fly(oEl),this.position,this.offsets,this.animate);
		el.position('absolute');
		el.setLeftTop(this.object.getX()+this.offsets[0],this.object.getY()-el.getHeight()+this.offsets[1]);
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
	if(this.element) this.getEl().hide();
  },
  /**
   * show
   */
  show: function() {
	if(this.element) this.getEl().show();
  },
  /**
   * destroy
   */
  destroy: function() {
	if(this.element)
	  Ext.destroy(this.element);
  }
})

/**
 * @class Ext.ux.LabelEditor
 * Allows in-place plain text editing on elements
 * @extends Ext.Editor
 * @see WorkspaceLabel
 */
Ext.ux.LabelEditor = Ext.extend(Ext.Editor, {
	alignment: "tl-tl",
	hideEl : false,
	cls: "x-small-editor",
	shim: false,
	completeOnEnter: true,
	cancelOnEsc: true,
	
	constructor: function(cfg, field){
		Ext.ux.LabelEditor.superclass.constructor.call(this,
			field || new Ext.form.TextField({
				allowBlank: false,
				growMin:90,
				growMax:240,
				grow:true,
				selectOnFocus:true
			}), cfg
		);
	},
	
	/**
	 * attachTo
	 * Links this editor to a DOM node
	 * @param {Ext.Element} targetEl The DOM node to which this editor should be applied
	 */
	attachTo: function(targetEl,renderEl) {
	  this.targetEl = targetEl;
	  this.renderEl = renderEl;
	  targetEl.on('click',this.startEdit,this);
	  
	},
	
	/**
	 * startEdit
	 * Begins editing the label
	 */
	startEdit: function() {
	  if(this.renderEl) {
		Ext.ux.LabelEditor.superclass.startEdit.call(this,this.targetEl);//this.renderEl,this.targetEl.innerHTML);
	  }
	}
});

/**
 * @class WorkspaceLabel
 * Allows in-place plain text editing of idea labels
 * @extends WorkspaceShim
 */
var WorkspaceLabel = function() {
  Ext.apply(this,{
	elementSpec: {
	  tag: 'div',
	  cls: 'workspace-label'
	},
	/**
	 * @cfg {Array} offsets
	 * Pixels by which to offset the shim 
	 */
	offsets: [0,1]
	/**
	 * @cfg {WorkspaceObject} object
	 * The object to which to bind this shim
	 */
  })
  WorkspaceLabel.superclass.constructor.apply(this,arguments);
}

Ext.extend(WorkspaceLabel,WorkspaceShim,{
  property: 'name',
  render: function() {
	WorkspaceLabel.superclass.render.apply(this,arguments);
	
	// attach editor to DOM node
	this.editor = new Ext.ux.LabelEditor({
	  labelSelector: '#'+this.getEl().id
	});
	this.editor.attachTo(this.getEl(),this.object.workspace.getEl());
	this.editor.on('complete',this.onSave,this);
	
	// pre-build metrics object to perform sizing in #updateSize
	this.metrics = Ext.util.TextMetrics.createInstance(this.getEl());
	
	// load data into label
	var val = this.object.get(this.property);
	this.onChange(this.property,val);
	this.onMove();
  },
  
  /**
   * onSave
   * Invoked when the attached Ext.ux.LabelEditor finishes editing; updates the attached object
   * @private
   * @param {Ext.ux.LabelEditor} ed
   * @param {Mixed} value
   */
  onSave: function(ed,value) {
	if(this.property && this.object) {
	  this.object.set(this.property,value);
	}
  },
  applyTo: function() {
	WorkspaceLabel.superclass.applyTo.apply(this,arguments);
	if(this.object) {
	  this.object.on('change',this.onChange,this);
	  this.object.on('resize',this.onMove,this);
	}
  },
  /**
   * updateSize
   * Invoked automatically to set the height of the shim
   * @private
   */
  updateSize: function(val) {
	this.getEl().setHeight(this.metrics.getHeight(val)+5);
  },
  onMove: function(){
	this.updateSize(this.object.get(this.property));
	WorkspaceLabel.superclass.onMove.apply(this,arguments);
  },
  /**
   * onChange
   * Invoked when the attached object property changes; updates the attached element
   * @param {String} prop The property which changes
   * @param {Mixed} val The value which changes
   */
  onChange: function(prop,val) {
	if(prop == this.property && !this.ignoreNext) {
	  this.getEl().update(val);
	  this.updateSize(val);
	}
  },
  
  destroy: function() {
	this.object.un('change',this.onChange,this);
	this.object.un('resize',this.onMove,this);
	this.editor.destroy();
	WorkspaceLabel.superclass.destroy.apply(this,arguments);
  }
})

////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * @class WorkspaceObject
 * Represents an object in the workspace
 * @extends SerializableObject
 * @abstract
 */
var WorkspaceObject = function(config) {
	WorkspaceObject.superclass.constructor.apply(this,arguments);
	
	Ext.apply(this,config);
	Ext.applyIf(this,{
		/**
		 * @cfg {String} id
		 */
		id: App.nextId(),
		/**
		 * @cfg {Workspace} workspace
		 */
		workspace: App.getDefaultWorkspace()
	});
	
		
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
		 * @param {WorkspaceObject} this
		 */
		 'destroy'
	);
	
	this.expose('x',true,true); //'getX','updateX');
	this.expose('y',true,true); //,'getY','updateY');
	this.expose('id','getId',false);
	this.expose('parent',true,true);
	this.expose('name',true,true);
	this.expose('iconCls',true,true);
	
	// bind listeners to update position
	this.on('change_x',this.updateX,this);
	this.on('change_y',this.updateY,this);
};

Ext.extend(WorkspaceObject, SerializableObject, {
  /**
   * @cfg {String} wtype
   * The configured wtype with which to instantiate this object
   */
  wtype: 'WorkspaceObject',
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
  name: 'New Idea',
	
	/**
	 * initialize
	 * Realizes properties containing complex objects (such as {@link #parent}) which may have been serialized.
	 * Invoked automatically by the {@link Workspace} after all components have been instantiated
	 */
	initialize: function() {
	  if(this.parent) {
		this.set('parent',Workspace.Components.realize(this.parent));
	  }
	},
	/**
	 * getParent
	 * @return {WorkspaceObject} parent
	 */
	getParent: function() {
	  return this.get('parent');
	},
	/**
	 * setParent
	 * @param {WorkspaceObject} parent
	 */
	setParent: function(parent) {
	  this.set('parent',parent);
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
	orphan: function(){
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
	return this.unselect.apply(this,arguments);
  },
  /**
   * unselectAncestors
   * invokes this method on this object's parent, then unselects it. Automatically invoked by {@link Workspace#select}
   */
  unselectAncestors: function() {
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
  unselectDescendents: function() {
	if(!this.selectChildren && this.children && this.children.each) {
	  this.children.each(function(child) { 
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
	if(this.is('selected')) {
	  this.unselect();  
	} else {
	  this.select();  
	}
  },
	
	/**
	 * getX
	 * Returns the object's x position relative to another workspace object
	 * @param {WorkspaceObject} rel Another object to whose position this object should be compared
	 */
	getX: function(rel) {
	  if(!rel) {
		  return this.get('x');	
		} else {
		  return this.get('x') - rel.getX();
		}
	},
	/**
	 * getY
	 * Returns the object's y position relative to another workspace object
	 * @param {WorkspaceObject} rel Another object to whose position this object should be compared
	 */
	getY: function(rel) {
		if(!rel) {
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
		this.fireEvent('move',x,this.getY());
	},
	/**
	 * setT
	 * Invoked by change_y; fires move event
	 * @private
	 * @param {Number} y
	 */
	updateY: function(y) {
		this.fireEvent('move',this.getX(),y);
	},
	/**
	 * getPosition
	 * Returns the object's x,y position
	 * @returns {Object} pos Hash containing <var>x</var> and <var>y</var>
	 */
	getPosition: function() {
		return {x: this.get('x'), y: this.get('y')};	
	},
	/**
	 * setPosition
	 * Sets this object's x and y position (and optionally that of its children)
	 * @param {Object} x
	 * @param {Object} y
	 * @param {Object} applyToChildren (Optional) True to shift the position of all children as well, false to retain their position (defaults to true)
	 */
	setPosition: function(x,y,applyToChildren) {
	  applyToChildren = applyToChildren !== false;
	  
	  	// calculate amount to shift children
		var d = this.getDelta(x,y);
	  	
		// update x,y properties
		this.set('x',x); 
		this.set('y',y);
		
		// prevent event duplication; will keep parent objects (like WorkspaceIdea) from recalculating layout
		this.ignoreTranslateChildren = true;
		
		// apply translation to children
		if(applyToChildren && this.moveChildren && this.children && this.children.each) {
		  this.children.each(function(child) {
			child.translate(d.dx,d.dy);
		  })
		}
		this.ignoreTranslateChildren = false;
		this.fireEvent('move',this,x,y);
	},
	
	/**
	 * getAbsolutePosition
	 * @deprecated
	 */
	getAbsolutePosition: function() {
		var pos = this.getPosition();
		pos.x+=this.workspace.element.getX();
		pos.y+=this.workspace.element.getY();
		return pos;
	},
	/**
	 * moveTo
	 * Alias for {@link #setPosition}
	 * @param {Object} x
	 * @param {Object} y
	 */
	moveTo: function(x,y) {
		this.setPosition(x,y);
		// this.fireEvent('move',this,this.getX(),this.getY());
	},
	/**
	 * translate
	 * Moves this object (and optionally its children) by the specified amount
	 * @param {Object} dx
	 * @param {Object} dy
	 * @param {Object} applyToChildren (Optional) True to shift the position of all children as well, false to retain their position (defaults to true)
	 */
	translate: function(dx,dy,applyToChildren) {
		// default
		applyToChildren = (applyToChildren !== false);
		
		//this.suspendEvents();
		var x = this.getX()+dx,
			y = this.getY()+dy;
		this.set('x',x);
		this.set('y',y);
		
		// prevent event duplication; will keep parent objects (like WorkspaceIdea) from recalculating layout
		this.ignoreTranslateChildren = true;
		
		// apply translation to children
		if(applyToChildren && this.moveChildren && this.children && this.children.each) {
		  this.children.each(function(child) {
			child.translate(dx,dy);
		  })
		}
		this.ignoreTranslateChildren = false;
		this.fireEvent('move',this,this.getX(),this.getY());
	},
	/**
	 * move
	 * Alias for {@link #translate}
	 * @param {Object} dx
	 * @param {Object} dy
	 */
	move: function(dx,dy) {
		this.translate(dx,dy)	
	},
	/**
	 * getDelta
	 * Calculates difference between position of object and the provided coordinates. 
	 * @param {Object} x2
	 * @param {Object} y2
	 * @return {Object} delta Hash containing <var>dx</var> and <var>dy</var>
	 */
	getDelta: function(x2,y2) {
		return {dx: (x2-this.getX()), dy: (y2-this.getY())};
	},
	/**
	 * setState
	 * Changes properties in {@link #state}
	 * @param {String} field
	 * @param {Mixed} value
	 */
	setState: function(field,value) {
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
	 * @param {WorkspaceShim} shim
	 */
	addShim: function(shim) {
	  if(this.getEl) {
		shim.applyTo(this);
	  }
	},
	/**
	 * render
	 * Fires the render event, sets state to rendered.
	 */
	render: function() {
		this.setState('rendered',true);
		this.fireEvent('render');
	},
	/**
	 * destroy
	 * Destroys the component and all children;
	 */
	destroy: function(){
		if (this.children && this.children.getCount() > 0) {
			this.children.each(function(child){
				child.orphan();
			});
		}
		if (this.parent) {
			this.orphan();
		}
		this.fireEvent('destroy',this);
		this.setState('destroyed', true);
	}
});

Workspace.reg('WorkspaceObject',WorkspaceObject);

////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * @class WorkspaceObject2d
 * Represents a two-dimensional object in the workspace
 * @extends WorkspaceObject
 * @abstract
 */
var WorkspaceObject2d = function(config) {
	WorkspaceObject2d.superclass.constructor.apply(this,arguments);	
	
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
	
	this.expose('width',true,true);//'getWidth','updateWidth');
	this.expose('height',true,true);//,'getHeight','updateHeight');
	
	// subscribe to property change events to fire resize event
	this.on('change_width',this.updateWidth,this);
	this.on('change_height',this.updateHeight,this);
};

Ext.extend(WorkspaceObject2d, WorkspaceObject, {
  wtype: 'WorkspaceObject2d',
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
   * Generates and returns a {@link WorkspaceProxy} object bound to this object. 
   * If a WorkspaceProxy has already been created for this object, that proxy is returned.
   * @param {Object} cfg Configuration object for the new {@link WorkspaceProxy}
   * @param {Object} forceReposition (Optional) true to force the existing proxy to be repositioned to match this element's bounding box
   * @return {WorkspaceProxy} proxy
   */
  getProxy: function(cfg,forceReposition) {
	cfg = cfg || {};
	forceReposition = forceReposition || false; 
	
	if(!this.dragProxy) { 
	  Ext.applyIf(cfg,{
		workspace: this.workspace
	  });
	  this.dragProxy = new WorkspaceProxy(cfg);
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
  proxify: function() {
	return this.applyProxy.apply(this,arguments);
  },
  /**
   * deproxify
   * Alias for {@link #restoreFromProxy}
   */
  deproxify: function() {
	return this.restoreFromProxy.apply(this,arguments);
  },
  /**
   * applyProxy
   * Hides this object in the workspace and replaces it with a proxy
   */
  applyProxy: function() {
	if(this.hide) {
	  var proxy = this.getProxy(false,true);
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
	if(this.dragProxy) {
	  this.show();
	  if(!cancel) this.setBox(this.dragProxy.getBox());
	  this.dragProxy.hide();
	  this.fireEvent('resize',this.getWidth(),this.getHeight());
	  this.fireEvent('move',this.getX(),this.getY());
	  this.proxified = false;
	}
  },
  	/**
  	 * getDimensions
  	 * @returns {Object} dimesnions Hash containing <var>width</var> and <var>height</var> properties
  	 */
	getDimensions: function() {
		return {'width': this.getWidth(), 'width': this.getHeight()};	
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
		this.fireEvent('resize',this.width,this.height);
	},
	/**
	 * updateHeight
	 * Fires resize event
	 * @private
	 * @param {Object} h
	 */
	updateHeight: function(h) {
		this.fireEvent('resize',this.width,this.height);
	},
	/**
	 * setDimensions
	 * Sets the width and height of an object
	 * @param {Object} w
	 * @param {Object} h
	 */
	setDimensions: function(w,h) {
		this.set('width',w); this.set('height',h);	
	},
	/**
	 * getBBox
	 * Returns this object's position and dimensions in a single object
	 * @return {Object} bbox A hash containing <var>x</var>, <var>y</var>, <var>width</var>, and <var>height</var> properties.
	 */
	getBBox: function() {
	 return {x: this.getX(), y: this.getY(), width: this.getWidth(), height: this.getHeight()};  
	},
	/**
	 * getBox
	 * Gets a four-cornered bounding box for this proxy
	 * @return {Object} box An object with <var>tl</var>, <var>tr</var>, <var>bl</var>, and <var>br</var> 
	 * properties, corresponding to each corner of the box. Each key contains an object with <var>x</var> and <var>y</var> properties.
	 */
	getBox: function() {
		return { 
			'tl': { x: this.getX(), y: this.getY() },
			'tr': { x: this.getX()+this.getWidth(), y: this.getY() },
			'bl': { x: this.getX(), y: this.getY()+this.getHeight() },
			'br': { x: this.getX()+this.getWidth(), y: this.getY()+this.getHeight() }
		};
	},
	/**
	 * setBox
	 * Updates this object's position and dimensions to match the given four-cornered bounding box. 
	 * @param {Object} box A four-cornered bounding box (as would be returned by {@link #getBox}
	 * @param {Object} applyToChildren (Optional) True to shift the position of all children as well, false to retain their position (defaults to true)
	 */
	setBox: function(x1,y1,x2,y2) {
		if(arguments.length == 4) {
		  applyToChildren = (arguments[4] !== false)
		  this.setPosition(x1,y1);
		  this.setDimensions(x2-x1,y2-y1);
		} else {
		  var box = arguments[0],
			applyToChildren = arguments[1] !== false;
		  
		  this.setPosition(box.tl.x,box.tl.y,applyToChildren);
		  this.setDimensions(box.tr.x-box.tl.x,box.bl.y-box.tl.y);
		}
	},
	/**
	 * show
	 * Shows the object and all children if it has been hidden
	 */
	show: function() {
		if(this.getEl && this.is('rendered')) {
			var el = this.getEl();
			if(el){
			  el.show();
			  this.fireEvent('show',this);
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
	hide: function(){
		if (this.getEl && this.is('rendered')) {
			var el = this.getEl();
			if (el) {
				el.hide();
				this.fireEvent('hide', this);
			}
			if (this.children) {
				this.children.each(function(child){
					child.hide();
				})
			}
		}
	}, 
  
	click: function(e,t,o) {
		this.fireEvent('click');
		this.workspace.click(e,this);
	},
	dblclick: function(e,t,o) {
		this.fireEvent('dblclick');
		this.workspace.dblclick(e,this);
	},
	mousedown: function(e,t,o) {
		this.fireEvent('mousedown');
		this.workspace.mousedown(e,this);
	},
	mouseup: function(e,t,o) {
		this.fireEvent('mouseup');
		this.workspace.mouseup(e,this);
	},
	mousemove: function(e,t,o) {
		this.fireEvent('mousemove');
		this.workspace.mousemove(e,this);
	},
	mouseover: function(e,t,o) {
		this.fireEvent('mouseover');
		this.workspace.mouseover(e,this);
	},
	mouseout: function(e,t,o) {
		this.fireEvent('mouseout');
		this.workspace.mouseout(e,this);
	},
  destroy: function() {
	if(this.dragProxy)
	  this.dragProxy.destroy();
	WorkspaceObject2d.superclass.destroy.apply(this,arguments);
  } 
});

Workspace.reg('WorkspaceObject2d',WorkspaceObject2d);

////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * @class ElementObject
 * Represents a workspace object rendered by an HTML element
 * @extends WorkspaceObject2d
 * @abstract
 */
var ElementObject = function(workspace,config) {
	ElementObject.superclass.constructor.call(this,workspace,config);
	
	Ext.applyIf(this,{
		/**
		 * @cfg elementSpect
		 * An Ext.DomHelper spec describing the element to be created
		 */
		elementSpec: {}
	});
	
	Ext.applyIf(this.elementSpec,{
		tag: 'div',
		cls: ''
	});
	
	
};	

Ext.extend(ElementObject, WorkspaceObject2d, {
	wtype: 'ElementObject',
	/**
	 * render
	 * Builds this object's element and sets its position
	 */
	render: function(){
		this.element = this.workspace.addElement(this.elementSpec);
		this.element.position('absolute');
		this.element.setLeft(this.x);
		this.element.setTop(this.y);
		this.element.setWidth(this.width);
		this.element.setHeight(this.height);
		this.buildEvents();
		ElementObject.superclass.render.apply(this, arguments);
	},
	/**
	 * buildEvents
	 * Attaches event handlers to the object to invoke appropriate methods.
	 * Should be called if contentEditable is changed on the element, which breaks attached event listeners
	 */
	buildEvents: function(){
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
	updateX: function(x){
		this.element.setLeft(x);
		ElementObject.superclass.updateX.call(this, x);
	},
	/**
	 * updateY
	 * Updates the element's position. Called automatically when y property is changed
	 * @private
	 * @param {Object} y
	 */
	updateY: function(y){
		this.element.setTop(y);
		ElementObject.superclass.updateY.call(this, y);
	},
	/**
	 * updateWidth
	 * Updates the element's dimensions. Called automatically when width property is changed
	 * @private
	 * @param {Object} w
	 */
	updateWidth: function(w){
		this.element.setWidth(w);
		ElementObject.superclass.updateWidth.call(this, w);
	},
	/**
	 * updateHeight
	 * Updates the element's dimensions. Called automatically when height property is changed
	 * @private
	 * @param {Object} h
	 */
	updateHeight: function(h){
		this.element.setHeight(h);
		ElementObject.superclass.updateHeight.call(this, h);
	},
	/**
	 * getEl
	 * @return {Ext.Element}
	 */
	getEl: function(){
		return this.element;
	},
	
	
	destroy: function(){
		Ext.destroy(this.element);
		ElementObject.superclass.destroy.apply(this, arguments);
	}
});

Workspace.reg('ElementObject',ElementObject);

////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * @class ImageObject
 * Represents a workspace object containing an image
 * @extends ElementObject
 */
var ImageObject = function(workspace,config) {
  ImageObject.superclass.constructor.call(this,workspace,config);

  Ext.apply(this.elementSpec,{
	tag: 'div',
	cls: 'image'
  }); 
  
  this.expose('url',true,true); //'getText', 'setText'); //,'text','string');
  this.on('change_url',this.setText,this)
};


Ext.extend(ImageObject, ElementObject, {
	wtype: 'ImageObject',
	name: 'New Image',
	iconCls: 'image-icon',
	/**
	 * @cfg {String} url
	 * URL to the image to be displayed
	 */
	url: '/canvas/uploads/',
	render: function(){
		// build inner HTML
		this.elementSpec.html = '<img src="' + this.get('url') + '" />';
		ImageObject.superclass.render.call(this, arguments);
		
		// auto-calculate position and dimensions if not specified in config 
		if (this.getWidth() == 0) {
			this.set('width', this.getImageEl().getWidth());
			this.set('height', this.getImageEl().getHeight());
			this.set('x', this.getX());
			this.set('y', this.getY());
		}
	},
	getUrl: function(){
		return this.get('url'); //this.text;
	},
	/**
	 * setUrl
	 * Updates the URL; called automatically when url property is set
	 * @private
	 * @param {Object} value
	 */
	setUrl: function(value){
		this.getImageEl().set({
			src: value
		});
	},
	/**
	 * getImageEl
	 * Returns the DOM img element
	 * @return {Ext.Element}
	 */
	getImageEl: function(){
		if (this.getEl()) 
			return this.getEl().child('img');
	},
	/**
	 * updateWidth
 	 * Updates the element's dimensions. Called automatically when width property is changed
	 * @param {Object} w
	 */
	updateWidth: function(w){
		this.getImageEl().setWidth(w);
		ImageObject.superclass.updateWidth.apply(this, arguments);
	},
	/**
	 * updateHeight
	 * Updates the element's dimensions. Called automatically when height property is changed
	 * @param {Object} h
	 */
	updateHeight: function(h){
		this.getImageEl().setHeight(h);
		ImageObject.superclass.updateHeight.apply(this, arguments);
	}
});

Workspace.reg('ImageObject',ImageObject);

////////////////////////////////////////////////////////////////////////////////////////////////

/*
 * @class IFrameObject
 * Represents a workspace object containing an iframe
 * @extends ElementObject
 */
var IFrameObject = function(workspace,config) {
  IFrameObject.superclass.constructor.call(this,workspace,config);

  Ext.apply(this.elementSpec,{
	tag: 'div',
	cls: 'iframe'
  }); 
  
  this.expose('url',true,true); //'getText', 'setText'); //,'text','string');
  this.on('change_url',this.setText,this)
};


Ext.extend(IFrameObject, ElementObject, {
	wtype: 'IFrameObject',
	isEditable: false,
	isSelectable: true,
	isResizable: true,
	name: 'New IFrame',
	iconCls: 'iframe-icon',
	/**
	 * @cfg {Number} padding
	 * Amount to pad the iframe element (to allow this object to be dragged from iframe edges)
	 */
	padding: 2,
	/**
	 * @cfg {String} url
	 */
	url: '',
	render: function(){
		// build iframe
		this.elementSpec.html = '<iframe src="' + this.getFullUrl() + '" />';
		IFrameObject.superclass.render.call(this, arguments);
		
		// update position and dimensions
		this.set('width', this.getWidth());
		this.set('height', this.getHeight());
		this.getIFrameEl().position('relative');
		
		// apply "padding" to this element so that iframe can be dragged
		this.getIFrameEl().setLeftTop(this.padding, this.padding);
	},
	/**
	 * getFullUrl
	 * Allows descendent classes to implement URL filtering
	 * @abstract
	 */
	getFullUrl: function(){
		return this.getUrl();
	},
	getUrl: function(){
		return this.get('url'); //this.text;
	},
	setUrl: function(value){
		this.getImageEl().set({
			src: value
		});
	},
	/**
	 * getImageEl
	 * Returns the DOM iframe element
	 * @return {Ext.Element}
	 */
	getIFrameEl: function(){
		if (this.getEl()) 
			return this.getEl().child('iframe');
	},
	updateWidth: function(w){
		this.getIFrameEl().setWidth(w - (this.padding * 2));
		IFrameObject.superclass.updateWidth.apply(this, arguments);
	},
	updateHeight: function(h){
		this.getIFrameEl().setHeight(h - (this.padding * 2));
		IFrameObject.superclass.updateHeight.apply(this, arguments);
	}
});

Workspace.reg('IFrameObject',IFrameObject);

////////////////////////////////////////////////////////////////////////////////////////////////

/*
 * @class PDFEmbedObject
 * Represents a workspace object containing an iframe
 * @extends IFrameObject
 */
var PDFEmbedObject = function(workspace, config){
	PDFEmbedObject.superclass.constructor.call(this, workspace, config);
};

Ext.extend(PDFEmbedObject, IFrameObject, {
	wtype: 'PDFEmbedObject',
	name: 'New PDF',
	iconCls: 'pdf',
	url: 'http://labs.google.com/papers/bigtable-osdi06.pdf',
	/**
	 * Returns the URL to the Google Docs PDF embedding suite
	 * @param {Object} value
	 */
	getFullUrl: function(value){
		value = value || this.get('url');
		return 'http://docs.google.com/viewer?embedded=true&url=' + encodeURIComponent(value);
	},
	setUrl: function(value){
		this.getIFrameEl().set({
			src: this.getFullUrl(value)
		});
	}
});

Workspace.reg('PDFEmbedObject',PDFEmbedObject);

////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * @class RichTextObject
 * Represents a workspace object containing editable, rich HTML
 * @extends ElementObject
 */
var RichTextObject = function(workspace,config) {
	RichTextObject.superclass.constructor.call(this,workspace,config);

	Ext.apply(this.elementSpec,{
		tag: 'div',
		cls: 'textbox'
	});	
	
	this.expose('text',true,true); //'getText', 'setText'); //,'text','string');
	this.on('change_text',this.setText,this)
};


Ext.extend(RichTextObject, ElementObject, {
	wtype: 'RichTextObject',
	isEditable: true,
	isSelectable: true,
	isResizable: true,
	text: '',
	name: "New Textbox",
	iconCls: 'text-icon',
	/**
	 * @cfg {String} editor
	 * The name of a {@link WorkspaceTool} to use to edit this object (activated on double-click)
	 */
	editor: 'aloha',
	render: function(){
		this.elementSpec.html = this.get('text');
		RichTextObject.superclass.render.call(this, arguments);
	},
	getText: function(){
		//this.text = this.getEl().innerHTML;
		return this.get('text'); //this.text;
	},
	/**
	 * setText
	 * Updates the element with the passed HTML; automatically invoked when 'text' property is set.
	 * @private
	 * @param {Object} value
	 */
	setText: function(value){
		this.text = value;
		this.getEl().update(value);
	}
});

Workspace.reg('RichTextObject',RichTextObject);

////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * @class MathEquationObject
 * Represents a workspace object containing an editable mathematical equation
 * @extends ElementObject
 */
var MathEquationObject = function(workspace,config) {
	Ext.applyIf(config,{
		
	})
	
	MathEquationObject.superclass.constructor.call(this,workspace,config);

	Ext.apply(this.elementSpec,{
		tag: 'div',
		cls: 'math'
	});	
	
	this.expose('latex',true,true);
};


Ext.extend(MathEquationObject, ElementObject, {
	wtype: 'MathEquationObject',
	name: 'New Equation',
	iconCls: 'math-icon',
	isEditable: true,
	isSelectable: true,
	isResizable: true,
	/**
	 * @cfg {String} latex
	 * The LaTeX string to be rendered in this element
	 */
	latex: '',
	editor: 'mathquill',
	render: function(){
		MathEquationObject.superclass.render.call(this, arguments);
		this.showImage(this.get('latex'));
		// $(this.getEl().dom).mathquill('latex',this.get('latex'));
	},
	/**
	 * Render LaTeX as image using a free service
	 * @param {Object} text
	 */
	showImage: function(text){
		var url = 'http://latex.codecogs.com/gif.latex?';
		url += encodeURIComponent(text);
		this.getEl().update('<img src="' + url + '" />');
	},
	/**
	 * activate
	 * Makes this element editable using Mathquill; automatically invoked by the configured editor
	 * @private
	 */
	activate: function(){
		var el = this.getEl();
		el.update('');
		$(el.dom).mathquill('editable').mathquill('latex', this.get('latex'));
	},
	/**
	 * deactivate
	 * Restores this element to a non-editable image; automatically invoekd by the configured editor
	 * @private
	 */
	deactivate: function(){
		var el = this.getEl(), text = $(el.dom).mathquill('latex');
		
		this.set('latex', text);
		
		$(this.element.dom).mathquill('revert');
		this.element = Ext.get(this.element.dom);
		this.showImage(text)
	}
});

Workspace.reg('MathEquationObject',MathEquationObject);

////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * @class ChemStructureObject
 * Represents a workspace object containing an editable chemical structure
 * @extends ElementObject
 */
var ChemStructureObject = function(workspace,config) {
	ChemStructureObject.superclass.constructor.call(this,workspace,config);

	Ext.apply(this.elementSpec,{
		tag: 'div',
		cls: 'textbox'
	});	
	
};

Ext.extend(ChemStructureObject, ElementObject, {
  wtype: 'ChemStructureObject',
  name: 'New Chemical Structure',
  iconCls: 'chem',
	isEditable: true,
  isSelectable: true,
  isResizable: true,
	editor: 'chemdraw',
	render: function() {
		ChemStructureObject.superclass.render.call(this,arguments);	
	}
});

Workspace.reg('ChemStructureObject',ChemStructureObject);

////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * @class VectorObject
 * Represents a workspace object rendered by an SVG/VML (Raphael) element
 * @extends WorkspaceObject2d
 */
var VectorObject = function(workspace,config) {
	VectorObject.superclass.constructor.call(this,workspace,config);
	
	// expose a bunch of SVG properties
	this.expose('fill',true, true); //,'fill','color');
	this.expose('fillOpacity',true, true); //,'fillOpacity','number');
	this.expose('opacity',true, true); //,'opacity','number');
	this.expose('stroke',true, true); //,'stroke','color');
	this.expose('strokeWidth',true, true); //,'strokeWidth','number');
	this.expose('strokeDasharray',true, true); //,'strokeDasharray','string'); // ['', '-', '.', '-.', '-..', '. ', '- ', '--', '- .', '--.', '--..']
	this.expose('strokeLinecap',true, true); //,'strokeLinecap','string'); //['butt', 'square', 'round']
	this.expose('strokeLinejoin',true, true); //,'strokeLinejoin','string'); // ['bevel', 'round', 'miter']
	this.expose('strokeMiterlimit',true, true); //,'strokeMiterlimit', 'number');
	this.expose('strokeOpacity',true, true); //,'strokeOpacity', 'number');
	this.expose('path',true, true); //,'path','array');
	this.expose('shape',true, true); //,'shape','string');
	
};

Ext.extend(VectorObject, WorkspaceObject2d, {
	wtype: 'VectorObject',
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
	
	render: function(){
		this.buildObject();
		this.on('change', this.updateObject, this);
		VectorObject.superclass.render.apply(this, arguments);
	},
	/**
	 * buildObject
	 * Invokes the Raphael constructor specified in {@link #shape}, with the arguments specified in {@link #arguments}
	 * @private
	 */
	buildObject: function(){
		if (Ext.isFunction(this.workspace.paper[this.shape])) {
			// build the element
			this.vectorElement = this.workspace.paper[this.shape].apply(this.workspace.paper, this.arguments);
			
			// apply attributes specified in config
			this.vectorElement.attr(this.attributes());
			
			// attach event listeners
			this.element = Ext.get(this.vectorElement.node);
			/*
			 this.vectorElement.click(this.click.createDelegate(this));
			 this.vectorElement.dblclick(this.dblclick.createDelegate(this));
			 this.vectorElement.mouseup(this.mouseup.createDelegate(this));
			 this.vectorElement.mousedown(this.mousedown.createDelegate(this));
			 this.vectorElement.mousemove(this.mousemove.createDelegate(this));
			 this.vectorElement.mouseover(this.mouseover.createDelegate(this));
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
	
	toBack: function(){
		this.vectorElement.toBack();
	},
	
	/**
	 * updateObject
	 * Sets the attributes of this object's vector graphic representation to those specified in its properties.
	 * Invoked automatically when properties are changed.
	 * @private
	 */
	updateObject: function(){
		this.vectorElement.attr(this.attributes());
	},
	
	updateX: function(x){
		VectorObject.superclass.updateX.apply(this, arguments);
		this.vectorElement.attr({
			x: x
		});//this.x});
	},
	updateY: function(y){
		VectorObject.superclass.updateY.apply(this, arguments);
		this.vectorElement.attr({
			y: y
		});//this.y});
	},
	updateWidth: function(width){
		VectorObject.superclass.updateWidth.apply(this, arguments);
		this.vectorElement.attr({
			width: width
		});//this.width});
	},
	updateHeight: function(height){
		VectorObject.superclass.updateHeight.apply(this, arguments);
		this.vectorElement.attr({
			height: height
		});//this.height});
	},
	
	getPosition: function(){
		//var box = this.vectorElement.getBBox();
		return {
			x: this.getX(),
			y: this.getY()
		}; //{x: box.x, y: box.y};
	},
	getDimensions: function(){
		//var box = this.vectorElement.getBBox();
		return {
			width: this.getWidth(),
			height: this.getHeight()
		}; //{width: box.width, height: box.height};
	},
	
	/**
	 * attributes
	 * Searches this object for the provided attributes and returns a hash containing containing them.
	 * Used to quicky apply properties saved in this object to its vector representation. Automatically converts 
	 * dashed property names to camelized property names stored in the object.
	 * @param {Object} attrArray (Optional) The list of proeprties to search for. Defaults to all allowed Raphael properties
	 */
	attributes: function(attrArray){
		var attr = {};
		if (!attrArray) {
			var attrArray = ['clip-rect', 'fill', 'fill-opacity', 'font', 'font-family', 'font-size', 'font-weight', 'height', 'opacity', 'path', 'r', 'rotation', 'rx', 'ry', 'scale', 'src', 'stroke', 'stroke-dasharray', 'stroke-linecap', 'stroke-linejoin', 'stroke-miterlimit', 'stroke-opacity', 'stroke-width', 'translation', 'width', 'x', 'y'];
		}
		for (var i = 0, l = attrArray.length; i < l; i++) {
			var param = attrArray[i], paramName = param.camelize().uncapitalize(), //param.underscore().camelize().uncapitalize(),
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
	getEl: function(){
		return this.vectorElement;
	},
	
	destroy: function(){
		this.vectorElement.remove();
		VectorObject.superclass.destroy.apply(this, arguments);
	}
});

Workspace.reg('VectorObject',VectorObject);

////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * @class VectorRectObject
 * Represents a workspace object rendered as an SVG/VML rectangle
 * @extends VectorObject
 */
var VectorRectObject = function(workspace,config) {	
	VectorRectObject.superclass.constructor.call(this,workspace,config);	

	Ext.applyIf(this,{
		
		// x: 0, y: 0, width: 0, height: 0,
	});
	
	this.expose('r',true,true);
};

Ext.extend(VectorRectObject, VectorObject, {
  wtype: 'VectorRectObject',
  name: 'New Rectangle',
  iconCls: 'rect',
  shape:'rect',
  r: 0,
  
  isResizable: true,
  render: function() {
	this.arguments = [this.x,this.y,this.width,this.height,this.r];
	VectorRectObject.superclass.render.call(this);
  }
});

Workspace.reg('VectorRectObject',VectorRectObject);

////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * @class WorkspaceIdeaObject
 * Represents an idea which groups various child objects together
 * @extends VectorRectObject
 */
var WorkspaceIdeaObject = function(workspace, config){
	WorkspaceIdeaObject.superclass.constructor.apply(this, arguments);
	
	// automatically set the fill to a nice random pastel color
	this.set('fill', Workspace.Utils.ideaColor());
	this.set('fillOpacity', 0.7);
	
	// set up the label editor
	this.addShim(new WorkspaceLabel({
		property: 'name'
	}));
	
	this._children = this.children;
	this.children = new Ext.util.MixedCollection();
	
	this.expose('children', true, false);
};

Ext.extend(WorkspaceIdeaObject, VectorRectObject, {
	wtype: 'WorkspaceIdeaObject',
	name: 'New Idea',
	iconCls: 'idea',
	r: 5,
	stroke: '#CCC',
	padding: 50,
	render: function(){
		WorkspaceIdeaObject.superclass.render.apply(this, arguments);
		this.updateSize(false, false);
		this.toBack();
	},
	initialize: function(){
		WorkspaceIdeaObject.superclass.initialize.apply(this, arguments);
		this.buildChildren();
	},
	/**
	 * buildChildren
	 * Realizes child objects passed to constructor. Automatically invoked by initialize
	 * @private
	 */
	buildChildren: function(){
		var children = this._children;
		if (Ext.isArray(children)) {
			Ext.each(children, function(child){
				this.addChild(Workspace.Components.realize(child));
			}, this)
		} else if (Ext.isObject(children)) {
			var child;
			for(var id in children) {
				child = children[id];
				this.addChild(Workspace.Components.realize(child))	
			}
		}
	},
	/**
	 * addChild
	 * Adds a child to this idea
	 * @param {WorkspaceObject} child
	 */
	addChild: function(child){
		this.children.add(child);
		child.setParent(this);
		child.on('move', this.adjustSize, this);
		child.on('resize', this.adjustSize, this);
	},
	/**
	 * adopt
	 * Alias for {@link #addChild}
	 */
	adopt: function() {
		this.addChild.apply(this,arguments);
	},
	
	/**
	 * removeChild
	 * Removes a child from this idea
	 * @param {WorkspaceObject} child
	 */
	removeChild: function(child) {
		this.children.remove(child.getId());
		child.un('move', this.adjustSize, this);
		child.un('resize', this.adjustSize, this);
	},
	
	/**
	 * adjustSize
	 * invoked automatically when children are moved or resized
	 * @private
	 */
	adjustSize: function(){
		if (!this.ignoreTranslateChildren) 
			this.updateSize(true, false);
	},
	/**
	 * updateSize
	 * Recalculates this object's position and dimensions so that it is sized to contain all child objects
	 * @param {Boolean} union (Optional) true to apply Workspace.Components.boxUnion to this idea's current box (only allowing the box to be expanded)
	 * @param {Boolean} applyToChildren (Optional) true to apply changes in position to child objects
	 */
	updateSize: function(union, applyToChildren){
		union = (union !== false);
		applyToChildren = (applyToChildren !== false);
		var attr = this.attributes(), box = Workspace.Utils.getBox(this.children.getRange());
		box = Workspace.Utils.padBox(box, this.padding);
		if (union) 
			box = Workspace.Utils.boxUnion(box, this.getBox())
		this.setBox(box, applyToChildren);//!union);
	},
	
});

Workspace.reg('WorkspaceIdeaObject',WorkspaceIdeaObject);

////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * @class VectorEllipseObject
 * Represents a workspace object rendered by an ellipse
 * @extends VectorObject
 */
var VectorEllipseObject = function(workspace,config) {		
	VectorEllipseObject.superclass.constructor.call(this,workspace,config);
	
};

Ext.extend(VectorEllipseObject, VectorObject, {
	wtype: 'VectorEllipseObject',
	name: 'New Ellipse',
	iconCls: 'ellipse',
	shape: 'ellipse',
	isResizable: true,
	x: 0,
	y: 0,
	width: 0,
	height: 0,
	
	render: function(){
		this.arguments = [this.get('x') + this.getRadiusX(), this.get('y') + this.getRadiusY(), this.getRadiusX(), this.getRadiusY()];
		//[(this.x-(this.width/2)),(this.y-(this.height/2)),(this.width/2),(this.height/2)];
		VectorEllipseObject.superclass.render.call(this);
	},
	/**
	 * getRadiusX
	 * @return {Number} rx
	 */
	getRadiusX: function(){
		return (this.getWidth() / 2);
	},
	/**
	 * getRadiusY
	 * @return {Number} ry
	 */
	getRadiusY: function(){
		return (this.getHeight() / 2);
	},
	/**
	 * getCenterX
	 * @return {Number} cx
	 */
	getCenterX: function(){
		return (this.getX() + this.getRadiusX());
	},
	/**
	 * getCenterY
	 * @return {Number} cy
	 */
	getCenterY: function(){
		return (this.getY() + this.getRadiusY());
	},
	updateX: function(x){
		VectorObject.superclass.updateX.apply(this,arguments);
		this.vectorElement.attr({
			cx: x + this.getRadiusX()
		})
	},
	updateY: function(y){
		VectorObject.superclass.updateY.apply(this,arguments);
		this.vectorElement.attr({
			cy: y + this.getRadiusY()
		})
	},
	updateWidth: function(w){
		this.vectorElement.attr({
			rx: this.getRadiusX()
		});
		this.updateX(this.getX());
	},
	updateHeight: function(w){
		this.vectorElement.attr({
			ry: this.getRadiusY()
		})
		this.updateY(this.getY());
	}
});

Workspace.reg('VectorEllipseObject',VectorEllipseObject);


////////////////////////////////////////////////////////////////////////////////////////////////

/*
 * @class VectorPathObject
 * Represents a workspace object rendered by an SVG/VML path
 * @extends VectorObject
 */
var VectorPathObject = function(config) {		
	VectorPathObject.superclass.constructor.apply(this,arguments);
};

Ext.extend(VectorPathObject, VectorObject, {
	wtype: 'VectorPathObject',
	name: 'New Path',
	iconCls: 'polyline',
	shape: 'path',
	isResizable: false,
	path: [],
	fillOpacity: 0,
	render: function(){
		this.arguments = [this.path];
		VectorPathObject.superclass.render.call(this);
		this.updateDimensions();
	},
	
	/**
	 * updatePath
	 * Sets this object's path to the passed path specification and recalculates its dimensions
	 * @param {Array} path Raphael path specification (e.g. [['M',x,y],['L',x,y]...])
	 */
	updatePath: function(path){
		this.path = path;
		this.vectorElement.attr({
			path: path
		});
		this.updateDimensions();
	},
	
	/**
	 * updateDimensions
	 * Sets this object's x, y, width, and height properties to match that of the bounding box of the object's path.
	 * Automatically invoked by updatePath and render()
	 * @private
	 */
	updateDimensions: function() {
	  var box = this.vectorElement.getBBox();
    this.set('x', box.x);
    this.set('y', box.y);
    this.set('height', box.height);
    this.set('width', box.width);
	},
	
	/**
	 * appendPoint
	 * Adds a new point to this object's path
	 * @param {Array} point Raphael path point specification (e.g. ['M',x,y])
	 */
	appendPoint: function(point){
		this.path.push(point);
		this.updatePath(this.path);
	},
	translate: function(dx, dy){
		var point;
		for (i = 0, l = this.path.length; i < l; i++) {
			point = this.path[i];
			switch (point[0]) {
				case 'C':
					point[5] = point[5] + dx;
					point[6] = point[6] + dy;
				case 'S':
					point[3] = point[3] + dx;
					point[4] = point[4] + dy;
				case 'M':
				case 'L':
				case 'T':
					point[1] = point[1] + dx;
					point[2] = point[2] + dy;
					break;
				default:
					break;
			}
		}
		this.updatePath(this.path);
		/*
		 this.x = this.getX();
		 this.y = this.getY();
		 */
		this.fireEvent('move', this.getX(), this.getY());
	},
	/**
	 * setPosition
	 * sets the position of this path by calculating the delta and translating the path
	 * @param {Object} x
	 * @param {Object} y
	 */
	setPosition: function(x, y){
		var delta = this.getDelta(x, y);
		this.translate(delta.dx, delta.dy);
	},
	// not implemented
	setDimensions: function(w, h){
	
	}
});

Workspace.reg('VectorPathObject',VectorPathObject);

////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * @class WorkspaceConnectionObject
 * Represents a workspace object connecting two other {@link WorkspaceObject}s together
 * @extends VectorObject
 */
WorkspaceConnectionObject = function() {
  WorkspaceConnectionObject.superclass.constructor.apply(this,arguments);
  /**
   * @cfg {WorkspaceObject} leftObject
   * The first object to connect
   */
  this.expose('leftObject',true,true);
  /**
   * @cfg {WorkspaceObject} rightObject
   * The second object to connect
   */
  this.expose('rightObject',true,true);
}

Ext.extend(WorkspaceConnectionObject,VectorObject,{
  shape: 'path',
  name: 'New Connection',
  iconCls: 'connector',
  wtype: 'WorkspaceConnectionObject',
  fillOpacity: 0.1,
  initialize: function() {
	if(this.leftObject.id) {
		this.set('leftObject',Workspace.Components.realize(this.leftObject));
	}
	if(this.rightObject.id) {
		this.set('rightObject',Workspace.Components.realize(this.rightObject));
	}
  },
  render: function() {
	var o1 = this.get('leftObject');
	var o2 = this.get('rightObject');
	o1.on('move',this.onObjectMove,this);
	o2.on('move',this.onObjectMove,this);
	o1.on('hide',this.hide,this);
	o2.on('hide',this.hide,this);
	o1.on('show',this.show,this);
	o2.on('show',this.show,this);
	o1.on('destroy',this.destroy,this);
	o2.on('destroy',this.destroy,this);
	this.arguments = [this.buildPath(o1,o2)];
	WorkspaceConnectionObject.superclass.render.apply(this,arguments);
  },
  /**
   * onObjectMove
   * Rebuilds the path
   * @private
   */
  onObjectMove: function() {
	this.rebuildPath();
  },
  /**
   * rebuildPath
   * Calculates the path between the two configured objects and recalculates this object's layout
   */
  rebuildPath: function() {
	this.vectorElement.attr({ path:this.buildPath(this.get('leftObject'),this.get('rightObject')) });
	var box = this.vectorElement.getBBox();
	this.set('x',box.x);
	this.set('y',box.y);
	this.set('height',box.height);
	this.set('width',box.width);
  },
  /**
   * buildPath
   * Calculates a path betwen two objects
   * Adapted from http://raphaeljs.com/graffle.html
   * @param {Object} obj1
   * @param {Object} obj2
   */ 
  buildPath: function (obj1, obj2) { 
	var bb1 = obj1.getBBox(),
		bb2 = obj2.getBBox(),
		p = [{x: bb1.x + bb1.width / 2, y: bb1.y - 1},
		{x: bb1.x + bb1.width / 2, y: bb1.y + bb1.height + 1},
		{x: bb1.x - 1, y: bb1.y + bb1.height / 2},
		{x: bb1.x + bb1.width + 1, y: bb1.y + bb1.height / 2},
		{x: bb2.x + bb2.width / 2, y: bb2.y - 1},
		{x: bb2.x + bb2.width / 2, y: bb2.y + bb2.height + 1},
		{x: bb2.x - 1, y: bb2.y + bb2.height / 2},
		{x: bb2.x + bb2.width + 1, y: bb2.y + bb2.height / 2}],
		d = {}, dis = [];
	for (var i = 0; i < 4; i++) {
		for (var j = 4; j < 8; j++) {
			var dx = Math.abs(p[i].x - p[j].x),
				dy = Math.abs(p[i].y - p[j].y);
			if ((i == j - 4) || (((i != 3 && j != 6) || p[i].x < p[j].x) && ((i != 2 && j != 7) || p[i].x > p[j].x) && ((i != 0 && j != 5) || p[i].y > p[j].y) && ((i != 1 && j != 4) || p[i].y < p[j].y))) {
				dis.push(dx + dy);
				d[dis[dis.length - 1]] = [i, j];
			}
		}
	}
	if (dis.length == 0) {
		var res = [0, 4];
	} else {
		res = d[Math.min.apply(Math, dis)];
	}
	var x1 = p[res[0]].x,
		y1 = p[res[0]].y,
		x4 = p[res[1]].x,
		y4 = p[res[1]].y;
	dx = Math.max(Math.abs(x1 - x4) / 2, 10);
	dy = Math.max(Math.abs(y1 - y4) / 2, 10);
	var x2 = [x1, x1, x1 - dx, x1 + dx][res[0]].toFixed(3),
		y2 = [y1 - dy, y1 + dy, y1, y1][res[0]].toFixed(3),
		x3 = [0, 0, 0, 0, x4, x4, x4 - dx, x4 + dx][res[1]].toFixed(3),
		y3 = [0, 0, 0, 0, y1 + dy, y1 - dy, y4, y4][res[1]].toFixed(3);
	var path = ["M", x1.toFixed(3), y1.toFixed(3), "C", x2, y2, x3, y3, x4.toFixed(3), y4.toFixed(3)];//.join(",");
	return path;
  }
});

Ext.apply(WorkspaceConnectionObject,{
	/**
	 * getPoint
	 * Gets an imitation WorkspaceObject suitable *only* to be passed to a WorkspaceConnectionObject as one of its anchors.
	 * @static
	 * @param {Object} x
	 * @param {Object} y
	 */
	getPoint: function(x, y){
		return {
			x: x,
			y: y,
			width: 0,
			height: 0,
			getBBox: function(){
				return this;
			},
			on: function(){
			},
			un: function(){
			}
		}
	},
});

Workspace.reg('WorkspaceConnectionObject',WorkspaceConnectionObject);
