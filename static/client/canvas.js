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

Ext.Loader.setConfig({
	enabled : true,
	paths : {
		App : 'client'
	}
});

Ext.require(['App.ui.Launcher', 'App.ui.Application']);

// Bootstrap user interface
App.ui.buildInterface = function() {

	// Initialize random Ext things
	Ext.QuickTips.init();

	// Remove the loading panel after the page is loaded
	Ext.get('loading').remove();
	Ext.get('loading_mask').fadeOut({
		remove : true
	});

	var scriptPanel = new Ext.debug.ScriptsPanel();
	var logView = new Ext.debug.LogPanel();
	cp = logView;
	App.ui.Launcher.console = new Ext.Panel({
		ref : 'console',
		iconCls : 'terminal',
		region : 'south',
		height : 200,
		split : true,
		collapsible : true,
		collapsed : true,
		collapseMode : 'mini',
		titleCollapse: true,
		title : 'Console',
		layout : 'border',
		items : [scriptPanel, logView]
	});

	var cellEditing = Ext.create('Ext.grid.plugin.CellEditing', {
		clicksToEdit : 2
	});

	var tree = Ext.create('App.ui.FilesTree', {
		region : 'west',
		split : true,
		width : 300,
		collapsible : true,
		autoScroll : true,
		// preventHeader: true,

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
					text : App.getFullTitleFormatted(),
				}, '-', {
					text : 'New',
					//handler: App.ui.Launcher.makeLauncher('nodal'),
					iconCls : 'plus',
					menu : Ext.create('App.ui.CreateMenu', {}),
				}, {
					text : 'Open',
					iconCls : 'folder-open',
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
					},'-',{
						text: 'Help',
						iconCls: 'help',
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
					handler: function() {
						window.location = "/logout";
					}
					//handler: ,
					//scope: this
				}]
			},
			items : [tree, {
				xtype : 'tabpanel',
				region : 'center',
				border : false,
				bodyBorder: false,
				bodyCls : 'x-docked-noborder-top',
				items : []
			}, App.ui.Launcher.console]
		}]

	});
	App.ui.filesTree = tree;
	App.ui.Launcher.tabPanel = viewport.down('tabpanel');

	App.ui.Launcher.launch('dashboard');
};
Ext.onReady(App.ui.buildInterface);
