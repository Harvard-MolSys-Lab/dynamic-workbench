jQuery.event.props.push("dataTransfer");
Ext.define('App.ui.DragDropManager', {
	extend: 'Ext.util.Observable',
	allowExtDD: false,
	constructor: function(cfg) {
		this.callParent(arguments);
		Ext.apply(this, cfg);
	},
	inheritableStatics: {
		handlers: {},
		handlerOrder: [],
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
		hasHandler: function(mimeType) {
			return (this.handlers[mimeType]!=false);
		},
		getHandler: function(mimeType) {
			return this.handlers[mimeType];
		},
		eachHandler: function(f) {
			Ext.each(this.handlerOrder,function(mime) {
				f(mime,this.getHandler(mime));
			},this);
		},
	},
	getEl: function() {
		return this.element;
	},
	render: function() {
		var el = $(this.getEl().dom);
		//el.get(0).addEventListener("drop", this.onDrop.createDelegate(this), true);
		el.bind('drop',Ext.bind(this.onDrop,this));
		el.bind('dragenter',this.onDragEnter,this);
		el.bind('dragover',this.onDragOver,this);
		//el.bind('dropCreate',this.dropCreate.createDelegate(this));
		if(this.allowExtDD) {
			this.dropZone = new Ext.dd.DropTarget(this.workspace.getEl(), {
				notifyDrop: Ext.bind(this.notifyDrop,this),
				// notifyEnter: function() {
				// //alert('Enter');
				// return true;
				// }
			});
		}
	},
	// ExtJS Drop
	notifyDrop: function(dd, e,
	data) {
		if(data.mimeType && Ext.getClass(this).hasHandler(data.mimeType)) {
			h.call(this,data,e);
			return true;
		} else {
			return false;
		}
	},
	// Browser Drop
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
	onDragEnter: function(e) {
		e.preventDefault();
	},
	onDragOver: function(e) {
		e.preventDefault();
	},
	destroy: function() {
		this.workspace.getEl().un('drop',this.onDrop,this);
	},
	getAdjustedXYcoords: function() {
		return Workspace.tools.BaseTool.prototype.getAdjustedXYcoords.apply(this,arguments);
	},
	getAdjustedXY: function() {
		return Workspace.tools.BaseTool.prototype.getAdjustedXY.apply(this,arguments);
	},
	// File drop
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
	getUploadUrl: function() {
		return App.getEndpoint('upload');
	}
}, function() {
});