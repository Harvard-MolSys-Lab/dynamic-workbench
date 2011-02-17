/********************************************
 * InfoMachine
 * 
 * Copyright (c) 2010 Casey Grun
 *********************************************/

/**
 * @class SerializableObject
 * Encapsulates functionality for storing and retrieving key value pairs and automatically serializing them. 
 * @extends Ext.util.Observable
 */
var SerializableObject = function() {
  // directory of readable properties and their getter functions
  this._readable = {};
  // directory of writeable properties and their setter functions
  this._writeable = {};
  // directory of serializable properties
  this._serializable = {};
  // directory of user properties
  this._userProperties = {};
  
  this.addEvents(
    /**
     * @event change
     * Fired when one of this object's properties is {@link #set}
     * @param {String} property The name of the property
     * @param {Mixed} value The new value of the property
     */
    'change',
    /**
     * @event destroy
     * Fired when this object is {@link #destroy}ed
     */
    'destroy',
    /**
     * @event meta
     * Fired when a property is exposed
     * @param {String} property The name of the property
     * @param {Object} data Hash containing the property's new meta description
     */
    'meta'
    /**
     * @event change_(prop)
     * <var>x</var> is {@link #set}
     */
   );
};

Ext.extend(SerializableObject, Ext.util.Observable, {
  /**
   * getId
   * Gets this object's global id
   * @return {String} id
   */
  getId: function() {
    if(this.id) {
      return this.id;
    } else {
      this.id = App.nextId();
      return this.id; 
    }
  },
  
  /**
   * serialize
   * Traverses this object's properties which have been {@link #expose}d as serializable, and returns an object
   * literal containing a hash of each of the properties, serialized by {@link Workspace.Components.serialize}. 
   * @param {Boolean} isChild true to serialize this object as a reference (ie: don't copy any of its properties; just
   * save its id and wtype). 
   * @return {Object} serialized An object literal containing each of the serialized properties
   */
  serialize: function(isChild) {
    isChild = isChild || false;
    
    var out = { wtype: this.wtype, id: this.getId() };
    if(!isChild) { 
      var o;
      for(var prop in this._serializable) {
        o = this.get(prop);
        o = Workspace.Components.serialize(o,true);
        out[prop] = o;
      }
    } else {
      out.isReference = true;
    }
    return out;
  },
  // deprecated
  deserialize: function(obj) {
    for(var prop in obj) {
      this.set(prop,Workspace.Utils.deserialize(obj[prop]));
    }
  },
  /**
   * exposeAll
   * Exposes all keys in a given object hash as properties of this object
   * @param {Object} properties A hash containing as keys the properties to be exposed
   */
  exposeAll: function(obj) {
    for(var prop in obj) {
      this.expose(prop,true,true,true,true);
    }
  },
  /**
   * expose
   * Marks a property as readable with {@link #get} and/or writeable with {@link #set} and/or serializable with {@link #serialize}.
   * @param {String} prop The name of the property to be exposed. This is the name that will be passed to {@link #get} and 
   * {@link #set}, but does not need to be an actual member property of this object, as long as a function or method is passed
   * to readable and/or writeable
   * @param {Boolean/Function/String} readable (Optional) true to mark <var>prop</var> as readable, false to mark as unreadable. A function
   * or method name can be passed which will be invoked in the context of this object and will serve as an accessor; otherwise an
   * accessor function will be generated which will return <var>this[prop]</var>. Defaults to false.
   * @param {Boolean/Function/String} writeable (Optional) true to mark <var>prop</var> as writeable, false to mark as unwriteable. A function
   * or method name can be passed which will be invoked in the context of this object and will serve as an accessor; otherwise an
   * accessor function will be generated which will set <var>this[prop]</var> to the passed value. Defaults to false.
   * @param {Boolean} serializable (Optional) true to include this property in serialized objects, false not to include it. The value serialized
   * will be the value returned by {@link #get}, passed through {@link Workspace.Components.serialize}.
   * @param {Boolean} user (Optional) true to mark as a user-defined property; false to mark as a system property. (Defaults to false)
   */
  expose: function(prop, readable, writeable, serializable, user) {
    readable = readable || false;
    writeable = writeable || false;
    serializable = (serializable !== false);
    user = user || false;
    
    if(readable) {
      readable = (Ext.isFunction(readable) ? readable : 
             (Ext.isFunction(this[readable]) ? this[readable] : readable));
      if(Ext.isFunction(readable)) {
        this._readable[prop] = readable; //readable.createDelegate(this);
      } else {
        this._readable[prop] = this._makeGetter(prop);
      }
    }
    if(writeable) {
      writeable = (Ext.isFunction(writeable) ? writeable : 
             (Ext.isFunction(this[writeable]) ? this[writeable] : writeable));
      if(Ext.isFunction(writeable)) {
        this._writeable[prop] = writeable; //writeable.createDelegate(this);
      } else {
        this._writeable[prop] = this._makeSetter(prop);
      }
    }
    if(serializable) {
      this._serializable[prop] = true;
    }
    if(user) {
      this._userProperties[prop] = true;
    }
    
    this.fireEvent('meta',prop,{readable: readable, writeable: writeable, serializable: serializable, user: user});
  },
  
  /**
   * _makeGetter
   * Creates a getter function which returns <var>this[property]</var> 
   * @private
   * @param {String} property
   * @return {Function} getter
   */
  _makeGetter: function(property) {
    return (function(prop) { return this[prop]; }).createDelegate(this,[property],true);
  },
  /**
   * _makeGetter
   * Creates a getter function which sets <var>this[property]</var> to the passed <var>value</var> 
   * @private
   * @param {@String} property
   * @return {Function} setter
   */
  _makeSetter: function(property) {
    return (function(value,prop) { this[prop] = value; }).createDelegate(this,[property],true);
  },
  
  /**
   * get
   * Returns the given property {@link #expose}d by this object, if that property is readable.
   * @param {String} property
   * @return {Mixed} value The value returned by invoking this property's accessor
   */
  get: function(property) {
    return (this._readable[property] ? this._readable[property].apply(this,Array.prototype.slice.call(arguments,1)) : false);
  },
  
  /**
   * has
   * Reports whether this object {@link #expose}s the given property as readable.
   * @param {String} property
   * @return {Boolean} readable True if the property can be accessed by {@link #get}, false if it cannot.
   */
  has: function(property) {
    return (this._readable[property] ? true : false);
  },
  
  /**
   * set
   * Sets the given property to the given value, if the property is writeable. Fires the 'change' event, as well as
   * change_(property). See {@link #change_*}
   * @param {String} property The property to write to
   * @param {Mixed} value The value to write
   */
  set: function(property,value) {
    if(this._writeable[property]) {
      this._writeable[property].apply(this,Array.prototype.slice.call(arguments,1));
    }
    this.fireEvent('change',property,value,this);
    this.fireEvent('change_'+property,value,this);
  },
  
  realize: function() {
    // vestigial
    
  },
  
  /**
   * onChange
   * Sets an event listener to watch for changes to a given property
   * @param {String} property The property to watch
   */
   onChange: function() {
     this.on.apply(this,['change_'+arguments[0]].concat(Array.prototype.slice.call(arguments,1)))
   },
   
  /**
   * destroy
   * Destroys the object. Fires the {@link #destroy} event
   */
  destroy: function() {
    this.fireEvent('destroy',this);
  }
});


