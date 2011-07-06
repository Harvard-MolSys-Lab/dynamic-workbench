/********************************************
 * InfoMachine
 *
 * Copyright (c) 2010 Casey Grun
 *********************************************/

/*
 * Note: for the time being, this file is fairly spaghetti-like. Forgive the mess.
 */

var console, cp;

Ext.ns('App.ui');

// Bootstrap user interface
App.ui.buildInterface = function() {

	// Initialize random Ext things
	Ext.QuickTips.init();

	// Remove the loading panel after the page is loaded
	Ext.get('loading').remove();
	Ext.get('loading_mask').fadeOut({
		remove: true
	});

	var scriptPanel = new Ext.debug.ScriptsPanel();
	var logView = new Ext.debug.LogPanel();
	cp = logView;
	App.ui.Launcher.console = new Ext.Panel({
		ref: 'console',
		iconCls: 'terminal',
		region: 'south',
		height: 200,
		split: true,
		collapsible: true,
		collapsed: true,
		collapseMode: 'mini',
		title: 'Console',
		layout: 'border',
		items: [scriptPanel,logView]
	});

	var cellEditing = Ext.create('Ext.grid.plugin.CellEditing', {
		clicksToEdit: 2
	});

	var tree = Ext.create('App.ui.FilesTree', {
		region: 'west',
		split: true,
		width: 300,
		collapsible: true,
		autoScroll: true,
		// preventHeader: true,

	});
	// Build canvas to fill viewport
	var viewport = new Ext.Viewport({
		layout: 'fit',
		border: false,
		items: [{
			layout: 'border',
			border: false,
			bodyBorder: false,
			tbar: {
				items: [{
					text: App.getFullTitle(),
				},'-',{
					text: 'New',
					//handler: App.ui.Launcher.makeLauncher('nodal'),
					iconCls: 'plus',
					menu: Ext.create('App.ui.CreateMenu', {}),
				},{
					text: 'Open',
					iconCls: 'folder-open',
				},{
					text: 'Tools',
					iconCls: 'tools',
					menu: [{
						text: 'Console',
						iconCls: 'terminal',
						handler: App.ui.Launcher.toggleConsole,
						scope: App.ui.Launcher
					},{
						text: 'Dashboard',
						iconCls: 'dash',
						handler: App.ui.Launcher.makeLauncher('dashboard')
					},{
						text: 'DD',
						iconCls: 'seq',
						handler: App.ui.Launcher.makeLauncher('dd'),
					},{
						text: 'NUPACK',
						iconCls: 'nupack-icon',
						handler: App.ui.Launcher.makeLauncher('nupack'),
						menu:new App.ui.NupackMenu()
					}]
				},'->',{
					scale: 'small',
					iconCls: 'system',
					text: 'System',
					menu: [{
						text: 'Preferences',
						iconCls: 'wrench',
						disabled: true,
					},{
						text: 'Installed Applications',
						iconCls: 'applications',
						disabled: true,
					},{
						text: 'Run',
						iconCls: 'run',
						disabled: true,
					},{
						text: 'Tasks',
						iconCls: 'system',
						handler: App.ui.Launcher.makeLauncher('taskmanager'),
					}]
				},'-',{
					scale: 'small',
					iconCls: 'user',
					text: (App.User.isLoggedIn() ? App.User.name : 'Not logged in'),
					disabled: !App.User.isLoggedIn(),
					iconAlign: 'left',
					//handler: ,
					//scope: this
				},{
					scale: 'small',
					iconCls: 'key',
					text: 'Logout',
					disabled: !App.User.isLoggedIn(),
					iconAlign: 'left',
					//handler: ,
					//scope: this
				}]
			},
			items:[tree,{
				xtype: 'tabpanel',
				region:'center',
				border: false,
				bodyCls: 'x-docked-noborder-top',
				items:[]
			},App.ui.Launcher.console]
		}]

	});
	App.ui.filesTree = tree;
	App.ui.Launcher.tabPanel = viewport.down('tabpanel');

	App.ui.Launcher.launch('dashboard');
};
Ext.onReady(App.ui.buildInterface);

Ext.define('App.ui.Launcher', {
	statics: {
		triggerDelimiter: ':',
		_triggers: {},
		_openTabs: {},
		register: function(name,className,config) {
			config || (config = {});
			this._triggers[name] = {
				cls: className,
				config: config
			};
		},
		addTab: function(tab) {
			if(this.tabPanel) {
				this.tabPanel.add(tab);
			}
		},
		launch: function(trigger,doc) {
			tab = this._openTabs[trigger];
			if(tab) {
				this.tabPanel.setActiveTab(tab);
			} else {
				var triggers = trigger.split(this.triggerDelimiter),
				rootTrigger = triggers.shift(),
				a = this._triggers[rootTrigger];
				if(a) {
					// mask workspace while deserializing
					var mask = this.tabPanel.setLoading('Loading...');

					var tab = Ext.create(a.cls,Ext.apply({},a.config, {
						document: (doc || false),
						initialTrigger: trigger,
						triggers: triggers,
						closable: true,
						listeners: {
							afterrender: {
								fn: function() {
									mask.hide();
								},
								single: true
							}
						}
					}));
					this.addTab(tab);
					this.tabPanel.setActiveTab(tab);
					this._openTabs[trigger] = tab;
					// Ext.History.add(trigger,true);

					tab.on('close', function(tab) {
						delete this._openTabs[tab.initialTrigger];
					},this);
					Ext.log('Launched InfoMachine application with trigger: '+trigger, {
						iconCls:'application',
						silent:true
					});
				}
			}
		},
		makeLauncher: function(trigger) {
			return Ext.bind( function() {
				this.launch(trigger);
			},this);
		},
		toggleConsole: function() {
			this.console.toggleCollapse();
		},
		showConsole: function() {
			this.console.expand();
		}
	}
}, function() {
	App.ui.Launcher.register('nodal', 'App.ui.Canvas', {
		title: 'Nodal System',
		iconCls: 'nodal',
		border: false,
		ribbonItems: [{
			xtype: 'nodal-hometab',
			title: 'Home',
			border: false,
		},{
			xtype: 'nodal-buildtab',
			title: 'Build',
			border: false,
		}],
	});
	App.ui.Launcher.register('whiteboard','App.ui.Canvas', {
		title: 'Whiteboard',
	});
	App.ui.Launcher.register('dashboard','App.ui.Dashboard', {});
	App.ui.Launcher.register('nupack/design','App.ui.Browser', {
		url: 'http://www.nupack.org/design',
		title: 'NUPACK Design',
		iconCls:'nupack-icon'
	});
	App.ui.Launcher.register('nupack/analyze','App.ui.Browser', {
		url: 'http://www.nupack.org/partition',
		title: 'NUPACK Analysis',
		iconCls:'nupack-icon'
	});
	App.ui.Launcher.register('nupack/utilities','App.ui.Browser', {
		url: 'http://www.nupack.org/utilities',
		title: 'NUPACK Util',
		iconCls:'nupack-icon'
	});
	App.ui.Launcher.register('nupack','App.ui.Browser', {
		url: 'http://www.nupack.org/',
		iconCls:'nupack-icon',
		title: 'NUPACK'
	});
	App.ui.Launcher.register('viewer','App.ui.Viewer', {
		editorType: 'Viewer',
		iconCls: 'document',
	});
	App.ui.Launcher.register('nupackedit','App.ui.NupackEditor', {});
	App.ui.Launcher.register('taskmanager','App.ui.TaskManager', {
		iconCls: 'system-monitor',
		title: 'Task Manager'
	});
	App.ui.Launcher.register('js','App.ui.TextEditor', {
		iconCls:'js',
		editorType: 'JS',
		mode: 'javascript',
	});
	App.ui.Launcher.register('txt','App.ui.TextEditor', {
		iconCls:'txt',
		editorType: 'Text',
		mode: '',
	});
	App.ui.Launcher.register('html','App.ui.TextEditor', {
		iconCls:'html',
		editorType: 'HTML',
		mode: 'htmlmixed',
	});
	App.ui.Launcher.register('xml','App.ui.TextEditor', {
		iconCls:'xml',
		editorType: 'XML',
		mode: 'xml',
	});
	App.ui.Launcher.register('tex','App.ui.TextEditor', {
		iconCls:'tex',
		editorType: 'TeX',
		mode: 'tex',
	});
	App.ui.Launcher.register('pil','App.ui.TextEditor', {
		iconCls:'pil',
		editorType: 'PIL',
		mode: 'pepper',
	});
	App.ui.Launcher.register('pepper','App.ui.Pepper', {
		iconCls:'pepper',
		editorType: 'Pepper',
		mode: 'pepper',
	});
	App.ui.Launcher.register('sequence','App.ui.SequenceEditor', {
		iconCls:'sequence',
		editorType: 'Sequence',
	});
	App.ui.Launcher.register('nupackresults','App.ui.NupackResults', {
		iconCls:'nupack-icon',
		editorType: 'NUPACK Results',
	});
	App.ui.Launcher.register('dd','App.ui.DD', {
		iconCls: 'seq',
		title: 'Domain Design',
	});

});
Ext.define('App.ui.CreateMenu', {
	extend: 'Ext.menu.Menu',
	labelText: 'File Name:',
	createText: 'Create',
	createIconCls: 'tick',
	autoCreateMenu: true,
	initComponent: function() {
		this.extraMenuItems || (this.extraMenuItems = []);
		Ext.apply(this, {
			items: [{
				text: this.labelText,
				canActivate: false,
				iconCls: 'rename',
			},{
				xtype: 'textfield',
				allowBlank: false,
				//validate: Ext.bind(this.validate,this),
				iconCls: 'rename',
				ref: 'fileNameField',
				indent: true,
			},].concat(this.extraMenuItems,[{
				text: this.createText,
				iconCls: this.createIconCls,
				ref: 'createButton',
				disabled: true,
				menu: Ext.apply(this.getCreateMenu(), {
					ref: 'createMenu',
				}),
			}])
		});
		this.callParent(arguments);
		_.each(this.query('*[ref]'), function(cmp) {
			this[cmp.ref] = cmp;
		},this);
		this.fileNameField.on('validitychange', function(field, isValid) {
			this.createButton.setDisabled(!isValid);
		},this);
		this.createButton.on('click', function() {
			var name=this.fileNameField.getValue();
			this.onCreateButton(name);
		},this);
		if(this.createMenu) {
			this.createMenu.on('click', function(menu,item,e) {
				if(item) {
					var type = item.type, name=this.fileNameField.getValue(), fullName = (type!='folder') ? App.Path.addExt(name,type) : name;
					this.onCreate(type,name,fullName);
				}
			},this);
		}
	},
	// validate: function(value) {
	// return !Ext.isEmpty(value);
	// },
	onCreate: function(type,name,fullName) {
		App.ui.filesTree.newFileUnderSelection(fullName);
	},
	getCreateMenu: function() {
		if(!this.autoCreateMenu) {
			return false;
		}
		return {

			items:[{
				text: 'Nodal System',
				iconCls: 'nodal',
				type: 'nodal',
			},{
				text: 'DyNAML File',
				iconCls: 'dynaml',
				type: 'dynaml',
			},'-',{
				text: 'Pepper System',
				iconCls: 'pepper',
				type: 'sys',
			},{
				text: 'Pepper Component',
				iconCls: 'pepper',
				type: 'comp',
			},{
				text: 'Pepper Intermediate (PIL)',
				iconCls: 'pil',
				type: 'pil',
			},'-',{
				text: 'NUPACK Multi-objective script',
				iconCls: 'nupack',
				type: 'nupack',
			},{
				text: 'Sequence',
				iconCls: 'seq',
				type: 'seq',
			},'-',{
				text: 'Chemical Reaction Network',
				iconCls: 'crn',
				type: 'crn',
				disabled: true,
			},{
				text: 'SBML File',
				iconCls: 'sbml',
				type: 'sbml',
				disabled: true,
			},'-',{
				text: 'HTML File',
				iconCls: 'html',
				type: 'html',
			},{
				text: 'XML File',
				iconCls: 'xml',
				type: 'xml',
			},{
				text: 'Javascript File',
				iconCls: 'js',
				type: 'js',
			},{
				text: 'Text File',
				iconCls: 'txt',
				type: 'txt',
			},'-',{
				text: 'Folder',
				iconCls: 'folder',
				type: 'folder'
			}]
		};
	}
});

Ext.define('App.ui.NupackMenu', {
	extend: 'Ext.menu.Menu',
	initComponent: function() {
		Ext.apply(this, {
			items: [{
				text: 'Analyze',
				handler: App.ui.Launcher.makeLauncher('nupack/analyze'),
				iconCls: 'nupack-icon',
			},{
				text: 'Design',
				handler: App.ui.Launcher.makeLauncher('nupack/design'),
				iconCls: 'nupack-icon',
			},{
				text: 'Utilities',
				handler: App.ui.Launcher.makeLauncher('nupack/utilities'),
				iconCls: 'nupack-icon',
			}]
		});
		this.callParent(arguments);
	}
});

