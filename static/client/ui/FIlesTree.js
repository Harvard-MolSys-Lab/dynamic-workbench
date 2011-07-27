/**
 * Displays a tree of files in the user's home directory
 */
Ext.define('App.ui.FilesTree', {
	extend: 'Ext.tree.Panel',
	requires: ['App.ui.CreateMenu','App.ui.Launcher','App.ui.FilesTree.FileUploader','App.ui.FilesTree.DragDropManager'],
	title: 'Files',
	newFileNumber: 0,
	loaders: 0,
	useArrows: true,
	/**
	 * @cfg {Boolean}
	 * True to show a context menu on right click to allow the user to open, rename, and create new files; 
	 * set to false to allow custom behavior (e.g. for embedding the {@link App.ui.FilesTree} in a menu)
	 */
	createContextMenu: true,
	allowDrop : true,
	//displayRoot: false,
	initComponent: function() {
		Ext.apply(this, {
			/*
			columns: [{
				xtype:'treecolumn',
				header: 'File',
				field: {
					xtype: 'textfield',
					allowBlank: false
				},
				dataIndex: 'text',
				sortable: true,
				resizable: false,
				flex: 1
			}],
			*/
			viewConfig: this.allowDrop ? {
				plugins: [{
					ptype: 'treeviewdragdrop',
				},],
				listeners: {
					drop: {
						fn: function() {
							this.getStore().sync();
						},
						scope: this
					}
				}
			} : {},
			store: App.DocumentStore,
			listeners:  {
				beforeitemcontextmenu: (this.createContextMenu ? {
					fn: this.showContextMenu,
					scope: this,
				} : {}),
				itemdblclick: {
					fn: this.click,
					scope: this
				},
			},
		});
		this.callParent(arguments);
		
		// Builds the context menu (TODO: move to separate class)
		if(this.createContextMenu) {
			this.contextMenu = Ext.create('Ext.menu.Menu', {
				floating: true,
				shadow: 'sides',
				items:[{
					text: 'Open',
					iconCls: 'folder-open',
					handler: function() {
						this.open(this.currentRecord);
					},
					scope: this,
				},{
					text: 'Refresh',
					iconCls: 'refresh',
					handler: function() {
						this.refresh(this.currentRecord);
					},
					scope:this,
				},{
					text: 'Download',
					iconCls: 'download',
					handler: function() {
						this.download(this.currentRecord)
					},
					scope:this,
					enableIf: function(rec) {
						return (rec.isLeaf());
					}
				},{
					text: 'Create',
					iconCls: 'plus-button',
					menu: Ext.create('App.ui.CreateMenu',{}),
				},{
					text: 'Delete',
					iconCls: 'delete-button',
					handler: function() {
						Ext.MessageBox.show({
							title:'Confirm file deletion',
							msg:'Are you sure you want to delete '+this.currentRecord.get('text')+' ?',
							buttons: Ext.MessageBox.YES+Ext.MessageBox.NO,
							closable: false,
							fn: function(btn) {
								if(btn=='yes') {
									this.deleteSelectedDocument()
								}
							},
							icon: Ext.MessageBox.WARNING,
							scope:this
						});
					},
					scope: this,
				},'-',{
					text: 'Rename:',
					canActivate: false,
					iconCls: 'rename',
					enableIf: function(rec) {
						return (rec.get('preventRename') != true) && (!rec.isRoot());
					}
				},{
					xtype: 'textfield',
					allowBlank: false,
					itemId: 'filename',
					ref: 'fileNameField',
					indent: true,
					enableIf: function(rec) {
						return (rec.get('preventRename') != true) && (!rec.isRoot());
					}
				}],
				renderTo: Ext.getBody(),
				setFileName: function(filename) {
					var fileNameField = this.fileNameField;
					fileNameField.originalValue = filename;
					fileNameField.setValue(filename);
				},
			});
			_.each(this.contextMenu.query('*[ref]'), function(cmp) {
				this[cmp.ref] = cmp;
			},this);
			this.contextMenu.fileNameField = this.fileNameField;
	
			this.fileNameField.on('blur', function() {
				var v;
				if(this.fileNameField.isDirty()) {
					v = this.fileNameField.getValue();
					this.currentRecord.set('text',v);
					//this.currentRecord.save();
					this.getStore().sync();
					this.fileNameField.originalValue = v;
					this.fileNameField.checkDirty();
	
				}
			},this);
			this.on('afterrender',this.afterrender,this)
		}
	},
	afterrender: function() {
		this.ddManager = Ext.create('App.ui.FilesTree.DragDropManager',{
			filesTree: this
		});
		this.ddManager.render();
	},
	showContextMenu: function(tree,rec,dom,i,e) {
		this.currentRecord = rec;
		var ctx = this.contextMenu;
		ctx.setFileName(rec.get('text'));
		_.each(ctx.query('*[enableIf]'),function(cmp) {
			if(_.isFunction(cmp.enableIf)) {
				if(cmp.enableIf(rec)) {
					cmp.enable();
				} else {
					cmp.disable();
				}
			}
		});
		ctx.showAt(e.getXY());
		//ctx.show();//dom);
		//ctx.alignTo(Ext.get(dom),'tl-bl',[5,0]);
		e.stopEvent();
		return false;
	},
	/**
	 * Reloads the file heirarchy underneath the provided {@link App.Document}
	 * @param {App.Document} rec The record under which to refresh
	 */
	refresh: function(rec) {
		if(rec) {
			//hackity hack
			rec.collapse();
			rec.set('loaded',false);
			// this.getView().on('itemupdate', function() {
			// rec.expand();
			// },this, {
			// single: true
			// })
			this.getView().refreshNode(rec.index);
		}
	},
	/**
	 * Downloads the requested file
	 */
	download: function(rec) {
		if(rec) {
			rec.download();
		}
	},
	/**
	 * Deletes the selected document
	 */
	deleteSelectedDocument: function() {
		//var rec = this.getSelectionModel().getLastSelected();
		var rec = this.currentRecord;
		this.deleteDocument(rec);
	},
	/**
	 * Deletes the provided {@link App.Document}
	 * @param {App.Document} rec
	 */
	deleteDocument: function(rec) {
		if(rec) {
			rec.remove(false);
			this.getStore().sync();
		}
	},
	/**
	 * Called when the user clicks on a cell
	 * @param {Ext.tree.Panel} tree
	 * @param {App.Document} rec
	 * @param {Mixed} item
	 * @param {Number} i Index of the selected record
	 * @param {Event} e
	 */
	click: function(tree,rec,item,i,e) {
		this.open(rec);
	},
	/**
	 * Opens the provided {@link App.Document} using {@link App.ui.Launcher#launch}
	 * @param {App.Document} rec The document to open
	 */
	open: function(rec) {
		if(rec) {
			if(!App.ui.Launcher.launchDocument(rec) && !rec.isLeaf()) {
				this.getView().expand(rec);
			}
		}
	},
	/**
	 * Opens the last selected document
	 */
	openSelection: function() {
		this.open(this.getSelectionModer().getLastSelected());
	},
	/**
	 * Selects a node based on a file path
	 */
	selectNode : function(node) {
		this.selectPath(node);
		// var rec = this.getStore().findRecord('node',node);
		// if(rec) {
			// this.getSelectionModel().
		// }
	},
	/**
	 * Creates a new document underneath the last selected record with the passed name
	 * @param {String} name of the new file 
	 */
	newFileUnderSelection: function(name) {
		var rec = this.getSelectionModel().getLastSelected();
		return this.newFile(rec,name);
	},
	/**
	 * Create a new document underneath the passed <var>rec</var>, if <var>rec</var> is a folder; else creates a 
	 * sibling to <var>rec</var>. 
	 * @param {App.Document} rec
	 * @param {String} name 
	 */
	newFile: function(rec,name) {
		(rec) || (rec = this.getRootNode());
		if(rec.isLeaf() && rec.parentNode) {
			rec = rec.parentNode;
		}
		var newRec = Ext.create('App.Document', {
			node: App.Path.join([rec.get('node'),name]),
			text: name,
			leaf: !App.Path.isFolder(name),
		});
		rec.appendChild(newRec);
		this.getStore().sync();
		rec.expand();
		return newRec;
	},
	newFileName: function() {
		this.newFileNumber++;
		return 'Untitled-'+this.newFileNumber;
	},
});