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
var SerializableObject = function(){
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
    getId: function(){
        if (this.id){
            return this.id;
        } else{
            this.id = App.nextId();
            return this.id;
        }
    },
    
    isWType : function(wtype, shallow){
        //assume a string by default
        if (Ext.isFunction(wtype)){
            wtype = wtype.wtype; //handle being passed the class, e.g. Ext.Component
        }else if (Ext.isObject(wtype)){
            wtype = wtype.constructor.wtype; //handle being passed an instance
        }

        return !shallow ? ('/' + this.getWTypes() + '/').indexOf('/' + wtype + '/') != -1 : this.constructor.wtype == wtype;
    },
    
    /**
     * getWTypes
     */
    getWTypes : function(){
        var tc = this.constructor;
        if(!tc.wtypes){
            var c = [], sc = this;
            while(sc && sc.constructor.wtype){
                c.unshift(sc.constructor.wtype);
                sc = sc.constructor.superclass;
            }
            tc.wtypeChain = c;
            tc.wtypes = c.join('/');
        }
        return tc.wtypes;
    },

    /**
   * serialize
   * Traverses this object's properties which have been {@link #expose}d as serializable, and returns an object
   * literal containing a hash of each of the properties, serialized by {@link Workspace.Components.serialize}. 
   * @param {Boolean} isChild true to serialize this object as a reference (ie: don't copy any of its properties; just
   * save its id and wtype). 
   * @return {Object} serialized An object literal containing each of the serialized properties
   */
    serialize: function(isChild){
        isChild = isChild || false;

        var out = {
            wtype: this.wtype,
            id: this.getId()
        };
        if (!isChild){
            var o;
            for (var prop in this._serializable){
                o = this.get(prop);
                o = Workspace.Components.serialize(o, true);
                out[prop] = o;
            }
        } else{
            out.isReference = true;
        }
        return out;
    },
    // deprecated
    deserialize: function(obj){
        for (var prop in obj){
            this.set(prop, Workspace.Utils.deserialize(obj[prop]));
        }
    },
    getReadableHash: function() {
      var out = {}, o;
      for (var prop in this._readable){
          o = this.get(prop);
          o = Workspace.Components.serialize(o, true);
          out[prop] = o;
      }
      return out;
    },
    /**
   * exposeAll
   * Exposes all keys in a given object hash as properties of this object
   * @param {Object} properties A hash containing as keys the properties to be exposed
   */
    exposeAll: function(obj){
        for (var prop in obj){
            this.expose(prop, true, true, true, true);
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
    expose: function(prop, readable, writeable, serializable, user){
        readable = readable || false;
        writeable = writeable || false;
        serializable = (serializable !== false);
        user = user || false;

        if (readable){
            readable = (Ext.isFunction(readable) ? readable:
            (Ext.isFunction(this[readable]) ? this[readable] : readable));
            if (Ext.isFunction(readable)){
                this._readable[prop] = readable;
                //readable.createDelegate(this);
            } else{
                this._readable[prop] = this._makeGetter(prop);
            }
        }
        if (writeable){
            writeable = (Ext.isFunction(writeable) ? writeable:
            (Ext.isFunction(this[writeable]) ? this[writeable] : writeable));
            if (Ext.isFunction(writeable)){
                this._writeable[prop] = writeable;
                //writeable.createDelegate(this);
            } else{
                this._writeable[prop] = this._makeSetter(prop);
            }
        }
        if (serializable){
            this._serializable[prop] = true;
        }
        if (user){
            this._userProperties[prop] = true;
        }

        this.fireEvent('meta', prop, {
            readable: readable,
            writeable: writeable,
            serializable: serializable,
            user: user
        });
    },

    /**
   * _makeGetter
   * Creates a getter function which returns <var>this[property]</var> 
   * @private
   * @param {String} property
   * @return {Function} getter
   */
    _makeGetter: function(property){
        return (function(prop){
            return this[prop];
        }).createDelegate(this, [property], true);
    },
    /**
   * _makeGetter
   * Creates a getter function which sets <var>this[property]</var> to the passed <var>value</var> 
   * @private
   * @param {@String} property
   * @return {Function} setter
   */
    _makeSetter: function(property){
        return (function(value, prop){
            this[prop] = value;
        }).createDelegate(this, [property], true);
    },

    /**
   * get
   * Returns the given property {@link #expose}d by this object, if that property is readable.
   * @param {String} property
   * @return {Mixed} value The value returned by invoking this property's accessor
   */
    get: function(property){
        return (this._readable[property] ? this._readable[property].apply(this, Array.prototype.slice.call(arguments, 1)) : false);
    },

    /**
   * has
   * Reports whether this object {@link #expose}s the given property as readable.
   * @param {String} property
   * @return {Boolean} readable True if the property can be accessed by {@link #get}, false if it cannot.
   */
    has: function(property){
        return (this._readable[property] ? true: false);
    },

    /**
   * set
   * Sets the given property to the given value, if the property is writeable. Fires the 'change' event, as well as
   * change_(property). See {@link #change_*}
   * @param {String} property The property to write to
   * @param {Mixed} value The value to write
   */
    set: function(property, value){
        var old = this.get(property);
        if (this._writeable[property]){
            this._writeable[property].apply(this, Array.prototype.slice.call(arguments, 1));
        }
        this.fireEvent('change', property, value, old, this);
        this.fireEvent('change_' + property, value, old, this);
    },

    realize: function(){
        // vestigial
    },

    /**
   * onChange
   * Sets an event listener to watch for changes to a given property
   * @param {String} property The property to watch
   */
    onChange: function(){
        this.on.apply(this, ['change_' + arguments[0]].concat(Array.prototype.slice.call(arguments, 1)))
    },

    /**
   * destroy
   * Destroys the object. Fires the {@link #destroy} event
   */
    destroy: function(){
        this.fireEvent('destroy', this);
    }
});


Ext.override(Ext.util.MixedCollection, {
    /**
   * serialize
   * See {@link SerializeableObject#serialize}
   */
    serialize: function(isChild){
        isChild = isChild || false;
        var result = false;
        if (this.keys.length > 0){
            result = {};
            this.eachKey(function(key, value){
                result[key] = Workspace.Components.serialize(value, isChild);
            })
        } else{
            result = []
            this.each(function(value){
                result.push(Workspace.Components.serialize(value, isChild));
            });
        }
        return result;
    }
})

////////////////////////////////////////////////////////////////////////////////////////////////
/**
 * @class WorkspaceFileUploader
 * Manages uploading a file and building an appropriate embedded object
 */
 
var WorkspaceFileUploader = function() {
  var mgr = function(config) {
    Ext.apply(this,config);
  }, handlers = {}, handlerOrder = [];
  return Ext.apply(mgr,{
    addHandler: function(mimeType, handler) {
      if(Ext.isArray(mimeType)) {
        Ext.each(mimeType,function(mt) {
          handlers[mt] = handler;
          handlerOrder.unshift(mt);  
        }, this);
      } else {
        handlers[mimeType] = handler;
        handlerOrder.unshift(mimeType);
      }
    },
    hasHandler: function(mimeType) {
      return (handlers[mimeType]!=false);
    },
    getHandler: function(mimeType) {
      return handlers[mimeType];
    },
    eachHandler: function(f) {
      Ext.each(handlerOrder,f);
    },
  });
}();
  

Ext.extend(WorkspaceFileUploader, Ext.util.Observable, {
  getConfig: function() {
    return {
      onComplete: this.onComplete.createDelegate(this),
      onProgress: this.onProgress.createDelegate(this),
      onCancel: this.onCancel.createDelegate(this) 
    };
  },
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
  onComplete: function(id, fileName, response) {
    var data = response,ext,name;
    if(response.success) { 
       name = response.fileName;
       ext = WorkspaceFileUploader.getExtension(name);

      if(WorkspaceFileUploader.hasHandler(ext)) {
        WorkspaceFileUploader.getHandler(ext).call(this,name)
      } else {
        //WorkspaceFileUploader.getHandler('default')
      }
    }
  },
  onProgress: function(id, fileName, loaded, total) {
    
  },
  onCancel: function(id, fileName) {
    
  }
});

WorkspaceFileUploader.getExtension = function(fileName) {
  return fileName.split('.').pop();
}

WorkspaceFileUploader.addHandler(['jpg','png','gif'],function(fileName) {
  this.workspace.createObject({
    wtype: 'Workspace.ImageObject',
    url: fileName,
    x: this.position.x,
    y: this.position.y
  });
  this.hideThrobber();
});

WorkspaceFileUploader.addHandler(['pdf','doc','docx','ppt','pptx','xls','xlsx'],function(fileName) {
  this.workspace.createObject({
    wtype: 'Workspace.PDFEmbedObject',
    url: fileName,
    x: this.position.x,
    y: this.position.y
  });
  this.hideThrobber();
});


////////////////////////////////////////////////////////////////////////////////////////////////
/**
 * @class WorkspaceDDManager
 * @extends Ext.util.Observable
 * Manages browser- and Ext-based drop actions on the workspace
 * @cfg {Workspace} workspace
 */

var WorkspaceDDManager = function() { 
  var mgr = function(cfg){
    WorkspaceDDManager.superclass.constructor.apply(this, arguments);
    Ext.apply(this, cfg);
  }, handlers = {}, handlerOrder = [];
  return Ext.apply(mgr,{
    addHandler: function(mimeType, handler) {
      if(Ext.isArray(mimeType)) {
        Ext.each(mimeType,function(mt) {
          handlers[mt] = handler;
          handlerOrder.unshift(mt);  
        }, this);
      } else {
        handlers[mimeType] = handler;
        handlerOrder.unshift(mimeType);
      }
    },
    hasHandler: function(mimeType) {
      return (handlers[mimeType]!=false);
    },
    getHandler: function(mimeType) {
      return handlers[mimeType];
    },
    eachHandler: function(f) {
      Ext.each(handlerOrder,f);
    },
  });
}();

jQuery.event.props.push("dataTransfer");

Ext.extend(WorkspaceDDManager, Ext.util.Observable, {
  render: function() {
    var el = $(this.workspace.getEl().dom);
    //el.get(0).addEventListener("drop", this.onDrop.createDelegate(this), true);
    el.bind('drop',this.onDrop.createDelegate(this));
    el.bind('dragenter',this.onDragEnter,this);
    el.bind('dragover',this.onDragOver,this);
    //el.bind('dropCreate',this.dropCreate.createDelegate(this));
    this.workspace.refreshEl();
    this.dropZone = new Ext.dd.DropTarget(this.workspace.getEl(),{
    	notifyDrop: this.notifyDrop.createDelegate(this)
    });
    /*
    new Ext.dd.DropZone(
    	//this.workspace.getEl(),
    	this.workspace.getEl(),
    {
    	getTargetElement: function() {
    		return this.workspace.getEl();
    	}.createDelegate(this),
    	onNodeDrop: function(target, source, e, data) {
    		alert('Drop');
    		return true;
    	},
    	onNodeOver : function(target, dd, e, data){ 
    		alert('over');
            return Ext.dd.DropZone.prototype.dropAllowed;
        },
        onNodeEnter: function() {
        	alert('enter');
        },
        onNodeOut: function() {}
    });
    */
  },
  
  // EXTJS DROP
  
  notifyDrop: function(dd, e, data) {
	if(data.mimeType && WorkspaceDDManager.hasHandler(data.mimeType)) {
		var h = WorkspaceDDManager.getHandler(data.mimeType);
        h.call(this,data,e);
        return true;
	} else {
		return false;
	}
  },
  
  // BROWSER DROP
  
  onDrop: function(e,t,o) {
    var that = this, pos = this.getAdjustedXYcoords(e.pageX,e.pageY);
    if(e.dataTransfer.files && this.fileHandler) {
      this.fileHandler(e.dataTransfer.files,pos);
    }
    WorkspaceDDManager.eachHandler(function(mimeType) {
      if(e.dataTransfer.types.indexOf(mimeType)!=-1) {
        var h = WorkspaceDDManager.getHandler(mimeType);
        h.call(that,e.dataTransfer.getData(mimeType),e);
        return false;
      }
    });
    e.preventDefault();
  },
  onDragEnter: function(e,t,o) {
  	/*
  	var accept = false;
  	WorkspaceDDManager.eachHandler(function(mimeType) {
      if(e.dataTransfer.types.indexOf(mimeType)!=-1) {
      	accept = true;
      	return false;
      }
   	});
   	if(accept) {
    	e.preventDefault();
    }
    */
   	e.preventDefault();
  },
  onDragOver: function(e,t,o) {
  	/*
    var accept = false;
  	WorkspaceDDManager.eachHandler(function(mimeType) {
      if(e.dataTransfer.types.indexOf(mimeType)!=-1) {
      	accept = true;
      	return false;
      }
   	});
   	if(accept) {
    	e.preventDefault();
    }
    */
   	e.preventDefault();
  },
  destroy: function() {
    this.workspace.getEl().un('drop',this.onDrop,this);
  },
  getAdjustedXYcoords: function() {
    return Workspace.tool.BaseTool.prototype.getAdjustedXYcoords.apply(this,arguments);
  },
  getAdjustedXY: function() {
    return Workspace.tool.BaseTool.prototype.getAdjustedXY.apply(this,arguments);
  },
  
  // FILES
  
  onFileComplete: function(id, fileName, response) {
    if(this.fileUploaders[id]) {
      this.fileUploaders[id].onComplete(id, fileName, response);
      delete this.fileUploaders[id];
    }
  },
  onFileProgress: function(id, fileName, loaded, total) {
    if(this.fileUploaders[id]) {
      this.fileUploaders[id].onProgress(id, fileName, loaded, total);
    }
  },
  onFileCancel: function(id, fileName) {
    if(this.fileUploaders[id]) {
      this.fileUploaders[id].onCancel(id, fileName);
      delete this.fileUploaders[id];
    }
  },
  getUploadHandler: function() {
    if(!this.uploadHandler) {
      this.uploadHandler = new qq.UploadHandlerXhr({
        action: this.getUploadUrl(),
        onComplete: this.onFileComplete.createDelegate(this),
        onCancel: this.onFileCancel.createDelegate(this),
        onProgress: this.onFileProgress.createDelegate(this)
      });
      this.fileUploaders = {};
    }
    return this.uploadHandler;
  },
  fileHandler: function(files,pos) {
    var uh = this.getUploadHandler();
    Ext.each(files,function(file) {
      var id = uh.add(file),
          uploader = new WorkspaceFileUploader({
            workspace: this.workspace,
            manager: this,
            fileId: id,
            position: pos
          });
      this.fileUploaders[id] = uploader;
      uh.upload(id,{userfile:uh.getName(id)});
      uploader.showThrobber();
    },this);
  },
  getUploadUrl: function() {
    return App.getEndpoint('upload');
  }
});

WorkspaceDDManager.addHandler('text/plain',function(data,e) {
  var pos = this.getAdjustedXYcoords(e.pageX,e.pageY),
  obj = this.workspace.createObject(Workspace.RichTextObject,{
    text: data,
    x: pos.x,
    y: pos.y
  });
  obj.sizeToFit();
});
WorkspaceDDManager.addHandler('text/html',function(data,e) {
  var pos = this.getAdjustedXYcoords(e.pageX,e.pageY),
  obj = this.workspace.createObject(Workspace.RichTextObject,{
    text: data,
    x: pos.x,
    y: pos.y
  });
  obj.sizeToFit();  
});
WorkspaceDDManager.addHandler('text/uri-list',function(data,e) {
  var pos = this.getAdjustedXYcoords(e.pageX,e.pageY), obj;
  if(data.match(Workspace.EmbedObject.regex)) {
    obj = this.workspace.createObject(Workspace.EmbedObject,{
      url: data,
      x: pos.x,
      y: pos.y
    });
  } else {
    obj = this.workspace.createObject(Workspace.IFrameObject,{
      url: data,
      x: pos.x,
      y: pos.y
    });
  }
  //obj.sizeToFit();  
});

WorkspaceDDManager.addHandler('ext/motif',function(data,e) {
	var pos = this.getAdjustedXY(e), tool;
	tool = this.workspace.activeTool;
	this.workspace.setActiveTool('node');
	this.workspace.getActiveTool().buildMotif(data.draggedRecord.get('number'),pos.x,pos.y);
	this.workspace.setActiveTool(tool);
});

////////////////////////////////////////////////////////////////////////////////////////////////
/**
 * @class WorkspaceScoller
 * @extends Ext.util.Observable
 * Allows the workspace to be scrolled by hovering over the edge
 * @cfg {Workspace} Workspace
 * @cfg {String} side One of: 'top','bottom','left', or 'right
 */

var WorkspaceScroller = function(cfg){
    WorkspaceScroller.superclass.constructor.apply(this, arguments);
    Ext.apply(this, cfg);
}

Ext.extend(WorkspaceScroller, Ext.util.Observable, {
    side: 'top',
    threshold: 20,
    delay: 1500,
    velocity: 20,
    animate: true,
    interval: 100,
    render: function(){
        this.element = Ext.get(Ext.DomHelper.append(document.body, {
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
    onResize: function(){
        var el = this.workspace.getContainerEl();
        switch (this.side){
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
    mouseover: function(){
        this.delayTask = new Ext.util.DelayedTask(this.startScroll, this);
        this.delayTask.delay(this.delay);
    },
    startScroll: function(){
        this.scrollTask = {
            run: this.doScroll,
            scope: this,
            interval: this.interval
        };
        this.scrollRunner = new Ext.util.TaskRunner();
        this.scrollRunner.start(this.scrollTask);
    },
    doScroll: function(){
        var scrolled = this.workspace.getEl().scroll(this.side, this.velocity, this.animate);
        // if not scrolled, expand workspace
    },
    mouseout: function(){
        if (this.delayTask){
            this.delayTask.cancel();
            delete this.delayTask;
        }
        if (this.scrollRunner){
            this.scrollRunner.stopAll();
        }
    },
    getEl: function(){
        return this.element;
    }
})

////////////////////////////////////////////////////////////////////////////////////////////////
/**
 * @class Workspace
 * @extends SerializableObject
 * Manages the Workspace area, {@link Workspace.tool.BaseTool}s, saving and loading {@link Workspace.Object}s
 * @constructor
 * @param {Ext.Element} element The HTML element to which to render this Workspace
 * @param {Object} config Configuration properties
 */
var Workspace = function(containerEl, config){
    Workspace.superclass.constructor.call(this);

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

    this.containerEl = containerEl;

    this.element = Ext.get(Ext.DomHelper.append(containerEl, {
        tagName: 'div',
        cls: 'workspace'
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
	  
	  // Initialize drag/drop manager
	  this.ddManager = new WorkspaceDDManager({workspace: this});
	  
	  // Initialize lens
	  this.lens = new WorkspaceLens();

    // Cache objects to be constructed later
    this._objects = this.objects || {};

    /**
	 * Objects in the workspace
	 * @type Workspace.ObjectCollection
	 * @property objects
	 */
    this.objects = new Workspace.ObjectCollection();
    /**
   * Currently selected objects in the workspace
   * @type Workspace.ObjectCollection
   * @property selection
   */
    this.selection = new Workspace.ObjectCollection();

    // Set up tools
    this.activeTool = 'pointer';
    var tools = {},
    toolName;
    if (this.tools.length == 0){
        var allTools = Workspace.Tools.getAllTools();
        for (var toolName in allTools){
            tools[toolName] = Workspace.Tools.getNewTool(toolName, this);
        }
    }
    else{
        for (var i = 0, l = this.tools.length; i < l; i++){
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
    this.addEvents('click', 'dblclick', 'mousedown', 'mouseup', 'mousemove', 'select', 'unselect', 'toolchange');
    this.element.on('click', this.click, this, false);
    this.element.on('dblclick', this.dblclick, this, false);
    this.element.on('mousedown', this.mousedown, this, false);
    this.element.on('mouseup', this.mouseup, this, false);
    this.element.on('mousemove', this.mousemove, this, false);

    this.expose('objects', true, true, false);
    // false to manually serialize this.objects
    this.expose('width', true, true);
    this.expose('height', true, true);

    this.on('change_width', this.onResize, this);
    this.on('change_height', this.onResize, this);

    this.initialize.defer(1, this);
};

Ext.extend(Workspace, SerializableObject, {
    //Ext.util.Observable, {
    wtype: 'Workspace',

    /**
	 * register
	 * Adds the passed object to this workspace's {@link #objects} property
	 * @param {Workspace.Object} item
	 */
    register: function(item){
        if (item.id){
            this.objects.add(item.id, item);
        } else{
            var id = App.nextId();
            item.id = id;
            this.objects.add(id, item);
        }
        return item.id;
    },
    /**
   * unregister
   * Removes object with the passed id from this workspace's {@link #objects} property
   * @param {String} id
   */
    unregister: function(id){
        this.objects.removeKey(id);
    },
    /**
	 * getObjectById
	 * @param {String} id
	 * @return {Workspace.Object} object
	 */
    getObjectById: function(id){
        return this.objects.get(id);
    },
    /**
	 * serialize
	 * Serializes the workspace. Override required to manually serialize objects
	 * @see Workspace.Components#serialize
	 */
    serialize: function(isChild){
      if(isChild) {
        return null; //{ wtype:'Workspace', id: this.getId()};
      }
        var o = Workspace.superclass.serialize.apply(this, arguments);
        o.objects = this.objects.serialize(false);
        return o;
    },
    /**
	 * initialize
	 * Deserializes, initializes, and renders serialized objects specified in the config
	 * Called automatically by the constructor; should not be invoked by application code.
	 * @private
	 */
    initialize: function(){
        this.createObjects(this._objects);
        this.fireEvent('afterload', this);
        this.render.defer(1, this);
    },

    /**
	 * @private
	 */
    render: function(){
        // not implemented
        //Ext.each(this.scrollers,function(s){ s.render(); });
        if (!this.width){
            var width = this.getContainerEl().getWidth(),
            height = this.getContainerEl().getHeight();
            this.resize(width, height);
        } else{
            this.onResize();
        }
        this.ddManager.render();
    },
    /**
	 * buildObject
	 * Instantiates the provided object and registers with Workspace.Components. Called by {@link #createObject} and {@link #createObjects}; don't call directly.
	 * @private
	 * @param {Function} objectClass Constructor to which <var>config</var> should be passed. May be omitted if <var>config</var> contains a registered wtype.
	 * @param {Object} config Object containing configuration parameters
	 * @return {SerializableObject} object
	 */
    buildObject: function(){
        var objectClass,
        cfg;

        // overloaded signature
        if (arguments.length == 1){
            cfg = arguments[0];
        } else if (arguments.length == 2 && Ext.isFunction(arguments[0])){
            objectClass = arguments[0];
            cfg = arguments[1];
        }
        // make sure instantiated objects have workspace reference
        Ext.apply(cfg, {
            workspace: this
        });

        // apply appropriate signature of Workspace.Components.create() to match this function's call signature
        if (objectClass){
            obj = Workspace.Components.create(objectClass, cfg);
        } else{
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
    createObjects: function(objects){
        var newObjects = [],
        obj;

        // instantiate objects from array
        if (Ext.isArray(objects)){
            for (var i = 0, l = objects.length; i < l; i++){
                obj = this.buildObject(objects[i]);
                newObjects.push(obj);
                this.fireEvent('instantiate', obj);

            }
            // or instantiate objects from object hash
        } else if (Ext.isObject(objects)){
            for (var id in this._objects){
                obj = this.buildObject(this._objects[id])
                newObjects.push(obj);
                this.fireEvent('instantiate', obj);
            }
        }

        // if objects were successfully created
        if (newObjects.length > 0){
            // initialize objects
            for (var i = 0, l = newObjects.length; i < l; i++){
                obj = newObjects[i];
                obj.initialize();
            }

            // render objects, register in this.objects, fire 'create' event
            for (var i = 0, l = newObjects.length; i < l; i++){
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
    createObject: function(objectClass, config){
        // instantiate object
        var obj = this.buildObject.apply(this, arguments);
        this.fireEvent('instantiate', obj);

        // initialize, render, and register object; fire create event
        if (obj){
            obj.initialize();
            obj.render();
            obj.realize();
            this.register(obj);
            this.fireEvent('create', obj);
            return obj;
        }
        else{
            return false;
        }
    },

    /**
	 * deleteObjects
	 * Removes the provided objects from the workspace; fires the {@link destroy} event for each object
	 * @param {Workspace.Object[]/Workspace.Object} objects Object or array of objects to remove
	 */
    deleteObjects: function(objects){
        if (Ext.isArray(objects)){
            for (var i = 0, l = objects.length; i < l; i++){
                this.unselect(objects[i]);
                objects[i].destroy();
                this.unregister(objects[i].getId());
                this.fireEvent('destroy', objects[i]);
            }
        } else{
        	var obj = objects;
            this.unselect(obj);
            obj.destroy();
            this.unregister(obj.getId());
            this.fireEvent('destroy', obj);
        }
    },
    
    deleteAllObjects: function() {
    	this.objects.each(function(obj) {
    		this.unselect(obj);
            obj.destroy();
            this.unregister(obj.getId());
            this.fireEvent('destroy', obj);
    	},this);
    	this.objects.clear();
    },
    
    reload: function(newObjects) {
    	this.deleteAllObjects();
    	this._objects = newObjects;
    	this.initialize();
    },

    /**
	 * edit
	 * Begin editing an item by setting the active tool to the object's {@link Workspace.Object#editor} and attaching the tool to that object
	 * @param {Workspace.Object} item
	 */
    edit: function(item){
        this.editingItem = item;
        item.setState('editing', true);
        if (item.editor && this.hasTool(item.editor)){
            this.changeTool(item.editor);
            this.getActiveTool().attach(item);
        }
    },
    /**
	 * endEdit
	 * Ends editing of an item by detaching the editing tool and returning to the default tool. 
	 */
    endEdit: function(){
        if (this.editingItem){
            this.getActiveTool().detach();
            this.editingItem.setState('editing', false);
            this.editingItem = false;
        }
        this.changeTool('pointer');
    },

    /**
	 * setSelection
	 * Selects the passed items and deselects everything else
	 * @param {Workspace.Objects[]} items Objects to select
	 */
    'setSelection': function(items){
        if (Ext.type(items) == 'array'){
            this.unselect();
            this.select(items);
        }
    },
    /**
	 * select
	 * Selects the given items. Automatically unselects any ancestors or descendents.
	 * @param {Workspace.Object/Workspace.Objects[]} items Object or array of objects to select
	 */
    'select': function(items){
        if (Ext.type(items) == 'array'){
            var selection = this.selection;
            Ext.each(items,
            function(item){
                if (item && item.isSelectable){
                    item.unselectAncestors();
                    item.unselectDescendents();

                    this.selection.add(item.getId(), item);
                    item.setState('selected', true);
                    item.fireEvent('select', item);
                    this.fireEvent('select', item);
                }
            },
            this);
        } else if (Ext.isFunction(items.getId)){
            var item = items;
            if (item && item.isSelectable){
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
	 * unselect
	 * Unselects the given items, or all items if no items are passed.
   * @param {Workspace.Object/Workspace.Objects[]} items Object or array of objects to select (Optional)
	 */
    unselect: function(items){
        if (items){
            // array passed; deselect each
            if (Ext.type(items) == 'array'){
                var selection = this.selection;
                Ext.each(items,
                function(item){
                    this.selection.removeKey(item.getId());
                    item.setState('selected', false);
                    item.fireEvent('unselect', item);
                    this.fireEvent('unselect', item);
                },
                this);

                // one item passed; deselect it
            } else if (Ext.isFunction(items.getId)){
                var item = items;
                this.selection.removeKey(item.getId());
                item.setState('selected', false);
                item.fireEvent('unselect', item);
                this.fireEvent('unselect', item);
            }

            // no objects passed; deselect all
        } else{
            this.selection.each(function(item){
                item.setState('selected', false);
                item.fireEvent('unselect', item);
                this.fireEvent('unselect', item);
            },
            this);
            this.selection.clear();
        }

    },
    /**
	 * deselect
	 * Alias for {@link #unselect}
	 */
    deselect: function(item){
        this.unselect(item);
    },
    /**
	 * hasSelection
	 * Reports whether any items are selected
	 * @return {Boolean} selected
	 */
    hasSelection: function(){
        var i = this.selection.getCount();
        return (i > 0);
    },
    /**
	 * getSelection
	 * Returns an array of currently selected objects
	 * @return {Workspace.Objects[]} selection
	 */
    getSelection: function(){
        return this.selection.getRange();
    },
    
    getSelectionWType: function() {
        return this.selection.getCommonWType();
    },

    /**
	 * getActiveTool
	 * Returns this workspace's instances of the active tool
	 * @return {Workspace.tool.BaseTool} activeTool
	 */
    getActiveTool: function(){
        return this.tools[this.activeTool];
    },

    /**
	 * setActiveTool
	 * Deactivates the current tool and activates the provided tool
	 * @param {String} toolName The tool to activate
	 */
    setActiveTool: function(tool){
        this.getActiveTool().deactivate();
        this.activeTool = tool;
        this.getActiveTool().activate();
    },

    /**
	 * hasTool
	 * Reports whether the workspace contains the given tool
	 * @param {String} toolName 
	 */
    hasTool: function(tool){
        return (this.tools[tool] != false);
    },

    /**
	 * changeTool
	 * Sets the active tool to the given toolName and fires the {@link toolChange} event
	 * @param {String} toolName
	 */
    changeTool: function(tool){
        this.setActiveTool(tool);
        this.fireEvent('toolchange');
    },

    /**
	 * click
	 * Invoked when a click event occurs on the workspace canvas or on a workspace item. 
	 * Invokes the {@link Workspace.tool.BaseTool#click} method of the active tool.
	 * @param {Event} e
	 * @param {Workspace.Object} item
	 */
    click: function(e, item){
        this.getActiveTool().click(e, (item.getId ? item: false));
    },

    /**
   * dblclick
   * Invoked when a double-click event occurs on the workspace canvas or on a workspace item. 
   * Invokes the {@link Workspace.tool.BaseTool#dblclick} method of the active tool.
   * @param {Event} e
   * @param {Workspace.Object} item
   */
    dblclick: function(e, item){
        this.getActiveTool().dblclick(e, (item.getId ? item: false));
    },

    /**
   * mousedown
   * Invoked when a mousedown event occurs on the workspace canvas or on a workspace item. 
   * Invokes the {@link Workspace.tool.BaseTool#mousedown} method of the active tool, although this behavior can be prevented
   * if a listener of the {@link mousedown} event returns false.
   * @param {Event} e
   * @param {Workspace.Object} item
   */
    mousedown: function(e, item){
        // TODO: Make sure this doesn't break anything ####
        if (this.fireEvent('mousedown', e, (item.getId ? item: false)))
        this.getActiveTool().mousedown(e, (item.getId ? item: false));
    },
    /**
   * mouseup
   * Invoked when a mouseup event occurs on the workspace canvas or on a workspace item. 
   * Invokes the {@link Workspace.tool.BaseTool#mouseup} method of the active tool, although this behavior can be prevented
   * if a listener of the {@link mouseup} event returns false.
   * @param {Event} e
   * @param {Workspace.Object} item
   */
    mouseup: function(e, item){
        if (this.fireEvent('mouseup', e, (item.getId ? item: false)) != false)
        this.getActiveTool().mouseup(e, (item.getId ? item: false));
    },
    /**
   * mouseover
   * Invoked when a mouseover event occurs on a workspace item. 
   * Invokes the {@link Workspace.tool.BaseTool#mouseover} method of the active tool.
   * @param {Event} e
   * @param {Workspace.Object} item
   */
    mouseover: function(e, item){
        this.getActiveTool().mouseover(e, (item.getId ? item: false));
    },
    /**
   * mouseout
   * Invoked when a mouseout event occurs on a workspace item. 
   * Invokes the {@link Workspace.tool.BaseTool#mouseout} method of the active tool.
   * @param {Event} e
   * @param {Workspace.Object} item
   */
    mouseout: function(e, item){
        this.getActiveTool().mouseout(e, (item.getId ? item: false));
    },

    /**
   * mousemove
   * Invoked when a mousemove event occurs on the workspace canvas or on a workspace item. 
   * Invokes the {@link Workspace.tool.BaseTool#mousemove} method of the active tool although this behavior can be prevented
   * if a listener of the {@link mousemove} event returns false.
   * @param {Event} e
   * @param {Workspace.Object} item
   */
    mousemove: function(e, item){
        if (this.fireEvent('mousemove', e, (item.getId ? item: false)));
        this.getActiveTool().mousemove(e, (item.getId ? item: false));
    },

    bodyResize: function(panel, w, h){
        this.fireEvent('bodyresize');
        this.expandToVisible();
    },
    expandToVisible: function() {
        var s = this.getVisibleSize(),z = this.lens.getZoom();
        if(s.width/z > this.get('width')) {
          this.set('width',s.width/z);
        }
        if(s.height/z > this.get('height')) {
          this.set('height',s.height/z);
        }
    },
    getVisibleSize: function() {
      return { width: this.containerEl.getWidth(), height: this.containerEl.getHeight() };
    },
    getVisibleDimensions: function() {
      return this.getVisibleSize();
    },

    resize: function(w, h){
        this.set('width', w);
        this.set('height', h);
    },

    expand: function(w, h){
        w = w || 100;
        h = h || 100;
        this.set('width', this.getWidth() + w);
        this.set('height', this.getHeight() + h);
    },

    getWidth: function(){
        return this.get('width');
    },
    getHeight: function(){
        return this.get('height');
    },
    onResize: function(){
        var z = this.lens.getZoom();
        if(z<1) { z = 1; }
        this.getEl().setSize(this.getWidth()*z, this.getHeight()*z);
        this.getPaper().setSize(this.getWidth()*z, this.getHeight()*z);
    },



    /**
	 * addElement
	 * Adds an HTML element to the canvas specified by the passed DomHelper spec
	 * @param {Object} spec An Ext.DomHelper spec
	 * @returns {Ext.Element} element
	 */
    addElement: function(spec){
        return Ext.get(Ext.DomHelper.append(this.element, spec));
    },

    /**
	 * getEl
	 * Returns the workspace canvas's DOM element
	 * @return {Ext.Element} element
	 */
    getEl: function(){
        return this.element;
    },
    refreshEl: function() {
      this.element = Ext.get(this.element.id);
    },

    getPaper: function(){
        return this.paper;
    },

    getContainerEl: function(){
        return this.containerEl;
    },

    /**
	 * doAction
	 * Performs the passed {@link WorkspaceAction} on this Workspace
	 * @param {WorkspaceAction} action The action to perform
	 */
    doAction: function(action){
        if (action.handler){
            action.attachTo(this);
            action.handler.apply(action.scope);
        }
    },

    destroy: function(){
        // destroy scrollers
        Ext.each(this.scrollers,
        function(s){
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

/**
 * @class Workspace.Components
 * @singleton
 */
Workspace.Components = (function(){
    var types = {},
    objects = new Ext.util.MixedCollection(),
    typeStore = new Ext.data.ArrayStore({
      fields: [
        {name: 'wtype'},
        {name: 'name'},
        {name: 'iconCls'}
      ]
    });
    
    return{
        /**
     * register
     * Registers the passed <var>wtype</var> with a constructor so that objects deserialized with
     * {@link Workspace.Components#deserialize}, {@link Workspace.Components#create}, {@link Workspace#createObject}, etc.
     * may have their constructor automatically detected, similar to Ext's xtypes
     * @param {String} wtype The canonical name of this type
     * @param {Function} type The constructor function
     */
        register: function(wtype, type){
            type.prototype.wtype = wtype;
            type.wtype = wtype;
            types[wtype] = type;
            var rec = { wtype: wtype };
            if(type.prototype) {
              if(type.prototype.iconCls) {
                rec.iconCls = type.prototype.iconCls;
              }
            }
            typeStore.add(new typeStore.recordType(rec));
            return type;
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
        get: function(id){
            return objects.get(id);
            // TODO: fix this
        },

        /**
     * has
     * Determines whether an object in the application has the given id.
     * @param {String} id
     */
        has: function(id){
            return objects.containsKey(id);
        },

        /**
     * create
     * Instantiates an object of the passed class or configured wtype.
     * @param {Function} objectClass Constructor to which <var>config</var> should be passed. May be omitted if <var>config</var> contains a registered wtype.
     * @param {Object} config Object containing configuration parameters
     * @return {SerializableObject} object
     */
        create: function(){
            var config,
            objectClass;
            if (arguments.length == 1){
                config = arguments[0]
                if (config && config.wtype && types[config.wtype]){
                    objectClass = types[config.wtype];
                }
            } else{
                objectClass = arguments[0];
                config = arguments[1];
            }

            if (config && objectClass && Ext.isFunction(objectClass)){
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
        realize: function(o){
            if (o.wtype){
                if (o.getId){
                    return o;
                } else if (o.id && Workspace.Components.has(o.id)){
                    return Workspace.Components.get(o.id);
                } else{
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
        serialize: function(o, isChild){
            // if o defines its own serialization function (ie: for higher level objects), use that
            if (o && o.serialize && Ext.isFunction(o.serialize)){
                return o.serialize(isChild)
            }

            // serialize an array
            if (Ext.isArray(o)){
                var r = [];
                for (var i = 0, l = o.length; i < l; i++){
                    r.push(Workspace.Components.serialize(o[i], true));
                }
                return r;
            }

            // serialize a simply object hash (allow for complex objects contained in the hash)
            if (Ext.isObject(o)){
                var r = {};
                for (var p in o){
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
        deserialize: function(o){
            // if o is a javscript object
            if (Ext.isObject(o)){

                // if o is a complex object, realize it by either instantiating it or populating the reference
                if (o.wtype){
                    return Workspace.Components.realize(o);

                    // if o is a normal object, deserialize each component
                } else{
                    return Workspace.Components.deserializeHash(o);
                }

                // if o is an array, deserialize each element
            } else if (Ext.isArray(o)){
                return Workspace.Components.deserializeArray(o);

                // otherwise no deserialization needed
            } else{
                return o;
            }
        },
        /**
     * deserializeHash
     * @private
     */
        deserializeHash: function(o){
            var r = {};
            for (var p in o){
                r[p] = Workspace.Components.deserialize(o[p], true);
            }
            return r;
        },
        /**
     * deserializeArray
     * @private
     */
        deserializeArray: function(o){
            var r = [];
            for (var i = 0, l = o.length; i < l; i++){
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
              if(o==wtype) { return true; }
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
    ideaColor: (function(){
        var colors = ['#FFCC99', '#FFFF99', '#CCFFCC', '#CCFFFF', '#99CCFF', '#CC99FF'],
        colorPointer = -1;
        return function(){
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
    bounds: function(v, min, max){
        max = max || false;
        min = min || false;
        if (max !== false){
            if (v > max) return max;
        }
        if (min !== false){
            if (v < min) return min;
        }
        return v;
    },
    /**
   * getBox
   * Returns the smallest box bounding the passed set of objects
   * @param {Workspace.Object[]} items 
   * @returns {Object} box The bounding box
   */
    getBox: function(items){
        var bbox;
        if (items.length > 0){
            bbox = items[0].getBox();
            var f = function(item){
                var ibox = item.getBox();
                if (ibox.tl.x < bbox.tl.x){
                    bbox.tl.x = ibox.tl.x;
                }
                if (ibox.tl.y < bbox.tl.y){
                    bbox.tl.y = ibox.tl.y;
                }
                if (ibox.br.x > bbox.br.x){
                    bbox.br.x = ibox.br.x;
                }
                if (ibox.br.y > bbox.br.y){
                    bbox.br.y = ibox.br.y;
                }
            };
            if (items.each){
                items.each(f);
            } else{
                Ext.each(items, f);
            }
        } else{
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
    getBBox: function(x, y, w, h){
        return{
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
    completeBox: function(tl, br){
        return{
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
    padBox: function(box, padding){
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
    boxUnion: function(bbox, ibox){
        if (ibox.tl.x < bbox.tl.x){
            bbox.tl.x = ibox.tl.x;
        }
        if (ibox.tl.y < bbox.tl.y){
            bbox.tl.y = ibox.tl.y;
        }
        if (ibox.br.x > bbox.br.x){
            bbox.br.x = ibox.br.x;
        }
        if (ibox.br.y > bbox.br.y){
            bbox.br.y = ibox.br.y;
        }
        return bbox;
    }
};

/**
 * @class WorkspaceAction
 * Encapsulates a single, un-doable change to the workspace.
 * @abstract
 * @extends Ext.Action
 */
var WorkspaceAction = function(config){
    WorkspaceAction.superclass.constructor.apply(this, arguments);
    Ext.apply(this,config);
}

Ext.extend(WorkspaceAction, Ext.Action, {

    /**
   * @cfg handler
   * The function to invoke on execution
   */
    handler: function(){},
    /**
   * getUndo
   * Gets the action which can be invoked to undo this action. This method must be called before (preferrably immediately before)
   * the action is invoked
   * @return {WorkspaceAction}
   */
    getUndo: function(){},
    /**
   * Serialized
   * Returns a serialized version of this action
   */
    serialize: function(){},
    /**
   * attachTo
   * Attaches this action to the given workspace
   * @param {Workspace} workspace
   */
    attachTo: function(workspace){
        this.workspace = workspace;
    },
    /**
   * execute
   * Performs the action on the attached workspace.
   */
    execute: function(){
        if (this.handler){
            this.handler.apply(this.scope);
        } else{
            WorkspaceAction.superclass.execute.apply(this, arguments);
        }
    }
});


Workspace.Actions = {};

/**
 * @class Workspace.Actions.ChangePropertyAction
 * An action which encapsulates a change in one or more properties of a group of {@link Workspace.Object}s
 * @extends WorkspaceAction
 * @cfg {Workspace.Object[]} subjects The objects to modify
 * @cfg {Object} values The properties to modify
 */
Workspace.Actions.ChangePropertyAction = function(config){
    Workspace.Actions.ChangePropertyAction.superclass.constructor.apply(this, arguments);
    Ext.applyIf(this, {
        scope: this
    })
};

Ext.extend(Workspace.Actions.ChangePropertyAction, WorkspaceAction, {
    wtype: 'ChangePropertyAction',
    handler: function(){
        for (var i = 0, l = this.subjects.length, subject; i < l; i++){
            subject = this.subjects[i];
            for (var key in this.values){
                subject.set(key, this.values[key]);
            }
        }
    },
    getUndo: function(){
        var undoData = {};
        for (var i = 0, l = this.subjects.length, subject; i < l; i++){
            subject = this.subjects[i];
            for (var key in this.values){
                undoData[key] = subject.get(key);
            }
        }
        return new Workspace.Actions.ChangePropertyAction({
            subjects: this.subjects.concat([]),
            values: undoData,
            text: 'Undo "' + this.text + '"',
            iconCls: this.iconCls,
        });
    },
    serialize: function(){
        return{
            wtype: this.wtype,
            subjects: Workspace.Components.serialize(this.subjects),
            values: Workspace.Components.serialize(this.values)
        }
    }
});

/**
 * @class Workspace.Actions.CreateObjectAction
 * Action which encapsulates creation of one or more Workspace.Objects
 * @extends WorkspaceAction
 * @cfg {Object[]} objects
 * Serialized workspace objects to be created
 * @constructor
 * @param {Object} config
 * @cfg {Object[]} objects An array of Workspace.Object configs
 */
Workspace.Actions.CreateObjectAction = function(config){
    Workspace.Actions.CreateObjectAction.superclass.constructor.apply(this, arguments);
    Ext.applyIf(this, {
        scope: this
    })
};

Ext.extend(Workspace.Actions.CreateObjectAction, WorkspaceAction, {
    wtype: 'CreateObjectAction',
    handler: function(){
        this.workspace.createObjects(this.objects);
    },
    getUndo: function(){
        return new Workspace.Actions.DeleteObjectAction({
            subjects: this.subjects.concat([]),
            text: 'Undo "' + this.text + '"',
            iconCls: this.iconCls
        });
    },
    serialize: function(){
        return{
            wtype: this.wtype,
            objects: Workspace.Components.serialize(this.subjects),
        }
    }
});

/**
 * @class Workspace.Actions.DuplicateObjectAction
 * Action which encapsulates creation of one or more Workspace.Objects
 * @extends WorkspaceAction
 * @cfg {Object[]} objects
 * Serialized workspace objects to be created
 * @constructor
 * @param {Object} config
 * @cfg {Object[]} objects An array of Workspace.Object configs
 */
Workspace.Actions.DuplicateObjectAction = function(config){
    Workspace.Actions.DuplicateObjectAction.superclass.constructor.apply(this, arguments);
    var subj = [], o;
    Ext.each(config.objects,function(obj) {
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
};

Ext.extend(Workspace.Actions.DuplicateObjectAction, WorkspaceAction, {
    wtype: 'DuplicateObjectAction',
    handler: function(){
        this.workspace.createObjects(this.objects);
    },
    getUndo: function(){
        return new Workspace.Actions.DeleteObjectAction({
            subjects: this.objects.concat([]),
            text: 'Undo "' + this.text + '"',
            iconCls: this.iconCls
        });
    },
    serialize: function(){
        return{
            wtype: this.wtype,
            objects: Workspace.Components.serialize(this.subjects),
        }
    }
});



/**
 * @class Workspace.Actions.DeleteObjectAction
 * Action which encapsulates deletion of one or more Workspace.Objects
 * @extends WorkspaceAction
 * @cfg {Object[]} subjects
 * Workspace objects to be deleted
 * @constructor
 * @param {Object} config
 */
Workspace.Actions.DeleteObjectAction = function(config){
    Workspace.Actions.DeleteObjectAction.superclass.constructor.apply(this, arguments);
    Ext.applyIf(this, {
        scope: this
    })
};

Ext.extend(Workspace.Actions.DeleteObjectAction, WorkspaceAction, {
    wtype: 'DeleteObjectAction',
    handler: function(){
        this.workspace.deleteObjects(this.subjects);
    },
    getUndo: function(){
        return new Workspace.Actions.CreateObjectAction({
            objects: Workspace.Components.serialize(this.subjects),
            text: 'Undo "' + this.text + '"',
            iconCls: this.iconCls
        });
    },
    serialize: function(){
        return{
            wtype: this.wtype,
            subjects: Workspace.Components.serialize(this.subjects)
        }
    }
});

/**
 * @class Workspace.Actions.FormIdeaAction
 * Action which encapsulates creating an idea from one or more objects
 * @extends WorkspaceAction
 * @cfg {Object[]} subjects
 * Workspace objects to be added to the idea
 * @constructor
 * @param {Object} config
 */
Workspace.Actions.FormIdeaAction = function(config){
    Workspace.Actions.FormIdeaAction.superclass.constructor.apply(this, arguments);
    Ext.applyIf(this, {
        scope: this,
        ideaConfig: {}
    })
};

Ext.extend(Workspace.Actions.FormIdeaAction, WorkspaceAction, {
    wtype: 'FormIdeaAction',
    handler: function(){
        Ext.apply(this.ideaConfig,{
          children: this.subjects,
          wtype: 'Workspace.IdeaObject'
        });
        var parent = this.workspace.createObject(this.ideaConfig);
        
    },
    getUndo: function(){
        return new Workspace.Actions.OrphanObjectAction({
            objects: this.subjects.concat([]),
            text: 'Undo "' + this.text + '"',
            iconCls: this.iconCls
        });
    },
    serialize: function(){
        return{
            wtype: this.wtype,
            subjects: Workspace.Components.serialize(this.subjects)
        }
    }
});



/**
 * @class Workspace.Actions.AdoptObjectAction
 * Action which encapsulates orphaning (removing from parent) of one or more Workspace.Objects
 * @extends WorkspaceAction
 * @cfg {Object[]} subjects
 * Workspace objects to be deleted
 * @constructor
 * @param {Object} config
 */
Workspace.Actions.AdoptObjectAction = function(config){
    Ext.apply(this, config)
    Workspace.Actions.AdoptObjectAction.superclass.constructor.apply(this, arguments);
    Ext.applyIf(this, {
        scope: this
    })
};

Ext.extend(Workspace.Actions.AdoptObjectAction, WorkspaceAction, {
    wtype: 'AdoptObjectAction',
    handler: function(){
        Ext.each(this.subjects,
        function(obj){
            this.parent.adopt(obj)
        },
        this);
        if (this.parent.adjustSize){
            this.parent.adjustSize()
        }
    },
    getUndo: function(){
        return new Workspace.Actions.OrphanObjectAction({
            objects: this.subjects.concat([]),
            text: 'Undo "' + this.text + '"',
            iconCls: this.iconCls
        });
    },
    serialize: function(){
        return{
            wtype: this.wtype,
            parent: Workspace.Components.serialize(this.parent),
            subjects: Workspace.Components.serialize(this.subjects)
        }
    }
});


/**
 * @class Workspace.Actions.OrphanObjectAction
 * Action which encapsulates orphaning (removing from parent) of one or more Workspace.Objects
 * @extends WorkspaceAction
 * @cfg {Object[]} subjects
 * Workspace objects to be deleted
 * @constructor
 * @param {Object} config
 */
Workspace.Actions.OrphanObjectAction = function(config){
    Ext.apply(this, config)
    Workspace.Actions.OrphanObjectAction.superclass.constructor.apply(this, arguments);
    Ext.applyIf(this, {
        scope: this
    })
};

Ext.extend(Workspace.Actions.OrphanObjectAction, WorkspaceAction, {
    wtype: 'OrphanObjectAction',
    handler: function(){
        Ext.each(this.subjects,
        function(obj){
            obj.orphan()
        });
    },
    getUndo: function(){
        // TODO: fix this
        return new Workspace.Actions.AdoptObjectAction({
            objects: this.subjects.concat([]),
            text: 'Undo "' + this.text + '"',
            iconCls: this.iconCls
        });
    },
    serialize: function(){
        return{
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
Workspace.Actions.ExpandAction = function(config){
    Ext.apply(this, config, {
        size: [400, 400]
    });
    Workspace.Actions.ExpandAction.superclass.constructor.apply(this, arguments);
    Ext.applyIf(this, {
        scope: this
    })
};

Ext.extend(Workspace.Actions.ExpandAction, WorkspaceAction, {
    wtype: 'ExpandAction',
    handler: function(){
        this.workspace.expand(this.size[0], this.size[1]);
    },
    getUndo: function(){

        return new Workspace.Actions.ExpandAction({
            size: [ - this.size[0], -this.size[1]],
            text: 'Undo "' + this.text + '"',
            iconCls: this.iconCls
        });
    },
    serialize: function(){
        return{
            wtype: this.wtype,
            size: this.size
        }
    }
});

Ext.ns('Workspace.tool');

//////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * @class Workspace.Tools
 * @singleton
 * Manages registration and instantiation of {@link Workspace.tool.BaseTool}s
 */
Workspace.Tools = (function(){
    var tools = {};
    return{
        /**
     * register
     * Registers a passed toolName to a {@link Workspace.tool.BaseTool} constructor
     * @param {String} toolName
     * @param {Function} toolClass
     */
        register: function(toolName, toolClass){
            tools[toolName] = toolClass;
        },
        /**
     * getToolClass
     * Returns a tool class given a toolName
     * @param {String} toolName
     */
        getToolClass: function(toolName){
            return tools[toolName];
        },
        /**
     * getAllTools
     * Returns a hash containing all registered tools
     * @return {Object} tools
     */
        getAllTools: function(){
            return tools;
        },
        /**
     * getNewTool
     * Returns an instance of the given toolName, bound to the passed {@link Workspace}
     * @param {String} toolName
     * @param {Workspace} workspace
     * @param {Object} config
     */
        getNewTool: function(toolName, workspace, config){
            var toolClass = Workspace.Tools.getToolClass(toolName);
            return new toolClass(workspace, config);
        }
    };
})();

//////////////////////////////////////////////////////////////////////////////////////////////////

Workspace.Layouts = new App.registry('ltype');

//////////////////////////////////////////////////////////////////////////////////////////////////

var WorkspaceLens = function(config) {
  WorkspaceLens.superclass.constructor.apply(this,arguments);
  Ext.apply(this, config, {
    origin: [0,0],
    zoom: 1.0
  });
};

Ext.extend(WorkspaceLens,Ext.util.Observable,{
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

//////////////////////////////////////////////////////////////////////////////////////////////////

var CardLens = Ext.extend(WorkspaceLens,{
  
})
