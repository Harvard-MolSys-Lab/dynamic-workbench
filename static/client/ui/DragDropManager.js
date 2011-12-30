jQuery.event.props.push("dataTransfer");

/**
 * Manages drag-and-drop activity for a component in the application. Supports 
 * browser-based drag-and-drop, file uploading, and Ext-based drag-and-drop. 
 * Allows configuration of different "handlers" to respond to drag-and-drop 
 * events for objects based on MIME-type. 
 */
Ext.define('App.ui.DragDropManager', {
	extend: 'Ext.util.Observable',
	/**
	 * @cfg
	 * True to allow drag-and-drop from the Ext drag-and-drop facility. Creates
	 * a #dropZone for this manager.
	 */
	allowExtDD: false,
	constructor: function(cfg) {
		this.callParent(arguments);
		Ext.apply(this, cfg);
	},
	inheritableStatics: {
		handlers: {},
		handlerOrder: [],
		/**
		 * Add a handler to respond to a particular MIME type
		 * @param {String} mimeType
		 * @param {Function} handler
		 */
		addHandler: function(mimeType, handler) {
			if(Ext.isArray(mimeType)) {
				Ext.each(mimeType, function(mt) {
					this.handlers[mt] = handler;
					this.handlerOrder.unshift(mt);
				}, this);
			} else {
				this.handlers[mimeType] = handler;
				this.handlerOrder.unshift(mimeType);
			}
		},
		/**
		 * Determine whether a handler exists for a particular MIME-type
		 * @param {String} mimeType
		 */
		hasHandler: function(mimeType) {
			return (this.handlers[mimeType]!=false);
		},
		/**
		 * Returns the handler for a MIME-type
		 * @param {String} mimeType
		 */
		getHandler: function(mimeType) {
			return this.handlers[mimeType];
		},
		/**
		 * Performs the passed function once for each handler, in each case passing:
		 * 	-	{String} mimeType
		 * 	-	{Function} handler
		 * @param {Function} f
		 */
		eachHandler: function(f) {
			Ext.each(this.handlerOrder,function(mime) {
				f(mime,this.getHandler(mime));
			},this);
		},
	},
	/**
	 * @return {Ext.Element} element The element to which this manager is bound.
	 */
	getEl: function() {
		return this.element;
	},
	/**
	 * Attaches requisite event handlers to the configured #element.
	 */
	render: function() {
		var el = $(this.getEl().dom);
		//el.get(0).addEventListener("drop", this.onDrop.createDelegate(this), true);
		el.bind('drop',Ext.bind(this.onDrop,this));
		el.bind('dragenter',this.onDragEnter,this);
		el.bind('dragover',this.onDragOver,this);
		//el.bind('dropCreate',this.dropCreate.createDelegate(this));
		if(this.allowExtDD) {
			
			/**
			 * @property {Ext.dd.DropTarget}
			 * Handles Ext drag and drop events
			 */
			this.dropZone = new Ext.dd.DropTarget(this.workspace.getEl(), {
				notifyDrop: Ext.bind(this.notifyDrop,this),
			});
		}
	},
	/*
	 * Handles events from the ExtJS drag and drop facility
	 */
	notifyDrop: function(dd, e,	data) {
		if(data.mimeType && Ext.getClass(this).hasHandler(data.mimeType)) {
			var h = Ext.getClass(this).getHandler(data.mimeType);
			h.call(this,data,e);
			return true;
		} else {
			return false;
		}
	},
	/**
	 * Handles browser drop events.
	 */
	onDrop: function(e) {
		var that = this;
		if(e.dataTransfer.files && this.fileHandler) {
			this.fileHandler(e.dataTransfer.files,e);
		}
		Ext.getClass(this).eachHandler( function(mimeType,h) {
			if(e.dataTransfer.types.indexOf(mimeType)!=-1) {
				h.call(that,e.dataTransfer.getData(mimeType),e);
				return false;
			}
		});
		e.preventDefault();
	},
	/**
	 * Prevents the default action on Browser dragenter
	 */
	onDragEnter: function(e) {
		e.preventDefault();
	},
	/**
	 * Prevents the default action on Browser dragover
	 */
	onDragOver: function(e) {
		e.preventDefault();
	},
	destroy: function() {
		this.workspace.getEl().un('drop',this.onDrop,this);
	},
	/**
	 * inheritdoc Workspace.tools.BaseTool#getAdjustedXYcoords
	 */
	getAdjustedXYcoords: function() {
		return Workspace.tools.BaseTool.prototype.getAdjustedXYcoords.apply(this,arguments);
	},
	/**
	 * inheritdoc Workspace.tools.BaseTool#getAdjustedXY
	 */
	getAdjustedXY: function() {
		return Workspace.tools.BaseTool.prototype.getAdjustedXY.apply(this,arguments);
	},
	/**
	 * Called upon completion of a file upload
	 */
	onFileComplete: function(id, fileName, response) {
		if(this.fileUploaders[id]) {
			this.fileUploaders[id].onComplete(id, fileName, response);
			delete this.fileUploaders[id];
		}
	},
	/**
	 * Called upon progress of a file upload
	 */
	onFileProgress: function(id, fileName, loaded, total) {
		if(this.fileUploaders[id]) {
			this.fileUploaders[id].onProgress(id, fileName, loaded, total);
		}
	},
	/**
	 * Called when a file upload is cancelled
	 */
	onFileCancel: function(id, fileName) {
		if(this.fileUploaders[id]) {
			this.fileUploaders[id].onCancel(id, fileName);
			delete this.fileUploaders[id];
		}
	},
	/**
	 * Returns an object to manage file uploads
	 */
	getUploadHandler: function() {
		/**
		 * @property {qq.UploadHandlerXhr} uploadHandler
		 */
		if(!this.uploadHandler) {
			this.uploadHandler = new qq.UploadHandlerXhr({
				action: this.getUploadUrl(),
				onComplete: Ext.bind(this.onFileComplete,this),
				onCancel: Ext.bind(this.onFileCancel,this),
				onProgress: Ext.bind(this.onFileProgress,this)
			});
			this.fileUploaders = {};
		}
		return this.uploadHandler;
	},
	/**
	 * Override to provide custom logic on file upload (see {@link Workspace.DDManager#fileHandler} for example)
	 */
	fileHandler: function(files,pos) {
		
	},
	/**
	 * Accesses the URL to which file uploads should be sent.
	 */
	getUploadUrl: function() {
		return App.getEndpoint('upload');
	}
}, function() {
});