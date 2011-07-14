Ext.define('App.ui.Launcher', {
	statics : {
		triggerDelimiter : ':',
		_triggers : {},
		_openTabs : {},
		register : function(name, className, config) {
			config || ( config = {});
			this._triggers[name] = {
				cls : className,
				config : config
			};
		},
		getActiveApp : function() {
			return this.tabPanel.getActiveTab();
		},
		addTab : function(tab) {
			if(this.tabPanel) {
				this.tabPanel.add(tab);
			}
		},
		launch : function(trigger, doc) {
			if(!trigger || trigger=="false") {
				return;
			}
			tab = this._openTabs[trigger];
			if(tab) {
				this.tabPanel.setActiveTab(tab);
			} else {
				var triggers = trigger.split(this.triggerDelimiter), rootTrigger = triggers.shift(), a = this._triggers[rootTrigger];
				var mask, tab;
				if(a) {
					// mask workspace while deserializing
					mask = this.tabPanel.setLoading('Loading...');
					tab = Ext.create(a.cls, Ext.apply({}, a.config, {
						document : (doc || false),
						initialTrigger : trigger,
						triggers : triggers,
						closable : true,
						listeners : {
							afterrender : {
								fn : function() {
									mask.hide();
								},
								single : true
							}
						}
					}));
				} else {
					mask = this.tabPanel.setLoading('Loading...');
					tab = Ext.createByAlias('app.' + rootTrigger);
				}
				if(tab) {
					this.addTab(tab);
					this.tabPanel.setActiveTab(tab);
					this._openTabs[trigger] = tab;
					// Ext.History.add(trigger,true);

					tab.on('close', function(tab) { delete
						this._openTabs[tab.initialTrigger];
					}, this);
					Ext.log('Launched InfoMachine application with trigger: ' + trigger, {
						iconCls : 'application',
						silent : true
					});
				}
			}
		},
		makeLauncher : function(trigger) {
			return Ext.bind(function() {
				this.launch(trigger);
			}, this);
		},
		toggleConsole : function() {
			this.console.toggleCollapse();
		},
		showConsole : function() {
			this.console.expand();
		}
	}
}, function() {
	App.ui.Launcher.register('nodal', 'App.ui.Canvas', {
		title : 'Nodal System',
		editorType: 'Nodal',
		iconCls : 'nodal',
		border : false,
		ribbonItems : [{
			xtype : 'nodal-hometab',
			title : 'Home',
			border : false,
		}, {
			xtype : 'nodal-buildtab',
			title : 'Build',
			border : false,
		}],
	});
	App.ui.Launcher.register('primary', 'App.ui.Canvas', {
		title : 'Primary Structure',
		editorType: 'Primary',
		iconCls : 'line',
		border : false,
		ribbonItems : [{
			xtype : 'primary-hometab',
			title : 'Home',
			border : false,
		// }, {
			// xtype : 'nodal-buildtab',
			// title : 'Build',
			// border : false,
		}],
	});
	App.ui.Launcher.register('whiteboard', 'App.ui.Canvas', {
		title : 'Whiteboard',
	});
	App.ui.Launcher.register('dashboard', 'App.ui.Dashboard', {});
	App.ui.Launcher.register('nupack/design', 'App.ui.Browser', {
		url : 'http://www.nupack.org/design',
		title : 'NUPACK Design',
		iconCls : 'nupack-icon'
	});
	App.ui.Launcher.register('nupack/analyze', 'App.ui.Browser', {
		url : 'http://www.nupack.org/partition',
		title : 'NUPACK Analysis',
		iconCls : 'nupack-icon'
	});
	App.ui.Launcher.register('nupack/utilities', 'App.ui.Browser', {
		url : 'http://www.nupack.org/utilities',
		title : 'NUPACK Util',
		iconCls : 'nupack-icon'
	});
	App.ui.Launcher.register('nupack', 'App.ui.Browser', {
		url : 'http://www.nupack.org/',
		iconCls : 'nupack-icon',
		title : 'NUPACK'
	});
	App.ui.Launcher.register('viewer', 'App.ui.Viewer', {
		editorType : 'Viewer',
		iconCls : 'document',
	});
	App.ui.Launcher.register('nupackedit', 'App.ui.NupackEditor', {});
	App.ui.Launcher.register('taskmanager', 'App.ui.TaskManager', {
		iconCls : 'system-monitor',
		title : 'Task Manager'
	});
	App.ui.Launcher.register('js', 'App.ui.TextEditor', {
		iconCls : 'js',
		editorType : 'JS',
		mode : 'javascript',
	});
	App.ui.Launcher.register('txt', 'App.ui.TextEditor', {
		iconCls : 'txt',
		editorType : 'Text',
		mode : '',
	});
	App.ui.Launcher.register('html', 'App.ui.TextEditor', {
		iconCls : 'html',
		editorType : 'HTML',
		mode : 'htmlmixed',
	});
	App.ui.Launcher.register('xml', 'App.ui.TextEditor', {
		iconCls : 'xml',
		editorType : 'XML',
		mode : 'xml',
	});
	App.ui.Launcher.register('tex', 'App.ui.TextEditor', {
		iconCls : 'tex',
		editorType : 'TeX',
		mode : 'tex',
	});
	App.ui.Launcher.register('pil', 'App.ui.TextEditor', {
		iconCls : 'pil',
		editorType : 'PIL',
		mode : 'pepper',
	});
	App.ui.Launcher.register('pepper', 'App.ui.Pepper', {
		iconCls : 'pepper',
		editorType : 'Pepper',
		mode : 'pepper',
	});
	App.ui.Launcher.register('sequence', 'App.ui.SequenceEditor', {
		iconCls : 'sequence',
		editorType : 'Sequence',
	});
	App.ui.Launcher.register('nupackresults', 'App.ui.NupackResults', {
		iconCls : 'nupack-icon',
		editorType : 'NUPACK Results',
	});
	App.ui.Launcher.register('dd', 'App.ui.DD', {
		iconCls : 'seq',
		title : 'Domain Design',
	});
	App.ui.active = function() {
		return App.ui.Launcher.getActiveApp();
	};
});
