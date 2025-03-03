/********************************************
 * InfoMachine
 *
 * Copyright (c) 2010 Casey Grun
 *********************************************/

Ext.Loader.setPath('Workspace','client/workspace');

////////////////////////////////////////////////////////////////////////////////////////////////
/**
 * @class Workspace
 * Manages the Workspace area, {@link Workspace.tools.BaseTool tools}, saving 
 * and loading {@link Workspace.objects.Object objects}.
 * @constructor
 * @param {Ext.Element} element The HTML element to which to render this Workspace
 * @param {Object} config Configuration properties
 */
Ext.define('Workspace', {
	wtype: 'Workspace',
	extend: 'Machine.core.Serializable',
	requires: ['Ext.core.DomHelper'],
	uses: ['Workspace.actions.CreateObjectAction','Workspace.actions.ChangePropertyAction','Workspace.actions.DuplicateObjectAction',
'Workspace.actions.DeleteObjectAction','Workspace.actions.FormIdeaAction','Workspace.actions.AdoptObjectAction',
'Workspace.actions.OrphanObjectAction','Workspace.actions.ExpandAction','Workspace.DDManager','Workspace.Label','Workspace.FileUploader','Workspace.tools.PointerTool',
'Workspace.tools.RectTool','Workspace.tools.TextTool','Workspace.tools.MathTool','Workspace.tools.PencilTool','Workspace.objects.Object','Workspace.objects.ObjectCollection'],
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
		 * @property {Workspace.objects.ObjectCollection} objects
		 * Objects in the workspace
		 */
		this.objects = Ext.create('Workspace.objects.ObjectCollection');
		/**
		 * @property {Workspace.objects.ObjectCollection} selection
		 * Currently selected objects in the workspace
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
	 * @return {Machine.core.Serializable} object
	 */
	buildObject: function() {
		var objectClass,
		cfg, obj;

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
	 * @return {Workspace.objects.Object[]} objects
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
	 * @return {Machine.core.Serializable} object
	 */
	createObject: function(objectClass, config) {
		// instantiate object
		var obj = this.buildObject.apply(this, arguments);
		if(obj) {	
			this.fireEvent('instantiate', obj);
		} else {
			throw {message: "Couldn't create object",data: {objectClass: objectClass, config: config}};
		}

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
	 * @return {Boolean} success Returns true if editing successfully began on the element, else false
	 */
	edit: function(item) {
		this.editingItem = item;
		item.setState('editing', true);
		if (item.editor && this.hasTool(item.editor)) {
			this.changeTool(item.editor);
			if(!this.getActiveTool().attach(item)) {
				this.editingItem = false;
				item.setState('editing', false);
				return false;
			}
			return true;	
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
	 * Gets all #objects in the workspace
	 * @returns {Workspace.objects.Object[]}
	 */
	getAllObjects: function() {
		return this.objects.getRange();
	},
	/**
	 * Gets all #objects which do not have a {@link Workspace.objects.Object#parent parent}.
	 * @param {String} [domain='all'] `selection` to query objects in the selection, `all` to query all objects in the workspace 
	 * @returns {Workspace.objects.Object[]} rootObjects
	 */
	getRootObjects: function(domain) {
		return this.filterObjectsBy(function(obj) { return !obj.hasParent(); },domain);
	},
	/**
	 * Finds an object matching an arbitrary criteria; returns the first 
	 * object for which `filter` returns true
	 * @param {Function} filter passed with the `object` as the first parameter; return `true` to select the object, `false` to reject
	 * @param {String} [domain='all'] `selection` to query objects in the selection, `all` to query all objects in the workspace 
	 * @returns {Workspace.object.Object[]}
	 */
	findObjectBy: function(f,domain) {
		switch(domain) {
			case 'selection':
				return _.find(this.getSelection(),f);
			case 'all':
			default:
				return _.find(this.getAllObjects(),f);
		}
	},
	/**
	 * Returns all objects matching an arbitrary criteria; returns an array of
	 * objects for which `filter` returns true
	 * @param {Function} filter passed with the `object` as the first parameter; return `true` to select the object, `false` to reject
	 * @param {String} [domain='all'] `selection` to query objects in the selection, `all` to query all objects in the workspace 
	 * @returns {Workspace.object.Object[]}
	 */
	filterObjectsBy: function(f,domain) {
		switch(domain) {
			case 'selection':
				return _.filter(this.getSelection(),f);
			case 'all':
			default:
				return _.filter(this.getAllObjects(),f);
		}
	},
	
	/**
	 * Returns this workspace's instances of the active tool
	 * @return {Workspace.tools.BaseTool} activeTool
	 */
	getActiveTool: function() {
		return this.tools[this.activeTool];
	},
	/**
	 * Sets the active tool to the given toolName and fires the {@link #toolchange} event
	 * @param {String} toolName The tool to activate
	 */
	setActiveTool: function(tool) {
		var oldTool = this.activeTool;
		this.getActiveTool().deactivate();
		this.activeTool = tool;
		this.getActiveTool().activate();
		this.fireEvent('toolchange',tool,oldTool);
	},
	/**
	 * Alias for #setActiveTool
	 */
	changeTool: function(tool) {
		this.setActiveTool(tool);
	},
	/**
	 * Reports whether the workspace contains the given tool
	 * @param {String} toolName
	 */
	hasTool: function(tool) {
		return (this.tools[tool] != false);
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
	getCanvasMarkup : function() {
		var el = this.element.down('svg').dom;
		if(el) {
			return $('<div>').append($(el).clone()).html(); 
		}
		// var html = this.element.getHTML();
		// return html.replace(/<div\s+id="[\w-]+"\s+class="x-clear"\s+role="presentation"><\/div>/g,'');
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
	/**
	 * Destroys the workspace
	 */
	destroy: function() {
		// destroy scrollers
		Ext.each(this.scrollers, function(s) {
			s.render();
		});
		
		
		// destroy vector
		this.paper.remove();
		
		// unset element listeners
		this.element.un('click', this.click, this, false);
		this.element.un('dblclick', this.dblclick, this, false);
		this.element.un('mousedown', this.mousedown, this, false);
		this.element.un('mouseup', this.mouseup, this, false);
		this.element.un('mousemove', this.mousemove, this, false);
	},
	/**
	 * 
	 */
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
	var types = {}, aliases = {},
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
		 * Registers one wtype to be an alias for another wtype. This is only a one-way mapping; if the `alias` is passed to
		 * #getType or #create, an object will be created  with the wtype given by `wtype`; memory that the object was 
		 * instantiated with `alias` will be lost.
		 * 
		 * @param  {String} alias The name that will serve as the alias
		 * @param  {String} wtype The actual wtype of the object that should be created
		 * @return {[type]} [description]
		 */
		registerAlias: function (alias, wtype) {
			aliases[alias] = wtype;	
		},
		/**
		 * Given a `wtype`, determines whether the `wtype` is an alias for another `wtype`; if so, returns the name of the 
		 * true `wtype`; else returns the passed `wtype`.
		 * @param  {String} wtype A `wtype` or alias
		 * @return {String} The resolved `wtype`
		 */
		resolveAlias: function (wtype) {
			return aliases[wtype] || wtype;
		},
		/**
		 * Returns the class corresponding to the passed wtype
		 * @param {String} wtype The mneumonic name of the type to lookup
		 */
		getType: function(wtype) {
			wtype = Workspace.Components.resolveAlias(wtype);

			return types[wtype];
		},
		/**
		 * Gets an object by its id. Unlike {@link Workspace#getObjectById}, this method locates an object within the entire application
		 * @param {String} id
		 */
		get: function(id) {
			return objects.get(id);
			// TODO: fix this
		},
		/**
		 * Determines whether an object in the application has the given id.
		 * @param {String} id
		 */
		has: function(id) {
			return objects.containsKey(id);
		},
		/**
		 * Instantiates an object of the passed class or configured wtype.
		 * @param {Function} objectClass Constructor to which <var>config</var> should be passed. May be omitted if <var>config</var> contains a registered wtype.
		 * @param {Object} config Object containing configuration parameters
		 * @return {Machine.core.Serializable} object
		 */
		create: function() {
			var config,
			objectClass;
			if (arguments.length == 1) {
				config = arguments[0]
				if (config && config.wtype) {
					config.wtype = Workspace.Components.resolveAlias(config.wtype);
					if(types[config.wtype]) {
						objectClass = Workspace.Components.getType(config.wtype);
					}
				}
			} else {
				objectClass = arguments[0];
				config = arguments[1];
				config.wtype = Workspace.Components.resolveAlias(config.wtype);
			}

			if (config && objectClass && Ext.isFunction(objectClass)) {
				var o = new objectClass(config);
				objects.add(o.getId(), o);
				return o;
			} else {
				if(config.wtype) {
					config.wtype = Workspace.Components.resolveAlias(config.wtype);
					return Ext.create(config.wtype,config);		
				}
			}
			return false;
		},
		/**
		 * Realizes a complex object (any object with an id and a wtype) by either instantiating the object or resolving the reference.
		 * That is, if an object with the given wtype and id already exists in the application, it is returned. Otherwise, an object
		 * with the given wtype is instantiated using parameters in config. If the value passed to config has already been instantiated,
		 * it is returned unmodified.
		 * @param {Object} config Object containing configuration parameters. Must include a registered <var>wtype</var>!
		 * @return {Machine.core.Serializable} object
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
		defaultType: 'Machine.core.Serializable',

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
 * @method reg
 * Alias for {@link Workspace.Components.register}
 * @static
 * @member Workspace
 */
Workspace.reg = Workspace.Components.register;
Workspace.regAlias = Workspace.Components.registerAlias;


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
		var pointers = {};
		var colors = d3.scale.category20().range();
		// _.map(['#FFCC99', '#FFFF99', '#CCFFCC', '#CCFFFF', '#99CCFF', '#CC99FF'],function(color) {
			// return pv.color(color);
		// });
		var defaultPointer = -1;
		return function(id) {
			if(id) {
				if(pointers[id] == undefined) {
					pointers[id] = -1;
				}
				colorPointer = pointers[id];
			} else {				
				colorPointer = defaultPointer;
			}
			var colorPointer = (colorPointer + 1);
			var color = colorPointer % colors.length;
			var darkness = Math.floor(colorPointer / colors.length);
			
			if(id) {
				pointers[id] = colorPointer;
			} else {
				defaultPointer = colorPointer;
			}
			
			return d3.rgb(colors[color]).darker(darkness).toString();
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

Workspace.Layouts = new App.Registry('ltype');

//////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * Applies scaling, rotation, and offset to the canvas {@link Workspace} and 
 * does the related math for other classes.
 */
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
	 * Adjusts frame x/y coordinates to workspace coordinates
	 * @param {Number} x The frame x coordinate
	 * @param {Number} y The frame y coordinate
	 * @return {Object} coords The space x,y coordinates
	 * @return {Object} coords.x
	 * @return {Object} coords.y
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