Ext.override(Ext.util.MixedCollection,{
  /**
   * serialize
   * See {@link SerializeableObject#serialize}
   */
  serialize: function(isChild) {
    isChild = isChild || false;
    var result = false;
    if(this.keys.length > 0) {
      result = {};
      this.eachKey(function(key,value) {
        result[key] = Workspace.Components.serialize(value,isChild);
      })
    } else {
      result = []
      this.each(function(value) {
        result.push(Workspace.Components.serialize(value,isChild));
      });
    }
    return result;
  }
})

////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * @class WorkspaceScoller
 * @extends Ext.util.Observable
 * Allows the workspace to be scrolled by hovering over the edge
 * @cfg {Workspace} Workspace
 * @cfg {String} side One of: 'top','bottom','left', or 'right
 */

var WorkspaceScroller = function(cfg) {
  WorkspaceScroller.superclass.constructor.apply(this,arguments);
  Ext.apply(this,cfg);
}

Ext.extend(WorkspaceScroller,Ext.util.Observable,{
  side: 'top',
  threshold: 20,
  delay: 1500,
  velocity: 20,
  animate: true,
  interval: 100,
  render: function() {
    this.element = Ext.get(Ext.DomHelper.append(document.body,{
      tagName: 'div',
      cls: 'scroller'
    }));
	this.element.unselectable();
    this.element.position('absolute');
    this.element.on('mouseover',this.mouseover,this);
    this.element.on('mouseout',this.mouseout,this);
    this.onResize();
    this.workspace.on('bodyresize',this.onResize,this);
  },
  onResize: function() {
    var el = this.workspace.getContainerEl();
    switch(this.side) {
      case 'top':
        this.element.setWidth(el.getWidth());
        this.element.setHeight(this.threshold);
        this.element.alignTo(el,'tl-tl');
        break;
      case 'bottom':
        this.element.setWidth(el.getWidth());
        this.element.setHeight(this.threshold);
        this.element.alignTo(el,'bl-bl');
        break;
      case 'left':
        this.element.setWidth(this.threshold);
        this.element.setHeight(el.getHeight());
        this.element.alignTo(el,'tl-tl');
        break;
      case 'right':
        this.element.setWidth(this.threshold);
        this.element.setHeight(el.getHeight());
        this.element.alignTo(el,'tr-tr');
        break;
    }
  },
  mouseover: function() {
    this.delayTask = new Ext.util.DelayedTask(this.startScroll,this);
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
    var scrolled = this.workspace.getEl().scroll(this.side,this.velocity,this.animate);
    // if not scrolled, expand workspace
  },
  mouseout: function() {
    if(this.delayTask) {
      this.delayTask.cancel();
      delete this.delayTask;
    }
    if(this.scrollRunner) {
      this.scrollRunner.stopAll();
    }
  },
  getEl: function() {
    return this.element;
  }
})

////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * @class Workspace
 * @extends SerializableObject
 * Manages the Workspace area, {@link WorkspaceTool}s, saving and loading {@link WorkspaceObject}s
 * @constructor
 * @param {Ext.Element} element The HTML element to which to render this Workspace
 * @param {Object} config Configuration properties
 */
var Workspace = function(containerEl, config) {
	Workspace.superclass.constructor.call(this);

	Ext.apply(this,config,{
	  /**
	   * @cfg id
	   * The workspace's global id
	   */
		id: App.nextId(),
		tools: [],
		scrollParams: {
		  hthresh: 50,
		  vthresh: 50,
		  frequency: 1000
		}
	});
	
	this.containerEl = containerEl; 
	
	this.element = Ext.get(Ext.DomHelper.append(containerEl,{
		tagName: 'div'
	}));
	
	// Initialize vector layer
	this.paper = Raphael(this.element.id);
	
	// not implemented
	/*
	// Initialize scrolling behavior
	this.scrollers = [
	 new WorkspaceScroller({ workspace: this, side: 'top' }),
	 new WorkspaceScroller({ workspace: this, side: 'right' }),
	 new WorkspaceScroller({ workspace: this, side: 'bottom' }),
	 new WorkspaceScroller({ workspace: this, side: 'left' }),
	];
	*/
	
	// Cache objects to be constructed later
	this._objects = this.objects || {};
	
	/**
	 * Objects in the workspace
	 * @type Ext.util.MixedCollection
	 * @property objects
	 */
	this.objects = new Ext.util.MixedCollection();
  /**
   * Currently selected objects in the workspace
   * @type Ext.util.MixedCollection
   * @property selection
   */
	this.selection = new Ext.util.MixedCollection();
	
	// Set up tools
	this.activeTool = 'pointer';
	var tools = {}, toolName;
	if (this.tools.length == 0) {
		var allTools = Workspace.Tools.getAllTools();
		for (var toolName in allTools) {
			tools[toolName] = Workspace.Tools.getNewTool(toolName, this);
		}
	}
	else {
		for (var i = 0, l = this.tools.length; i < l; i++) {
			toolName = this.tools[i]
			tools[toolName] = Workspace.Tools.getNewTool(toolName, this);
		}
	}
	 /**
   * Tools that can be activated in the workspace
   * @type Object
   * @property tools
   */

	this.tools = tools;
	this.getActiveTool().activate();
	
	
	// Set up events to pass to tools
	this.addEvents('click','dblclick','mousedown','mouseup','mousemove','select','unselect','toolchange');
	this.element.on('click', this.click, this, false);
	this.element.on('dblclick', this.dblclick, this, false);
	this.element.on('mousedown', this.mousedown, this, false);
	this.element.on('mouseup', this.mouseup, this, false);
	this.element.on('mousemove', this.mousemove, this, false);
	
	this.expose('objects',true,true,false); // false to manually serialize this.objects
	this.expose('width',true,true);
	this.expose('height',true,true);
	
	this.on('change_width',this.onResize,this);
	this.on('change_height',this.onResize,this);
	
	this.initialize.defer(1,this);
};

