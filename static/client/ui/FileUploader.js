/**
 * Manages file uploading
 */
Ext.define('App.ui.FileUploader', {
	extend: 'Ext.util.Observable',
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
			Ext.each(this.handlerOrder,f);
		},
		getExtension: function(fileName) {
			return fileName.split('.').pop();
		},
	},
	getConfig: function() {
		return {
			onComplete: Ext.bind(this.onComplete,this),
			onProgress: Ext.bind(this.onProgress,this),
			onCancel: Ext.bind(this.onCancel,this)
		};
	},

	onComplete: function(id, fileName, response) {
		var data = response,ext,name;
		if(response.success) {
			name = response.readablePath;
			ext = Ext.getClass(this).getExtension(name);

			if(Ext.getClass(this).hasHandler(ext)) {
				Ext.getClass(this).getHandler(ext).call(this,name)
			} else {
				//Ext.getClass(this).getHandler('default')
			}
		}
	},
	onProgress: function(id, fileName, loaded, total) {

	},
	onCancel: function(id, fileName) {

	}
}, function() {
});