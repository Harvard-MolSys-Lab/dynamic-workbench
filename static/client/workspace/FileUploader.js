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