Ext.define('App.ui.FilesTree', {
	extend: 'Ext.tree.Panel',
	title: 'Files',
	newFileNumber: 0,
	useArrows: true,
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
			viewConfig: {
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
			},
			store: App.DocumentStore,
			listeners: {
				beforeitemcontextmenu: {
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
				},
				itemclick: {
					fn: function(tree,rec,item,i,e) {
						this.open(rec);
					},
					scope: this
				}
			},
		});
		this.callParent(arguments);
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
				menu: new App.ui.CreateMenu({}),
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
	open: function(rec) {
		if(rec.get('trigger')) {
			App.ui.Launcher.launch(rec.get('trigger'),rec);
		}
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

/**
 * @class App.ui.TaskManager
 * Shows current and past tasks running on server
 */
Ext.define('App.ui.TaskManager', {
	extend: 'Ext.panel.Panel',
	initComponent: function() {
		this.grid = Ext.create('Ext.grid.Panel', {
			store: App.TaskRunner.taskStore,
			columns: [{
				dataIndex: 'tool',
				renderer: function(tool) {
					return '<img src="'+Ext.BLANK_IMAGE_URL+'" style="width:18px;height:18px;" class="'+App.TaskRunner.serverTools[tool].iconCls+'" />';
				}
			},{
				header: 'Tool',
				dataIndex: 'tool'
			},{
				header: 'Date Submitted',
				dataIndex: 'startDate'
			},{
				header: 'Date Completed',
				dataIndex: 'endDate'
			}]
		});
		Ext.apply(this, {
			items: [this.grid]
		});
		this.callParent(arguments);
	}
})

/**
 * @class App.ui.Browser
 */
Ext.define('App.ui.Browser', {
	extend: 'Ext.panel.Panel',
	initComponent: function() {
		Ext.apply(this, {
			html: '<iframe src="'+this.url+'" style="width:100%;height:100%;border:none;"></iframe>'
		});
		this.callParent(arguments);
	}
});

Ext.define('App.ui.Viewer', {
	extend: 'App.ui.Browser',
	editorType: 'Viewer',
	iconCls: 'application',
	mixins: {
		app: 'App.ui.Application'
	},
	constructor: function(config) {
		this.mixins.app.constructor.apply(this,arguments);

		this.url = Ext.urlAppend(App.getEndpoint('load'),Ext.Object.toQueryString({
			'node':this.getPath()
		}));
		this.callParent(arguments);
		//this.on('afterrender',this.updateTitle,this,{single: true});
	}
});

/**
 * @class App.ui.Canvas
 * The application interface. Responsible for constructing a {@link Workspace} object, managing user interface controls which appear
 * outside the Workspace area itself (such as the Object tree and Ribbon UI)
 * @extends Ext.Panel
 */
Ext.define('App.ui.Canvas', {
	extend: 'Ext.panel.Panel',
	layout: 'border',
	alias: 'widget.canvas',
	editorType: 'Nodal',
	border: false,
	mixins: {
		app: 'App.ui.Application'
	},
	constructor: function(config) {
		this.callParent(arguments);
		this.mixins.app.constructor.apply(this,arguments);
	},
	initComponent: function(config) {

		// set defaults
		Ext.applyIf(this, {
			workspaceData: {}
		});

		Ext.apply(this, {
			items: [new App.ui.Ribbon({

				// North region: Ribbon interface
				region: 'north',
				height: 100,
				ref: 'ribbon',
				collapseMode: 'mini',
				canvas: this,
				items: this.ribbonItems || null,
				margins: '0 0 5 0',
			}),{

				// Center region: workspace canvas
				region: 'center',
				xtype: 'panel',
				ref: 'bodyPanel',
				autoScroll: true,
				bbar: {
					items: ['->','Zoom:&nbsp;',{
						ref: 'zoomField', //ref: '../../zoomField',
						xtype: 'slider',
						value: 1,
						minValue: 0.25,
						maxValue: 4,
						decimalPrecision: 2,
						animate: true,
						plugins: new Ext.slider.Tip({
							getText: function(thumb) {
								return String.format('{0}%', thumb.value * 100);
							}
						}),
						width: 100,
						tooltip: {
							title: 'Zoom',
							text: 'Workspace zoom'
						}
					}]
				}
				/*
				bbar: new Ext.ux.StatusBar({
				ref: '../statusBar'
				})
				*/
				// West region: Tree of objects
			},{
				region: 'west',
				// margins: '0 0 0 5',
				split: true,
				collapseMode: 'mini',
				collapsible: true,
				preventHeader: true,
				border: false,
				width: 200,
				layout: 'border',
				items: [new App.ui.ObjectTree({
					region: 'center',
					ref: 'objectTree', //'../objectTree',
					border: true,
					frame: false,
					split: true,
					collapsible: true,
					collapseMode: 'header',
					title: 'Objects',
					root: {
						text: 'Workspace',
						id: 'workspace',
						nodeType: 'node'
					}
				}), new App.ui.MotifPalette({
					ref: 'palatte',
					region: 'south',
					height: 400,
					split: true,
					collapsible: true,
					collapseMode: 'header',
					border: true,
					frame: false,
					title: 'Motifs',
				})]
			}, new App.ui.ObjectProperties({
				ref: 'objectProperties',
				width: 250,
				split: true,
				collapseMode: 'mini',
				collapsible: true,
				border: true,
				frame: false,
				region: 'east'
			}), ]
		});
		App.ui.Canvas.superclass.initComponent.call(this);
		_.each(['ribbon', 'bodyPanel','zoomField','objectTree','palatte','objectProperties'], function(item) {
			this[item] = this.down('*[ref='+item+']');
		},this);
		// build interface on render
		this.bodyPanel.on('render', function() {

			// // mask workspace while deserializing
			// var mask = new Ext.LoadMask(this.bodyPanel.body, {
			// msg: 'Loading Workspace...'
			// });

			this.loadWorkspace();

			this.zoomField.on('change',this.zoomWorkspace,this);

		},
		this);

	},
	loadWorkspace: function() {
		this.loadFile();
		// this.loadingMask = new Ext.LoadMask(this.bodyPanel.body, {
		// msg: 'Loading Workspace...'
		// });
		// if(this.doc) {
		// this.loadingMask.show();
		// this.doc.loadBody({
		// success: this.onLoad,
		// failure: this.onLoadFail,
		// scope: this
		// });
		// } else {
		// this.workspaceData = {};
		// this.doLoad();
		// }
		// if(this.path) {
		// this.loadingMask.show();
		// if(App.User.isLoggedIn()) {
		// Ext.Ajax.request({
		// url: App.getEndpoint('load'),//'/canvas/index.php/workspaces/save',
		// method: 'GET',
		// params: {
		// node: this.path,
		// },
		// success: this.onLoad,
		// failure: this.onLoadFail,
		// scope: this
		// });
		// } else {
		// Ext.log('Not logged in; could not load saved workspace from server. Opening blank workspace.');
		// }
		// } else {
		// this.workspaceData = {};
		// this.doLoad();
		// }
	},
	// onLoad: function(text) {
	// this.workspaceData = Ext.isEmpty(text) ? {} : Ext.decode(text);
	// this.doLoad();
	// },
	autoHideLoadingMask: false,
	onLoad: function() {
		this.workspaceData = Ext.isEmpty(this.data) ? {} : Ext.decode(this.data);
		this.workspaceData.path = this.getPath();

		// build workspace, using loaded data bootstrapped from App.loadData
		this.workspace = new Workspace(this.bodyPanel.body, this.workspaceData);
		this.workspace.on('afterload', function() {
			this.loadingMask.hide();
			// deprecated
			this.bodyPanel.on('bodyresize', function(c, w, h) {
				this.workspace.bodyResize(c,w,h);
			}, this);
			this.bodyPanel.on('resize', function(c,w,h) {
				this.workspace.bodyResize(c,this.bodyPanel.body.getWidth(),this.bodyPanel.body.getHeight());
			},this);
			// deprecated
			App.defaultWorkspace = this.workspace;

			// attach ribbon and object property grid to workspace to allow it to respond to selections
			this.ribbon.attachTo(this.workspace);
			this.objectProperties.attachTo(this.workspace);

			// attach tree to workspace to allow it to mirror selection
			this.objectTree.attachTo(this.workspace);

			this.workspace.bodyResize(this.bodyPanel,this.bodyPanel.body.getWidth()-10,this.bodyPanel.body.getHeight()-10);

		}, this, {
			single: true
		});
	},
	/**
	 * saveWorkspace
	 * Serializes, encodes, and saves the workspace to the server
	 */
	saveWorkspace: function() {
		this.saveFile();
		// this.savingMask = new Ext.LoadMask(this.bodyPanel.body, {
		// msg: 'Saving Workspace...'
		// });
		// this.savingMask.show();
		// //this.statusBar.setBusy();
		// var o = this.workspace.serialize(),
		// s = Ext.encode(o);
		// this._lastSave = o;
		// if(this.doc) {
		// this.loadingMask.show();
		// this.doc.saveBody(s, {
		// success: this.onLoad,
		// failure: this.onLoadFail,
		// scope: this
		// });
		// }

		// if(App.User.isLoggedIn()) {
		// Ext.Ajax.request({
		// url: App.getEndpoint('save'),//'/canvas/index.php/workspaces/save',
		// params: {
		// data: s,
		// node: this.path,
		// },
		// success: this.onSave,
		// failure: this.onSaveFail,
		// scope: this
		// });
		// } else {
		// Ext.log('Not logged in; could not save workspace to server.');
		// }
		// Ext.log(Ext.encode(o.objects));
	},
	getSaveData: function() {
		return this.workspace.serialize();
	},
	// /**
	// * onSave
	// * callback to restore the UI after successful save
	// */
	// onSave: function() {
	// this.savingMask.hide();
	// console.log('Workspace Saved.', this._lastSave);
	// Ext.log('Workspace saved to server.');
	// },
	// /**
	// * onSaveFail
	// * callback to inform the user of failed save
	// */
	// onSaveFail: function() {
	// alert("Workspace saving failed.");
	// console.log('Workspace save failed.', this._lastSave);
	// Ext.log('Workspace save failed.')
	// },
	zoomWorkspace: function(s,v) {
		this.workspace.zoomTo(v);
	}
});

/**
 * @class App.ui.Ribbon
 * Provides tabbed, dynamic toolbar which responds to user selection
 * @extends Ext.TabPanel
 */
Ext.define('App.ui.Ribbon', {
	extend:'Ext.tab.Panel',
	plain: true,
	border: false,
	bodyBorder: true,
	tabPosition: 'bottom',
	initComponent: function() {
		Ext.applyIf(this, {
			activeTab: 0,
			defaults: {
				border: true,
			},
			tabBar: {
				border: false,
				bodyBorder: false,
			}
		});
		if(!this.items) {
			this.items = [new App.ui.ToolsTab({
				title: 'Tools',
				ref: 'toolsTab',
			}), new App.ui.InsertTab({
				title: 'Insert',
				ref: 'insertTab',
			}), new App.ui.FillStrokeTab({
				title: 'Fill and Stroke',
				ref: 'fillStroke'
			}), new App.ui.GeometryTab({
				title: 'Geometry',
				ref: 'geometry'
			}), new App.ui.MetaTab({
				title: 'Meta',
				ref: 'metaTab'
			})];
		}
		Ext.each(this.items, function(item) {
			Ext.applyIf(item, {
				border: false,
				bodyBorder: false,
			})
		});
		App.ui.Ribbon.superclass.initComponent.apply(this, arguments);

		_.each(['toolsTab', 'insertTab','fillStroke','geometry','metaTab'], function(item) {
			this[item] = this.down('*[ref='+item+']');
		},this);
		/*
		// Allow the tools tab to manage the workspace tool
		this.mon(this.toolsTab, 'toolChange', this.setActiveTool, this);
		this.mon(this.insertTab, 'toolChange', this.setActiveTool, this);
		*/

		// allow ribbon tabs to invoke actions on the workspace
		this.items.each( function(item) {
			item.ribbon = this;
			this.mon(item, 'action', this.doAction, this);

			// Allow the tools tabs to manage the workspace tool
			if(item.getActiveTool) {
				this.mon(item,'toolChange',this.setActiveTool,this);
				this.mon(item, 'save', this.saveWorkspace, this);
			}
		},
		this);

		// allow workspace to be saved
	},
	attachTo: function(workspace) {
		this.workspace = workspace;

		// bind ribbon to objects when selected in workspace
		this.mon(this.workspace, 'select', this.bind, this);
		this.mon(this.workspace, 'unselect', this.unbind, this);

	},
	setActiveTool: function(tool) {
		this.workspace.setActiveTool(tool);
	},
	/**
	 * doAction
	 * Invokes the passed {@link WorkspaceAction} on the {@link #workspace}
	 * @param {WorkspaceAction} action
	 */
	doAction: function(action) {
		var undoAction = action.getUndo();
		this.workspace.doAction(action);
	},
	/**
	 * bind
	 * Binds the ribbon to the passed items
	 * @param {Workspace.Object} item
	 */
	bind: function(item) {
		this.items.each( function(tab) {
			if (tab.bind && Ext.isFunction(tab.bind))
				tab.bind(item);
		});
	},
	/**
	 * unbind
	 * Unbinds the ribbon from the passed items
	 * @param {Workspace.Object} item
	 */
	unbind: function(item) {
		this.items.each( function(tab) {
			if (tab.unbind && Ext.isFunction(tab.unbind))
				tab.unbind(item);
		});
	},
	saveWorkspace: function() {
		this.canvas.saveWorkspace();
	}
})

/**
 * @class App.ui.ObjectTree
 * Displays a tree of objects in the workspace, grouped heirarchically
 */
Ext.define('App.ui.ObjectTree', {
	extend: 'Ext.tree.TreePanel',
	useArrows: true,
	initComponent: function() {
		// Ext.apply(this, {
		// selModel: new Ext.tree.MultiSelectionModel()
		// });
		App.ui.ObjectTree.superclass.initComponent.apply(this, arguments);
		//this.editor = new Ext.tree.TreeEditor(this);
		//this.editor.on('complete', this.onEditName, this);
	},
	/**
	 * attachTo
	 * Links this tree to the passed {@link Workspace}
	 * @param {Workspace} workspace
	 */
	attachTo: function(workspace) {
		this.workspace = workspace;
		this.mon(this.workspace, 'instantiate', this.onCreate, this);
		this.mon(this.workspace, 'initialize', this.bindParent, this);
		this.mon(this.workspace, 'select', this.onWorkspaceSelect, this);
		this.mon(this.workspace, 'unselect', this.onWorkspaceUnselect, this);
		this.mon(this.workspace, 'destroy', this.onObjectDestroy, this);
		var sm = this.getSelectionModel();
		sm.on('selectionchange', this.onSelect, this);
	},
	/**
	 * Finds a node in the tree for the passed object
	 * @param {Workspace.Object} item
	 * @return {Ext.tree.Node} node
	 */
	findNodeForObject: function(item) {
		if (item && item.getId) {
			// true to search deeply
			return this.findNodeForId(item.getId());
		}
		return false;
	},
	/**
	 * Finds a node in the tree for the passed object id
	 * @param {String} id
	 * @return {Ext.tree.Node} node
	 */
	findNodeForId: function(id) {
		// true to search deeply
		return this.getStore().getRootNode().findChild('id', id, true);
	},
	/**
	 * Finds an object in the configured workspace corresponding to the passed node
	 * @param {Ext.tree.Node} node
	 */
	getObjectFromNode: function(node) {
		return this.workspace.getObjectById(node.id);
	},
	/**
	 * onEditName
	 * callback invoked by tree editor after a node's text has been edited; sets the name of the requisite object
	 * @param {Ext.tree.TreeEditor} editor
	 * @param {Object} value
	 */
	onEditName: function(editor, value) {
		var o = this.getObjectFromNode(this.editor.editNode);
		o.set('name', value);
	},
	/**
	 * onSelect
	 * callback invoked by the selection model after the selection has been changed; updates the workspace selection to match
	 * @param {Object} sm
	 * @param {Object} nodes
	 */
	onSelect: function(sm, nodes) {
		if (!this.ignoreSelectionChange) {
			this.ignoreSelectionChange = true;
			var toSelect = [];
			Ext.each(nodes, function(node) {
				toSelect.push(this.workspace.getObjectById(node.id));
			},
			this);
			this.workspace.setSelection(toSelect);
			this.ignoreSelectionChange = false;
		}
	},
	/**
	 * onWorkspaceSelect
	 * listener invoked by the workspace when its selection changes; updates the tree's selection to match
	 * @param {Workspace.Object} item
	 */
	onWorkspaceSelect: function(item) {
		if (!this.ignoreSelectionChange) {
			this.ignoreSelectionChange = true;
			var n = this.findNodeForObject(item);
			if (n) {
				this.getSelectionModel().select(n,true);
			}
			this.ignoreSelectionChange = false;
		}
	},
	/**
	 * onWorkspaceUnselect
	 * listener invoked by the workspace when its selection changes; updates the tree's selection to match
	 * @param {Workspace.Object} item
	 */
	onWorkspaceUnselect: function(item) {
		if (!this.ignoreSelectionChange) {
			this.ignoreSelectionChange = true;
			var n = this.findNodeForObject(item);
			if (n) {
				this.getSelectionModel().deselect(n,true);
			}
			this.ignoreSelectionChange = false;
		}
	},
	/**
	 * onCreate
	 * listener invoked by the workspace when an object is constructed; builds a node for it in the tree
	 * @param {Workspace.Object} obj
	 */
	onCreate: function(obj) {
		var parentNode;

		if (obj.hasParent()) {
			parentNode = this.findNodeForObject(obj.getParent());
		}
		if(!parentNode) {
			parentNode = this.getRootNode();
		}

		if (parentNode) {
			parentNode.appendChild({
				text: obj.get('name'),
				id: obj.getId(),
				iconCls: obj.get('iconCls'),
				editable: true
			});
		}
		obj.on('change', this.onChange, this);
	},
	bindParent: function(obj) {
		var node = this.findNodeForObject(obj),
		parentNode = this.findNodeForObject(obj.getParent());
		if (parentNode) {
			node.remove(false);
			parentNode.appendChild(node);
		}
	},
	/**
	 * onObjectDestroy
	 * listener invoked by the workspace when an object is constructed; builds a node for it in the tree
	 * @param {Workspace.Object} obj
	 */
	onObjectDestroy: function(obj) {
		var node = this.findNodeForObject(obj);
		if (node) {
			node.remove();
			node.destroy();
		}
		obj.un('change', this.onChange, this);
	},
	/**
	 * onChange
	 * listener invoked by an object when one of its properties is changed; updates the tree to match
	 * @param {String} prop
	 * @param {Mixed} value
	 * @param {Workspace.Object} obj
	 */
	onChange: function(prop, value, old, obj) {
		if (!this.ignoreChange && obj && obj.getId) {
			if (prop == 'name') {
				var node = this.findNodeForObject(obj);
				if (node) {
					node.set('text',value);
				}
			} else if (prop == 'parent') {
				var node = this.findNodeForObject(obj),
				parentNode = this.findNodeForObject(obj.getParent());
				if (parentNode) {
					node.remove(false);
					parentNode.appendChild(node);
				}
			}
		}
	},
})

/**
 * @class App.ui.MotifPalette
 * Allows motifs to be added to workspace by drag and drop
 */
Ext.define('App.ui.MotifPalette', {
	extend:'Ext.panel.Panel',
	initComponent: function() {
		Ext.apply(this, {
			items: [{
				xtype:'dataview',
				store: Workspace.objects.dna.motifStore,
				tpl: '<tpl for=".">'+
				'<div class="motif-template">'+
				'<img src="images/motifs/m{number}.gif" />'+
				'</div>'+
				'</tpl><div class="x-clear" />',
				itemSelector: 'div.motif-template',
				overItemClass: 'x-view-over',
				trackOver: true,
				itemId: 'view'
			}]
		});
		App.ui.MotifPalette.superclass.initComponent.apply(this,arguments);
		this.view = this.getComponent('view');

		this.view.on('render', function(v) {
			this.dragZone = new Ext.dd.DragZone(v.getEl(), {

				// On receipt of a mousedown event, see if it is within a DataView node.
				// Return a drag data object if so.
				getDragData: function(e) {

					// Use the DataView's own itemSelector (a mandatory property) to
					// test if the mousedown is within one of the DataView's nodes.
					var sourceEl = e.getTarget(v.itemSelector, 10);

					// If the mousedown is within a DataView node, clone the node to produce
					// a ddel element for use by the drag proxy. Also add application data
					// to the returned data object.
					if (sourceEl) {
						d = sourceEl.cloneNode(true);
						d.id = Ext.id();
						return {
							ddel: d,
							sourceEl: sourceEl,
							repairXY: Ext.fly(sourceEl).getXY(),
							sourceStore: v.store,
							draggedRecord: v.getRecord(sourceEl),
							mimeType: 'ext/motif'
						}
					}
				},
				// Provide coordinates for the proxy to slide back to on failed drag.
				// This is the original XY coordinates of the draggable element captured
				// in the getDragData method.
				getRepairXY: function() {
					return this.dragData.repairXY;
				}
			});
		},this);
	}
})

/**
 * @class App.ui.BoundObjectPanel
 * Allows ribbon tabs to be bound to {@link Workspace.Object}s and fields within the panel to be bound to object properties.
 * Components within this panel which contain an {@link #objectBinding} property will be set to the value of that property when objects are bound, and
 * changes to those components triggering the change event (or another event specified in {@link #objectBindingEvent}) will cause {@link WorkspaceAction}s
 * to be generated and applied to the attached workspace.
 * @extends Ext.Panel
 */
Ext.define('App.ui.BoundObjectPanel', {
	extend:'Ext.panel.Panel',
	initComponent: function() {
		App.ui.BoundObjectPanel.superclass.initComponent.apply(this, arguments);

		this.addEvents('action');

		// objects which have been bound to this panel with #bind
		this.boundObjects = Ext.create('Workspace.objects.ObjectCollection', {});

		// fields which specify an objectBinding
		this.boundFields = new Ext.util.MixedCollection();

		// fields which specify a displayIf or an enableIf function
		this.dynamicFields = new Ext.util.MixedCollection();

		// collect all fields with object bindings specified
		var boundFields = this.query('component[objectBinding]'), //[objectBinding!=""]');
		// this.findBy( function(cmp) {
		// return (Ext.isDefined(cmp.objectBinding) && cmp.objectBinding != '');
		// },this),
		dynamicFields = this.query('component[enableIf]','component[showIf]');
		// this.findBy( function(cmp) {
		// return (Ext.isFunction(cmp.enableIf) || Ext.isFunction(cmp.showIf));
		// },this);
		// oh, yeah and look in the toolbar too since that's where they're ALL going to be
		// if (this.topToolbar) {
		// boundFields = boundFields.concat(this.topToolbar.findBy( function(cmp) {
		// return (Ext.isDefined(cmp.objectBinding) && cmp.objectBinding != '');
		// },this));
		// dynamicFields = dynamicFields.concat(this.topToolbar.findBy( function(cmp) {
		// return (Ext.isFunction(cmp.enableIf) || Ext.isFunction(cmp.showIf));
		// },this));
		// }

		// index fields and add event handlers
		Ext.each(boundFields, function(field) {
			var eventName = field.objectBindingEvent || 'change';
			field.addListener(eventName, this.updateObjects, this);
			this.boundFields.add(field.objectBinding, field);
		},this);
		this.dynamicFields.addAll(dynamicFields);

		this.on('afterrender', this.buildTips, this);
		this.on('afterrender', this.updateDynamicFields, this);
	},
	buildTips: function() {
		/*
		 // collect all fields with tooltip configs specified
		 var tips = this.findBy( function(cmp) {
		 return (Ext.isDefined(cmp.tooltip) && cmp.tooltip != '' && !cmp.isXType('button', true));
		 },
		 this);

		 // oh, yeah and look in the toolbar too since that's where they're ALL going to be
		 if (this.topToolbar) {
		 tips = tips.concat(this.topToolbar.findBy( function(cmp) {
		 return (Ext.isDefined(cmp.tooltip) && cmp.tooltip != '' && !cmp.isXType('button', true));
		 },
		 this));
		 }
		 this.tips = [];
		 Ext.each(tips, function(field) {
		 if (field.tooltip) {
		 var t = field.tooltip;
		 if (t.text && !t.html) {
		 t.html = t.text;
		 }
		 t.target = field.getEl();
		 this.tips.push(new Ext.ToolTip(t));
		 }
		 },
		 this)
		 */
	},
	/**
	 * updateObjects
	 * listener invoked by bound field on change (or other {@link #objectBinding} event); generates a {@link WorkspaceAction} to update
	 * the specified propery in all bound objects
	 * @param {Object} field
	 * @param {Object} newValue
	 * @param {Object} oldValue
	 */
	updateObjects: function(field, newValue, oldValue) {
		if (!this.ignoreNext) {
			if (field.objectBinding) {
				var values = {},
				action;
				values[field.objectBinding] = newValue;

				// Build WorkspaceAction
				action = new Workspace.actions.ChangePropertyAction({
					values: values,
					subjects: this.boundObjects.getRange()
				});

				this.fireEvent('action', action);
			}
		}
	},
	/**
	 * updateFields
	 * Updates the fields in this ribbon to match the values in this object
	 * @param {Workspace.Object} item
	 */
	updateFields: function(item) {
		this.boundFields.each( function(field) {
			if (item.has(field.objectBinding)) {
				field.setValue(item.get(field.objectBinding));
			}
		},
		this);
	},
	/**
	 * updateFieldsHandler
	 * Called when bound objects change
	 * @param {Object} prop
	 * @param {Object} val
	 * @param {Object} item
	 */
	updateFieldsHandler: function(prop, val, item) {
		if (this.boundFields.containsKey(prop)) {
			var f = this.boundFields.get(prop);
			this.ignoreNext = true;
			f.setValue(val);
			this.ignoreNext = false;
		}
	},
	updateDynamicFields: function() {
		var common = this.boundObjects.getCommonWType();
		this.dynamicFields.each( function(f) {
			if(Ext.isFunction(f.showIf)) {
				if(f.showIf(common,this.boundObjects,this))
					f.show();
				else
					f.hide();
			}
			if(Ext.isFunction(f.enableIf)) {
				if(f.enableIf(common,this.boundObjects,this))
					f.enable();
				else
					f.disable();
			}
		},this);
	},
	/**
	 * bind
	 * Attaches the given object to this panel, so that changes in the panel will be reflected in the object
	 * @param {Workspace.Object} item
	 */
	bind: function(item) {
		if (!this.boundObjects.containsKey(item.getId())) {
			this.boundObjects.add(item.getId(), item);
			if (this.boundObjects.length == 1) {
				this.updateFields(item);
			}
			this.mon(item, 'change', this.updateFieldsHandler, this);
			this.updateDynamicFields();
		}
	},
	/**
	 * unbind
	 * Detaches the given object from this panel
	 * @param {Workspace.Object} item
	 */
	unbind: function(item) {
		if (item) {
			if (this.boundObjects.containsKey(item.getId())) {
				this.boundObjects.removeAtKey(item.getId());
				this.mun(item, 'change', this.updateFieldsHandler, this);
			}
		} else {
			this.boundObjects.clear();
		}
		this.updateDynamicFields();
	},
	/**
	 * destroy
	 */
	destroy: function() {
		Ext.each(this.tips, function(tip) {
			tip.destroy();
		});
		App.ui.BoundObjectPanel.superclass.destroy.apply(this, arguments);

	}
});

/**
 * @class App.ui.ObjectProperties
 * Allows creation and editing object properties
 * @extends App.ui.BoundObjectPanel
 */

Ext.define('App.ui.ObjectProperties', {
	extend:'App.ui.BoundObjectPanel',
	constructor: function() {
		App.ui.ObjectProperties.superclass.constructor.apply(this, arguments);
	},
	initComponent: function() {
		this.grid = Ext.create('Ext.grid.property.Grid', {
			border: false,
			bodyBorder: false,
			source: {},
			title: 'All Properites'
		});
		Ext.apply(this, {
			title: 'Selected Object',
			layout: 'accordion',
			items: [this.grid]
		});
		App.ui.ObjectProperties.superclass.initComponent.apply(this,arguments);
		this.grid.on('propertychange',this.onPropertyChange,this);
	},
	bind: function(obj) {
		this.unbind();
		this.boundObject = obj;
		this.boundObject.on('change',this.onObjectChange,this);
		this.grid.setSource(obj.getReadableHash());
	},
	unbind: function(obj) {
		if(this.boundObject) {
			if((obj == this.boundObject) || (!obj)) {
				this.boundObject.un('change',this.onObjectChange,this);
				this.grid.setSource({});
				this.boundObject = false
			}
		}
	},
	onObjectChange: function(prop, val) {
		if(!this.ignore)
			this.grid.setProperty(prop,val,true);
	},
	onPropertyChange: function(src,prop,value) {
		if(this.boundObject) {
			this.ignore = true;
			this.boundObject.set(prop,value);
			this.ignore = true;
		}
	},
	attachTo: function(workspace) {
		this.workspace = workspace;

		// bind ribbon to objects when selected in workspace
		this.mon(this.workspace, 'select', this.bind, this);
		this.mon(this.workspace, 'unselect', this.unbind, this);

	},
})

/**
 * @class App.ui.ToolsTab
 * Manages the tool palate and provides several object actions
 * @extends App.ui.BoundObjectPanel
 */
Ext.define('App.ui.ToolsTab', {
	extend:'App.ui.BoundObjectPanel',
	/**
	 * @cfg {String} tool
	 * The default tool
	 */
	tool: 'pointer',
	generateConfig: function() {
		return {
			tbar: [{

				// 'Tools' group
				xtype: 'buttongroup',
				title: 'Tools',
				columns: 2,

				items: [{
					iconCls: 'cursor',
					enableToggle: true,
					toggleGroup: 'toolbox',
					toolName: 'pointer',
					pressed: true,
					tooltip: {
						title: 'Pointer Tool',
						text: 'Select, move, and resize objects. Click objects or drag boxes around them to select. Grab and drag to move. Drag hangles to resize (objects without handles can\'t be resized).'
					}
				},{
					iconCls: 'pencil',
					enableToggle: true,
					toggleGroup: 'toolbox',
					toolName: 'pencil',
					tooltip: {
						title: 'Pencil Tool',
						text: 'Draw freehand objects. Click and drag to start drawing; release to finish.'
					}
				},{
					iconCls: 'idea',
					toggleGroup: 'toolbox',
					enableToggle: true,
					toolName: 'idea',
					tooltip: {
						title: 'Idea Tool',
						text: 'Group objects into ideas. Drag a box around a group of objects to make an idea.'
					}
				},{
					iconCls: 'connector',
					toggleGroup: 'toolbox',
					enableToggle: true,
					toolName: 'connector',
					tooltip: {
						title: 'Connector Tool',
						text: 'Draw connections between objects. Click one point or object and drag to another point or object.'
					}
				},

				/*{
				 iconCls: 'vector',
				 toggleGroup: 'toolbox',
				 enableToggle: true,
				 disabled: true,
				 tooltip: {title: 'Vector Tool', text:'Edit shapes'}
				 },*/
				]
			},{

				// 'Object' group
				xtype: 'buttongroup',
				title: 'Object',
				columns: 3,
				items: [{
					scale: 'medium',
					rowspan: 2,
					iconAlign: 'top',
					iconCls: 'delete-24',
					text: 'Delete',
					handler: this.deleteObjects,
					scope: this,
					tooltip: {
						title: 'Delete',
						text: 'Deletes the selected objects.'
					},
					enableIf: function(com,bound) {
						return bound.getCount()>0;
					}
				},{
					disabled: true,
					scale: 'medium',
					rowspan: 2,
					iconAlign: 'top',
					iconCls: 'duplicate-24',
					text: 'Duplicate',
					handler: this.duplicateObjects,
					scope: this,
					tooltip: {
						title: 'Duplicate',
						text: 'Inserts a copy of the selected objects.'
					}
				},
				// {
				//
				// ref: 'nameField', //'../../nameField',
				// fieldLabel: 'Name',
				// objectBinding: 'name',
				// xtype: 'textfield',
				// width: 150,
				// tooltip: {
				// title: 'Name',
				// text: 'The object\'s name'
				// },
				// },{
				// ref: 'typeField', // '../../typeField',
				// xtype: 'combo',
				// objectBinding: 'wtype',
				// store: Workspace.Components.getTypeStore(),
				// tpl: new Ext.XTemplate(
				// '<tpl for="."><div class="x-combo-list-item">',
				// '<img src="' + Ext.BLANK_IMAGE_URL + '" class="combo-icon {iconCls}" />&nbsp;<span>{wtype}</span>',
				// '</div></tpl>'
				// ),
				// valueField: 'wtype',
				// displayField: 'wtype',
				// typeAhead: true,
				// mode: 'local',
				// forceSelection: true,
				// triggerAction: 'all',
				// selectOnFocus: true,
				// width: 150,
				// tooltip: {
				// title: 'Type',
				// text: 'The object type.'
				// }
				// }
				]
			},{

				// 'Idea' group
				xtype: 'buttongroup',
				title: 'Idea',
				columns: 2,
				defaults: {
					cellCls: 'table-cell-padded'
				},
				items: [{
					scale: 'medium',
					rowspan: 2,
					iconAlign: 'top',
					iconCls: 'idea-form-24',
					text: 'Form idea',
					tooltip: {
						title: 'Form idea',
						text: 'Makes a new idea from the selected objects. Select the objects you want to add to an idea, then click this button'
					},
					handler: this.formIdea,
					scope: this,
					enableIf: function(com,bound) {
						return bound.getCount() > 0;
					}
				},{
					iconCls: 'idea-remove',
					text: 'Remove from Idea',
					rowspan: 1,
					handler: this.orphanObjects,
					scope: this,
					tooltip: {
						title: 'Remove from Idea',
						text: 'Removes the selected objects from the idea they\'re a part of (if any).'
					},
					enableIf: function(com,bound) {
						var p = false;
						bound.each( function(f) {
							if(f.hasParent()) {
								p = true;
								return false;
							}
						});
						return p;
					}
				},{
					iconCls: 'idea-add',
					text: 'Add to Idea',
					rowspan: 1,
					toolName: 'idea-add',
					enableToggle: true,
					toggleGroup: 'toolbox',
					tooltip: {
						title: 'Add this to Idea',
						text: 'Allows you to add the selected object(s) to an idea. Select the objects you want to add to an idea, then click this button, then click an idea.'
					}
				}]

			},
			// not implemented
			// 'Transform' group
			/*{
			 xtype:'buttongroup',
			 title:'Transform',
			 columns: 4,
			 items:[{
			 iconCls: 'rotate-left'
			 },{
			 iconCls: 'rotate-right'
			 },{
			 iconCls: 'flip-horiz'
			 },{
			 iconCls: 'flip-vert'
			 },{
			 iconCls: 'arrange-forward'
			 },{
			 iconCls: 'arrange-backwards'
			 },{
			 iconCls: 'arrange-front'
			 },{
			 iconCls: 'arrange-back'
			 }]
			 },*/
			'->',{

				// 'Workspace' group
				xtype: 'buttongroup',
				title: 'Workspace',
				columns: 4,
				items: [{
					scale: 'medium',
					iconCls: 'undo-24',
					text: 'Undo',
					rowspan: 2,
					iconAlign: 'top',
					handler: this.undo,
					scope: this,
					ref: 'undoButton', //'../undoButton',
					disabled: true
				},{
					scale: 'medium',
					iconCls: 'redo-24',
					text: 'Redo',
					rowspan: 2,
					iconAlign: 'top',
					handler: this.redo,
					scope: this,
					ref: 'redoButton', // '../undoButton',
					disabled: true
				},{
					scale: 'medium',
					iconCls: 'save-24',
					text: 'Save',
					rowspan: 2,
					iconAlign: 'top',
					handler: this.saveWorkspace,
					scope: this
				},{
					scale: 'medium',
					iconCls: 'document-24',
					text: 'Expand',
					rowspan: 2,
					iconAlign: 'top',
					handler: this.expandWorkspace,
					scope: this
				}]
			}]
		};
	},
	initComponent: function() {
		this.addEvents('toolChange');
		Ext.apply(this, this.generateConfig());

		App.ui.ToolsTab.superclass.initComponent.apply(this, arguments);

		_.each(this.query('*[ref]'), function(cmp) {
			this[cmp.ref] = cmp;
		},this);
		// dictionary of all buttons with configured toolName bindings
		this.toolButtons = new Ext.util.MixedCollection();

		// collect all buttons with tool bindings specified
		var toolButtons = this.query('component[toolName]'); //[toolname!=""]');
		// this.findBy( function(cmp) {
		// return (Ext.isDefined(cmp.toolName) && cmp.toolName != '');
		// },
		// this);

		// if (this.topToolbar) {
		// toolButtons = toolButtons.concat(this.topToolbar.findBy( function(cmp) {
		// return (Ext.isDefined(cmp.toolName) && cmp.toolName != '');
		// },
		// this));
		// }

		// index buttons and add event handlers
		Ext.each(toolButtons, function(button) {
			button.addListener('toggle', this.onToggle, this);
			this.toolButtons.add(button.toolName, button);
		},
		this);

		// not implemented
		//		this.uploaderWindow = new Ext.Window({
		//			title: 'Upload files',
		//			closeAction: 'hide',
		//			frame: true,
		//			width: 500,
		//			height: 200,
		//			items: {
		//				xtype: 'awesomeuploader',
		//				gridHeight: 100,
		//				height: 160,
		//				awesomeUploaderRoot: '/scripts/awesomeuploader_v1.3.1/',
		//				listeners: {
		//					scope: this,
		//					fileupload: function(uploader, success, result){
		//						if (success) {
		//							Ext.Msg.alert('File Uploaded!', 'A file has been uploaded!');
		//						}
		//					}
		//				}
		//			}
		//		});
	},
	// not implemented
	pushUndo: function(action) {
		this.undoStack.push(action);
		this.rebuildUndo();
	},
	// not implemented
	popUndo: function() {
		var a = this.undoStack.pop();
		this.rebuildUndo();
		return a;
	},
	// not implemented
	rebuildUndo: function() {
		this.undoButton.menu.removeAll();
		this.undoButton.menu.add(this.undoStack);
		if (this.undoStack.length > 0) {
			this.undoButton.enable();
		} else {
			this.undoButton.disable();
		}
	},
	// not implemented
	undo: function() {
		this.fireEvent('undo', this);
	},
	// not implemented
	redo: function() {
		this.fireEvent('redo', this)
	},
	/**
	 * deleteObjects
	 * Generates a WorkspaceAction to delete the bound objects
	 */
	deleteObjects: function() {
		var action = new Workspace.actions.DeleteObjectAction({
			subjects: this.boundObjects.getRange()
		});
		this.fireEvent('action', action);
	},
	/**
	 * duplicateObjects
	 * Generates a WorkspaceAction to delete the bound objects
	 */
	duplicateObjects: function() {
		var action = new Workspace.actions.DuplicateObjectAction({
			objects: this.boundObjects.getRange()
		});
		this.fireEvent('action', action);
	},
	/**
	 * orphanObjects
	 * Generates a WorkspaceAction to decouple the bound objects from their parent(s)
	 */
	orphanObjects: function() {
		var action = new Workspace.actions.OrphanObjectAction({
			subjects: this.boundObjects.getRange()
		});
		this.fireEvent('action', action);
	},
	/**
	 * formIdea
	 * Generates a WorkspaceAction to build an idea from the current selection
	 */
	formIdea: function() {
		var action = new Workspace.actions.FormIdeaAction({
			subjects: this.boundObjects.getRange()
		});
		this.fireEvent('action', action);
	},
	/**
	 * expandWorkspace
	 * Generates a WorkspaceAction to expand the size of the workspace
	 */
	expandWorkspace: function() {
		var action = new Workspace.actions.ExpandAction({});
		this.fireEvent('action', action);
	},
	/**
	 * saveWorkspace
	 * Generates an event notifying the parent canvas to save the workspace
	 */
	saveWorkspace: function() {
		this.fireEvent('save', this);
	},
	/**
	 * onToggle
	 * Event handler automatically applied to buttons with configured {@link #toolName}s
	 * @param {Ext.Button} btn
	 * @param {Boolean} pressed
	 */
	onToggle: function(btn, pressed) {
		if (pressed) {
			this.setActiveTool(btn.toolName);
		}
	},
	/**
	 * getActiveTool
	 * Gets the name of the currently active tool
	 * @return {String} toolName
	 */
	getActiveTool: function() {
		return this.tool;
	},
	/**
	 * setActiveTool
	 * Allows Tools tab in ribbon to set the active workspace tool
	 * @param {String} tool
	 */
	setActiveTool: function(tool) {
		if (!this.ignoreToolChange) {
			this.tool = tool;
			this.fireEvent('toolChange', tool);
		}
	},
	/**
	 * onToolChange
	 * Responds to workspace toolChange event and updates UI to reflect
	 * @param {String} tool
	 */
	onToolChange: function(tool) {
		var button = this.toolButtons.get(tool);
		if (button) {
			this.ignoreToolChange = true;
			button.toggle(true);
			this.tool = tool;
			this.fireEvent('toolChange');
			this.ignoreToolChange = false;
		}
	}
});

/**
 * @class App.ui.InsertTab
 * Allows insertion of various vector and HTML objects
 * @extends App.ui.ToolsTab
 */
Ext.define('App.ui.InsertTab', {
	extend:'App.ui.ToolsTab',
	generateConfig: function() {
		return {
			tbar:[{
				// 'Insert' group
				xtype: 'buttongroup',
				title: 'Insert',
				columns: 5,
				defaults: {
					cellCls: 'table-cell-padded'
				},
				items: [{
					iconCls: 'line',
					enableToggle: true,
					toggleGroup: 'toolbox',
					toolName: 'line',
					tooltip: {
						title: 'Line',
						text: 'Draw straight lines. Click and drag to draw a line; release to finish.'
					}
				},{
					iconCls: 'rect',
					enableToggle: true,
					toggleGroup: 'toolbox',
					toolName: 'rect',
					tooltip: {
						title: 'Rectangle',
						text: 'Draw rectangles. Click and drag a box to draw; release to finish.'
					}
				},{
					iconCls: 'ellipse',
					toggleGroup: 'toolbox',
					enableToggle: true,
					toolName: 'ellipse',
					tooltip: {
						title: 'Ellipse',
						text: 'Draw ellipses. Click and drag to draw; release to finish.'
					}
				},{
					iconCls: 'polygon',
					toggleGroup: 'toolbox',
					enableToggle: true,
					tooltip: {
						title: 'Polygon',
						text: 'Draw closed polygons. Click once to start drawing; each click adds a point. Double-click to finish'
					},
					toolName: 'polygon'

				},{
					iconCls: 'path',
					toggleGroup: 'toolbox',
					enableToggle: true,
					toolName: 'polyline',
					tooltip: {
						title: 'Polylines',
						text: 'Draw open polygons. Click once to start drawing; each click adds a point. Double-click to finish'
					}
				},{
					iconCls: 'text-icon',
					enableToggle: true,
					toggleGroup: 'toolbox',
					toolName: 'textbox',
					tooltip: {
						title: 'Text Tool',
						text: 'Enter and edit text. Click or click and drag to insert a textbox. Click a textbox to edit text.'
					}
				},{
					iconCls: 'math-icon',
					toggleGroup: 'toolbox',
					enableToggle: true,
					toolName: 'math',
					tooltip: {
						title: 'Equations',
						text: 'Insert mathematical equations. Click and drag to draw an equation box.'
					}
				},]
				/*{
				 iconCls: 'curve',
				 toggleGroup: 'toolbox',
				 enableToggle: true,
				 toolName: 'curve',
				 disabled: true,
				 },{
				 iconCls: 'image',
				 enableToggle: false,
				 disabled: true,
				 handler: function() {
				 this.uploaderWindow.show();
				 },
				 scope: this
				 }*/

			}]
		};
	}
});

/**
 * @class App.ui.FillStrokeTab
 * A ribbon tab to manage setting the fill and stroke of objects
 * @extends App.ui.BoundObjectPanel
 */
Ext.define('App.ui.FillStrokeTab', {
	extend:'App.ui.BoundObjectPanel',
	initComponent: function() {
		Ext.apply(this, {
			tbar: [{

				// 'Fill' group
				xtype: 'buttongroup',
				title: 'Fill',
				columns: 1,
				defaults: {
					cellCls: 'table-cell-padded'
				},
				items: [new Ext.ux.ColorField({
					ref: '../../fillColorField',
					fieldLabel: 'Fill Color',
					objectBinding: 'fill',
					width: 100,
					tooltip: {
						title: 'Fill Color',
						text: 'Color of the object\'s background (fill).'
					},
				}),{
					ref: '../../fillOpacityField',
					xtype: 'slider',
					objectBinding: 'fillOpacity',
					objectBindingEvent: 'changecomplete',
					minValue: 0,
					maxValue: 1,
					decimalPrecision: 2,
					animate: true,
					plugins: new Ext.slider.Tip({
						getText: function(thumb) {
							return String.format('{0}%', thumb.value * 100);
						}
					}),
					width: 100,
					tooltip: {
						title: 'Fill Opacity',
						text: 'Opacity/transparency of the stroke.'
					},
				}]
			},{

				// 'Stroke' group
				xtype: 'buttongroup',
				title: 'Stroke',
				columns: 2,
				defaults: {
					cellCls: 'table-cell-padded'
				},
				items: [new Ext.ux.ColorField({
					ref: '../../strokeColorField',
					anchor: 'left',
					objectBinding: 'stroke',
					width: 100,
					tooltip: {
						title: 'Stroke Color',
						text: 'Color of the object\'s outline (stroke).'
					},
				}),{
					ref: '../../strokeTypeField',
					xtype: 'combo',
					objectBinding: 'strokeDasharray',
					store: new Ext.data.ArrayStore({
						fields: ['name', 'dash_array'],
						data: [['solid', ''], ['dashed', '--'], ['dashed', '-'], ['dashed', '- '], ['dotted', '.'], ['dotted', '. '], ['dashed/dotted', '-.'], ['dashed/dotted', '-..'], ['dashed/dotted', '- .'], ['dashed/dotted', '--.'], ['dashed/dotted', '--..']]
					}),
					tpl: new Ext.XTemplate(
					'<tpl for="."><div class="x-combo-list-item">',
					'<span>{name}</span>&nbsp;(<var>{dash_array}</var>)',
					'</div></tpl>'
					),
					valueField: 'dash_array',
					displayField: 'dash_array',
					typeAhead: true,
					mode: 'local',
					forceSelection: true,
					triggerAction: 'all',
					selectOnFocus: true,
					width: 100,
					tooltip: {
						title: 'Stroke Type',
						text: 'Style of the stroke (solid, dashed, etc.).'
					},
					cellCls: 'table-cell-padded-right'
				},{
					ref: '../../strokeOpacityField',
					xtype: 'slider',
					objectBinding: 'strokeOpacity',
					objectBindingEvent: 'changecomplete',
					minValue: 0,
					maxValue: 1,
					decimalPrecision: 2,
					animate: true,
					plugins: new Ext.slider.Tip({
						getText: function(thumb) {
							return String.format('{0}%', thumb.value * 100);
						}
					}),
					width: 100,
					tooltip: {
						title: 'Stroke Opacity',
						text: 'Opacity/transparency of the stroke.'
					},
				},{
					ref: '../../strokeWidthField',
					xtype: 'slider',
					objectBinding: 'strokeWidth',
					objectBindingEvent: 'changecomplete',
					minValue: 0,
					maxValue: 10,
					decimalPrecision: 1,
					increment: 0.5,
					animate: true,
					plugins: new Ext.slider.Tip({
						getText: function(thumb) {
							return String.format('{0} px', thumb.value);
						}
					}),
					width: 100,
					cellCls: 'table-cell-padded-right',
					tooltip: {
						title: 'Stroke Width',
						text: 'Width of the object\'s outline (stroke).'
					},
				}]

			}]
		});

		App.ui.FillStrokeTab.superclass.initComponent.apply(this, arguments);

		//this.on('afterrender', this.afterrender, this);
	},
});

/**
 * @class App.ui.GeometryTab
 * Ribbon panel which displays the position and dimensions of an object
 * @extends App.ui.BoundObjectPanel
 */
Ext.define('App.ui.GeometryTab', {
	extend:'App.ui.BoundObjectPanel',
	initComponent: function() {
		Ext.apply(this, {
			tbar: [{

				// Position group
				xtype: 'buttongroup',
				title: 'Position',
				columns: 1,
				defaults: {
					cellCls: 'table-cell-padded'
				},
				items: [{
					ref: '../../xField',
					fieldLabel: 'X',
					objectBinding: 'x',
					xtype: 'numberfield',
					width: 100,
					tooltip: {
						title: 'x position',
						text: 'The object\'s x position'
					},
				},{
					ref: '../../yField',
					fieldLabel: 'Y',
					objectBinding: 'y',
					xtype: 'numberfield',
					width: 100,
					tooltip: {
						title: 'y position',
						text: 'The object\'s y position'
					},
				}]
			},{

				// Dimensions group
				xtype: 'buttongroup',
				title: 'Dimensions',
				columns: 1,
				defaults: {
					cellCls: 'table-cell-padded'
				},
				items: [{
					ref: '../../widthField',
					fieldLabel: 'Width',
					objectBinding: 'width',
					xtype: 'numberfield',
					width: 100,
					tooltip: {
						title: 'Width',
						text: 'The object\'s width'
					},
				},{
					ref: '../../heightField',
					fieldLabel: 'Height',
					objectBinding: 'height',
					xtype: 'numberfield',
					width: 100,
					tooltip: {
						title: 'Height',
						text: 'The object\'s height'
					},
				}]
			}]
		});

		App.ui.GeometryTab.superclass.initComponent.apply(this, arguments);

		//this.on('afterrender', this.afterrender, this);
	},
	afterrender: function() {
		var tips = [this.xField, this.tField, this.widthField, this.heightField];
		this.tips = [];
		Ext.each(tips, function(field) {
			if (field.tooltip) {
				var t = field.tooltip;
				if (t.text && !t.html) {
					t.html = t.text;
				}
				t.target = field.getEl();
				this.tips.push(new Ext.ToolTip(t));
			}
		},
		this)
	}
});

/**
 * @class App.ui.MetaTab
 * Ribbon panel which displays properties of an object
 * @extends App.ui.BoundObjectPanel
 */
Ext.define('App.ui.MetaTab', {
	extend:'App.ui.BoundObjectPanel',
	initComponent: function() {
		Ext.apply(this, {
			tbar: [{

				// Name group
				xtype: 'buttongroup',
				title: 'Name',
				columns: 1,
				defaults: {
					cellCls: 'table-cell-padded'
				},
				items: [{
					ref: '../../nameField',
					fieldLabel: 'Name',
					objectBinding: 'name',
					xtype: 'textfield',
					width: 200,
					tooltip: {
						title: 'Name',
						text: 'The object\'s name'
					},
				},{
					ref: '../../typeField',
					xtype: 'combo',
					objectBinding: 'wtype',
					store: Workspace.Components.getTypeStore(),
					tpl: new Ext.XTemplate(
					'<tpl for="."><div class="x-combo-list-item">',
					'<img src="' + Ext.BLANK_IMAGE_URL + '" class="combo-icon {iconCls}" />&nbsp;<span>{wtype}</span>',
					'</div></tpl>'
					),
					valueField: 'wtype',
					displayField: 'wtype',
					typeAhead: true,
					mode: 'local',
					forceSelection: true,
					triggerAction: 'all',
					selectOnFocus: true,
					width: 200,
					tooltip: {
						title: 'Type',
						text: 'The object type.'
					},
					cellCls: 'table-cell-padded-right'
				}]
			},{

				// Properties group
				xtype: 'buttongroup',
				title: 'Properties',
				columns: 1,
				defaults: {
					cellCls: 'table-cell-padded'
				},
				items: []
			}]
		});

		App.ui.MetaTab.superclass.initComponent.apply(this, arguments);

		//this.on('afterrender', this.afterrender, this);
	},
	afterrender: function() {
		var tips = [this.nameField];
		this.tips = [];
		Ext.each(tips, function(field) {
			if (field.tooltip) {
				var t = field.tooltip;
				if (t.text && !t.html) {
					t.html = t.text;
				}
				t.target = field.getEl();
				this.tips.push(new Ext.ToolTip(t));
			}
		},
		this)
	}
});

Ext.define('App.ui.Dashboard', {
	extend: 'Ext.panel.Panel',
	initComponent: function() {

		Ext.apply(this, {
			title: 'Dashboard',
			bodyStyle:'padding:10px',
			iconCls: 'dash',
			autoLoad: {
				url: 'html/dashboard.html',
				callback: this.initDashboard,
				scope: this
			}
		});

		App.on('userNameChanged', function(name,email) {
			Ext.get('fp-user-name').update(App.User.name+' ('+App.User.email+')');
		});
		this.callParent();
	},
	initDashboard: function() {
		if(App.User.isLoggedIn()) {
			Ext.get('fp-user-name').update(App.User.name+' ('+App.User.email+')');
		}
	}
});
/**
 * @class App.ui.ProtovisPanel
 * Allows ProtoVis visualizations to be automatically sized and displayed within an {@link Ext.panel.Panel}
 */
Ext.define('App.ui.ProtovisPanel', {
	alias: 'widget.pvpanel',
	extend: 'Ext.panel.Panel',
	/**
	 * @cfg pan {Boolean} true to automatically allow panning of the display (defaults to true)
	 */
	pan: true,
	/**
	 * @cfg zoom {Number} if >0, mousewheel events on the visualization will zoom with this speed; false to disable zooming (defaults to 1)
	 */
	zoom: 1,
	bpadding: 20,
	/**
	 * @cfg autoRender {Boolean} true to automatically render the visualization after the component renders; false to render manually using
	 * {@link #afterrender} (defaults to false)
	 */
	autoRender: false,
	/**
	 * @cfg autoSize {Boolean} true to automatically scale the visualization to the size of the panel's body element (defaults to true)
	 */
	autoSize: true,
	initComponent: function() {
		//this.on('afterrender',this.afterrender,this);
		this.callParent(arguments);
		if(this.autoRender) {
			this.on('afterrender',this.afterrender,this, {
				single: true
			});
		}
	},
	/**
	 * afterrender
	 * Renders the visualization. Called automatically if {@link #autoRender} is true
	 */
	afterrender: function() {
		if(!this.built) {
			this.buildVis();
			if(!this.collapsed) {
				this.renderVis();
			}
			this.on('collapse',this.hideVis,this);
			this.on('expand',this.resizeVis,this);
			this.on('resize',this.resizeVis,this);
			this.built = true;
		}
	},
	/**
	 * getBodyWidth
	 * @return {Number} width of the body element in pixels
	 */
	getBodyWidth: function() {
		return this.body.getWidth();
	},
	/**
	 * getBodyHeight
	 * @return {Number} height of the body element in pixels
	 */
	getBodyHeight: function() {
		return this.body.getHeight();
	},
	/**
	 * resizeVis
	 * Updates the size (if {@link #autoSize} is true) of the visualization on panel resize. Calls user-defined {@link #updateVis}
	 */
	resizeVis: function(p,w,h) {
		if(this.autoSize) {
			this.vis.width(this.getBodyWidth()).height(this.getBodyHeight());
		}
		this.updateVis();
		this.vis.render();
	},
	/**
	 * renderVis
	 * Renders the visualization. Do not override this method; override {@link #buildVis} to specify your visualization.
	 */
	renderVis: function() {
		if(this.vis) {
			this.vis.visible(true);
			this.vis.render();
		}
	},
	/**
	 * updateVis
	 * Override this method to provide custom logic upon panel resize (such as updating visualization parameters other than width and height)
	 */
	updateVis: function() {
	},
	/**
	 * hideVis
	 * Hides the visualization.
	 */
	hideVis: function() {
		if(this.vis) {
			//this.vis.visible(false);
			this.vis.render();
		}
	},
	/**
	 * buildVis
	 * Override this method to provide your custom visualization logic
	 */
	buildVis: function() {
		return this.getCanvas();
	},
	/**
	 * getCanvas
	 * Builds the visualization panel, sizes, and sets pan and zoom events if specified.
	 * @returns {pv.Panel} panel the visualization panel
	 */
	getCanvas: function() {
		/**
		 * @property {pv.Panel} vis The visualization panel to which you can write. Ensure it is built by calling
		 * {@link #getCanvas}.
		 */
		if(!this.vis) {
			this.vis = new pv.Panel()
			.canvas(this.body.dom);
			if(this.autoSize) {
				this.vis
				.width(this.body.getWidth())
				.height(this.body.getHeight());
			}
			if(this.pan) {
				this.vis.event("mousedown", pv.Behavior.pan());
			}
			if(this.zoom) {
				this.vis.event("mousewheel", pv.Behavior.zoom(this.zoom));

			}
		}
		return this.vis;
	},
})

/**
 * App.ui.NupackResults
 * Application to show results of a NUPACK complexes and concentrations calculation.
 * Note: see the server-side nupackAnalysis section for details on the input format to this application
 * @consumes *.nupack-results
 */
Ext.define('App.ui.NupackResults', {
	extend: 'Ext.panel.Panel',
	template: '<div class="app-nupack-complex-wrap">'+
	'<div>'+
	'<span class="app-nupack-complex">Complex: {complex}</span>'+
	'&nbsp;|&nbsp;'+
	'<span class="app-nupack-order">Order: {order}</span>'+
	'</div>'+
	'<div class="app-nupack-force"></div>'+
	'</div>',
	mixins: {
		app: 'App.ui.Application',
	},
	html: '<fieldset class="x-fieldset x-fieldset-default"><legend class="x-fieldset-header x-fieldset-header-default nupack-strand-summary-title">Distinct strands</legend><pre class="nupack-strand-summary cm-s-default"></pre></fieldset>'+
	'<fieldset class="x-fieldset x-fieldset-default"><legend class="x-fieldset-header x-fieldset-header-default nupack-strand-summary-title">Complex Minimum Free Energy</legend><div class="nupack-mfe-summary"></div></fieldset>'+
	'<div class="nupack-concentration-summary"></div>',
	bodyPadding: 5,
	autoScroll: true,
	constructor: function(config) {
		this.callParent(arguments);
		this.mixins.app.constructor.apply(this,arguments);
	},
	initComponent: function() {
		this.callParent(arguments);
		this.on('afterrender',this.loadFile,this);
	},
	onLoad: function() {
		if(this.data) {
			if(!this.xt) {
				this.xt = new Ext.XTemplate(this.template);
			}

			this.sourceData = Ext.decode(this.data);

			// determine the highest concentration in the ensemble; scale against that
			// TODO: replace this with the sum of the starting concentrations
			var maxConcentration = _.reduce(this.sourceData.ocx_mfe, function(memo,complexData) {
				var x = Math.abs(parseFloat(complexData.concentration)*1000); //.toFixed());
				if(x > memo) {
					memo = x;
				}
				return memo;
			}, 0);
			// determine the highest-order complex in the ensemble
			var maxComplexSize = _.max(_.map(this.sourceData.ocx_mfe, function(a) {
				return a.strands.length;
			})),
			// sort the source data blobs by concentration (descending)
			sorted = _.sortBy(this.sourceData.ocx_mfe, function(a) {
				return -(parseFloat(a.concentration))*1000;
			}),
			// find the highest energy in this ensemble
			maxMfe = _.max(_.map(this.sourceData.ocx_mfe, function(a) {
				return Math.abs(parseFloat(a.energy));
			}));
			// print a list of the strands and strand indexes
			var strandSummary = this.getEl().down('.nupack-strand-summary'),
			// generate whole number indicies
			strandNames = this.sourceData.strandNames ? this.sourceData.strandNames : _.range(1,this.sourceData.strands.length+1);
			// syntax highlighting
			CodeMirror.runMode(_.map(_.zip(strandNames,this.sourceData.strands), function(x) {
				return x.join(' : ');
			}).join('\n'),'sequence',strandSummary.dom);
			this.getEl().down('.nupack-strand-summary-title').update(this.sourceData.strands.length+' distinct strands')

			// MFE bar graph
			var w = 600,
			h = 10*sorted.length,
			xScale = pv.Scale.linear(0, maxMfe).nice().range(0, w),
			yScale = pv.Scale.ordinal(pv.range(0,sorted.length)).splitBanded(0, h, 4/5),
			mfe = new pv.Panel()
			.canvas(this.getEl().down('.nupack-mfe-summary').dom)
			.width(w)
			.height(h)
			.top(10)
			.bottom(20)
			.left(50)
			.right(10);

			var bar = mfe.add(pv.Bar)
			.data(sorted)
			.top( function() {
				return yScale(this.index)
			})
			.height(yScale.range().band)
			.left(0)
			.width( function(d) {
				return xScale(Math.abs(parseFloat(d.energy)))
			});
			/* The value label. */
			bar.anchor("right").add(pv.Label)
			.textStyle("white")
			.text( function(d) {
				return d.energy
			});
			/* The variable label. */
			bar.anchor("left").add(pv.Label)
			.textMargin(5)
			.textAlign("right")
			.text( function(d) {
				return d.strandNames.join('+')
			});
			/* X-axis ticks. */
			mfe.add(pv.Rule)
			.data(xScale.ticks(5))
			.left(xScale)
			.strokeStyle( function(d) {
				return d ? "rgba(255,255,255,.3)" : "#000"
			} )
			.add(pv.Rule)
			.bottom(0)
			.height(5)
			.strokeStyle("#000")
			.anchor("bottom").add(pv.Label)
			.text(xScale.tickFormat);

			mfe.render();

			// render each complex block
			_.each(sorted, Ext.bind( function(complexData) {

				// compute the adjacency data used in laying out visualizations
				var nodeLayout  = DNA.generateAdjacency(complexData.structure,complexData.strands,false, {
					ppairs:complexData.ppairs
				}),
				nodeLayout2 = DNA.generateAdjacency(complexData.structure,complexData.strands,true, {
					ppairs:complexData.ppairs
				}),
				// Strand colors
				colors = pv.Colors.category10(),
				// Pair probability colors
				probColors = pv.Scale.linear(0, .5, 1).range("rgba(0,0,180,1)", "rgba(180,180,0,1)", "rgba(180,0,0,1)");

				// Complex block
				var pane = new Ext.panel.Panel({
					// render: complex name, concentration, concentration bar
					title: '<span class="nupack-complex-strands">'+complexData.strandNames.join('+')+'</span>'+'<span class="nupack-concentration-bar"></span><span class="nupack-concentration">'+complexData.concentration+' M&nbsp;|&nbsp;</span>' ,//'Complex: '+complexData.complex+' Order: '+complexData.order,
					cls: 'nupack-complex-panel',
					collapsible: true,
					titleCollapse: true,
					collapsed: true,
					resizable: {
						handles: 'n s'
					},
					listeners: {
						// build visualizations on panel expand
						expand: function(p) {
							if(this.force && this.adjacency && this.arc) {
								this.doLayout();
								_.invoke([this.force,this.adjacency,this.arc],'afterrender');
							}
						}
					},

					layout: 'border',
					defaults: {
						// anchor: '100%',
						xtype: 'panel',
						collapsible: true,
						cls: 'simple-header',
					},
					items: [{
						// Force-directed secondary structure depication
						xtype: 'pvpanel',
						ref: 'force',
						title: 'Secondary Structure',
						layout: 'fit',
						region: 'north',
						split: true,
						flex: 1,
						margins: '5 5 0 5',
						titleCollapse: true,
						buildVis: function() {
							this.getCanvas();
							var forceVis = this.vis;
							forceVis.fillStyle("white");

							var force = forceVis.add(pv.Layout.Force)
							.nodes(nodeLayout2.nodes)
							.links(nodeLayout2.links)
							.chargeConstant(-220)
							.springConstant(0.9)
							//.springLength(20)
							.bound(false);

							force.link.add(pv.Line)
							.strokeStyle( function(d,l) {
								return l.probability ? probColors(l.probability) : 'rgba(0,0,0,0.2)'
							});
							force.node.add(pv.Dot)
							.size( function(d) {
								return (d.linkDegree + 4) * Math.pow(this.scale, -1.5)
							})
							.fillStyle( function(d) {
								return d.fix ? "brown" : colors(d.strand)
							})
							.strokeStyle( function() {
								return this.fillStyle().darker()
							})
							.lineWidth(1)
							.title( function(d) {
								return d.nodeName
							})
							.event("mousedown", pv.Behavior.drag())
							.event("drag", force);
						}
					},{
						layout: 'border',
						region: 'center',
						flex: 1,
						collapseMode: 'mini',
						preventHeader: true,
						split: true,
						margins: '0 5 5 5',
						border: false,
						items:[{
							// arc depication
							// TODO: include option to view linearized
							title: 'Arc Diagram',
							xtype: 'pvpanel',
							ref: 'arc',
							region: 'center',
							flex: 1,
							titleCollapse: true,
							//margins: '0 0 5 5',
							collapseDirection: 'left',
							headerPosition: 'left',
							zoom:5,
							buildVis: function() {
								this.getCanvas();
								var arcVis = this.vis;
								// var arcVis = new pv.Panel()
								// .canvas(arcPanel.getEl().dom)
								// .width(arcPanel.getEl().getWidth())
								// .height(arcPanel.getEl().getHeight())
								// .event("mousedown", pv.Behavior.pan());

								this.arc = arcVis.add(pv.Layout.Arc)
								.nodes(nodeLayout.nodes)
								.links(nodeLayout.links)
								.orient('radial')
								.fillStyle("white");

								this.arc.link.add(pv.Line)
								.strokeStyle( function(d) {
									return d.probability ? probColors(d.probability) : '#ddd'
								});
								this.arc.node.add(pv.Dot)
								.fillStyle( function(d) {
									return colors(d.strand)
								});
								this.arc.label.add(pv.Label);

								this.updateVis();
							},
							updateVis: function() {
								this.arc
								.top(10)
								.left(10)
								.bottom(10)
								.right(10);
							},
						},{
							// adjacency matrix
							title: 'Adjacency Matrix',
							xtype: 'pvpanel',
							region: 'east',
							ref:'adjacency',
							split: true,
							flex: 1,
							titleCollapse: true,
							collapseDirection: 'right',
							headerPosition: 'right',
							zoom: 10,
							buildVis: function() {
								this.getCanvas();
								var adjVis = this.vis;

								var layout = this.layout = adjVis.add(pv.Layout.Matrix)
								.nodes(nodeLayout.nodes)
								.links(nodeLayout.links)
								.fillStyle("white");

								layout.link.add(pv.Bar)
								.fillStyle( function(d,l) {
									return l.probability ? probColors(l.probability) : '#ddd'
								})
								.antialias(false)
								.lineWidth(1);

								layout.label.add(pv.Label)
								.textStyle( function(d) {
									return colors(d.strand)
								});
								this.updateVis();
							},
							updateVis: function() {
								var r = Math.max(this.layout.data.length*12,Math.min(this.getBodyWidth(),this.getBodyHeight()));
								this.layout
								.top(10)
								.left(10)
								.width(r)
								.height(r);
							},
						},]
					}],
					// items: [{
					// title: 'Secondary Structure',
					// layout: 'fit',
					// region: 'north',
					// split: true,
					// items: {
					// xtype: 'component',
					// ref: 'force',
					// },
					// flex: 1,
					// margins: '5 5 0 5',
					// },{
					// title: 'Arc Diagram',
					// layout: 'fit',
					// region: 'center',
					// items: {
					// xtype: 'component',
					// ref: 'arc',
					// },
					// flex: 1,
					// margins: '0 0 5 5',
					// collapseDirection: 'left',
					// headerPosition: 'left',
					// },{
					// layout: 'fit',
					// title: 'Adjacency Matrix',
					// region: 'east',
					// split: true,
					// items: {
					// xtype: 'component',
					// ref:'adjacency',
					// },
					// flex: 1,
					// margins: '0 5 5 0',
					// collapseDirection: 'right',
					// headerPosition: 'right',
					// },],
					renderTo: this.body,
					minHeight: 200,
					height: 600,
					// margins: '5 0 20 0',
				});

				// collect child elements with 'ref' property and set as properties of this
				_.each(pane.query('*[ref]'), function(cmp) {
					this[cmp.ref] = cmp;
				},pane);
				var forcePanel = pane.force,
				arcPanel = pane.arc,
				adjPanel = pane.adjacency;

				// draw concentration bars for all panel blocks
				var concEl = pane.getEl().down('.nupack-concentration-bar').dom,
				c = (parseFloat(complexData.concentration)*1000), // .toFixed(),
				w = 400,
				h = 10;
				var pc = Math.abs(c/maxConcentration);
				var concPanel = new pv.Panel()
				.canvas(concEl)
				.width(w)
				.height(h);

				concPanel.add(pv.Bar)
				.data([{
					concentration: pc
				}])
				.width( function(d) {
					return Math.round(d.concentration*w)
				})
				.height(h)
				.top(0)
				.left(0)
				.fillStyle('#d00');
				concPanel.render();

			},this));
		}
	},
});

Ext.define('App.ui.CodeMirror', {
	alias: 'widget.codemirror',
	extend: 'Ext.panel.Panel',
	value: '',
	autoScroll: true,
	lineNumbers: true,
	initComponent: function() {
		Ext.applyIf(this, {
			html: '<textarea style="width: 100%;border:none;">'+this.value+'</textarea>',
			lastPos: null,
			lastQuery: null,
			marked: []
		});
		this.callParent(arguments);
		this.on('afterrender', this.afterrender, this, {
			single: true
		});
	},
	afterrender: function() {
		var textarea = this.getEl().down('textarea').dom;
		if(textarea) {
			this.codemirror = CodeMirror.fromTextArea(textarea,this);
			this.codemirror.setValue(this.value);
			this.codemirror.onCursorActivity = Ext.bind(this.onCursorActivity,this);
		}
	},
	onCursorActivity: function() {
		this.fireEvent('cursorChange',this);
	},
	getValue: function() {
		return this.codemirror.getValue();
	},
	setValue: function(v) {
		if(this.rendered) {
			this.codemirror.setValue(v);
		} else {
			this.value = v;
		}
	},
	unmark: function() {
		for (var i = 0; i < this.marked.length; ++i)
			this.marked[i]();
		this.marked.length = 0;
	},
	search: function(text) {
		var editor = this.codemirror;
		this.unmark();
		if (!text)
			return;
		for (var cursor = editor.getSearchCursor(text); cursor.findNext();)
			this.marked.push(editor.markText(cursor.from(), cursor.to(), "searched"));

		if (this.lastQuery != text)
			this.lastPos = null;
		var cursor = editor.getSearchCursor(text, this.lastPos || editor.getCursor());
		if (!cursor.findNext()) {
			cursor = editor.getSearchCursor(text);
			if (!cursor.findNext())
				return;
		}
		editor.setSelection(cursor.from(), cursor.to());
		this.lastQuery = text;
		this.lastPos = cursor.to();
	},
	replace: function(text,replace) {
		var editor = this.codemirror;
		this.unmark();
		if (!text)
			return;
		for (var cursor = editor.getSearchCursor(text); cursor.findNext();)
			editor.replaceRange(replace, cursor.from(), cursor.to());
	}
}, function() {
});
Ext.define('App.ui.TextEditor', {
	extend: 'Ext.panel.Panel',
	mixins: {
		app: 'App.ui.Application'
	},
	mode:'',
	layout: 'fit',
	editorType: '',
	constructor: function(config) {
		this.callParent(arguments);
		this.mixins.app.constructor.apply(this,arguments);
	},
	initComponent: function() {
		Ext.applyIf(this, {
			tbar: ['->',{
				text: 'Save',
				iconCls: 'save',
				handler: function() {
					this.saveFile();
				},
				scope: this,
			}],
			items: [{
				xtype: 'codemirror',
				itemId: 'editor',
				border: false,
				mode: this.mode,
			}],
		});
		this.callParent(arguments);
		this.editor = this.down('.codemirror');
		this.on('afterrender',this.loadFile,this);
	},
	onLoad: function() {
		this.editor.setValue(this.data);
	},
	getSaveData: function() {
		return this.editor.getValue();
	},
	search: function(text) {
		this.editor.search(text);
	},
	replace: function(text,replace) {
		this.editor.replace(text,replace);
	}
});

Ext.define('App.ui.Pepper', {
	extend: 'App.ui.TextEditor',
	initComponent: function() {
		Ext.applyIf(this, {
			tbar: [{
				text: 'Save',
				iconCls: 'save',
				handler: function() {
					this.saveFile();
				},
				scope: this,
			},{
				text: 'Compile',
				iconCls: 'compile',
				handler: function() {
					App.runTask('Pepper', {
						node: this.getPath()
					});
				},
				scope: this,
			}]
		});
		this.callParent(arguments);
	}
});

Ext.define('App.ui.SequenceThreader', {
	extend: 'Ext.window.Window',
	layout: 'fit',
	width:400,
	height: 400,
	initComponent: function() {
		Ext.apply(this, {
			layout: 'border',
			margins: 5,
			tbar: [{
				text: 'Thread',
				handler: this.thread,
				scope: this,
			},{
				text: 'Normalize',
				handler: this.normalize,
				scope: this,
			},{
				text: 'Truncate',
				handler: this.truncate,
				scope: this,
			}],
			items:[new App.ui.CodeMirror({
				region: 'west',
				width: 200,
				split: true,
				ref: 'sequencesPane',
				mode: 'sequence',
				title: 'Sequence',
			}),new App.ui.CodeMirror({
				region: 'center',
				ref: 'strandsPane',
				mode: 'nupack',
				title: 'Strands',
			}),new App.ui.CodeMirror({
				region: 'south',
				ref: 'resultsPane',
				mode: 'sequence',
				height: 200,
				split: true,
				title: 'Results',
			})],
			buttons: [{
				text: 'Done'
			}]
		});
		this.callParent(arguments);
		_.each(this.query('*[ref]'), function(cmp) {
			this[cmp.ref] = cmp;
		},this);
	},
	smartSelect: function(editor) {
		return App.ui.SequenceEditor.prototype.smartSplit.call(editor,editor.getValue());
	},
	thread: function() {
		var seqs = this.smartSelect(this.sequencesPane),
		strands = this.smartSelect(this.strandsPane), strandsList = {}, namesList;
		// _.each(_.map(strands, function(strand) {
		// return strand.split(':');
		// }),function(pair,list,i) {
		// if(pair.length > 1) {
		// strandsList.push({name: pair[0].trim(), strand: pair[1]});
		// //namesList[i] = pair[0];
		// //newStrandList[i] = pair[1];
		// } else {
		// strandsList.push({strand: pair[1].trim()});
		// }
		// });
		seqs = _.compact(_.map(seqs, function(seq) {
			return seq.trim();
		}));
		strandsList = DNA.normalizeSystem(_.compact(_.map(strands, function(strand) {
			return _.last(strand.split(':')).trim();
		})));
		//seqs.unshift('');
		var out = '';
		_.each(strandsList, function(spec,list,i) {
			out+= (DNA.threadSegments(seqs,spec)+'\n');
		});
		this.resultsPane.setValue(out);

	},
	normalize: function() {
		var strands = this.smartSelect(this.strandsPane), namesStrands, namesList, strandsList;
		namesStrands = _.map(strands, function(strand) {
			return _.map(strand.split(':'), function(s) {
				return s.trim();
			});
		})
		namesStrands = _.zip.apply(_,namesStrands);
		namesList = _.compact(namesStrands[0]);
		strandsList = _.compact(namesStrands[1]);
		strandsList = DNA.normalizeSystem(strandsList);

		this.strandsPane.setValue(_.map(_.zip(namesList,strandsList), function(pair) {
			return pair[0]+' : '+DNA.encodeStrand(pair[1]);
		}).join('\n'));
	},
	setStrands: function(data) {
		this.strandsPane.setValue(data);
	},
	setSequences: function(data) {
		this.sequencesPane.setValue(data);
	},
})

Ext.define('App.ui.SequenceEditor', {
	extend: 'App.ui.TextEditor',
	mode: 'sequence',
	initComponent: function() {
		Ext.applyIf(this, {
			tbar: [{
				text: 'Metrics',
				iconCls: 'ruler',
				menu: {
					items: [{
						text:  'Stats',
						menu: new App.ui.SequenceStats({
							ref: 'statsPanel'
						}),
						ref: 'stats'
					},{
						text: 'Levenshtein distance',
						menu: new App.ui.CompareMenu({
							algorithm:DNA.levenshtein,
						}),
						ref: 'lev',
					},{
						text: 'Hamming distance',
						menu: new App.ui.CompareMenu({
							algorithm:DNA.hamming,
							validate: function(v1,v2) {
								return (v1.length == v2.length);
							}
						}),
						ref: 'hamming',
					},{
						text: 'Shannon Entropy',
						menu: new App.ui.StatMenu({
							labelText: 'Calculate Shannon Entropy (∆S°)',
							baseText: 'Shannon: ',
							algorithm: function(sel) {
								var p_g = 0,
								p_a = 0,
								p_t = 0,
								p_c = 0,
								base = 0,
								shannon = 0;

								sel = sel.trim();

								// determine base frequencies
								for (j = 0; j < sel.length; j++) {

									// 1 = G, 2 = A, 3 = T, 4 = C; 11 = G (locked), etc
									base = sel[j];// % 10;
									if(base=='G') {
										p_g++;
									} else if (base=='A') {
										p_a++;
									} else if (base=='T') {
										p_t++;
									} else if (base=='C') {
										p_c++;
									}
								}

								// convert to distributions
								p_g = p_g / sel.length;
								p_a = p_a / sel.length;
								p_t = p_t / sel.length;
								p_c = p_c / sel.length;

								shannon = -(p_g * (p_g > 0 ? Math.log(p_g)/Math.LN2 : 0) +
									p_a * (p_a > 0 ? Math.log(p_a)/Math.LN2 : 0) +
									p_t * (p_t > 0 ? Math.log(p_t)/Math.LN2 : 0) +
									p_c * (p_c > 0 ? Math.log(p_c/Math.LN2) : 0));

								return shannon;
							},
						}),
						ref: 'shannon',
					}],
				},
				scope: this,
			},{
				text: 'Edit',
				iconCls: 'pencil',
				menu: {
					items: [{
						text: 'Reverse',
						iconCls: 'arrow-reverse',
						handler: this.reverse,
						scope: this,
					},{
						text: 'Complement',
						iconCls: 'arrow-complement',
						handler: this.complement,
						scope: this,
					},{
						text: 'Reverse Complement',
						iconCls: 'arrow-reverse-complement',
						handler: this.reverseComplement,
						scope: this,
					},{
						text: 'Pairwise Align',
						iconCls: 'pairwise-align',
						ref: 'align',
						handler: this.pairwiseAlign,
						scope:this,
					},{
						text: 'Replace Selection',
						checked: true,
						ref: 'replaceSelection',
					},'-',{
						text: 'To DNA',
						handler: this.convertToDNA,
						scope: this,
					},{
						text: 'To RNA',
						handler: this.convertToRNA,
						scope: this,
					},'-',{
						text: 'Strip extra characters',
						handler: this.stripExtra,
						scope: this,
					},{
						text: 'Strip whitespace',
						handler: this.stripWhitespace,
						scope: this,
					},{
						text: 'Strip newlines',
						handler: this.stripNewlines,
						scope: this,
					},{
						text: 'Insert line breaks',
						handler: this.autoLineBreaks,
						scope: this,
					},{
						text: 'Uppercase',
						handler: this.uppercase,
						scope: this,
					},{
						text: 'Lowercase',
						handler: this.lowercase,
						scope: this,
					},{
						text: 'Comment/Uncomment',
						handler: this.toggleComment,
						scope: this,
					},'-',{
						text: 'Make DD input file',
						handler: this.insertDD,
						scope: this,
					},{
						text: 'NUPACK out to FASTA',
						handler: this.nupackToFasta,
						scope: this,
					},'-',{
						text: 'Thread sequences to strand',
						handler: this.threadStrands,
						scope: this,
					},{
						text: 'Truncate',
						menu: [{
							text: 'Bases to truncate: ',
							tip: "Use a positive number for 5' truncations, negative number for 3' truncations.",
							canActivate: false,
						},{
							xtype: 'numberfield',
							ref: 'truncationCount',
							indent: true,
						},{
							text: 'Truncate',
							iconCls: 'tick',
							handler: this.truncate,
							scope: this,
						}]
					},{
						text: 'Name Strands',
						menu: [{
							text: 'Strand name prefix: ',
							canActivate: false,
						},{
							xtype: 'textfield',
							ref: 'strandNamePrefix',
							indent: true,
						},{
							text: 'Name Strands',
							iconCls: 'tick',
							handler: this.nameStrands,
							scope: this,
						}]
					},{
						text: 'Prepend strands',
						menu: [{
							text: 'Strand Prefix: ',
							canActivate: false,
						},{
							xtype: 'textfield',
							ref: 'strandPrefix',
							indent: true,
						},{
							text: 'Prepend',
							iconCls: 'tick',
							handler: this.prepend,
							scope: this,
						}]
					},]
				}
			},{
				text: 'Compute',
				iconCls: 'calculator',
				menu: {
					items:[{
						text: 'MFE Complexes',
						iconCls: 'nupack-icon',
						menu: new App.ui.CreateMenu({
							ref: 'mfeMenu',
							labelText: 'Save results to:',
							createText: 'Run',
							extraMenuItems: ['-',{
								xtype: 'numberfield',
								minValue: 1,
								allowBlank: true,
								emptyText: 'Max Complex Size',
								ref: 'mfeMaxComplexSize',
								indent: true,
							},'-'],
							onCreateButton: Ext.bind(this.mfeComplexes,this),
							autoCreateMenu: false,
						}),
						// handler: this.mfeComplexes,
						// scope: this,
					},{
						text: 'Pairwise MFE Complexes',
						iconCls: 'nupack-icon',
						menu: new App.ui.CreateMenu({
							ref: 'mfeMenu',
							labelText: 'Save results to:',
							createText: 'Run',
							// extraMenuItems: ['-',{
							// text: 'Temperature (°C):',
							// canActivate: false,
							// },{
							// xtype: 'numberfield',
							// emptyText: 'Temperature (°)',
							// tip: 'Temperature in °C',
							// value: 20,
							// allowBlank: false,
							// indent: true,
							// },'-',{
							// text: 'Mg<sup>2+</sup> (M): ',
							// canActivate: false,
							// },{
							// emptyText: 'Magnesium (M)',
							// tip: 'Magnesium concentration in mol/L (M)',
							// xtype: 'numberfield',
							// value: 1,
							// allowBlank: false,
							// indent: true,
							// },'-',{
							// text: 'Na<sup>+</sup> (M): ',
							// canActivate: false,
							// },{
							// emptyText: 'Sodium (M)',
							// tip: 'Magnesium concentration in mol/L (M)',
							// xtype: 'numberfield',
							// allowBlank: false,
							// value: 0,
							// indent: true,
							// },'-'],
							onCreateButton: Ext.bind(this.pairwiseMfeComplexes,this),
							autoCreateMenu: false,
						}),
					},{
						text: 'Brute Force',
						menu: [{
							text: 'Target length: ',
							canActivate: false,
						},{
							xtype: 'numberfield',
							ref: 'brutePermCount',
							minValue:2,
							maxValue:6,
							indent: true,
						},{
							text: 'Concatenations: ',
							canActivate: false,
						},{
							xtype: 'numberfield',
							ref: 'concatCount',
							minValue:0,
							indent: true,
						},{
							text: 'Brute',
							iconCls: 'tick',
							handler: this.bruteForce,
							scope: this,
						}]
					}]
				}
			},'->',{
				text: 'Save',
				iconCls: 'save',
				handler: function() {
					this.saveFile();
				},
				scope: this,
			}],
			bbar: new Ext.ux.statusbar.StatusBar({
				ref: 'statusBar',
				items: [{
					baseText: 'Strands: ',
					text: 'Strands: ',
					ref: 'strandCount',
				},{
					baseText: 'Bases: ',
					text: 'Bases: ',
					ref: 'baseCount',
				}]
			})
		});
		this.callParent(arguments);
		_.each(this.query('*[ref]'), function(cmp) {
			this[cmp.ref] = cmp;
		},this);
		this.shannon.on('activate',this.populateShannon,this);
		this.hamming.on('activate',this.populateHamming,this);
		this.lev.on('activate',this.populateLev,this);
		this.stats.on('activate',this.populateStats,this);
		this.editor.on('cursorChange',this.updateStatusBar,this);
	},
	updateStatusBar: function() {
		var sel = this.editor.getSelection();
		strandCount = _.reduce(sel.split('\n')).length;
		baseCount = sel.replace(/[^atcgu\s]/gmi,'').length;
		this.strandCount.setText(this.strandCount.baseText + strandCount);
		this.baseCount.setText(this.baseCount.baseText + baseCount);
	},
	bruteForce: function() {
		var strands = this.smartSelect(), count = this.brutePermCount.getValue(), concat = this.concatCount.getValue();
		function permute(prev,alphabet) {
			var o = [];
			_.each(prev, function(item) {
				_.each(alphabet, function(ch) {
					o.push(item+ch);
				});
			});
			return o;
		}

		function permutations(length,out,alph) {
			alph || (alph = ['A','T','C','G']);
			out || (out = ['A','T','C','G']);
			for(var i=1;i<length;i++) {
				out = permute(out,alph);
			}
			return out;
		}

		function brute(strands,length) {

			var nMers = permutations(length),
			wc = '',
			out = {};
			for(var i=0;i<nMers.length;i++) {
				wc = DNA.reverseComplement(nMers[i]);
				out[nMers[i]] = 0;
				for(var j=0;j<strands.length;j++) {
					if(strands[j].indexOf(wc)!=-1) {
						out[nMers[i]]++;
					}
				}
			}

			var minInteractions = 1000, sortedNmers = _.sortBy(_.map(out, function(value,key) {
				if(value < minInteractions) {
					minInteractions = value;
				}
				return {
					sequence: key,
					interactions: value
				};
			}), function(value) {
				return value.interactions;
			}),
			topNmers = _.compact(_.map(sortedNmers, function(nMer) {
				return (nMer.interactions == minInteractions) ? nMer.sequence : false;
			})),
			perms = (concat!=0) ? permutations(concat,topNmers,topNmers) : sortedNmers, //,
			des = new DD(), permScores;
			des.addDomains(strands);
			des.evaluateAllScores();
			permScores = _.map(perms,function(perm) {
				des.addDomains([perm]);
				des.evaluateScores(des.getDomainCount()-1);
				return {perm: perm, score: des.popDomain()};
			});
			permScores = _.sortBy(permScores,function(block) {
				return block.score;
			});
			console.log(permScores);
			// permAligns = _.sortBy(_.map(perms, function(perm) {
				// var score = 0;
				// return {
					// perm: perm,
					// alignments: _.map(strands, function(strand) {
						// var align = DNA.pairwiseAlign(strand,perm);
						// score += align.score;
						// return {
							// strand: strand,
							// alignment: align.sequences,
							// score: align.score,
// 
						// };
					// }),
					// score: score
				// };
			// }), function(a) {
				// return a.score
			// }),
			// permOut = _.map(permAligns, function(a) {
				// return 'Perm: '+a.perm+'\n'+'Score: '+a.score+'\n'+_.map(a.alignments, function(block) {
					// return block.alignment.join('\n');
				// }).join('\n\n');
			// }).join('\n\n%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%\n\n');
			// console.log(permOut);

			var win = new Ext.window.Window({
				width: 650,
				height: 400,
				maximizable: true,
				items: [{
					xtype: 'textareafield',
					region: 'north',
					height: 200,
					value: _.map(permScores,function(block) {
						return block.perm + ' : '+block.score;
					}).join('\n'),
					split: true,
				},new App.ui.ProtovisPanel({
					length: length,
					strands: strands,
					autoRender: true,
					autoSize: false,
					autoScroll: true,
					region: 'center',
					buildVis: function() {

						this.vis = this.getCanvas();
						var data = this.data;
						w = 600,
						h = 15*data.length,
						xScale = pv.Scale.linear(0, this.strands.length).nice().range(0, w),
						yScale = pv.Scale.ordinal(pv.range(0,data.length)).splitBanded(0, 15*data.length, 4/5);
						this.vis
						.width(w)
						.height(h)
						.top(10)
						.bottom(20)
						.left(50)
						.right(10);

						var bar = this.vis.add(pv.Bar)
						.data(data)
						.top( function() {
							return yScale(this.index)
						})
						.height(yScale.range().band)
						.left(0)
						.width( function(d) {
							return xScale(d.interactions)
						});
						/* The value label. */
						bar.anchor("right").add(pv.Label)
						.textStyle("white")
						.text( function(d) {
							return d.interactions
						});
						/* The variable label. */
						bar.anchor("left").add(pv.Label)
						.textMargin(5)
						.textAlign("right")
						.text( function(d) {
							return d.sequence
						});
						/* X-axis ticks. */
						// this.vis.add(pv.Rule)
						// .data(xScale.ticks(5))
						// .left(xScale)
						// .strokeStyle( function(d) {
						// return d ? "rgba(255,255,255,.3)" : "#000"
						// } )
						// .add(pv.Rule)
						// .bottom(0)
						// .height(5)
						// .strokeStyle("#000")
						// .anchor("bottom").add(pv.Label)
						// .text(xScale.tickFormat);
					},
					data: sortedNmers,
				}),],
				layout: 'border',
				title: 'Brute force '+count+'-mer search',
			});
			win.show();
			console.log(sortedNmers);
		}

		brute(strands,count);

		// var brute = new Worker('client/brute.js');
		// brute.onmessage = function(e) {console.log(e) };
		// brute.postMessage({strands: strands, length: count});
		// console.log('Worker started.');
	},
	/**
	 * Opens a window where the user can combine sequences into NUPACk-style strands
	 */
	threadStrands: function() {
		var win = new App.ui.SequenceThreader();
		win.show();
		win.setSequences(this.getSelection());
	},
	pairwiseMfeComplexes: function(fullName) {
		var strands = this.smartSelect(),
		maxComplexes = strands.length;
		App.runTask('NupackPairwise', {
			node: App.Path.sameDirectory(this.getPath(),fullName),
			strands: strands,
		});
	},
	mfeComplexes: function(fullName) {
		var strands = this.smartSelect(),
		maxComplexes = this.mfeMaxComplexSize.getValue();
		maxComplexes = Ext.isNumber(maxComplexes) ? maxComplexes : strands.length;
		App.runTask('NupackAnalysis', {
			node: App.Path.sameDirectory(this.getPath(),fullName),
			strands: strands,
			max: maxComplexes,
		});
	},
	populateStats: function() {
		this.statsPanel.loadSequence(this.getSelectionOrValue().replace(/[^atcgu]/gi,''));
		//this.statsPanel.show();
	},
	getSelectionOrValue: function() {
		var sel = this.editor.codemirror.getSelection();
		if(sel=='') {
			sel = this.editor.getValue();
		}
		return sel;
	},
	toggleComment: function() {
		var strands = this.smartSelect();
		strands = _.map(strands, function(strand) {
			if(strand.trim()[0]=='#' || strand.trim()[0]=='%') {
				strand = strand.trim().substr(1);
			} else {
				strand = '#' + strand;
			}
			return strand;
		});
		strands = strands.join('\n');
		this.editor.codemirror.replaceSelection(strands);
	},
	truncate: function() {
		var strands = this.smartSelect(), len = this.truncationCount.getValue();
		strands = _.map(strands, function(strand) {
			if(len > 0) {
				return strand.substr(len)
			} else {
				return strand.substr(0,strand.length+len)
			}
		});
		strands = strands.join('\n');
		this.editor.codemirror.replaceSelection(strands);
	},
	nameStrands: function() {
		var strands = this.smartSelect(), prefix = this.strandNamePrefix.getValue(), i=0;
		!!prefix || (prefix = '');

		strands = _.map(strands, function(strand) {
			i++;
			return prefix+i+' : '+strand;
		});
		strands = strands.join('\n');
		this.editor.codemirror.replaceSelection(strands);
	},
	prepend: function() {
		var strands = this.smartSelect(), prefix = this.strandPrefix.getValue(), i=0;
		!!prefix || (prefix = '');

		strands = _.map(strands, function(strand) {
			return prefix+strand;
		});
		strands = strands.join('\n');
		this.editor.codemirror.replaceSelection(strands);

	},
	nupackToFasta: function() {
		this.replace(new RegExp("\\t\\n",'gm'),'\n>');
		this.replace(new RegExp("\\t",'g'),'\n');
	},
	insertDD: function() {
		// var sel = this.editor.codemirror.getSelection(), v;
		// if(sel=='') {
		// sel = this.editor.getValue();
		// v = this.makeDD(sel);
		// this.editor.setValue(sel+'\n'+v);
		// } else {
		// v = this.makeDD(sel)
		// this.editor.codemirror.replaceSelection(sel+'\n'+v);
		// }
		this.replace(Ext.bind(this.makeDD,this));
	},
	makeDD: function(val) {
		val = val.replace(/[^atcgu\s]/gi,'');
		var list = _.map(val.split('\n'), function(v) {
			return v.trim()
		}),
		out=list.length.toString()+'\n';
		_.each(list, function(row) {
			out+=row+' 1 15\n';
		});
		return '# Save the following as an input file for DD:\n'+out;
	},
	replace: function(regex,value) {
		var sel = this.editor.codemirror.getSelection(), v;
		if(sel=='') {
			sel = this.editor.getValue();
			if(regex.test) {
				v = sel.replace(regex,value);
			} else if(Ext.isFunction(regex)) {
				v = regex(sel);
			}
			this.editor.setValue(v);
		} else {
			if(regex.test) {
				v = sel.replace(regex,value);
			} else if(Ext.isFunction(regex)) {
				v = regex(sel);
			}
			this.editor.codemirror.replaceSelection(v);
		}
	},
	uppercase: function() {
		this.replace( function(sel) {
			return sel.toUpperCase();
		});
	},
	lowercase: function() {
		this.replace( function(sel) {
			return sel.toLowerCase();
		});
	},
	convertToDNA: function() {
		this.replace(/u/g,'t');
		this.replace(/U/g,'T');
	},
	convertToRNA: function() {
		this.replace(/t/g,'u');
		this.replace(/T/g,'U');
	},
	autoLineBreaks: function() {
		this.replace(/s/gm,'\n');
	},
	stripExtra: function() {
		this.strip(/[^atcgu\s]/gi);
	},
	stripWhitespace: function() {
		this.strip(/\s/gm);
	},
	stripNewlines: function() {
		this.strip(new RegExp("\\n",'gm'));
	},
	strip: function(regex) {
		this.replace(regex,'');
	},
	pairwiseAlign: function() {
		var seqs = this.smartSelect(),
		align = DNA.pairwiseAlign(seqs[0],seqs[1],2, -1, 2, 0, 0);
		this.editor.codemirror.replaceSelection(align.sequences.join('\n'));
	},
	reverse: function() {
		var sel = this.editor.codemirror.getSelection(), replaceSel = !this.replaceSelection.checked,
		newVal = DNA.reverse(sel);
		if(replaceSel) {
			newVal = sel + '\n'+newVal;
		}
		this.editor.codemirror.replaceSelection(newVal);
	},
	complement: function() {
		var sel = this.editor.codemirror.getSelection(), replaceSel = !this.replaceSelection.checked,
		newVal = DNA.complement(sel);

		if(replaceSel) {
			newVal = sel + '\n'+newVal;
		}
		this.editor.codemirror.replaceSelection(newVal);
	},
	reverseComplement: function() {
		var sel = this.editor.codemirror.getSelection(), replaceSel = !this.replaceSelection.checked,
		newVal = DNA.reverseComplement(sel);

		if(replaceSel) {
			newVal = sel + '\n'+newVal;
		}
		this.editor.codemirror.replaceSelection(newVal);
	},
	populateShannon: function() {
		var menu = this.shannon.menu;
		sel = this.editor.codemirror.getSelection();
		if(sel!='') {
			menu.populate(sel);
		}
	},
	populateHamming: function() {
		this.populateComparison(this.hamming);
	},
	populateLev: function() {
		this.populateComparison(this.lev);
	},
	getSelection: function() {
		return this.editor.codemirror.getSelection();
	},
	smartSelect: function() {
		return this.smartSplit(this.editor.codemirror.getSelection());
	},
	smartSplit: function(sel) {
		if(sel.indexOf('\n')!=-1) {
			sel.replace(/(\r\n)/g,'\n');
			sel = sel.split('\n');

		} else if(sel.indexOf('\t')!=-1) {
			sel = sel.split('\t');
		} else if(sel.indexOf(' ')!=-1) {
			sel = sel.split(' ');
		} else {
			sel = [sel,''];
		}
		return _.map(sel, function(x) {
			return x.trim()
		});
	},
	populateComparison: function(item) {
		var menu = item.menu,
		sel = this.editor.codemirror.getSelection();
		if(sel!='') {
			sel = this.smartSplit(sel);
			menu.populate(sel[0],sel[1]);
		}
	}
});

Ext.define('App.ui.DD', {
	extend: 'Ext.panel.Panel',
	mixins: {
		app: 'App.ui.Application'
	},
	mutating: false,
	initComponent: function() {
		var designer = this.designer = new DD();

		this.store = Ext.create('Ext.data.ArrayStore', {
			ref: 'store',
			fields: [{
				name: 'domain',
				type: 'int'
			},{
				name: 'sequence',
			},{
				name: 'importance',
				type: 'float',
			},{
				name: 'composition',
				type: 'int',
			},{
				name: 'score',
				type: 'float',
			},{
				name: 'target',
				type: 'bool',
				defaultValue: false,
			}
			],
			data: []
		});

		var cellEditor = this.cellEditor = Ext.create('Ext.grid.plugin.CellEditing', {
			clicksToEdit: 1,
			autoCancel: false
		});
		this.cellEditor.on('edit', function(editor,e) {
			this.designer.updateDomain(this.store.indexOf(e.record),e.record.get('sequence'),e.record.get('importance'),e.record.get('composition'));
			
		},this);
		this.targetColumn = Ext.create('Ext.ux.CheckColumn',{
				header: 'Target',
				dataIndex: 'target',
				width: 60,
				xtype: 'checkcolumn'
		});
		this.targetColumn.on('checkchange',function(col,i,checked) {
			var rec = this.store.getAt(i);
			 if(rec.get('target')) { 
				this.designer.targetDomain(i)
			} else {
				this.designer.untargetDomain(i)
			}
		},this);
			
		Ext.apply(this, {
			layout: 'fit',
			// items: {
			// xtype: 'panel',
			// ref: 'output',
			// },
			items: {
				xtype: 'gridpanel',
				bodyBorder: false,
				border: false,
				ref: 'grid',
				columns: [Ext.create('Ext.grid.RowNumberer'),{
					header: 'Sequence',
					dataIndex: 'sequence',
					renderer: function(v) {
						var x = {
							innerHTML: '',
							nodeType: 1
						};
						CodeMirror.runMode(v.toUpperCase(),'sequence',x);
						return x.innerHTML;
					},
					editor: {
						allowBlank: false,
					},
					flex: 1
				},{
					header: 'Importance',
					dataIndex: 'importance',
					width: 100,
					editor: {
						xtype: 'numberfield',
						allowBlank: false,
					}
				},{
					header: 'Composition',
					dataIndex: 'composition',
					renderer:  Ext.bind( function(v) {
						v = this.designer.printComposition(v);
						var x = {
							innerHTML: '',
							nodeType: 1
						};
						CodeMirror.runMode(v.toUpperCase(),'sequence',x);
						return x.innerHTML;
					},this),
					width: 100,
					editor: {
						xtype: 'numberfield'
					},
					// editor: {
					// xtype: 'combobox',
					// store: Ext.create('Ext.data.Store',{
					// fields: ['base','value'],
					// data: [{base: 'G', value: 8},{base: 'A',value: 4},{base: 'T', value: 2},{base: 'C', value: 1}]
					// }),
					// queryMode: 'local',
					// multiSelect: true,
					// allowBlank: false,
					// displayField: 'base',
					// valueField: 'value',
					// setValue: function(v,doSelect) {
					// v = _.compact([v & 8 >> 3, v & 4 >> 2, v & 2 >> 1, v & 1]);
					// this.callParent([v,doSelect]);
					// },
					// getValue: function() {
					// var x = this.callParent(arguments);
					// console.log(x);
					// },
					// }
				},{
					header: 'Score',
					dataIndex: 'score',
					width: 100,
					editable: false,
				},this.targetColumn],
				store: this.store,
				plugins: [this.cellEditor]
			},
			tbar: [{
				text: 'Mutate',
				iconCls: 'play',
				ref: 'mutateButton',
				handler: this.toggleMutation,
				scope: this,
			},'-',{
				text: 'Add',
				ref: 'addDomainButton',
				handler: this.doAddDomain,
				scope: this,
				iconCls: 'plus',
				xtype: 'splitbutton',
				menu: [{
					text: 'New domain length: ',
					canActivate: false,
				},{
					xtype: 'numberfield',
					ref: 'addDomLen',
					value: 8,
					min: 2,
					indent: true,
				},{
					text: 'Add Domain',
					iconCls: 'tick',
					ref: 'addDomainItem',
					handler: this.doAddDomain,
					scope: this,
				},'-',{
					text: 'Add specific domains...',
					handler: this.addManyDomains,
					scope: this,
				}]
			},{
				text: 'Modify',
				ref: 'modDomainButton',
				iconCls: 'edit',
				xtype: 'splitbutton',
				handler: function() {
					this.cellEditor.startEdit(this.grid.getSelectionModel().getLastSelected(),this.grid.headerCt.getHeaderAtIndex(0));
				},
				scope: this,
				menu: [{
					text: 'Reseed Domain',
					handler: this.reseed,
					scope: this,
				},{
					text: 'Reseed All Domains',
					handler: this.reseedAll,
					scope: this,
				}]
			},{
				text: 'Delete',
				ref: 'delDomainButton',
				handler: this.doDeleteDomain,
				scope: this,
				iconCls: 'cross',
			},'-',{
				text: 'Advanced',
				iconCls: 'tools',
				menu: [{
					text: 'Design options',
					iconCls: 'wrench',
					handler: this.designOptions,
					scope: this,
				},{
					text: 'Tweak score parameters',
					iconCls: 'ui-slider',
					handler: this.scoreParams,
					scope: this,
				}]
			},'->',{
				text: 'Save',
				iconCls: 'save'
			}],
			bbar: new Ext.ux.statusbar.StatusBar({
				ref: 'statusBar',
				items: [{
					baseText: 'Attempts: ',
					text: 'Attempts: ',
					ref: 'attemptCount',
				},{
					baseText: 'Mutations: ',
					text: 'Mutations: ',
					ref: 'mutCount',
				}]
			})
		});
		this.callParent(arguments);
		_.each(this.query('*[ref]'), function(cmp) {
			this[cmp.ref] = cmp;
		},this);
	},
	reseed: function() {
		
	},
	reseedAll: function() {
		
	},
	updateOptions: function(v) {
		this.designer.updateOptions(v);
	},
	updateRules: function() {
		this.designer.updateRules(v);
	},
	designOptions: function () {
		if(!this.designOptionsWindow) {
			this.designOptionsWindow = Ext.create('App.ui.DD.RulesWindow',{designer:this.designer, closeAction: 'hide'});
		}
		this.designOptionsWindow.setValues(this.designer.getRules());
		this.designOptionsWindow.show();
	},
	scoreParams: function() {
		if(!this.scoreParamsWindow) {
			this.scoreParamsWindow = Ext.create('App.ui.DD.OptionsWindow',{designer:this.designer, closeAction: 'hide'});
		}
		this.scoreParamsWindow.setValues(this.designer.getOptions());
		this.scoreParamsWindow.show();
	},
	updateStatusBar: function() {
		var attempts = this.designer.getMutationAttempts(),
		muts = attempts = this.designer.getMutationCount();
		this.attemptCount.setText(this.attemptCount.baseText+attempts);
		this.mutCount.setText(this.mutCount.baseText+muts);
	},
	doDeleteDomain: function() {
		var rec = this.grid.getSelectionModel().getLastSelected();
		if(rec) {
			this.designer.removeDomain(this.store.indexOf(rec));
			this.store.remove(rec);
		}
	},
	addManyDomains: function() {
		if(!this.addDomainsWindow) {
			this.addDomainsWindow = Ext.create('App.ui.DD.SequenceWindow',{designer:this});
		}
		this.addDomainsWindow.show();
	},
	addDomains: function(seqs) {
		var imp = 1, comp = 15;
		this.designer.addDomains(seqs,imp,comp);
		_.each(seqs,function(seq) {
			this.store.add({
				sequence: seq,
				importance: imp,
				composition: comp,
			}); 
		},this);
		this.designer.evaluateIntrinsicScores();
	},
	doAddDomain: function() {
		var len = this.addDomLen.getValue();
		var seq = this.designer.randomSequence(1,len)[0];
		this.addDomain(this.designer.printfDomain(seq),1,15);
	},
	addDomain: function(seq,imp,comp) {
		// false to not clobber
		this.designer.addDomains([seq],imp,comp,false);
		this.store.add({
			sequence: seq,
			importance: imp,
			composition: comp,
		});
		this.designer.evaluateAllScores();
	},
	toggleMutation: function() {
		if(this.mutating) {
			this.pauseMutation();
		} else {
			this.startMutation();
		}
	},
	mutStep: 100,
	doMutation: function() {
		for(var i=0; i<this.mutStep;i++) {
			this.designer.mutate();
		}
		this.updateStatusBar();
		// true to force a re-tally (since domain_score[] isn't automatically updated when a
		// mutation is rejected; we risk showing an increased score that was actually rejected)
		var scores = this.designer.getScores(true),
		mut_dom = this.designer.getMutatedDomain(),
		mut_dom_seq = this.designer.printfDomainById(mut_dom), rec;
		//this.output.update(this.designer.printDomains());
		// //this.store.suspendEvents();
		for(var i=0;i<scores.length;i++) {
			rec = this.store.getAt(i);//+1);
			if(rec.get('score') !=0 && rec.get('score') < scores[i]) {
				throw "Score increase";
			}
			rec.set('score',scores[i]);
		}
		rec = this.store.getAt(mut_dom);
		rec.set('sequence',mut_dom_seq);
		//this.store.resumeEvents();
		this.store.sync();
	},
	startMutation: function() {
		this.mutateButton.setIconCls('pause');
		_.invoke([this.modDomainButton,this.addDomainButton,this.delDomainButton],'disable');
		if(!this.mutationTask) {
			this.mutationTask = Ext.TaskManager.start({
				run: this.doMutation,
				interval: 0.1,
				scope: this,
			});
		} else {
			this.mutationTask = Ext.TaskManager.start(this.mutationTask);
		}
		this.mutating = true;
	},
	pauseMutation: function() {
		this.mutateButton.setIconCls('play');
		_.invoke([this.modDomainButton,this.addDomainButton,this.delDomainButton],'enable');
		if(this.mutationTask) {
			Ext.TaskManager.stop(this.mutationTask);
		}
		this.mutating = false;
	}
});

Ext.define('App.ui.DD.SequenceWindow',{
	extend: 'Ext.window.Window',
	width: 800,
	height: 600,
	layout: 'fit',
	title: 'Add specific sequences to DD',
	initComponent: function() {
		this.sequenceEditor = Ext.create('App.ui.CodeMirror',{mode: 'sequence',border: false});
		Ext.apply(this,{
			items: [this.sequenceEditor],
			buttons: [{
				text: 'Add Domains',
				iconCls: 'tick',
				handler: this.addDomains,
				scope: this,
			}]
		});
		this.callParent(arguments);
	},
	addDomains: function() {
		this.designer.addDomains(this.sequenceEditor.getValue().split('\n'));
	}
})

// var options = {
// MAX_MUTATIONS: 10, // maximum number of simultaneous mutations
// GCstr:2,
// ATstr:1,
// GTstr:0,
// MBstr:-3, // mismatch, bulge
// LLstr:-0.5, // large loop
// DHstr:3, // score for domain ending in a base pair
// LHbases:4,
// LHstart:2,
// LHpower:2,
// MAX_IMPORTANCE:100,
// INTRA_SCORE:5, // score bonus for intrastrand/dimerization interactions
// CROSSTALK_SCORE:-5, // score bonus for crosstalk (as compared to interaction)
// CROSSTALK_DIV:2, // crosstalk score is divided by this much (and then score is subtracted)
// GGGG_PENALTY:50,
// ATATAT_PENALTY:20,
// };

Ext.define('App.ui.DD.OptionsWindow', {
	extend: 'Ext.window.Window',
	layout: 'fit',
	plain: true,
	bodyBorder: false,
	border: false,
	width: 675,
	initComponent: function() {
		Ext.apply(this, {
			items: {
				xtype: 'form',
				frame: true,
				defaults: {
					labelAlign: 'right',
					labelWidth: 250,
				},
				items: [{
					fieldLabel: 'Maximum simultaneous mutations',
					xtype: 'numberfield',
					itemId: 'MAX_MUTATIONS',
				},{
					xtype: 'fieldset',
					title: 'Base composition',
					defaults: {
						labelAlign: 'right',
						labelWidth: 175,
					},
					layout: {
						type: 'table',columns: 2,
					},
					items: [{
						fieldLabel: 'GC Score',
						xtype: 'numberfield',
						itemId: 'GCstr',
					},{
						fieldLabel: 'AT Score',
						xtype: 'numberfield',
						itemId: 'ATstr',
					},{
						fieldLabel: 'GT score',
						xtype: 'numberfield',
						itemId: 'GTstr',
					},{
						fieldLabel: 'GGGG Penalty',
						xtype: 'numberfield',
						itemId: 'GGGG_PENALTY',
					},{
						fieldLabel: '6 consecutive A/T or G/C score',
						xtype: 'numberfield',
						itemId: 'ATATAT_PENALTY',
					},{
						fieldLabel: 'Shannon Entropy multiplier',
						xtype: 'numberfield',
						itemId: 'SHANNON_MULTIPLIER',
					},]
				},{xtype: 'container', layout: {type: 'table',columns: 2,}, defaults: {margin: 5}, items:[{
					xtype: 'fieldset',
					title: 'Matches',
					defaults: {
						labelAlign: 'right',
						labelWidth: 220,
					},
					items: [{
						fieldLabel: 'Mismatch/bulge score',
						xtype: 'numberfield',
						itemId: 'MBstr',
					},{
						fieldLabel: 'Larger loop score (per extra base)',
						xtype: 'numberfield',
						itemId: 'LLstr',
					},{
						fieldLabel: 'Penalty for pairing at ends of domains',
						xtype: 'numberfield',
						itemId: 'DHstr',
					},]
				},{
					xtype: 'fieldset',
					title: 'Exponential Scoring',
					defaults: {
						labelAlign: 'right',
						labelWidth: 220,
					},
					items: [{
						fieldLabel: 'Number of bases before exponential score kicks in',
						xtype: 'numberfield',
						itemId: 'LHbases',
					},{
						fieldLabel: 'Exponential score initial',
						xtype: 'numberfield',
						itemId: 'LHstart',
					},{
						fieldLabel: 'Exponential score power',
						xtype: 'numberfield',
						itemId: 'LHpower',
					},]
				},]},{
					xtype: 'fieldset',
					title: 'Crosstalk',
					defaults: {
						labelAlign: 'right',
						labelWidth: 220,
					},
					items:[{
						fieldLabel: 'Intra-domain bonus score',
						xtype: 'numberfield',
						itemId: 'INTRA_SCORE',
					},{
						fieldLabel: 'Crosstalk bonus score',
						xtype: 'numberfield',
						itemId: 'CROSSTALK_SCORE',
					},{
						fieldLabel: 'Crosstalk score divide factor',
						xtype: 'numberfield',
						itemId: 'CROSSTALK_DIV',
					}]
				},],
				buttons: [{
					text: 'Save',
					handler: this.save,
					scope: this,
				}]
			}
		});
		this.callParent(arguments);
		this.form = this.down('form');
	},
	save: function() {
		this.designer.updateOptions(this.getValues());
	},
	getValues: function() {
		return this.form.getValues();
	},
	setValues: function(v) {
		return this.form.getForm().setValues(v);
	},
});

// var rules = {
// rule_4g : 1, // cannot have 4 G's or 4 C's in a row
// rule_6at : 1, // cannot have 6 A/T or G/C bases in a row
// rule_ccend : 1, // domains MUST start and end with C
// rule_ming : 1, // design tries to minimize usage of G
// rule_init : 7, // 15 = polyN, 7 = poly-H, 3 = poly-Y, 2 = poly-T
// rule_targetworst : 1, // target worst domain
// rule_gatc_avail : 15, // all bases available
// rule_lockold : 0, // lock all old bases (NO)
// }



Ext.define('App.ui.DD.RulesWindow', {
	extend: 'Ext.window.Window',
	plain: true,
	bodyBorder: false,
	border: false,
	layout: 'fit',
	initComponent: function() {
		Ext.apply(this, {
			items: {
				xtype: 'form',
				frame: true,
				defaults: {
					labelAlign: 'top',
					// labelWidth: 150,
				},
				items: [{
					boxLabel: "Prevent 4 G's and 4 C's in a row",
					xtype: 'checkboxfield',
					itemId: 'rule_4g',
				},{
					boxLabel: "Prevent 6 A/T bases in a row and 6 G/C bases in a row",
					xtype: 'checkboxfield',
					itemId: 'rule_6at',
				},{
					boxLabel: 'Domains must start and end with C',
					xtype: 'checkboxfield',
					itemId: 'rule_ccend',
				},{
					boxLabel: "Minimize G's in domain design",
					xtype: 'checkboxfield',
					itemId: 'rule_ming',
				},{
					boxLabel: 'Target worst domain for mutations',
					xtype: 'checkboxfield',
					itemId: 'rule_targetworst',
				},{
					fieldLabel: "Constrain initial domain sequences",
					xtype: 'textfield',
					itemId: 'rule_init',
				},{
					fieldLabel: 'Constrain bases in domains',
					xtype: 'textfield',
					itemId: 'rule_gatc_avail',
				},{
					boxLabel: 'Lock all bases in strands loaded from file',
					xtype: 'checkboxfield',
					itemId: 'rule_lockold',
				},],
				buttons: [{
					text: 'Save',
					handler: this.save,
					scope: this,
				}]
			}
		});
		this.callParent(arguments);
		this.form = this.down('form');
	},
	save: function() {
		this.designer.updateRules(this.getValues());
	},
	getValues: function() {
		return this.form.getValues();
	},
	setValues: function(v) {
		return this.form.getForm().setValues(v);
	},
});

Ext.define('App.ui.SequenceStats', {
	extend: 'Ext.menu.Menu',
	minWidth: 300,
	minHeight: 400,
	initComponent: function() {
		this.store = new Ext.data.JsonStore({
			fields: [{
				name: 'name',
				type: 'string'
			},{
				name: 'count',
				type: 'int'
			},{
				name: 'percent',
				type: 'float',
			},
			],
			data: []
		});
		this.chartStore = new Ext.data.JsonStore({
			fields: [{
				name: 'name',
				type: 'string'
			},{
				name: 'count',
				type: 'int'
			},{
				name: 'percent',
				type: 'float',
			},
			],
			data: []
		});
		this.grid = new Ext.grid.Panel({
			store: this.store,
			columns: [{
				header: 'Sequence',
				dataIndex: 'name',
				flex: 2,
				renderer: function(v) {
					return v.toUpperCase();
				},
			},{
				header: 'Count',
				dataIndex: 'count',
				flex: 1,
			},{
				header: 'Percent',
				dataIndex: 'percent',
				flex: 1,
				renderer: function(v) {
					return (v*100)+'%';
				}
			}]
		});
		this.chart = new Ext.chart.Chart({
			store: this.chartStore,
			shadow: false,
			legend: false,
			height: 200,
			//insetPadding: 60,
			theme: 'Base:gradients',
			series: [{
				type: 'pie',
				field: 'percent',
				showInLegend: false,
				donut: false,
				highlight: {
					segment: {
						margin: 20
					}
				},
				label: {
					field: 'name',
					display: 'middle',
					contrast: true,
					font: '14px helvetica',
					renderer: function(v) {
						return v.toUpperCase();
					}
				}
			}]
		});
		Ext.apply(this, {
			items: [
			this.chart,
			this.grid]
		});

		this.callParent(arguments);
	},
	loadSequence: function(sequence) {
		var data = DNA.sequenceStats(sequence);
		this.store.loadData(data.full);
		this.chartStore.loadData(data.abbr);
	},
});

Ext.define('App.ui.StatMenu', {
	extend: 'Ext.menu.Menu',
	labelText: 'Statistic: ',
	baseText: 'Value: ',
	initComponent: function() {
		Ext.apply(this, {
			resizable: {
				transparent: true,
			},
			items: [{
				text: this.labelText,
				canActivate: false
			},{
				xtype: 'textfield',
				ref: 'field',
				validate: Ext.bind(this.doValidate,this),
				scope: this,
				indent: true,
				invalidText: this.invalidText,
				invalidCls: 'x-form-invalid',
				validateOnChange: this.validateOnChange,
			},'-',{
				text: this.baseText,
				defaultText: this.baseText,
				canActivate: false,
				disabled: true,
				ref: 'output',
			}]
		});
		this.callParent(arguments);
		_.each(this.query('*[ref]'), function(cmp) {
			this[cmp.ref] = cmp;
		},this);
		this.field.on('blur', this.onBlur,this);
	},
	validate: function() {
		return true;
	},
	algorithm: function() {
		return 0;
	},
	doValidate: function() {
		var v1 = this.field.getValue();
		return this.validate(v1 || '');
	},
	onBlur: function() {
		this.validityChange(this.doValidate());
	},
	validityChange: function(isValid) {
		this.output.setDisabled(!isValid);
		if(isValid) {
			this.output.setText(this.baseText + this.algorithm(this.field.getValue()));
		} else {
			this.output.setText('N/A');
		}
	},
	populate: function(s1) {
		this.field.suspendEvents();

		if(s1) {
			this.field.setValue(s1);
		}
		this.field.resumeEvents();
		this.validityChange(this.doValidate());
	},
})

Ext.define('App.ui.CompareMenu', {
	extend: 'Ext.menu.Menu',
	//plain: true,
	invalidText: 'Invalid Comparison',
	validateOnChange: false,
	minWidth: 300,
	resizeHandles: 's e se',

	initComponent: function() {
		Ext.apply(this, {
			resizable: {
				transparent: true,
			},
			items: [{
				text: 'Compare:',
				canActivate: false
			},{
				xtype: 'textfield',
				ref: 'field1',
				validate: Ext.bind(this.doValidate,this),
				scope: this,
				indent: true,
				invalidText: this.invalidText,
				invalidCls: 'x-form-invalid',
				validateOnChange: this.validateOnChange,
			},{
				xtype: 'textfield',
				ref: 'field2',
				validate: Ext.bind(this.doValidate,this),
				scope: this,
				indent: true,
				invalidText: this.invalidText,
				invalidCls: 'x-form-invalid',
				validateOnChange: this.validateOnChange,
			},'-',{
				text: 'Edit distance: ',
				defaultText: 'Edit distance: ',
				canActivate: false,
				disabled: true,
				ref: 'output',
			}]
		});
		this.callParent(arguments);
		_.each(this.query('*[ref]'), function(cmp) {
			this[cmp.ref] = cmp;
		},this);
		this.field1.on('blur', this.onBlur,this);
		this.field2.on('blue', this.onBlur,this);
	},
	validate: function() {
		return true;
	},
	algorithm: function() {
		return 0;
	},
	doValidate: function() {
		var v1 = this.field1.getValue();
		v2 = this.field2.getValue();
		return this.validate(v1 || '', v2 || '');
	},
	onBlur: function() {
		this.validityChange(this.doValidate());
	},
	validityChange: function(isValid) {
		this.output.setDisabled(!isValid);
		if(isValid) {
			this.output.setText(this.output.defaultText + this.algorithm(this.field1.getValue(),this.field2.getValue()));
		} else {
			this.output.setText('N/A');
		}
	},
	populate: function(s1,s2) {
		this.field1.suspendEvents();
		this.field2.suspendEvents();

		if(s1) {
			this.field1.setValue(s1);
		}
		if(s2) {
			this.field2.setValue(s2);
		}
		this.field1.resumeEvents();
		this.field2.resumeEvents();
		this.validityChange(this.doValidate());
	},
});

Ext.define('App.ui.NupackEditor', {
	extend: 'App.ui.TextEditor',
	iconCls:'nupack',
	editorType: 'NUPACK',
	mode: 'nupack',
	initComponent: function() {
		Ext.apply(this, {
			tbar: [{
				xtype: 'splitbutton',
				text: 'Open NUPACK',
				iconCls: 'nupack-icon',
				handler: App.ui.Launcher.makeLauncher('nupack'),
				menu: new App.ui.NupackMenu({}),
			},{
				text: 'Edit',
				iconCls: 'pencil',
				menu: [{
					text: 'Thread segments to sequences',
					handler: this.threadStrands
				},]
			},'->',{
				text: 'Save',
				iconCls: 'save',
				handler: function() {
					this.saveFile();
				},
				scope: this,
			}]
		})
		this.callParent(arguments);
	},
	threadStrands: function() {
		var win = new App.ui.SequenceThreader();
		win.show();
		win.setStrands(this.getSelection());
	},
	getSelection: function() {
		return this.editor.codemirror.getSelection();
	},
}
)