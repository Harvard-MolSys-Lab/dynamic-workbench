Ext.define('App.ui.files.FileUploader', {
	statics : {
		buildStandardHandlers : function() {
			var types = ['jpg', 'png', 'gif', 'txt', 'pdf', 'svg', 'txt', 'seq', 'nupack', 'nodal', 'workspace', 'html', 'js', 'xml'];
			types = _.uniq(types.concat(_.keys(App.triggers)));

			App.ui.files.FileUploader.addHandler(types, function(fileName) {
				App.ui.filesTree.refreshDocument(this.record);
				this.filesTree.loaders--;
				this.filesTree.setLoading((this.filesTree.loaders > 0));
				Ext.msg('File', "{0} uploaded successfully.", fileName);
			});
		}
	},
	extend : 'App.ui.FileUploader',
}, function() {
	App.ui.files.FileUploader.addHandler(['exe', 'sh', 'run', ''], function(fileName) {
		Ext.MsgBox.alert("Not Permitted", "Uploading this type of file is not allowed for security reasons.");
	});
	App.on('load',App.ui.files.FileUploader.buildStandardHandlers);
}); 