Ext.define('App.ui.Application', {
	autoHideLoadingMask: true,
	autoHideSavingMask: true,
	loadingMsg: 'Loading File...',
	savingMsg: 'Saving File...',
	constructor: function(config) {
		this.doc = 	this.document = config ? (config.document ? config.document : false) : false;

		if(this.doc) {
			this.doc.on('edit',this.updateTitle,this);
			this.updateTitle();
		}
	},
	updateTitle: function() {
		var title = this.editorType;
		if(this.doc) {
			title = this.doc.getBasename()+' ('+title+')';
		}
		try {
			this.setTitle(title);
		} catch (e) {
		}
	},
	getPath: function() {
		return this.doc.getPath();
	},
	/**
	 * loadFile
	 * Loads the file body for this.{@link #document}. Calls {@link #doLoad} or {@link #doLoadFail} as an internal callback, which
	 * in turn call {@link #onLoad}. These methods handle displaying a loading mask as well.
	 */
	loadFile: function() {
		this.loadingMask = new Ext.LoadMask(this.body, {
			msg: this.loadingMsg,
		});
		if(this.doc) {
			this.doc.loadBody({
				success: this.doLoad,
				failure: this.doLoadFail,
				scope: this
			});
		} else {
			this.data = '';
			this.onLoad();
		}
	},
	doLoad: function(text) {
		this.data = text;
		this.onLoad();
		if(this.autoHideLoadingMask)
			this.loadingMask.hide();
	},
	/**
	 * doLoadFail
	 * callback to inform the user of failed load
	 */
	doLoadFail: function(e) {
		if(this.autoHideLoadingMask)
			this.loadingMask.hide();
		console.log('File load failed.', e);
		Ext.log('File load failed.')
	},
	onLoad: function() {
	},
	/**
	 * saveFile
	 * Saves the file body for this.{@link #document}. Retrieves application state with {@link #getSaveData}.
	 * Calls {@link #doSave} or {@link #doSaveFail} as internal callbacks, which
	 * in turn call {@link #onSave}. These methods handle displaying a saving mask as well.
	 */

	saveFile: function() {
		this.savingMask || (this.savingMask = new Ext.LoadMask(this.body, {
				msg: this.savingMsg
			}));
		this.savingMask.show();
		//this.statusBar.setBusy();
		var o = this.getSaveData();
		this._lastSave = o;
		if(Ext.isObject(o)) {
			o = Ext.encode(o);
		}
		this.doc.saveBody(o, {
			success: this.doSave,
			failure: this.doSaveFail,
			scope: this
		});
		// if(App.User.isLoggedIn()) {
		// Ext.Ajax.request({
		// url: App.getEndpoint('save'),//'/canvas/index.php/workspaces/save',
		// params: {
		// data: o,
		// node: this.path,
		// },
		// success: this.onSave,
		// failure: this.onSaveFail,
		// scope: this
		// });
		// } else {
		// Ext.log('Not logged in; could not save workspace to server.');
		// }
		//Ext.log(Ext.encode(s));

	},
	/**
	 * doSave
	 * callback to restore the UI after successful save
	 */
	doSave: function() {
		if(this.autoHideSavingMask)
			this.savingMask.hide();
		this.onSave();
		console.log('File Saved.', this._lastSave);
		Ext.log('File saved to server.');
	},
	/**
	 * doSaveFail
	 * callback to inform the user of failed save
	 */
	doSaveFail: function() {
		if(this.autoHideSavingMask)
			this.savingMask.hide();
		alert("File saving failed.");
		console.log('File save failed.', this._lastSave);
		Ext.log('File save failed.')
	},
	/**
	 * onSave
	 * Override this method to provide application-specific behavior after a save.
	 */
	onSave: function() {

	},
	/**
	 * getSaveData
	 * Override this method to return state data to be saved to the {@link #document} file.
	 */
	getSaveData: function() {
		return '';
	},
});