Ext.extend(Workspace, SerializableObject, {//Ext.util.Observable, {
	wtype: 'Workspace',
	
	/**
	 * register
	 * Adds the passed object to this workspace's {@link #objects} property
	 * @param {WorkspaceObject} item
	 */
	register: function(item) {
		if(item.id) {
			this.objects.add(item.id,item);	
		} else {
			var id = App.nextId();
			item.id = id;
			this.objects.add(id,item);
		}
		return item.id;
	},
	/**
   * unregister
   * Removes object with the passed id from this workspace's {@link #objects} property
   * @param {String} id
   */
	unregister: function(id) {
		this.objects.removeKey(id);
	},
	/**
	 * getObjectById
	 * @param {String} id
	 * @return {WorkspaceObject} object
	 */
	getObjectById: function(id) {
	  return this.objects.get(id);
	},
	/**
	 * serialize
	 * Serializes the workspace. Override required to manually serialize objects
	 * @see Workspace.Components#serialize
	 */
	serialize: function() {
	  var o = Workspace.superclass.serialize.apply(this,arguments);
	  o.objects = this.objects.serialize(false);
	  return o;
	},
	/**
	 * initialize
	 * Deserializes, initializes, and renders serialized objects specified in the config
	 * Called automatically by the constructor; should not be invoked by application code.
	 * @private
	 */
	initialize: function() {
	  this.createObjects(this._objects);
	  this.fireEvent('afterload',this);
	  this.render.defer(1,this);
	},
	
	/**
	 * @private
	 */
	render: function() {
		// not implemented
		//Ext.each(this.scrollers,function(s){ s.render(); });
		if(!this.width) {
			var width = this.getContainerEl().getWidth(),
				height = this.getContainerEl().getHeight();
			this.resize(width,height);
		} else {
			this.onResize();
		}
	},
	/**
	 * buildObject
	 * Instantiates the provided object and registers with Workspace.Components. Called by {@link #createObject} and {@link #createObjects}; don't call directly.
	 * @private
	 * @param {Function} objectClass Constructor to which <var>config</var> should be passed. May be omitted if <var>config</var> contains a registered wtype.
	 * @param {Object} config Object containing configuration parameters
	 * @return {SerializableObject} object
	 */
	buildObject: function() {
    var objectClass,cfg;
    
    // overloaded signature
    if(arguments.length == 1) {
      cfg = arguments[0];
    } else if(arguments.length == 2 && Ext.isFunction(arguments[0])) {
      objectClass = arguments[0];
      cfg = arguments[1];
    }
    // make sure instantiated objects have workspace reference
    Ext.applyIf(cfg,{ workspace: this });
    
    // apply appropriate signature of Workspace.Components.create() to match this function's call signature
    if(objectClass) {
      obj = Workspace.Components.create(objectClass,cfg);
    } else {
      obj = Workspace.Components.create(cfg);
    }
    return obj;
  },
	
	/**
   * createObjects
   * Instantiates, initializes, and renders the given objects. This method and {@link #createObject} are the preferred ways to add objects to the workspace
   * @param {Object[]/Object} configs An array or hash of configuration objects. Each element in <var>configs</var> must have a registered wtype!
   * @return {WorkspaceObject[]} objects
   */
	createObjects: function(objects) {
	  var newObjects = [], obj;
	  
	  // instantiate objects from array
	  if(Ext.isArray(objects)) {
	    for(var i=0,l=object.length;i<l;i++) {
        obj = this.buildObject(objects[i]);
		newObjects.push(obj);
		this.fireEvent('instantiate',obj);
		
      }
    // or instantiate objects from object hash
	  } else if(Ext.isObject(objects)) {
  	  for(var id in this._objects) {
        obj = this.buildObject(this._objects[id])
		newObjects.push(obj);
		this.fireEvent('instantiate',obj);
      }
    }
    
    // if objects were successfully created
    if(newObjects.length > 0) {
      // initialize objects
      for(var i=0,l=newObjects.length;i<l;i++) {
        obj = newObjects[i];
        obj.initialize();
      }
      
      // render objects, register in this.objects, fire 'create' event
      for(var i=0,l=newObjects.length;i<l;i++) {
        obj = newObjects[i];
        obj.render();
        obj.realize();
        this.register(obj);
        this.fireEvent('create',obj);
      }
    }
	},
	
	
	/**
	 * createObject
   * Instantiates, initializes, and renders the given objects. This method and {@link #createObjects} are the preferred ways to add objects to the workspace
   * @param {Function} objectClass Constructor to which <var>config</var> should be passed. May be omitted if <var>config</var> contains a registered wtype.
   * @param {Object} config Object containing configuration parameters
   * @return {SerializableObject} object
	 */
	createObject: function(objectClass, config){
		// instantiate object
		var obj = this.buildObject.apply(this, arguments);
		this.fireEvent('instantiate',obj);
		
		// initialize, render, and register object; fire create event
		if (obj) {
			obj.initialize();
			obj.render();
			obj.realize();
			this.register(obj);
			this.fireEvent('create', obj);
			return obj;
		}
		else {
			return false;
		}
	},
	
	/**
	 * deleteObjects
	 * Removes the provided objects from the workspace; fires the {@link destroy} event for each object
	 * @param {WorkspaceObject[]/WorkspaceObject} objects Object or array of objects to remove
	 */
	deleteObjects: function(objects) {
		if(Ext.isArray(objects)) {
			for(var i=0,l=object.length; i<l; i++) {
				this.unselect(objects[i]);
				objects[i].destroy();
				this.unregister(objects[i].getId());
				this.fireEvent('destroy',objects[i]);
			}
		} else {
			this.unselect(objects);
			objects.destroy();
			this.unregister(objects.getId());	
			this.fireEvent('destroy',objects[i]);
		}
	},
	
	/**
	 * edit
	 * Begin editing an item by setting the active tool to the object's {@link WorkspaceObject#editor} and attaching the tool to that object
	 * @param {WorkspaceObject} item
	 */
	edit: function(item) {
		this.editingItem = item;
		item.setState('editing',true);
		if(item.editor && this.hasTool(item.editor)) {
			this.changeTool(item.editor);
			this.getActiveTool().attach(item);
		}	
	},
	/**
	 * endEdit
	 * Ends editing of an item by detaching the editing tool and returning to the default tool. 
	 */
	endEdit: function() {
		if (this.editingItem) {
		  this.getActiveTool().detach();
			this.editingItem.setState('editing', false);
			this.editingItem = false;
		}
		this.changeTool('pointer');	
	},
	
	/**
	 * setSelection
	 * Selects the passed items and deselects everything else
	 * @param {WorkspaceObjects[]} items Objects to select
	 */
	'setSelection': function(items) {
	  if(Ext.type(items)=='array') {
	    this.unselect();
	    this.select(items);
	  }
	},
	/**
	 * select
	 * Selects the given items. Automatically unselects any ancestors or descendents.
	 * @param {WorkspaceObject/WorkspaceObjects[]} items Object or array of objects to select
	 */
	'select': function(items) {
		if(Ext.type(items)=='array') {
			var selection = this.selection;
			Ext.each(items,function(item) {
				if(item.isSelectable) {
				  item.unselectAncestors();
          item.unselectDescendents();
					
					this.selection.add(item.getId(),item);
					item.setState('selected',true);
					item.fireEvent('select',item);
					this.fireEvent('select',item);
				}
			},this);
		} else if(Ext.isFunction(items.getId)) {
			var item = items;
			if(item.isSelectable) {
			  item.unselectAncestors();
        item.unselectDescendents();
				
				this.selection.add(item.getId(), item);
				item.setState('selected',true);
				item.fireEvent('select',item);
				this.fireEvent('select',item);
			}
		}
		
	},
	
	/**
	 * unselect
	 * Unselects the given items, or all items if no items are passed.
   * @param {WorkspaceObject/WorkspaceObjects[]} items Object or array of objects to select (Optional)
	 */
	unselect: function(items) {
		if(items) {
		  // array passed; deselect each
			if(Ext.type(items)=='array') {
				var selection = this.selection;
				Ext.each(items,function(item) {
					selection.remove(item.getId());
					item.setState('selected',false);
					item.fireEvent('unselect',item);
					this.fireEvent('unselect',item);
				},this);
			
			// one item passed; deselect it
			} else if(Ext.isFunction(items.getId)) {
				var item = items;
				this.selection.remove(item.getId());
				item.setState('selected',false);
				item.fireEvent('unselect',item);
				this.fireEvent('unselect',item);
			}
		
		// no objects passed; deselect all
		} else {
			this.selection.each(function(item) { 
				item.setState('selected',false); 
				item.fireEvent('unselect',item); 
				this.fireEvent('unselect',item); 
			},this);
			this.selection.clear();	
		}
		
	},
	/**
	 * deselect
	 * Alias for {@link #unselect}
	 */
	deselect: function(item) {
		this.unselect(item);	
	},
	/**
	 * hasSelection
	 * Reports whether any items are selected
	 * @return {Boolean} selected
	 */
	hasSelection: function() {
		var i = this.selection.getCount();
		return (i>0);
	},
	/**
	 * getSelection
	 * Returns an array of currently selected objects
	 * @return {WorkspaceObjects[]} selection
	 */
	getSelection: function() {
		return this.selection.getRange();
	},
	
	/**
	 * getActiveTool
	 * Returns this workspace's instances of the active tool
	 * @return {WorkspaceTool} activeTool
	 */
	getActiveTool: function() {
		return this.tools[this.activeTool];	
	},
	
	/**
	 * setActiveTool
	 * Deactivates the current tool and activates the provided tool
	 * @param {String} toolName The tool to activate
	 */
	setActiveTool: function(tool) {
		this.getActiveTool().deactivate();
		this.activeTool = tool;	
		this.getActiveTool().activate();
	},
	
	/**
	 * hasTool
	 * Reports whether the workspace contains the given tool
	 * @param {String} toolName 
	 */
	hasTool: function(tool) {
		return (this.tools[tool] != false);	
	},
	
	/**
	 * changeTool
	 * Sets the active tool to the given toolName and fires the {@link toolChange} event
	 * @param {String} toolName
	 */
	changeTool: function(tool) {
		this.setActiveTool(tool);
		this.fireEvent('toolchange');	
	},
	
	/**
	 * click
	 * Invoked when a click event occurs on the workspace canvas or on a workspace item. 
	 * Invokes the {@link WorkspaceTool#click} method of the active tool.
	 * @param {Event} e
	 * @param {WorkspaceObject} item
	 */
	click: function(e, item) {
		this.getActiveTool().click(e,(item.getId ? item : false));
	},
	
	/**
   * dblclick
   * Invoked when a double-click event occurs on the workspace canvas or on a workspace item. 
   * Invokes the {@link WorkspaceTool#dblclick} method of the active tool.
   * @param {Event} e
   * @param {WorkspaceObject} item
   */
	dblclick: function(e, item) {
		this.getActiveTool().dblclick(e,(item.getId ? item : false));
	},
	
	/**
   * mousedown
   * Invoked when a mousedown event occurs on the workspace canvas or on a workspace item. 
   * Invokes the {@link WorkspaceTool#mousedown} method of the active tool, although this behavior can be prevented
   * if a listener of the {@link mousedown} event returns false.
   * @param {Event} e
   * @param {WorkspaceObject} item
   */
  mousedown: function(e, item) {
	  // TODO: Make sure this doesn't break anything ####
		if(this.fireEvent('mousedown',e,(item.getId ? item : false))) 
		this.getActiveTool().mousedown(e,(item.getId ? item : false));
	},
	/**
   * mouseup
   * Invoked when a mouseup event occurs on the workspace canvas or on a workspace item. 
   * Invokes the {@link WorkspaceTool#mouseup} method of the active tool, although this behavior can be prevented
   * if a listener of the {@link mouseup} event returns false.
   * @param {Event} e
   * @param {WorkspaceObject} item
   */
	mouseup: function(e, item) {
		if(this.fireEvent('mouseup',e,(item.getId ? item : false))) 
		  this.getActiveTool().mouseup(e,(item.getId ? item : false));
	},
	/**
   * mouseover
   * Invoked when a mouseover event occurs on a workspace item. 
   * Invokes the {@link WorkspaceTool#mouseover} method of the active tool.
   * @param {Event} e
   * @param {WorkspaceObject} item
   */
	mouseover: function(e, item) {
		this.getActiveTool().mouseover(e,(item.getId ? item : false));
	},
	/**
   * mouseout
   * Invoked when a mouseout event occurs on a workspace item. 
   * Invokes the {@link WorkspaceTool#mouseout} method of the active tool.
   * @param {Event} e
   * @param {WorkspaceObject} item
   */
	mouseout: function(e, item) {
		this.getActiveTool().mouseover(e,(item.getId ? item : false));
	},
	
	/**
   * mousemove
   * Invoked when a mousemove event occurs on the workspace canvas or on a workspace item. 
   * Invokes the {@link WorkspaceTool#mousemove} method of the active tool although this behavior can be prevented
   * if a listener of the {@link mousemove} event returns false.
   * @param {Event} e
   * @param {WorkspaceObject} item
   */
	mousemove: function(e, item) {
		if(this.fireEvent('mousemove',e,(item.getId ? item : false)));
		  this.getActiveTool().mousemove(e,(item.getId ? item : false));
	},
	
	bodyResize: function(panel,w,h) {
	  this.fireEvent('bodyresize');
	},
	
	resize: function(w,h) {
		this.set('width',w);
		this.set('height',h);
	},
	
	expand: function(w,h) {
		w = w || 100;
		h = h || 100;
		this.set('width',this.getWidth()+w);
		this.set('height',this.getHeight()+h);
	},
	
	getWidth: function() {
		return this.get('width');
	},
	getHeight: function() {
		return this.get('height');
	},
	onResize: function() {
		this.getEl().setSize(this.getWidth(),this.getHeight());
		this.getPaper().setSize(this.getWidth(),this.getHeight());
	},
	
	
	
	/**
	 * addElement
	 * Adds an HTML element to the canvas specified by the passed DomHelper spec
	 * @param {Object} spec An Ext.DomHelper spec
	 * @returns {Ext.Element} element
	 */
	addElement: function(spec) {
		return Ext.get(Ext.DomHelper.append(this.element,spec));	
	},
	
	/**
	 * getEl
	 * Returns the workspace canvas's DOM element
	 * @return {Ext.Element} element
	 */
	getEl: function() {
	  return this.element;
	},
	
	getPaper: function() {
		return this.paper;
	},
	
	getContainerEl: function() {
		return this.containerEl;
	},
	
	/**
	 * doAction
	 * Performs the passed {@link WorkspaceAction} on this Workspace
	 * @param {WorkspaceAction} action The action to perform
	 */
	doAction: function(action) {
	  if(action.handler) {
	    action.attachTo(this);
	    action.handler.apply(action.scope);
	  }
	},
	
	destroy: function() {
	  // destroy scrollers
	  Ext.each(this.scrollers,function(s){ s.render(); });
	  
	  // destroy vector
	  
	  // unset element listeners
	}
});

