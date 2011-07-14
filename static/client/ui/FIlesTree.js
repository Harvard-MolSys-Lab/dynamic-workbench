Ext.define('App.ui.FilesTree', {
	extend: 'Ext.tree.Panel',
	requires: ['App.ui.CreateMenu','App.ui.Launcher'],
	title: 'Files',
	newFileNumber: 0,
	useArrows: true,
	createContextMenu: true,
	
	//displayRoot: false,
	initComponent: function() {
		Ext.apply(this, {
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
					fn: function(tree,rec,dom,i,e) {
						this.currentRecord = rec;
						var ctx = App.ui.filesTree.contextMenu;
						ctx.setFileName(rec.get('text'));
						ctx.show();//dom);
						ctx.alignTo(Ext.get(dom),'tl-bl',[5,0]);
						e.stopEvent();
						return false;
					},
					scope: this
				} : {}),
				itemclick: {
					fn: this.click,
					scope: this
				},
			},
		});
		this.callParent(arguments);
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
				},{
					xtype: 'textfield',
					allowBlank: false,
					itemId: 'filename',
					ref: 'fileNameField',
					indent: true,
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
		}
	},
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
	deleteSelectedDocument: function() {
		//var rec = this.getSelectionModel().getLastSelected();
		var rec = this.currentRecord;
		this.deleteDocument(rec);
	},
	deleteDocument: function(rec) {
		if(rec) {
			rec.remove(false);
			this.getStore().sync();
		}
	},
	click: function(tree,rec,item,i,e) {
		this.open(rec);
	},
	open: function(rec) {
		if(rec.get('trigger')) { // && App.ui.Launcher.has(rec.get('trigger'))) {
			App.ui.Launcher.launch(rec.get('trigger'),rec);
		}
		//if(rec.get('type') && App.ui.Launcher.has(rec.get('type'))) {
		//	App.ui.Launcher.launchType(rec.get('type'),rec);
		//}
	},
	newFileUnderSelection: function(name) {
		var rec = this.getSelectionModel().getLastSelected();
		this.newFile(rec,name);
	},
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