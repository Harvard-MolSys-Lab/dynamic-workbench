Ext.define('App.ui.FilesTree.DragDropManager', {
	constructor : function() {
		this.callParent(arguments);
		if(this.filesTree && this.filesTree.getEl()) {
			this.element = this.filesTree.getEl();
		}
	},
	require: ['App.ui.FilesTree.FileUploader'],
	extend : 'App.ui.DragDropManager',
	fileHandler : function(files, e) {
		var el = Ext.get(e.target).up('.x-grid-row'), rec;
		if(el) {
			rec = this.filesTree.getView().getRecord(el);
			if(rec) {
				uh = this.getUploadHandler();
				Ext.each(files, function(file) {
					var id = uh.add(file), uploader = Ext.create('App.ui.FilesTree.FileUploader', {
						filesTree : this.filesTree,
						record : rec,
						manager : this,
						fileId : id,
					});
					this.fileUploaders[id] = uploader;
					uh.upload(id, {
						userfile : App.Path.join([App.Path.pop(rec.getPath(), 1), uh.getName(id)])
					});
					this.filesTree.loaders++;
					this.filesTree.setLoading(this.filesTree.loaders);
				}, this);
			}
		}
	}
});