/**
 * @class Workspace.Components
 * @singleton
 */
Workspace.Components = (function() {
  var types = {},
    objects = new Ext.util.MixedCollection();
  return {
    /**
     * register
     * Registers the passed <var>wtype</var> with a constructor so that objects deserialized with
     * {@link Workspace.Components#deserialize}, {@link Workspace.Components#create}, {@link Workspace#createObject}, etc.
     * may have their constructor automatically detected, similar to Ext's xtypes
     * @param {String} wtype The canonical name of this type
     * @param {Function} type The constructor function
     */
    register: function(wtype,type) {
      types[wtype] = type;
    },
    
    /**
     * get
     * Gets an object by its id. Unlike {@link Workspace#getObjectById}, this method locates an object within the entire application
     * @param {String} id
     */
    get: function(id) {
       return objects.get(id);
       // TODO: fix this
    },
    
    /**
     * has
     * Determines whether an object in the application has the given id.
     * @param {String} id
     */
    has: function(id) {
      return objects.containsKey(id);
    },
    
    /**
     * create
     * Instantiates an object of the passed class or configured wtype.
     * @param {Function} objectClass Constructor to which <var>config</var> should be passed. May be omitted if <var>config</var> contains a registered wtype.
     * @param {Object} config Object containing configuration parameters
     * @return {SerializableObject} object
     */
    create: function() {
      var config,objectClass;
      if(arguments.length == 1) {
        config = arguments[0]
        if(config && config.wtype && types[config.wtype]) {
          objectClass = types[config.wtype];
        }
      } else {
        objectClass = arguments[0];
        config = arguments[1];
      }
      
      if(config && objectClass && Ext.isFunction(objectClass)) {
        var o = new objectClass(config);
        objects.add(o.getId(),o);
        return o;
      }
      return false;
    },
    
    /**
     * realize
     * Realizes a complex object (any object with an id and a wtype) by either instantiating the object or resolving the reference.
     * That is, if an object with the given wtype and id already exists in the application, it is returned. Otherwise, an object
     * with the given wtype is instantiated using parameters in config. If the value passed to config has already been instantiated, 
     * it is returned unmodified.
     * @param {Object} config Object containing configuration parameters. Must include a registered <var>wtype</var>!
     * @return {SerializableObject} object
     */
    realize: function(o) {
      if(o.wtype) {
        if(o.getId) {
          return o;
        } else if (o.id && Workspace.Components.has(o.id)) {
          return Workspace.Components.get(o.id);
        } else {
          return Workspace.Components.create(o); 
        }
      }
    },
    
    /**
     * serialize
     * Traverses properties/elements of the passed item and serializes them. If o is an array, returns an array
     * containing the results of applying this function to every element. If o is an object, returns a hash containing
     * the results of applying this function to each value in the object. If o has its own <var>serialize</var> function,
     * (e.g. if o is a {@link SerializableObject}), returns the result of that function.
     * Note: this function still returns a Javascript Object; it does *not* encode the object to a JSON string. That
     * process is performed by Ext.encode.
     * @param {Object/Array/SerializableObject} o An object to serialize 
     * @param {Boolean} isChild true to serialize this object as a reference (ie: don't copy any of its properties; just
     * @return {Object} serialized An object literal containing each of the serialized properties
    */
    serialize: function(o, isChild) {
      // if o defines its own serialization function (ie: for higher level objects), use that
      if(o && o.serialize && Ext.isFunction(o.serialize)) {
        return o.serialize(isChild)
      }
      
      // serialize an array
      if(Ext.isArray(o)) {
        var r = [];
        for(var i=0,l=o.length;i<l;i++) {
          r.push(Workspace.Components.serialize(o[i],true));
        }
        return r;
      }
      
      // serialize a simply object hash (allow for complex objects contained in the hash)
      if(Ext.isObject(o)) {
       var r = {};
       for(var p in o) {
        r[p] = Workspace.Components.serialize(o[p],true); 
       }
       return r; 
      }
      
      // no serialization needed; Ext will take care of the .toString()s
      return o;
    },
    /**
     * deserialize
     * Deserializes an object hash serialized by {@link #serialize}.
     * Note: to deserialize complex objects, each object must contain a registered wtype.
     * Note 2: this method still accepts Javascript objects; it does not decode JSON strings. That function
     * is performed by Ext.decode.
     * @param {Object/Array} o
     */
    deserialize: function(o) {
      // if o is a javscript object
      if(Ext.isObject(o)) {
        
        // if o is a complex object, realize it by either instantiating it or populating the reference
        if(o.wtype) {
          return Workspace.Components.realize(o);
          
       // if o is a normal object, deserialize each component
        } else {
          return Workspace.Components.deserializeHash(o);
        }
      
      // if o is an array, deserialize each element
      } else if(Ext.isArray(o)) {
        return Workspace.Components.deserializeArray(o);
      
      // otherwise no deserialization needed
      } else {
        return o;  
      }  
    },
    /**
     * deserializeHash
     * @private
     */
    deserializeHash: function(o) {
      var r = {};
      for(var p in o) {
        r[p] = Workspace.Components.deserialize(o[p],true); 
      }
      return r;
    },
    /**
     * deserializeArray
     * @private
     */
    deserializeArray: function(o) {
      var r = [];
      for(var i=0,l=o.length;i<l;i++) {
        r.push(Workspace.Components.deserialize(o[i],true));
      }
      return r;
    }
  };
})();

