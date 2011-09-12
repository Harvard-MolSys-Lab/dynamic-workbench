/**
 * Manages launching and running {@link App.ui.Application}s. Applications can be launched programattically by calling
 * {@link App.ui.Launcher#launch}, or simply {App.ui#launch} with a trigger. Triggers identify particular
 * applications
 * @singleton
 */
Ext.define('App.ui.Launcher', {
	singleton : true,
	/**
	 * @property {String}
	 * Delimiter to separate trigger properties
	 */
	triggerDelimiter : ':',
	_triggers : {},
	_openTabs : {},
	/**
	 * Registers a trigger with the provided {@link App.ui.Application} subclass
	 * @param {String} name Name of the trigger
	 * @param {String} className Name of the {@link App.ui.Application} subclass
	 * @param {Object} config Config options to be passed to {@link Ext#create} along with <var>className</var>
	 */
	register : function(name, className, config) {
		config || ( config = {});
		this._triggers[name] = {
			cls : className,
			config : config
		};
	},
	/**
	 * Returns the currently active {@link App.ui.Application}
	 */
	getActiveApp : function() {
		return this.tabPanel.getActiveTab();
	},
	/**
	 * Adds a tab to the main {@link #tabPanel}
	 */
	addTab : function(tab) {
		/**
		 * @property {Ext.tab.Panel} tabPanel
		 * The main tab panel which holds {@link App.ui.Application application} tabs
		 */
		if(this.tabPanel) {
			this.tabPanel.add(tab);
		}
	},
	/**
	 * Attempts to {@link #launch launch} the passed {@link App.ui.Document document} by
	 * {@link App.ui.Document#checkout attached app} or {@link App.ui.Document#trigger}, if configured.
	 */
	launchDocument : function(rec) {
		if(rec.app) {
			// TODO: more sophisticated activation logic
			this.tabPanel.setActive(rec.app);
			return rec.app;
		} else if(rec.get('trigger')) { // && App.ui.Launcher.has(rec.get('trigger'))) {
			return App.ui.Launcher.launch(rec.get('trigger'), rec);
		}
		return null;
	},
	/**
	 * Launches the passed {@link #trigger trigger} attached to the passed {@link App.ui.Document}. Generally results in
	 * opening a new {@link App.ui.Application application} in a tab within the main {@link #tabPanel tab panel}
	 *
	 */
	launch : function(trigger, doc) {
		if(!trigger || trigger == "false") {
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

				tab.on('close', function(tab) { 
					delete this._openTabs[tab.initialTrigger];
				}, this);
				Ext.log('Launched application with trigger: ' + trigger, {
					iconCls : 'application',
					silent : true
				});
				mask.hide();
				return tab;
			}
		}
	},
	/**
	 * Gets a hash of configured {@link #triggers}
	 * @return {Object} triggers
	 */
	getLaunchers : function() {
		return this._triggers;
	},
	/**
	 * Returns a bound function to launch the given trigger. Useful for attaching to the handler property of
	 * {@link Ext.button.Button}s and {@link Ext.menu.Item}s.
	 * @return {Function} launcher
	 */
	makeLauncher : function(trigger) {
		return Ext.bind(function() {
			this.launch(trigger);
		}, this);
	},
	/**
	 * Toggles collapse state of the {@link #console console}.
	 */
	toggleConsole : function() {
		this.console.toggleCollapse();
	},
	/**
	 * Expands the {@link #console console}
	 */
	showConsole : function() {
		this.console.expand();
	},
	/**
	 * Gets a {@link Ext.menu.Menu} containing a list of currently running {@link App.ui.Application applications}
	 */
	getAppMenu : function(handler) {
		if(!this.appMenu) {
			this.appMenu = Ext.create('Ext.menu.Menu',{	});
		}
		this.appMenu.removeAll();
		this.appMenu.suspendLayout = true;
		_.each(this._openTabs,function(tab,trigger) {
			this.appMenu.add({
				text: tab.title,
				iconCls: tab.iconCls || 'application',
				handler: !!handler ? _.bind(handler,tab,tab,trigger) : this.makeLauncher(trigger), 
			});
		},this)
		this.appMenu.suspendLayout = false;
		this.appMenu.doLayout();
		return this.appMenu;
	}
}, function() {
	App.ui.Launcher.register('help', 'App.ui.Help', {
	});
	App.ui.Launcher.register('nodal', 'App.ui.NodalCanvas', {
		title : 'Nodal System',
		editorType : 'Nodal',
		iconCls : 'nodal',
	});
	App.ui.Launcher.register('primary', 'App.ui.Canvas', {
		title : 'Primary Structure',
		editorType : 'Primary',
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

	});
	App.ui.Launcher.register('nupackedit', 'App.ui.NupackEditor', {});
	App.ui.Launcher.register('taskmanager', 'App.ui.TaskManager', {
		iconCls : 'system-monitor',
		title : 'Task Manager'
	});
	App.ui.Launcher.register('js', 'App.ui.JavascriptEditor', {
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

	});
	App.ui.Launcher.register('nupackresults', 'App.ui.NupackResults', {
		iconCls : 'nupack-icon',
		editorType : 'NUPACK Results',
	});
	App.ui.Launcher.register('dd', 'App.ui.DD', {
		iconCls : 'seq',
	});
	App.ui.active = function() {
		return App.ui.Launcher.getActiveApp();
	};
});
