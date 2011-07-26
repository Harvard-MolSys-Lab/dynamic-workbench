/********************************************
 * InfoMachine
 *
 * Copyright (c) 2010 Casey Grun
 *********************************************/

Ext.Loader.setPath('Workspace','client/workspace');

////////////////////////////////////////////////////////////////////////////////////////////////
/**
 * @class Workspace
 * Manages the Workspace area, {@link Workspace.tools.BaseTool}s, saving and loading {@link Workspace.objects.Object}s
 * @constructor
 * @param {Ext.Element} element The HTML element to which to render this Workspace
 * @param {Object} config Configuration properties
 */
Ext.define('Workspace', {
	wtype: 'Workspace',
	extend: 'Machine.core.Serializable',
	requires: ['Ext.core.DomHelper'],
	constructor: function(containerEl, config) {
		this.callParent([]);

		Ext.apply(this, config, {
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
		
		/**
		 * @property {Ext.Element}
		 */
		this.containerEl = containerEl;

		/**
		 * @property {Ext.Element}
		 */
		this.element = Ext.get(Ext.core.DomHelper.append(containerEl, {
			tagName: 'div',
			cls: 'workspace'
		}));

		// Initialize vector layer
		/**
		 * @property {Raphael}
		 */
		this.paper = Raphael(this.element.id);

		// Initialize drag/drop manager
		/**
		 * @property {Workspace.DDManager}
		 */
		this.ddManager = new Workspace.DDManager({
			workspace: this
		});

		// Initialize lens
		/**
		 * @property {Workspace.Lens}
		 */
		this.lens = new Workspace.Lens();

		// Cache objects to be constructed later
		this._objects = this.objects || {};

		/**
		 * Objects in the workspace
		 * @type Workspace.ObjectCollection
		 * @property objects
		 */
		this.objects = Ext.create('Workspace.objects.ObjectCollection');
		/**
		 * Currently selected objects in the workspace
		 * @type Workspace.ObjectCollection
		 * @property selection
		 */
		this.selection = Ext.create('Workspace.objects.ObjectCollection');

		// Set up tools
		this.activeTool = 'pointer';
		var tools = {},
		toolName;
		if (this.tools.length == 0) {
			var allTools = Workspace.Tools.getAllTools();
			for (var toolName in allTools) {
				tools[toolName] = Workspace.Tools.getNewTool(toolName, this);
			}
		} else {
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
		this.addEvents(
			/**
			 * @event click
			 */
			'click', 
			/**
			 * @event dblclick
			 */
			'dblclick', 
			/**
			 * @event mousedown
			 */
			 'mousedown', 
			/**
			 * @event mouseup
			 */
			 'mouseup', 
			/**
			 * @event mousemove
			 */
			 'mousemove', 
			/**
			 * @event select
			 */
			 'select', 
			/**
			 * @event unselect
			 */
			 'unselect', 
			/**
			 * @event toolchange
			 */
			 'toolchange');

		this.ignore = {
			click: false,
			dblclick: false,
			mousedown: false,
			mouseup: false,
			mousemove: false
		};

		this.expose('objects', true, true, false);
		// false to manually serialize this.objects
		this.expose('width', true, true);
		this.expose('height', true, true);

		this.on('change:width', this.onResize, this);
		this.on('change:height', this.onResize, this);

		Ext.Function.defer(this.initialize,1, this);
	},
	/**
	 * Adds the passed object to this workspace's {@link #objects} property
	 * @param {Workspace.objects.Object} item
	 */
	register: function(item) {
		if (item.id) {
			this.objects.add(item.id, item);
		} else {
			var id = App.nextId();
			item.id = id;
			this.objects.add(id, item);
		}
		return item.id;
	},
	/**
	 * Removes object with the passed id from this workspace's {@link #objects} property
	 * @param {String} id
	 */
	unregister: function(id) {
		this.objects.removeAtKey(id);
	},
	/**
	 * @param {String} id
	 * @return {Workspace.objects.Object} object
	 */
	getObjectById: function(id) {
		return this.objects.get(id);
	},
	/**
	 * Serializes the workspace. Override required to manually serialize objects
	 * @see Workspace.Components#serialize
	 */
	serialize: function(isChild) {
		if(isChild) {
			return null; //{ wtype:'Workspace', id: this.getId()};
		}
		var o = Workspace.superclass.serialize.apply(this, arguments);
		o.objects = this.objects.serialize(false);
		return o;
	},
	/**
	 * Deserializes, initializes, and renders serialized objects specified in the config
	 * Called automatically by the constructor; should not be invoked by application code.
	 * @private
	 */
	initialize: function() {
		this.createObjects(this._objects);
		this.fireEvent('afterload', this);
		Ext.Function.defer(this.render,1, this);
	},
	/**
	 * @private
	 */
	render: function() {
		// not implemented
		//Ext.each(this.scrollers,function(s){ s.render(); });
		if (!this.width) {
			var width = this.getContainerEl().getWidth(),
			height = this.getContainerEl().getHeight();
			this.resize(width, height);
		} else {
			this.onResize();
		}
		this.ddManager.render();
		this.element.on('click', this.click, this, false);
		this.element.on('dblclick', this.dblclick, this, false);
		this.element.on('mousedown', this.mousedown, this, false);
		this.element.on('mouseup', this.mouseup, this, false);
		this.element.on('mousemove', this.mousemove, this, false);
	},
	/**
	 * buildObject
	 * Instantiates the provided object and registers with {@link Workspace.Components}. Called by {@link #createObject} and {@link #createObjects}; don't call directly.
	 * @private
	 * @param {Function} objectClass Constructor to which <var>config</var> should be passed. May be omitted if <var>config</var> contains a registered wtype.
	 * @param {Object} config Object containing configuration parameters
	 * @return {SerializableObject} object
	 */
	buildObject: function() {
		var objectClass,
		cfg;

		// overloaded signature
		if (arguments.length == 1) {
			cfg = arguments[0];
		} else if (arguments.length == 2 && Ext.isFunction(arguments[0])) {
			objectClass = arguments[0];
			cfg = arguments[1];
		}
		// make sure instantiated objects have workspace reference
		Ext.apply(cfg, {
			workspace: this
		});

		// apply appropriate signature of {@link Workspace.Components#create} to match this function's call signature
		if (objectClass) {
			obj = Workspace.Components.create(objectClass, cfg);
		} else {
			obj = Workspace.Components.create(cfg);
		}
		return obj;
	},
	/**
	 * createObjects
	 * Instantiates, initializes, and renders the given objects. This method and {@link #createObject} are the preferred ways to add objects to the workspace
	 * @param {Object[]/Object} configs An array or hash of configuration objects. Each element in <var>configs</var> must have a registered wtype!
	 * @return {Workspace.Object[]} objects
	 */
	createObjects: function(objects) {
		var newObjects = [],
		obj;

		// instantiate objects from array
		if (Ext.isArray(objects)) {
			for (var i = 0, l = objects.length; i < l; i++) {
				obj = this.buildObject(objects[i]);
				if(obj) {	
					newObjects.push(obj);
					this.fireEvent('instantiate', obj);
				} else {
					throw {message: "Couldn't create object",data: objects[i]};
				}
			}
			// or instantiate objects from object hash
		} else if (Ext.isObject(objects)) {
			for (var id in this._objects) {
				obj = this.buildObject(this._objects[id])
				if(obj) {
					newObjects.push(obj);
					this.fireEvent('instantiate', obj);
				} else {
					throw {message: "Couldn't create object",data: this._objects[id]};
				}
			}
		}

		// if objects were successfully created
		if (newObjects.length > 0) {
			// initialize objects
			for (var i = 0, l = newObjects.length; i < l; i++) {
				obj = newObjects[i];
				obj.initialize();
			}

			// render objects, register in this.objects, fire 'create' event
			for (var i = 0, l = newObjects.length; i < l; i++) {
				obj = newObjects[i];
				obj.render();
				obj.realize();
				this.register(obj);
				this.fireEvent('create', obj);
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
	createObject: function(objectClass, config) {
		// instantiate object
		var obj = this.buildObject.apply(this, arguments);
		this.fireEvent('instantiate', obj);

		// initialize, render, and register object; fire create event
		if (obj) {
			obj.initialize();
			obj.render();
			obj.realize();
			this.register(obj);
			this.fireEvent('create', obj);
			return obj;
		} else {
			return false;
		}
	},
	/**
	 * Removes the provided objects from the workspace; fires the {@link #destroy} event for each object
	 * @param {Workspace.objects.Object[]/Workspace.objects.Object} objects Object or array of objects to remove
	 */
	deleteObjects: function(objects) {
		if (Ext.isArray(objects)) {
			for (var i = 0, l = objects.length; i < l; i++) {
				this.unselect(objects[i]);
				objects[i].destroy();
				this.unregister(objects[i].getId());
				this.fireEvent('destroy', objects[i]);
			}
		} else {
			this.unselect(objects);
			objects.destroy();
			this.unregister(objects.getId());
			this.fireEvent('destroy', objects[i]);
		}
	},
	/**
	 * Begin editing an item by setting the active tool to the object's {@link Workspace.objects.Object#editor} and attaching the tool to that object
	 * @param {Workspace.objects.Object} item
	 */
	edit: function(item) {
		this.editingItem = item;
		item.setState('editing', true);
		if (item.editor && this.hasTool(item.editor)) {
			this.changeTool(item.editor);
			this.getActiveTool().attach(item);
		}
	},
	/**
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
	 * Selects the passed items and deselects everything else
	 * @param {Workspace.objects.Object[]} items Objects to select
	 */
	'setSelection': function(items) {
		if (Ext.type(items) == 'array') {
			this.unselect();
			this.select(items);
		}
	},
	/**
	 * Selects the given items. Automatically unselects any ancestors or descendents.
	 * @param {Workspace.objects.Object/Workspace.objects.Object[]} items Object or array of objects to select
	 */
	'select': function(items) {
		if (Ext.type(items) == 'array') {
			var selection = this.selection;
			Ext.each(items, function(item) {
				if (item && item.isSelectable) {
					item.unselectAncestors();
					item.unselectDescendents();

					this.selection.add(item.getId(), item);
					item.setState('selected', true);
					item.fireEvent('select', item);
					this.fireEvent('select', item);
				}
			},
			this);
		} else if (Ext.isFunction(items.getId)) {
			var item = items;
			if (item && item.isSelectable) {
				item.unselectAncestors();
				item.unselectDescendents();

				this.selection.add(item.getId(), item);
				item.setState('selected', true);
				item.fireEvent('select', item);
				this.fireEvent('select', item);
			}
		}

	},
	/**
	 * Unselects the given items, or all items if no items are passed.
	 * @param {Workspace.objects.Object/Workspace.objects.Object[]} items Object or array of objects to select (Optional)
	 */
	unselect: function(items) {
		if (items) {
			// array passed; deselect each
			if (Ext.type(items) == 'array') {
				var selection = this.selection;
				Ext.each(items, function(item) {
					this.selection.removeAtKey(item.getId());
					item.setState('selected', false);
					item.fireEvent('unselect', item);
					this.fireEvent('unselect', item);
				},
				this);

				// one item passed; deselect it
			} else if (Ext.isFunction(items.getId)) {
				var item = items;
				this.selection.removeAtKey(item.getId());
				item.setState('selected', false);
				item.fireEvent('unselect', item);
				this.fireEvent('unselect', item);
			}

			// no objects passed; deselect all
		} else {
			this.selection.each( function(item) {
				item.setState('selected', false);
				item.fireEvent('unselect', item);
				this.fireEvent('unselect', item);
			},
			this);
			this.selection.clear();
		}
	},
	/**
	 * Alias for {@link #unselect}
	 */
	deselect: function(item) {
		this.unselect(item);
	},
	/**
	 * Reports whether any items are selected
	 * @return {Boolean} selected
	 */
	hasSelection: function() {
		var i = this.selection.getCount();
		return (i > 0);
	},
	/**
	 * Returns an array of currently selected objects
	 * @return {Workspace.objects.Object[]} selection
	 */
	getSelection: function() {
		return this.selection.getRange();
	},
	getSelectionWType: function() {
		return this.selection.getCommonWType();
	},
	/**
	 * Returns this workspace's instances of the active tool
	 * @return {Workspace.tools.BaseTool} activeTool
	 */
	getActiveTool: function() {
		return this.tools[this.activeTool];
	},
	/**
	 * Deactivates the current tool and activates the provided tool
	 * @param {String} toolName The tool to activate
	 */
	setActiveTool: function(tool) {
		this.getActiveTool().deactivate();
		this.activeTool = tool;
		this.getActiveTool().activate();
	},
	/**
	 * Reports whether the workspace contains the given tool
	 * @param {String} toolName
	 */
	hasTool: function(tool) {
		return (this.tools[tool] != false);
	},
	/**
	 * Sets the active tool to the given toolName and fires the {@link #toolChange} event
	 * @param {String} toolName
	 */
	changeTool: function(tool) {
		this.setActiveTool(tool);
		this.fireEvent('toolchange');
	},
	/**
	 * Finds the {@link Workspace.objects.Object} on which an event occurred
	 * @param {Event} e
	 * @return {Workspace.objects.Object} item
	 */
	getObjectFromEvent: function(item) {
		// item = e.getTarget('.workspace-object',document.body,true);
		// if(item) item = item.getAttribute('objectId');
		// if(item) item = this.getObjectById(item);
		return item ? (item.getId ? item: false) : false;
	},
	/**
	 * Invoked when a click event occurs on the workspace canvas or on a workspace item.
	 * Invokes the {@link Workspace.tools.BaseTool#click} method of the active tool.
	 * @param {Event} e
	 * @param {Workspace.objects.Object} item
	 */
	click: function(e, item) {
		item = this.getObjectFromEvent(item);
		this.getActiveTool().click(e, item);

		// if(!this.ignore.click) {
		// console.log('click: ',item);
		// this.getActiveTool().click(e, (item.getId ? item: false));
		// }
		// if(item && item.getId) this.ignore.click = !this.ignore.click;
	},
	/**
	 * dblclick
	 * Invoked when a double-click event occurs on the workspace canvas or on a workspace item.
	 * Invokes the {@link Workspace.tools.BaseTool#dblclick} method of the active tool.
	 * @param {Event} e
	 * @param {Workspace.objects.Object} item
	 */
	dblclick: function(e, item) {
		item = this.getObjectFromEvent(item);
		this.getActiveTool().dblclick(e, item);
		// if(!this.ignore.dblclick) {
		// console.log('dblclick: ',item);
		// this.getActiveTool().dblclick(e, (item.getId ? item: false));
		// }
		// if(item && item.getId) this.ignore.dblclick = !this.ignore.dblclick;

	},
	/**
	 * mousedown
	 * Invoked when a mousedown event occurs on the workspace canvas or on a workspace item.
	 * Invokes the {@link Workspace.tools.BaseTool#mousedown} method of the active tool, although this behavior can be prevented
	 * if a listener of the {@link #mousedown} event returns false.
	 * @param {Event} e
	 * @param {Workspace.objects.Object} item
	 */
	mousedown: function(e, item) {
		item = this.getObjectFromEvent(item);
		if (this.fireEvent('mousedown', e, item))
			this.getActiveTool().mousedown(e, item);

		// TODO: Make sure this doesn't break anything ####
		// if(!this.ignore.mousedown) {
		// console.log('mousedown: ',item);
		//
		// if (this.fireEvent('mousedown', e, (item.getId ? item: false)))
		// this.getActiveTool().mousedown(e, (item.getId ? item: false));
		// }
		// if(item && item.getId) this.ignore.mousedown = !this.ignore.mousedown;

	},
	/**
	 * mouseup
	 * Invoked when a mouseup event occurs on the workspace canvas or on a workspace item.
	 * Invokes the {@link Workspace.tools.BaseTool#mouseup} method of the active tool, although this behavior can be prevented
	 * if a listener of the {@link #mouseup} event returns false.
	 * @param {Event} e
	 * @param {Workspace.objects.Object} item
	 */
	mouseup: function(e, item) {
		item = this.getObjectFromEvent(item);
		if (this.fireEvent('mouseup', e, item))
			this.getActiveTool().mouseup(e, item);

		// if(!this.ignore.mouseup) {
		// console.log('mouseup: ',item);
		// if (this.fireEvent('mouseup', e, (item.getId ? item: false)))
		// this.getActiveTool().mouseup(e, (item.getId ? item: false));
		// }
		// if(item && item.getId) this.ignore.mouseup = !this.ignore.mouseup;
	},
	/**
	 * mouseover
	 * Invoked when a mouseover event occurs on a workspace item.
	 * Invokes the {@link Workspace.tools.BaseTool#mouseover} method of the active tool.
	 * @param {Event} e
	 * @param {Workspace.objects.Object} item
	 */
	mouseover: function(e, item) {
		item = this.getObjectFromEvent(item);
		this.getActiveTool().mouseover(e, item);

		// if(!this.ignore.mouseover) {
		// console.log('mouseover: ',item);
		// this.getActiveTool().mouseover(e, (item.getId ? item: false));
		// }
		// if(item && item.getId) this.ignore.mouseover = !this.ignore.mouseover;

	},
	/**
	 * mouseout
	 * Invoked when a mouseout event occurs on a workspace item.
	 * Invokes the {@link Workspace.tools.BaseTool#mouseout} method of the active tool.
	 * @param {Event} e
	 * @param {Workspace.objects.Object} item
	 */
	mouseout: function(e, item) {
		item = this.getObjectFromEvent(item);
		this.getActiveTool().mouseout(e, item);

		// if(!this.ignore.mouseout) {
		// console.log('mouseout: ',item);
		// this.getActiveTool().mouseout(e, (item.getId ? item: false));
		// }
		// if(item && item.getId) this.ignore.mouseout = !this.ignore.mouseout;
	},
	/**
	 * Invoked when a mousemove event occurs on the workspace canvas or on a workspace item.
	 * Invokes the {@link Workspace.tools.BaseTool#mousemove} method of the active tool although this behavior can be prevented
	 * if a listener of the {@link #mousemove} event returns false.
	 * @param {Event} e
	 * @param {Workspace.objects.Object} item
	 */
	mousemove: function(e, item) {
		item = this.getObjectFromEvent(item);
		if (this.fireEvent('mousemove', e, item));
		this.getActiveTool().mousemove(e, item	);

		// if(!this.ignore.mousemove) {
		// console.log('mousemove: ',item);
		// if (this.fireEvent('mousemove', e, (item.getId ? item: false)));
		// this.getActiveTool().mousemove(e, (item.getId ? item: false));
		// }
		// if(item && item.getId) this.ignore.mousemove = !this.ignore.mousemove;

	},
	/**
	 * getPath
	 * Returns the file path on the server where this workspace is stored
	 * @return {String} path
	 */
	getPath: function() {
		return this.path;
	},
	/**
	 * bodyResize
	 * Invoked by the containing {@link Workspace.ui.Canvas} when the visible area changes
	 */
	bodyResize: function(panel, w, h) {
		this.fireEvent('bodyresize');
		this.expandToVisible();
	},
	/**
	 * expandToVisible
	 * Expands the workspace to fill the space visible in its {@link #containerEl}
	 */
	expandToVisible: function() {
		var s = this.getVisibleSize(),z = this.lens.getZoom();
		if(s.width/z > this.get('width')) {
			this.set('width',s.width/z);
		}
		if(s.height/z > this.get('height')) {
			this.set('height',s.height/z);
		}
	},
	/**
	 * getVisibleSize
	 * Determines the space visible in this workspace's {@link #containerEl}
	 */
	getVisibleSize: function() {
		return {
			width: this.containerEl.getWidth(),
			height: this.containerEl.getHeight()
		};
	},
	/**
	 * getVisibleDimensions
	 * Alias for {@link #getVisibleSize}
	 */
	getVisibleDimensions: function() {
		return this.getVisibleSize();
	},
	resize: function(w, h) {
		this.set('width', w);
		this.set('height', h);
	},
	expand: function(w, h) {
		w = w || 100;
		h = h || 100;
		this.set('width', this.getWidth() + w);
		this.set('height', this.getHeight() + h);
	},
	getWidth: function() {
		return this.get('width');
	},
	getHeight: function() {
		return this.get('height');
	},
	onResize: function() {
		var z = this.lens.getZoom();
		if(z<1) {
			z = 1;
		}
		this.getEl().setSize(this.getWidth()*z, this.getHeight()*z);
		this.getPaper().setSize(this.getWidth()*z, this.getHeight()*z);
	},
	/**
	 * addElement
	 * Adds an HTML element to the canvas specified by the passed DomHelper spec
	 * @param {Object} spec An Ext.core.DomHelper spec
	 * @returns {Ext.Element} element
	 */
	addElement: function(spec) {
		return Ext.get(Ext.core.DomHelper.append(this.element, spec));
	},
	/**
	 * getEl
	 * Returns the workspace canvas's DOM element
	 * @return {Ext.Element} element
	 */
	getEl: function() {
		return this.element;
	},
	refreshEl: function() {
		this.element = Ext.get(this.element.id);
	},
	getPaper: function() {
		return this.paper;
	},
	getContainerEl: function() {
		return this.containerEl;
	},
	/**
	 * doAction
	 * Performs the passed {@link Workspace.actions.Action} on this Workspace
	 * @param {Workspace.actions.Action} action The action to perform
	 */
	doAction: function(action) {
		if (action.handler) {
			action.attachTo(this);
			action.handler.apply(action.scope);
		}
	},
	destroy: function() {
		// destroy scrollers
		Ext.each(this.scrollers, function(s) {
			s.render();
		});
		// destroy vector
		// unset element listeners
	},
	zoomTo: function(factor) {
		this.lens.setZoom(factor);
		var el = $(this.getEl().dom);
		el.scale(factor);
		this.expandToVisible();
		this.onResize();

	},
});

////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * @class Workspace.Components
 * @singleton
 * Manages creating, serializing, and deserializing objects which implement the {@link Machine.core.Serializable} pattern.
 * Stores a registry of created objects which can be accessed by ID, as well as a registry of 
 * {@link Machine.core.Serializable#wtype}s. 
 */
Workspace.Components = (function() {
	var types = {},
	objects = new Ext.util.MixedCollection(),
	typeStore = Ext.create('Ext.data.ArrayStore', {
		fields: [{
			name: 'wtype',
			type:'string'
		},{
			name: 'name',
			type:'string'
		},{
			name: 'iconCls',
			type:'string'
		},
		],
		data: [],
	});

	return {
		/**
		 * Registers the passed <var>wtype</var> with a constructor so that objects deserialized with
		 * {@link Workspace.Components#deserialize}, {@link Workspace.Components#create}, {@link Workspace#createObject}, etc.
		 * may have their constructor automatically detected, similar to Ext's xtypes
		 * @param {String} wtype The canonical name of this type
		 * @param {Function} type The constructor function
		 */
		register: function(wtype, type) {
			type.prototype.wtype = wtype;
			type.wtype = wtype;
			types[wtype] = type;
			var rec = {
				wtype: wtype
			};
			if(type.prototype) {
				if(type.prototype.iconCls) {
					rec.iconCls = type.prototype.iconCls;
				}
			}
			typeStore.add(rec);
		},
		/**
		 * getType
		 * Returns the class corresponding to the passed wtype
		 * @param {String} wtype The mneumonic name of the type to lookup
		 */
		getType: function(wtype) {
			return types[wtype];
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
			var config,
			objectClass;
			if (arguments.length == 1) {
				config = arguments[0]
				if (config && config.wtype && types[config.wtype]) {
					objectClass = types[config.wtype];
				}
			} else {
				objectClass = arguments[0];
				config = arguments[1];
			}

			if (config && objectClass && Ext.isFunction(objectClass)) {
				var o = new objectClass(config);
				objects.add(o.getId(), o);
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
			if (o.wtype) {
				if (o.getId) {
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
		 * (e.g. if o is a {@link Machine.core.Serializable}), returns the result of that function.
		 * Note: this function still returns a Javascript Object; it does *not* encode the object to a JSON string. That
		 * process is performed by Ext.encode.
		 * @param {Object/Array/Machine.core.Serializable} o An object to serialize
		 * @param {Boolean} isChild true to serialize this object as a reference (ie: don't copy any of its properties; just
		 * @return {Object} serialized An object literal containing each of the serialized properties
		 */
		serialize: function(o, isChild) {
			// if o defines its own serialization function (ie: for higher level objects), use that
			if (o && o.serialize && Ext.isFunction(o.serialize)) {
				return o.serialize(isChild)
			}

			// serialize an array
			if (Ext.isArray(o)) {
				var r = [];
				for (var i = 0, l = o.length; i < l; i++) {
					r.push(Workspace.Components.serialize(o[i], true));
				}
				return r;
			}

			// serialize a simply object hash (allow for complex objects contained in the hash)
			if (Ext.isObject(o)) {
				var r = {};
				for (var p in o) {
					r[p] = Workspace.Components.serialize(o[p], true);
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
			if (Ext.isObject(o)) {

				// if o is a complex object, realize it by either instantiating it or populating the reference
				if (o.wtype) {
					return Workspace.Components.realize(o);

					// if o is a normal object, deserialize each component
				} else {
					return Workspace.Components.deserializeHash(o);
				}

				// if o is an array, deserialize each element
			} else if (Ext.isArray(o)) {
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
			for (var p in o) {
				r[p] = Workspace.Components.deserialize(o[p], true);
			}
			return r;
		},
		/**
		 * deserializeArray
		 * @private
		 */
		deserializeArray: function(o) {
			var r = [];
			for (var i = 0, l = o.length; i < l; i++) {
				r.push(Workspace.Components.deserialize(o[i], true));
			}
			return r;
		},
		getTypeStore: function() {
			return typeStore;
		},
		defaultType: 'SerializableObject',

		isWType: function(o,wtype) {
			if(Ext.isString(o)) {
				if(this.has(o)) {
					if(o==wtype) {
						return true;
					}
					var t = this.getType(o);
					do {
						if(t && t.prototype && t.prototype.superclass) {
							t = t.prototype.superclass.constructor;
						} else {
							break;
						}
					} while(t.wtype!=wtype)
					return t && t.wtype && (t.wtype == wtype);
				}
			} else if(Ext.isFunction(o.isWType)) {
				return o.isWType(wtype);
			}
		},
	};
})();
/**
 * reg
 * Alias for {@link Workspace.Components.register}
 * @static
 */
Workspace.reg = Workspace.Components.register;

////////////////////////////////////////////////////////////////////////////////////////////////

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
		var colors = ['#FFCC99', '#FFFF99', '#CCFFCC', '#CCFFFF', '#99CCFF', '#CC99FF'],
		colorPointer = -1;
		return function() {
			colorPointer = (colorPointer + 1) % colors.length;
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
	bounds: function(v, min, max) {
		max = max || false;
		min = min || false;
		if (max !== false) {
			if (v > max)
				return max;
		}
		if (min !== false) {
			if (v < min)
				return min;
		}
		return v;
	},
	/**
	 * getBox
	 * Returns the smallest box bounding the passed set of objects
	 * @param {Workspace.objects.Object[]} items
	 * @returns {Object} box The bounding box
	 */
	getBox: function(items) {
		var bbox;
		if (items.length > 0) {
			bbox = items[0].getBox();
			var f = function(item) {
				var ibox = item.getBox();
				if (ibox.tl.x < bbox.tl.x) {
					bbox.tl.x = ibox.tl.x;
				}
				if (ibox.tl.y < bbox.tl.y) {
					bbox.tl.y = ibox.tl.y;
				}
				if (ibox.br.x > bbox.br.x) {
					bbox.br.x = ibox.br.x;
				}
				if (ibox.br.y > bbox.br.y) {
					bbox.br.y = ibox.br.y;
				}
			};
			if (items.each) {
				items.each(f);
			} else {
				Ext.each(items, f);
			}
		} else {
			bbox = {
				tl: {
					x: 0,
					y: 0
				},
				br: {
					x: 0,
					y: 0
				}
			};
		}
		return Workspace.Utils.completeBox(bbox.tl, bbox.br);
	},
	getBBox: function(x, y, w, h) {
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
	completeBox: function(tl, br) {
		return {
			tl: tl,
			tr: {
				x: br.x,
				y: tl.y
			},
			br: br,
			bl: {
				x: tl.x,
				y: br.y
			}
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
		box.tl.x -= dp;
		box.tl.y -= dp;
		box.br.x += dp;
		box.br.y += dp;
		return Workspace.Utils.completeBox(box.tl, box.br);
	},
	/**
	 * boxUnion
	 * Returns the smallest box containing both of the passed four-corner boxes
	 * @param {Object} bbox The first box
	 * @param {Object} ibox The second box
	 */
	boxUnion: function(bbox, ibox) {
		if (ibox.tl.x < bbox.tl.x) {
			bbox.tl.x = ibox.tl.x;
		}
		if (ibox.tl.y < bbox.tl.y) {
			bbox.tl.y = ibox.tl.y;
		}
		if (ibox.br.x > bbox.br.x) {
			bbox.br.x = ibox.br.x;
		}
		if (ibox.br.y > bbox.br.y) {
			bbox.br.y = ibox.br.y;
		}
		return bbox;
	}
};

////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * @class Workspace.FileUploader
 * Manages uploading a file and building an appropriate embedded object
 */
Ext.define('Workspace.FileUploader', {
	alias: 'WorkspaceFileUploader',
	extend: 'App.ui.FileUploader',
	showThrobber: function() {
		this.throbber = this.workspace.addElement({
			tag: 'div',
			cls: 'file-upload-throbber'
		});
		this.throbber.setLeftTop(this.position.x,this.position.y);
	},
	hideThrobber: function() {
		if(this.throbber) {
			this.throbber.hide();
		}
	},
},function() {
	Workspace.FileUploader.addHandler(['jpg','png','gif'], function(fileName) {
		this.workspace.createObject({
			wtype: 'Workspace.objects.ImageObject',
			url: fileName,
			x: this.position.x,
			y: this.position.y
		});
		this.hideThrobber();
	});
	Workspace.FileUploader.addHandler(['pdf','doc','docx','ppt','pptx','xls','xlsx'], function(fileName) {
		this.workspace.createObject({
			wtype: 'Workspace.objects.PDFEmbedObject',
			url: fileName,
			x: this.position.x,
			y: this.position.y
		});
		this.hideThrobber();
	});

});


////////////////////////////////////////////////////////////////////////////////////////////////
/**
 * @class Workspace.DDManager
 * @extends Ext.util.Observable
 * Manages drop actions on the workspace
 * @cfg {Workspace} workspace
 */
Ext.define('Workspace.DDManager',{
	extend: 'App.ui.DragDropManager',
	alias: 'WorkspaceDDManager',
	allowExtDD: true,
	fileHandler: function(files,e) {
		var pos = this.getAdjustedXYcoords(e.pageX,e.pageY), 
		uh = this.getUploadHandler();
		Ext.each(files, function(file) {
			var id = uh.add(file),
			uploader = new Workspace.FileUploader({
				workspace: this.workspace,
				manager: this,
				fileId: id,
				position: pos
			});
			this.fileUploaders[id] = uploader;
			uh.upload(id, {
				userfile:App.Path.join([App.Path.pop(this.workspace.getPath(),1),uh.getName(id)])
			});
			uploader.showThrobber();
		},this);
	},
	getEl: function() {
		return this.workspace.getEl();
	},
},function() {
	Workspace.DDManager.addHandler('text/plain', function(data,e) {
		var pos = this.getAdjustedXYcoords(e.pageX,e.pageY),
		obj = this.workspace.createObject(Workspace.RichTextObject, {
			text: data,
			x: pos.x,
			y: pos.y
		});
		obj.sizeToFit();
	});
	Workspace.DDManager.addHandler('text/html', function(data,e) {
		var pos = this.getAdjustedXYcoords(e.pageX,e.pageY),
		obj = this.workspace.createObject(Workspace.RichTextObject, {
			text: data,
			x: pos.x,
			y: pos.y
		});
		obj.sizeToFit();
	});
	Workspace.DDManager.addHandler('text/uri-list', function(data,e) {
		var pos = this.getAdjustedXYcoords(e.pageX,e.pageY), obj;
		if(data.match(Workspace.EmbedObject.regex)) {
			obj = this.workspace.createObject(Workspace.EmbedObject, {
				url: data,
				x: pos.x,
				y: pos.y
			});
		} else {
			obj = this.workspace.createObject(Workspace.IFrameObject, {
				url: data,
				x: pos.x,
				y: pos.y
			});
		}
	});
})


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

/**
 * @class Workspace.actions.Action
 * Encapsulates a single, un-doable change to the workspace.
 * @abstract
 * @extends Ext.Action
 */
Ext.define('Workspace.actions.Action', {
	alias: 'WorkspaceAction',
	extend:'Ext.Action',
	constructor: function(config) {
		Workspace.actions.Action.superclass.constructor.apply(this, arguments);
		Ext.apply(this,config);
	},
	/**
	 * @cfg handler
	 * The function to invoke on execution
	 */
	handler: function() {
	},
	/**
	 * getUndo
	 * Gets the action which can be invoked to undo this action. This method must be called before (preferrably immediately before)
	 * the action is invoked
	 * @return {Workspace.actions.Action}
	 */
	getUndo: function() {
	},
	/**
	 * Serialized
	 * Returns a serialized version of this action
	 */
	serialize: function() {
	},
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
		if (this.handler) {
			this.handler.apply(this.scope);
		} else {
			Workspace.actions.Action.superclass.execute.apply(this, arguments);
		}
	}
});

/**
 * @class Workspace.actions.ChangePropertyAction
 * An action which encapsulates a change in one or more properties of a group of {@link Workspace.objects.Object}s
 * @extends Workspace.actions.Action
 * @cfg {Workspace.objects.Object[]} subjects The objects to modify
 * @cfg {Object} values The properties to modify
 */
Ext.define('Workspace.actions.ChangePropertyAction', {
	extend: 'Workspace.actions.Action',
	constructor: function(config) {
		Workspace.actions.ChangePropertyAction.superclass.constructor.apply(this, arguments);
		Ext.applyIf(this, {
			scope: this
		})
	},
	wtype: 'ChangePropertyAction',
	handler: function() {
		for (var i = 0, l = this.subjects.length, subject; i < l; i++) {
			subject = this.subjects[i];
			for (var key in this.values) {
				subject.set(key, this.values[key]);
			}
		}
	},
	getUndo: function() {
		var undoData = {};
		for (var i = 0, l = this.subjects.length, subject; i < l; i++) {
			subject = this.subjects[i];
			for (var key in this.values) {
				undoData[key] = subject.get(key);
			}
		}
		return new Workspace.actions.ChangePropertyAction({
			subjects: this.subjects.concat([]),
			values: undoData,
			text: 'Undo "' + this.text + '"',
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
 * @class Workspace.actions.CreateObjectAction
 * Action which encapsulates creation of one or more {@link Workspace.objects.Object}s
 * @extends Workspace.actions.Action
 * @cfg {Object[]} objects
 * Serialized workspace objects to be created
 * @constructor
 * @param {Object} config
 * @cfg {Object[]} objects An array of {@link Workspace.objects.Object} configs
 */
Ext.define('Workspace.actions.CreateObjectAction', {
	extend: 'Workspace.actions.Action',
	constructor: function(config) {
		Workspace.actions.CreateObjectAction.superclass.constructor.apply(this, arguments);
		Ext.applyIf(this, {
			scope: this
		})
	},
	wtype: 'CreateObjectAction',
	handler: function() {
		this.workspace.createObjects(this.objects);
	},
	getUndo: function() {
		return new Workspace.actions.DeleteObjectAction({
			subjects: this.subjects.concat([]),
			text: 'Undo "' + this.text + '"',
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
 * @class Workspace.actions.DuplicateObjectAction
 * Action which encapsulates creation of one or more {@link Workspace.objects.Object}s
 * @extends Workspace.actions.Action
 * @cfg {Object[]} objects
 * Serialized workspace objects to be created
 * @constructor
 * @param {Object} config
 * @cfg {Object[]} objects An array of {@link Workspace.objects.Object} configs
 */
Ext.define('Workspace.actions.DuplicateObjectAction', {
	extend: 'Workspace.actions.Action',
	constructor: function(config) {
		Workspace.actions.DuplicateObjectAction.superclass.constructor.apply(this, arguments);
		var subj = [], o;
		Ext.each(config.objects, function(obj) {
			o = obj.serialize();
			delete o.id;
			if(o.x) {
				o.x+=10;
			}
			if(o.y) {
				o.y+=10;
			}
			subj.push(o);
		})
		Ext.applyIf(this, {
			scope: this,
			objects: subj
		});
	},
	wtype: 'DuplicateObjectAction',
	handler: function() {
		this.workspace.createObjects(this.objects);
	},
	getUndo: function() {
		return new Workspace.actions.DeleteObjectAction({
			subjects: this.objects.concat([]),
			text: 'Undo "' + this.text + '"',
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
 * @class Workspace.actions.DeleteObjectAction
 * Action which encapsulates deletion of one or more {@link Workspace.objects.Object}
 * @extends Workspace.actions.Action
 * @cfg {Object[]} subjects
 * Workspace objects to be deleted
 * @constructor
 * @param {Object} config
 */
Ext.define('Workspace.actions.DeleteObjectAction', {
	extend: 'Workspace.actions.Action',
	constructor: function(config) {
		Workspace.actions.DeleteObjectAction.superclass.constructor.apply(this, arguments);
		Ext.applyIf(this, {
			scope: this
		})
	},
	wtype: 'DeleteObjectAction',
	handler: function() {
		this.workspace.deleteObjects(this.subjects);
	},
	getUndo: function() {
		return new Workspace.actions.CreateObjectAction({
			objects: Workspace.Components.serialize(this.subjects),
			text: 'Undo "' + this.text + '"',
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
 * @class Workspace.actions.FormIdeaAction
 * Action which encapsulates creating an idea from one or more objects
 * @extends Workspace.actions.Action
 * @cfg {Object[]} subjects
 * Workspace objects to be added to the idea
 * @constructor
 * @param {Object} config
 */
Ext.define('Workspace.actions.FormIdeaAction', {
	extend: 'Workspace.actions.Action',
	constructor: function(config) {
		Workspace.actions.FormIdeaAction.superclass.constructor.apply(this, arguments);
		Ext.applyIf(this, {
			scope: this,
			ideaConfig: {}
		})
	},
	wtype: 'FormIdeaAction',
	handler: function() {
		Ext.apply(this.ideaConfig, {
			children: this.subjects,
			wtype: 'Workspace.IdeaObject'
		});
		var parent = this.workspace.createObject(this.ideaConfig);

	},
	getUndo: function() {
		return new Workspace.actions.OrphanObjectAction({
			objects: this.subjects.concat([]),
			text: 'Undo "' + this.text + '"',
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
 * @class Workspace.actions.AdoptObjectAction
 * Action which encapsulates adoption (assigning a parent) to one or more {@link Workspace.objects.Object}
 * @extends Workspace.actions.Action
 * @cfg {Object[]} subjects
 * Workspace objects to be deleted
 * @constructor
 * @param {Object} config
 */
Ext.define('Workspace.actions.AdoptObjectAction', {
	extend: 'Workspace.actions.Action',
	constructor: function(config) {
		Ext.apply(this, config)
		Workspace.actions.AdoptObjectAction.superclass.constructor.apply(this, arguments);
		Ext.applyIf(this, {
			scope: this
		})
	},
	wtype: 'AdoptObjectAction',
	handler: function() {
		Ext.each(this.subjects, function(obj) {
			this.parent.adopt(obj)
		},
		this);
		if (this.parent.adjustSize) {
			this.parent.adjustSize()
		}
	},
	getUndo: function() {
		return new Workspace.actions.OrphanObjectAction({
			objects: this.subjects.concat([]),
			text: 'Undo "' + this.text + '"',
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
 * @class Workspace.actions.OrphanObjectAction
 * Action which encapsulates orphaning (removing from parent) of one or more {@link Workspace.objects.Object}
 * @extends Workspace.actions.Action
 * @cfg {Object[]} subjects
 * Workspace objects to be deleted
 * @constructor
 * @param {Object} config
 */
Ext.define('Workspace.actions.OrphanObjectAction', {
	extend: 'Workspace.actions.Action',
	constructor: function(config) {
		Ext.apply(this, config)
		Workspace.actions.OrphanObjectAction.superclass.constructor.apply(this, arguments);
		Ext.applyIf(this, {
			scope: this
		})
	},
	wtype: 'OrphanObjectAction',
	handler: function() {
		Ext.each(this.subjects, function(obj) {
			obj.orphan()
		});
	},
	getUndo: function() {
		// TODO: fix this
		return new Workspace.actions.AdoptObjectAction({
			objects: this.subjects.concat([]),
			text: 'Undo "' + this.text + '"',
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
 * @class Workspace.actions.ExpandAction
 * Action which encapsulates expansion of a Workspace
 * @extends Workspace.actions.Action
 * @cfg {Number[]} size
 * Amount by which to expand the workspace ([xAmount,yAmount])
 * @constructor
 * @param {Object} config
 */
Ext.define('Workspace.actions.ExpandAction', {
	extend: 'Workspace.actions.Action',
	constructor: function(config) {
		Ext.apply(this, config, {
			size: [400, 400]
		});
		Workspace.actions.DeleteObjectAction.superclass.constructor.apply(this, arguments);
		Ext.applyIf(this, {
			scope: this
		})
	},
	wtype: 'ExpandAction',
	handler: function() {
		this.workspace.expand(this.size[0], this.size[1]);
	},
	getUndo: function() {

		return new Workspace.actions.ExpandAction({
			size: [ - this.size[0], -this.size[1]],
			text: 'Undo "' + this.text + '"',
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

Ext.ns('Workspace.tools');

//////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * @class Workspace.tools.ToolManager
 * @singleton
 * Manages registration and instantiation of {@link Workspace.tools.BaseTool}s
 */
Workspace.Tools = Workspace.tools.ToolManager = (function() {
	var tools = {};
	return {
		/**
		 * register
		 * Registers a passed toolName to a {@link Workspace.tools.BaseTool} constructor
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
		getNewTool: function(toolName, workspace, config) {
			var toolClass = Workspace.Tools.getToolClass(toolName);
			return new toolClass(workspace, config);
		}
	};
})();
//////////////////////////////////////////////////////////////////////////////////////////////////

Workspace.Layouts = new App.registry('ltype');

//////////////////////////////////////////////////////////////////////////////////////////////////

Ext.define('Workspace.Lens', {
	constructor: function(config) {
		Workspace.Lens.superclass.constructor.apply(this);
		Ext.apply(this, config, {
			origin: [0,0],
			zoom: 1.0
		});
	},
	extend: 'Ext.util.Observable',
	getOrigin: function() {
		return this.origin;
	},
	getOriginX: function() {
		return this.origin[0];
	},
	getOriginY: function() {
		return this.origin[1];
	},
	getZoom: function() {
		return this.zoom;
	},
	setZoom: function(v) {
		this.zoom = v;
	},
	/**
	 * @param {Number} x The frame x coordinate
	 * @param {Number} y The frame y coordinate
	 * @retrun {Object} coords The space x,y coordinates
	 */
	getAdjustedXYcoords: function(x,y) {
		return {
			x: (x-this.getOriginX()) / this.getZoom(),
			y: (y-this.getOriginY()) / this.getZoom()
		}
	},
	translateToViewX: function(v) {
		return (v-this.getOriginX()) * this.getZoom();
	},
	translateToViewY: function(v) {
		return (v-this.getOriginY()) * this.getZoom();
	},
	translateToViewWidth: function(v) {
		return v * this.getZoom();
	},
	translateToViewHeight: function(v) {
		return v * this.getZoom();
	},
	getX: function(obj) {
		return this.translateToViewX(obj.get('x'))
	},
	getY: function(obj) {
		return this.translateToViewY(obj.get('y'));
	},
	getWidth: function(obj) {
		return this.translateToViewWidth(obj.get('width'));
	},
	getHeight: function(obj) {
		return this.translateToViewHeight(obj.get('height'));
	},
	translateToRealX: function(obj,v) {
		return (v / this.getZoom()) + this.getOriginX();
	},
	translateToRealY: function(obj,v) {
		return (v / this.getZoom()) + this.getOriginY();
	},
	translateToRealWidth: function(obj,v) {
		return (v / this.getZoom());
	},
	translateToRealHeight: function(obj,v) {
		return (v / this.getZoom());
	},
	setX: function(obj,v) {
		return obj.set('x',translateToRealX(v));
	},
	setY: function(obj,v) {
		return obj.set('y',translateToRealY(v));
	},
	setWidth: function(obj,v) {
		return obj.set('width',translateToRealWidth(v));
	},
	setHeight: function(obj,v) {
		return obj.set('height',translateToRealHeight(v));
	}
});

Ext.require(['Workspace.tools.PointerTool','Workspace.tools.RectTool','Workspace.tools.TextTool','Workspace.tools.MathTool','Workspace.tools.PencilTool']); //,'Workspace.objects.ElementObject','Workspace.objects.VectorObject']);