/**
 * reg
 * Alias for {@link Workspace.Components.register}
 * @static
 */
Workspace.reg = Workspace.Components.register;

/**
 * @class Workspace.Utils
 * Contains various utility functions
 * @singleton
 */
Workspace.Utils = {
  deserialize: Workspace.Components.deserialize,
  serialize: Workspace.Components.serialize,
  /**
   * ideaColor
   * Iterates through some nice pastel colors for default idea backgrounds
   * @return {String} color
   */
  ideaColor: (function() {
    var colors = ['#FFCC99','#FFFF99','#CCFFCC','#CCFFFF','#99CCFF','#CC99FF'], colorPointer = -1;
    return function() {
      colorPointer = (colorPointer+1) % colors.length; 
      return colors[colorPointer];
    };
  })(),
  /**
   * bounds
   * Constrains a value to a minimum and/or maximum value
   * @param {Mixed} value The value to check
   * @param {Mixed} min The minimum value
   * @param {Mixed} max The maximum value
   * @return {Mixed} value The value, if between max and min, else the upper or lower bound.
   */
  bounds: function(v,min,max) {
    max = max || false;
    min = min || false;
    if(max!==false) {
      if(v > max) return max;
    }
    if(min!==false) {
      if(v < min) return min;
    }
    return v;
  },
  /**
   * getBox
   * Returns the smallest box bounding the passed set of objects
   * @param {WorkspaceObject[]} items 
   * @returns {Object} box The bounding box
   */
  getBox: function(items) {
    var bbox;
    if(items.length > 0) {
      bbox = items[0].getBox();
      var f = function(item) {
        var ibox = item.getBox();
        if(ibox.tl.x < bbox.tl.x) { bbox.tl.x = ibox.tl.x; }
        if(ibox.tl.y < bbox.tl.y) { bbox.tl.y = ibox.tl.y; }  
        if(ibox.br.x > bbox.br.x) { bbox.br.x = ibox.br.x; }
        if(ibox.br.y > bbox.br.y) { bbox.br.y = ibox.br.y; }
      };
      if(items.each) { 
        items.each(f); 
      } else {
        Ext.each(items,f);
      }
    } else {
      bbox = {
        tl: { x: 0, y: 0 },
        br: { x: 0, y: 0 }
      };
    }
    return Workspace.Utils.completeBox(bbox.tl,bbox.br);
  },
  getBBox: function(x,y,w,h) {
    return {
      x: x,
      y: y,
      width: w,
      height: h
    }
  },
  /**
   * completeBox
   * Returns a four-corner box object, given the top-left and bottom-right corners
   * @param {Object} tl
   * @param {Object} br
   */
  completeBox: function(tl,br) {
    return {
      tl: tl,
      tr: { x: br.x, y: tl.y },
      br: br,
      bl: { x: tl.x, y: br.y }
    }
  },
  
  /**
   * padBox
   * Expands the size of the box in the x and y dimensions by the given amount.
   * Padding is applied equally in all directions; that is, the top-left corner will be moved up and to the left
   * by the passed amount.
   * @param {Object} box A four-corner box object
   * @param {Number} padding The amount to pad the box
   */
  padBox: function(box, padding) {
    var dp = padding / 2;
    box.tl.x-=dp;
    box.tl.y-=dp;
    box.br.x+=dp;
    box.br.y+=dp;
    return Workspace.Utils.completeBox(box.tl,box.br);
  },
  
  /**
   * boxUnion
   * Returns the smallest box containing both of the passed four-corner boxes
   * @param {Object} bbox The first box
   * @param {Object} ibox The second box
   */
  boxUnion: function(bbox,ibox) {
    if(ibox.tl.x < bbox.tl.x) { bbox.tl.x = ibox.tl.x; }
    if(ibox.tl.y < bbox.tl.y) { bbox.tl.y = ibox.tl.y; }  
    if(ibox.br.x > bbox.br.x) { bbox.br.x = ibox.br.x; }
    if(ibox.br.y > bbox.br.y) { bbox.br.y = ibox.br.y; }
    return bbox;
  }
};

