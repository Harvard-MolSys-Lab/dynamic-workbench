Ext.define('App.ui.files.FileUploader',{
	extend: 'App.ui.FileUploader',
},function() {
	App.ui.files.FileUploader.addHandler(['jpg','png','gif','txt','pdf','svg','txt','seq','nupack','nodal','workspace','html','js','xml'], function(fileName) {
		App.ui.filesTree.refresh(this.record);
		this.filesTree.loaders--;
		this.filesTree.setLoading((this.filesTree.loaders > 0));
		Ext.msg('File',"{0} uploaded successfully.",fileName);
	});
	App.ui.files.FileUploader.addHandler(['exe','sh','run',''], function(fileName) {
		Ext.MsgBox.alert("Not Permitted","Uploading this type of file is not allowed for security reasons.");
	});
});