/**
 * Mixin which provides shared helper methods to client-side applications within the interface
 */
Ext.define('App.ui.Application', {
	/**
	 * @cfg
	 * Whether to automatically hide the Loading mask on {@link #doLoad}; set to <var>false</var>
	 * in order to provide custom logic to show or hide the loading mask 
	 */
	autoHideLoadingMask: true,
	/**
	 * @cfg
	 * Whether to automatically hide the Saving mask on {@link #doSave}; set to <var>false</var>
	 * in order to provide custom logic to show or hide the saving mask 
	 */
	autoHideSavingMask: true,
	loadingMsg: 'Loading File...',
	savingMsg: 'Saving File...',
	/**
	 * @constructor
	 */
	constructor: function(config) {
		/**
		 * @property {App.Document} doc
		 * Alias for {@link #document}.
		 */
		/**
		 * @property {App.Document} document
		 * The currently open {@link App.Document}.
		 */
		this.doc = 	this.document = config ? (config.document ? config.document : false) : false;

		if(this.doc) {
			this.doc.on('edit',this.updateTitle,this);
			this.updateTitle();
		}
	},
	/**
	 * Updates title of the Application panel to display the name of the {@link App.Document} being edited
	 */
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
	/**
	 * Returns the path ot the currently open doc
	 */
	getPath: function() {
		return this.doc.getPath();
	},
	/**
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
	/**
	 * Internal callback from {@link #loadFile} which calls user-specified {@link #onLoad}
	 */
	doLoad: function(text) {
		this.data = text;
		this.onLoad();
		if(this.autoHideLoadingMask)
			this.loadingMask.hide();
	},
	/**
	 * Internal callback to inform the user of failed load
	 */
	doLoadFail: function(e) {
		if(this.autoHideLoadingMask)
			this.loadingMask.hide();
		console.log('File load failed.', e);
		Ext.log('File load failed.')
	},
	/**
	 * Callback from {@link #doLoad} and {@link #doLoadFail}. Override this callback to provide 
	 * custom logic on {@link App.Document} load
	 */
	onLoad: function() {
	},
	/**
	 * Alias for {@link #saveFile}.
	 */
	save: function() {
		return this.saveFile.apply(this,arguments);
	},
	/**
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
	 * Internal callback from {@link #save} to restore the UI after successful save
	 */
	doSave: function() {
		if(this.autoHideSavingMask)
			this.savingMask.hide();
		this.onSave();
		console.log('File Saved.', this._lastSave);
		Ext.log('File saved to server.');
	},
	/**
	 * Internal callback from {@link #save} to inform the user of failed save
	 */
	doSaveFail: function() {
		if(this.autoHideSavingMask)
			this.savingMask.hide();
		alert("File saving failed.");
		console.log('File save failed.', this._lastSave);
		Ext.log('File save failed.')
	},
	/**
	 * Callback form {@link #doSave} or {@link #doSaveFail}. Override this method to 
	 * provide application-specific behavior after a save.
	 */
	onSave: function() {

	},
	/**
	 * Override this method to return state data to be saved to the {@link #document} file.
	 */
	getSaveData: function() {
		return '';
	},
});