/**
 * @class WorkspaceAction
 * Encapsulates a single, un-doable change to the workspace.
 * @abstract
 * @extends Ext.Action
 */
var WorkspaceAction = function() {
  WorkspaceAction.superclass.constructor.apply(this,arguments);
}

Ext.extend(WorkspaceAction,Ext.Action,{
  
  /**
   * @cfg handler
   * The function to invoke on execution
   */
  handler: function() {},
  /**
   * getUndo
   * Gets the action which can be invoked to undo this action. This method must be called before (preferrably immediately before)
   * the action is invoked
   * @return {WorkspaceAction}
   */
  getUndo: function() {},
  /**
   * Serialized
   * Returns a serialized version of this action
   */
  serialize: function() {},
  /**
   * attachTo
   * Attaches this action to the given workspace
   * @param {Workspace} workspace
   */
  attachTo: function(workspace) {
    this.workspace = workspace;
  },
  /**
   * execute
   * Performs the action on the attached workspace.
   */
  execute: function() {
    if(this.handler) {
      this.handler.apply(this.scope);
    } else {
      WorkspaceAction.superclass.execute.apply(this,arguments); 
    }
  }
});


Workspace.Actions = {};

/**
 * @class Workspace.Actions.ChangePropertyAction
 * An action which encapsulates a change in one or more properties of a group of {@link WorkspaceObject}s
 * @extends WorkspaceAction
 * @cfg {WorkspaceObject[]} subjects The objects to modify
 * @cfg {Object} values The properties to modify
 */
