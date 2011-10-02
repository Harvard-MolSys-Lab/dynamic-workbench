

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

