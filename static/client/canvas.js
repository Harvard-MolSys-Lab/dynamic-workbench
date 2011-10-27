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

Ext.Loader.setPath('App', 'client');

Ext.require(['App.ui.Launcher', 'App.ui.Application', // hack to make sure App.ui.FilesTree.DragDropManager is require'd before App.ui.FilesTree. For some reason Sencha Builder has trouble with that one
 'App.ui.FilesTree', 'App.ui.TabPanel', 'App.ui.NupackMenu', 'App.ui.console.ScriptsPanel', 'App.ui.console.LogPanel']);

// Ext.Loader sucks
Ext.require(['App.ui.nupack.Panel']);

// Bootstrap user interface
App.ui.buildInterface = function() {

	// Initialize random Ext things
	Ext.QuickTips.init();

	// Remove the loading panel after the page is loaded
	Ext.get('loading').remove();
	Ext.get('loading_mask').fadeOut({
		remove : true
	});

	var scriptPanel = Ext.create('App.ui.console.ScriptsPanel');
	var logView = Ext.create('App.ui.console.LogPanel');
	cp = logView;
	/**
	 * @property {Ext.panel.Panel}
	 * @member App.ui.Launcher
	 */
	App.ui.Launcher.console = Ext.create('Ext.panel.Panel', {
		ref : 'console',
		iconCls : 'terminal',
		region : 'south',
		height : 200,
		split : true,
		collapsible : true,
		collapsed : true,
		collapseMode : 'mini',
		titleCollapse : true,
		title : 'Console',
		layout : 'border',
		items : [scriptPanel, logView],
		scriptPanel : scriptPanel,
		logView : logView,
		executeInContext : function() {
			this.scriptPanel.executeInContext.apply(this.scriptPanel, arguments);
		},
	});

	var cellEditing = Ext.create('Ext.grid.plugin.CellEditing', {
		clicksToEdit : 2
	});

	/**
	 * @class App.DocumentStore
	 * Manages loading documents for the currently logged-in {@link App.User}
	 * @singleton
	 */
	App.DocumentStore = Ext.create('App.DocumentTreeStore', {
		root : {
			text : App.User.home,
			id : App.User.home,
			expanded : true,
			iconCls : 'folder',
			node : App.User.home,
		},

	});

	var tree = Ext.create('App.ui.FilesTree', {
		region : 'west',
		split : true,
		width : 300,
		collapsible : true,
		autoScroll : true,
		// preventHeader: true,

	});

	var tabs = Ext.create('App.ui.TabPanel', {
		region : 'center',
		border : false,
		bodyBorder : false,
	});

	// Build canvas to fill viewport
	var viewport = new Ext.Viewport({
		layout : 'fit',
		border : false,
		items : [{
			layout : 'border',
			border : false,
			bodyBorder : false,
			tbar : {
				items : [{
					text : App.getFullTitleFormatted() + (App.isPreRelease ? '&nbsp;|&nbsp;<strong class="pre-release">Pre-release. Do not distribute</strong>' : ''),
				}, '-', {
					text : 'New',
					//handler: App.ui.Launcher.makeLauncher('nodal'),
					iconCls : 'plus',
					menu : Ext.create('App.ui.CreateMenu', {}),
				}, {
					text : 'Open',
					iconCls : 'folder-open',
					handler : function() {
						App.ui.filesTree.openSelection();
					}
				}, {
					text : 'Tools',
					iconCls : 'tools',
					menu : [{
						text : 'Console',
						iconCls : 'terminal',
						handler : App.ui.Launcher.toggleConsole,
						scope : App.ui.Launcher
					}, {
						text : 'Dashboard',
						iconCls : 'dash',
						handler : App.ui.Launcher.makeLauncher('dashboard')
					}, {
						text : 'DD',
						iconCls : 'seq',
						handler : App.ui.Launcher.makeLauncher('dd'),
					}, {
						text : 'NUPACK',
						iconCls : 'nupack-icon',
						handler : App.ui.Launcher.makeLauncher('nupack'),
						menu : Ext.create('App.ui.NupackMenu'),
					}, '-', {
						text : 'Help',
						iconCls : 'help',
						handler : App.ui.Launcher.makeLauncher('help'),
					}]
				}, '->', {
					scale : 'small',
					iconCls : 'system',
					text : 'System',
					menu : [{
						text : 'Preferences',
						iconCls : 'wrench',
						disabled : true,
					}, {
						text : 'Installed Applications',
						iconCls : 'applications',
						disabled : true,
					}, {
						text : 'Run',
						iconCls : 'run',
						disabled : true,
					}, {
						text : 'Tasks',
						iconCls : 'system',
						handler : App.ui.Launcher.makeLauncher('taskmanager'),
					}]
				}, '-', {
					scale : 'small',
					iconCls : 'user',
					text : (App.User.isLoggedIn() ? App.User.name : 'Not logged in'),
					disabled : !App.User.isLoggedIn(),
					iconAlign : 'left',
					//handler: ,
					//scope: this
				}, {
					scale : 'small',
					iconCls : 'key',
					text : 'Logout',
					disabled : !App.User.isLoggedIn(),
					iconAlign : 'left',
					handler : function() {
						window.location = "/logout";
					}
					//handler: ,
					//scope: this
				}]
			},
			items : [tree, tabs, App.ui.Launcher.console]
		}]

	});
	/**
	 * @property {App.ui.FilesTree} filesTree
	 * @member App.ui.Launcher
	 * The main files tree containing all {@link App.ui.Document documents} in the IDE
	 */
	App.ui.Launcher.filesTree = App.ui.filesTree = tree;
	/**
	 * @property {App.ui.TabPanel} tabPanel
	 * @member App.ui.Launcher
	 * The main {@link App.ui.Application application} tab panel
	 */
	App.ui.Launcher.tabPanel = tabs;

	App.ui.Launcher.launch('dashboard');
};