Workspace.Actions.ChangePropertyAction = function(config) {
  Ext.apply(this,config)
  Workspace.Actions.ChangePropertyAction.superclass.constructor.apply(this,arguments);
  Ext.applyIf(this,{ scope: this })
};

Ext.extend(Workspace.Actions.ChangePropertyAction,WorkspaceAction,{
  wtype: 'ChangePropertyAction',
  handler: function() {
    for(var i=0, l=this.subjects.length,subject; i<l; i++) {
      subject = this.subjects[i];
      for(var key in this.values) {
        subject.set(key,this.values[key]);
      }
    }
  },
  getUndo: function() {
    var undoData = {};
    for(var i=0, l=this.subjects.length,subject; i<l; i++) {
      subject = this.subjects[i];
      for(var key in this.values) {
        undoData[key] = subject.get(key);
      }
    }
    return new Workspace.Actions.ChangePropertyAction({
      subjects: this.subjects.concat([]),
      values: undoData,
      text: 'Undo "'+this.text+'"',
      iconCls: this.iconCls,
    });
  },
  serialize: function() {
    return {
	  wtype: this.wtype,
      subjects: Workspace.Components.serialize(this.subjects),
      values: Workspace.Components.serialize(this.values)
    }
  }
});

/**
 * @class Workspace.Actions.CreateObjectAction
 * Action which encapsulates creation of one or more WorkspaceObjects
 * @extends WorkspaceAction
 * @cfg {Object[]} objects
 * Serialized workspace objects to be created
 * @constructor
 * @param {Object} config
 */
Workspace.Actions.CreateObjectAction = function(config) {
  Ext.apply(this,config)
  Workspace.Actions.CreateObjectAction.superclass.constructor.apply(this,arguments);
  Ext.applyIf(this,{ scope: this })
};

Ext.extend(Workspace.Actions.CreateObjectAction,WorkspaceAction,{
  wtype: 'CreateObjectAction',
  handler: function() {
    this.workspace.createObjects(this.objects);
  },
  getUndo: function() {
    return new Workspace.Actions.DeleteObjectAction({
      subjects: this.subjects.concat([]),
      text: 'Undo "'+this.text+'"',
      iconCls: this.iconCls
    });
  },
  serialize: function() {
    return {
	  wtype: this.wtype,
      objects: Workspace.Components.serialize(this.subjects),
    }
  }
});


