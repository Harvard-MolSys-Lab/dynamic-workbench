/**
 * Mixin which provides shared helper methods to client-side applications within the interface
 *
 * # Loading and saving files
 * 
 * You can override a few key methods for file loading/saving:
 * 
 * -	{#onLoad} - Override to update your UI once data is loaded
 * -	{#onSave} - Override to update your UI in response to data being saved
 * -	{#getSaveData} - Override to provide data to be saved
 * 
 */
Ext.define('App.ui.Application', {
	/**
	 * @cfg
	 * Whether to automatically hide the Loading mask on {@link #doLoad}; set to <var>false</var>
	 * in order to provide custom logic to show or hide the loading mask
	 */
	autoHideLoadingMask : true,
	/**
	 * @cfg
	 * Whether to automatically hide the Saving mask on {@link #doSave}; set to <var>false</var>
	 * in order to provide custom logic to show or hide the saving mask
	 */
	autoHideSavingMask : true,
	/**
	 * @cfg
	 * Message to display when the application pane is masked while loading a file
	 */
	loadingMsg : 'Loading File...',
	/**
	 * @cfg
	 * Message to display when the application pane is masked while loading a file
	 */
	savingMsg : 'Saving File...',

	/**
	 * @cfg
	 * `true` to prompt the user if they try to close the page with unsaved changes in this application,
	 * `false` otherwise; allows embedded applications not to trigger save warnings
	 */
	trackSaves: true,
	preventUpdateTitle: false,
	disableFancyTitles: false,
	unsaved: false,
	/**
	 * @constructor
	 */
	constructor : function(config) {
		this.bindDocument( config ? (config.document ? config.document : null) : null, true);
		Ext.util.Observable.prototype.constructor.apply(this)
		this.on('destroy', this.markSaved, this);
	},
	requestDocument: function(callback,scope) {
		if(this.document) {
			Ext.callback(callback,scope,[this.document]);
		} else {
			Ext.window.MessageBox.prompt('Save document','This action requires you to save your work to a file; please enter a file name.',function(buttonId, filename) {
				if(buttonId == 'ok') {
					var file = App.ui.filesTree.newFileUnderSelection(fileName);
					this.bindDocument(file);
				}
			},this);
		}
	},
	/**
	 * Re-fetches the {@link App.Document document} from App.DocumentStore
	 */
	renew : function() {
		if(this.doc) {
			var oldId = this.doc.id;
			var newDoc = App.DocumentStore.getRootNode().findChildBy(function(child) {
				return (child.id == oldId)
			}, true);
			if(newDoc) {
				this.unbindDocument();
				this.bindDocument(newDoc);
			}
		}
	},
	/**
	 * Attaches a {@link App.Document} to this Application, which can be saved by the user.
	 */
	bindDocument : function(doc, silent) {
		silent || ( silent = false);
		/**
		 * @property {App.Document} doc
		 * Alias for {@link #document}.
		 */
		/**
		 * @property {App.Document} document
		 * The currently open {@link App.Document}.
		 */
		this.doc = this.document = doc

		if(this.doc) {
			this.doc.on('edit', this.updateTitle, this);
			this.updateTitle();
			if(!silent) {
				/**
				 * @event binddocument
				 * Fires upon {@link #bindDocument binding} of a {@link App.Document document}
				 * to this application.
				 * @param {App.ui.Application} application
				 * @param {App.Document} document
				 */
				this.fireEvent('binddocument', this, doc);
			}
		}
	},
	unbindDocument : function() {
		this.doc.un('edit', this.updateTitle, this);

		this.doc = this.document = null;
		/**
		 * @event unbinddocument
		 * Fires upon {@link #unbindDocument unbinding} of a {@link App.Document document}
		 * to this application.
		 * @param {App.ui.Application} application
		 * @param {App.Document} document
		 */
		this.fireEvent('unbinddocument', this, this.doc);

	},
	/**
	 * Updates title of the Application panel to display the name of the {@link App.Document} being edited
	 */
	updateTitle : function() {
		var title = this.editorType;
		if(this.doc) {
			title = this.doc.getBasename() + ' <span class="app-type">(' + title + ')</span>' + (this.unsaved ? '*' : '');
		}
		if(this.disableFancyTitles) {
			title = Ext.util.Format.stripTags(title);
		}
		if(this.rendered && !this.preventUpdateTitle) 
			this.setTitle(title);
		else
			this.title = title;
	},
	/**
	 * Returns the path to the currently open doc
	 */
	getPath : function() {
		return this.doc ? this.doc.getDocumentPath() : false;
	},
	/**
	 * Alias for #getPath, by analogy to App.Document#getDocumentPath
	 */
	getDocumentPath : function() {
		return this.getPath();
	},
	/**
	 * Loads the file body for this.{@link #document}. Calls {@link #doLoad} or {@link #doLoadFail} as an internal callback, which
	 * in turn call {@link #onLoad}. These methods handle displaying a loading mask as well.
	 */
	loadFile : function() {
		this.loadingMask = new Ext.LoadMask(this.body, {
			msg : this.loadingMsg,
		});
		if(this.doc) {
			this.doc.loadBody({
				success : this.doLoad,
				failure : this.doLoadFail,
				scope : this
			});
		} else {
			this.data = '';
			this.onLoad();
		}
	},
	/**
	 * Internal callback from {@link #loadFile} which calls user-specified {@link #onLoad}
	 */
	doLoad : function(text) {
		this.data = text;
		this.onLoad();
		if(this.autoHideLoadingMask)
			this.loadingMask.hide();
	},
	/**
	 * Internal callback to inform the user of failed load
	 */
	doLoadFail : function(e) {
		if(this.autoHideLoadingMask)
			this.loadingMask.hide();
		console.log('File load failed.', e);
		App.log('File load failed.', {
			silent : true,
			error : true,
		});
		Ext.msg('File', 'Couldn\'t load file <strong>{0}</strong>. Message: {1}', this.document.get('text'), e.message || 'none');
	},
	/**
	 * Callback from {@link #doLoad} and {@link #doLoadFail}. Override this callback to provide
	 * custom logic on {@link App.Document} load
	 */
	onLoad : function() {
	},
	/**
	 * Alias for {@link #saveFile}.
	 */
	save : function() {
		return this.saveFile.apply(this, arguments);
	},
	/**
	 * Saves the file body for this.{@link #document}. Retrieves application state with {@link #getSaveData}.
	 * Calls {@link #doSave} or {@link #doSaveFail} as internal callbacks, which
	 * in turn call {@link #onSave}. These methods handle displaying a saving mask as well.
	 */
	saveFile : function() {
		this.savingMask || (this.savingMask = new Ext.LoadMask(this.body, {
			msg : this.savingMsg
		}));
		this.savingMask.show();
		//this.statusBar.setBusy();
		var o = this.getSaveData();
		this._lastSave = o;
		if(Ext.isObject(o)) {
			o = Ext.encode(o);
		}
		this.doc.saveBody(o, {
			success : this.doSave,
			failure : this.doSaveFail,
			scope : this
		});

	},
	/**
	 * Internal callback from {@link #save} to restore the UI after successful save
	 */
	doSave : function() {
		if(this.autoHideSavingMask)
			this.savingMask.hide();
		this.onSave();
		//console.log('File Saved.', this._lastSave);
		App.log('File saved to server.', {
			silent : true,
			iconCls : 'save',
		});
		Ext.msg('File', '<strong>{0}</strong> saved to server.', this.document.get('text'));

		this.markSaved();
	},
	/**
	 * Internal callback from {@link #save} to inform the user of failed save
	 */
	doSaveFail : function(e) {
		if(this.autoHideSavingMask)
			this.savingMask.hide();
		App.log('File save failed.', {
			silent : true,
			error : true,
		});
		Ext.msg('File', 'Couldn\'t save file <strong>{0}</strong>. Message: {1}', this.document.get('text'), e.message || 'none');
	},
	/**
	 * Callback form {@link #doSave} or {@link #doSaveFail}. Override this method to
	 * provide application-specific behavior after a save.
	 */
	onSave : function() {

	},
	/**
	 * Override this method to return state data to be saved to the {@link #document} file.
	 */
	getSaveData : function() {
		return '';
	},

	markUnsaved: function () {
		this.unsaved = true;
		if(this.trackSaves)
			App.ui.Launcher.markUnsaved(this);
		this.updateTitle();
	},
	markSaved: function () {
		this.unsaved = false;
		if(this.trackSaves)
			App.ui.Launcher.markSaved(this);
		this.updateTitle();
	},
});