/**
 * @class Workspace.Actions.DeleteObjectAction
 * Action which encapsulates deletion of one or more WorkspaceObjects
 * @extends WorkspaceAction
 * @cfg {Object[]} subjects
 * Workspace objects to be deleted
 * @constructor
 * @param {Object} config
 */
Workspace.Actions.DeleteObjectAction = function(config) {
  Ext.apply(this,config)
  Workspace.Actions.DeleteObjectAction.superclass.constructor.apply(this,arguments);
  Ext.applyIf(this,{ scope: this })
};

Ext.extend(Workspace.Actions.DeleteObjectAction,WorkspaceAction,{
  wtype: 'DeleteObjectAction',
  handler: function() {
    this.workspace.deleteObjects(this.subjects);
  },
  getUndo: function() {
    return new Workspace.Actions.CreateObjectAction({
      objects: Workspace.Components.serialize(this.subjects),
      text: 'Undo "'+this.text+'"',
      iconCls: this.iconCls
    });
  },
  serialize: function() {
    return {
	  wtype: this.wtype,		
      subjects: Workspace.Components.serialize(this.subjects)
    }
  }
});

/**
 * @class Workspace.Actions.AdoptObjectAction
 * Action which encapsulates orphaning (removing from parent) of one or more WorkspaceObjects
 * @extends WorkspaceAction
 * @cfg {Object[]} subjects
 * Workspace objects to be deleted
 * @constructor
 * @param {Object} config
 */
Workspace.Actions.AdoptObjectAction = function(config) {
  Ext.apply(this,config)
  Workspace.Actions.AdoptObjectAction.superclass.constructor.apply(this,arguments);
  Ext.applyIf(this,{ scope: this })
};

Ext.extend(Workspace.Actions.AdoptObjectAction,WorkspaceAction,{
  wtype: 'AdoptObjectAction',
  handler: function() {
    Ext.each(this.subjects,function(obj) { this.parent.adopt(obj) },this);
	if(this.parent.adjustSize) {this.parent.adjustSize()}
  },
  getUndo: function() {
    return new Workspace.Actions.OrphanObjectAction({
      objects: this.subjects.concat([]),
      text: 'Undo "'+this.text+'"',
      iconCls: this.iconCls
    });
  },
  serialize: function() {
    return {
	  wtype: this.wtype,		
	  parent: Workspace.Components.serialize(this.parent),
      subjects: Workspace.Components.serialize(this.subjects)
    }
  }
});


/**
 * @class Workspace.Actions.OrphanObjectAction
 * Action which encapsulates orphaning (removing from parent) of one or more WorkspaceObjects
 * @extends WorkspaceAction
 * @cfg {Object[]} subjects
 * Workspace objects to be deleted
 * @constructor
 * @param {Object} config
 */
Workspace.Actions.OrphanObjectAction = function(config) {
  Ext.apply(this,config)
  Workspace.Actions.OrphanObjectAction.superclass.constructor.apply(this,arguments);
  Ext.applyIf(this,{ scope: this })
};

Ext.extend(Workspace.Actions.OrphanObjectAction,WorkspaceAction,{
  wtype: 'OrphanObjectAction',
  handler: function() {
    Ext.each(this.subjects,function(obj) { obj.orphan() });
  },
  getUndo: function() {
  	// TODO: fix this
    return new Workspace.Actions.AdoptObjectAction({
      objects: this.subjects.concat([]),
      text: 'Undo "'+this.text+'"',
      iconCls: this.iconCls
    });
  },
  serialize: function() {
    return {
	  wtype: this.wtype,		
      subjects: Workspace.Components.serialize(this.subjects)
    }
  }
});

/**
 * @class Workspace.Actions.ExpandAction
 * Action which encapsulates expansion of a Workspace
 * @extends WorkspaceAction
 * @cfg {Number[]} size
 * Amount by which to expand the workspace ([xAmount,yAmount])
 * @constructor
 * @param {Object} config
 */
Workspace.Actions.ExpandAction = function(config) {
  Ext.apply(this,config,{
  	size: [400,400]
  });
  Workspace.Actions.DeleteObjectAction.superclass.constructor.apply(this,arguments);
  Ext.applyIf(this,{ scope: this })
};

Ext.extend(Workspace.Actions.ExpandAction,WorkspaceAction,{
  wtype: 'ExpandAction',
  handler: function() {
    this.workspace.expand(this.size[0],this.size[1]);
  },
  getUndo: function() {
    
    return new Workspace.Actions.ExpandAction({
	  size: [-this.size[0],-this.size[1]],
      text: 'Undo "'+this.text+'"',
      iconCls: this.iconCls
    });
  },
  serialize: function() {
    return {
	  wtype: this.wtype,
      size: this.size
    }
  }
});

/**
 * @class Workspace.Tools
 * @singleton
 * Manages registration and instantiation of {@link WorkspaceTool}s
 */
Workspace.Tools = (function() {
  var tools = {};
  return {
    /**
     * register
     * Registers a passed toolName to a {@link WorkspaceTool} constructor
     * @param {String} toolName
     * @param {Function} toolClass
     */
    register: function(toolName, toolClass) {
      tools[toolName] = toolClass;
    },
    /**
     * getToolClass
     * Returns a tool class given a toolName
     * @param {String} toolName
     */
    getToolClass: function(toolName) {
      return tools[toolName]; 
    },
    /**
     * getAllTools
     * Returns a hash containing all registered tools
     * @return {Object} tools
     */
    getAllTools: function() {
      return tools;
    },
    /**
     * getNewTool
     * Returns an instance of the given toolName, bound to the passed {@link Workspace}
     * @param {String} toolName
     * @param {Workspace} workspace
     * @param {Object} config
     */
    getNewTool: function(toolName,workspace,config) {
      var toolClass = Workspace.Tools.getToolClass(toolName);
      return new toolClass(workspace,config);
    }
  };
})();