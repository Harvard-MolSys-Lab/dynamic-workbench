/**
 * Allows graphical editing of Nodal systems.
 */
Ext.define('App.ui.NodalCanvas', {
	extend : 'App.ui.Canvas',
	editorType : 'Nodal',
	iconCls : 'nodal',
	requires : ['App.ui.nodal.HomeTab', 'App.ui.nodal.BuildTab', 'App.ui.nodal.CommandTab', //
	'Workspace.objects.dna.BuildManager', 'Workspace.objects.dna.Node', 'Workspace.objects.dna.Complementarity', //
	'Workspace.tools.nodal.NodeTool', 'Workspace.tools.nodal.PortTool', 'Workspace.tools.nodal.ComplementarityTool', //
	'Workspace.tools.nodal.MotifTool', 'Workspace.tools.nodal.ExposureTool', //
	'App.ui.nodal.NodeInspector', 'App.ui.nodal.PortInspector', 'App.ui.nodal.MotifInspector', 'App.ui.MotifPalette'],
	border : false,
	mixins : {
		refHelper : 'App.ui.RefHelper',
	},
	constructor : function() {
		Ext.applyIf(this, {
			ribbonItems : [{
				xtype : 'nodal-hometab',
				title : 'Home',
				border : false,
			}, {
				xtype : 'nodal-buildtab',
				title : 'Build',
				border : false,
			}, {
				xtype : 'nodal-commandtab',
				title : 'Command',
				border : false,
			}],
		});

		this.customMotifStore = Ext.create('Ext.data.Store', {
			model : Workspace.objects.dna.motifStore.model
		});

		/**
		 * @property {App.ui.MotifPalette} palette
		 */
		this.palettes = [Ext.create('App.ui.MotifPalette', {
			ref : 'palatte',
			title : 'Standard',
		}), Ext.create('App.ui.MotifPalette', {
			ref : 'customPalatte',
			title : 'Custom',
			store : this.customMotifStore,
		})];
		/**
		 * @property {App.ui.nodal.NodeInspector} nodeInspector
		 */
		this.inspectors = [Ext.create('App.ui.nodal.NodeInspector', {
			ref : 'nodeInspector',
		}),

		/**
		 * @property {App.ui.nodal.PortInspector} portInspector
		 */
		Ext.create('App.ui.nodal.PortInspector', {
			ref : 'portInspector',
		}),
		/**
		 * @property {App.ui.nodal.MotifInspector} motifInspector
		 */
		Ext.create('App.ui.nodal.MotifInspector', {
			ref : 'motifInspector'
		})];
		
		this.bbarItems = [{
			iconCls : '',
			ref : 'buildStatusButton',
			// handler:this.showBuildStatus,
			// scope: this,
			menu : [{
				text : 'Check for errors',
				handler : this.forceRebuild,
				scope : this,
			}, {
				text : 'Show full results',
				handler : this.showLibraryTreeWindow,
				scope : this,
			}]
		}]
		this.callParent(arguments);
		this.mixins.refHelper.init.apply(this);
	},
	setupWorkspace : function() {
		if(!this.workspace.buildManager) {
			this.workspace.buildManager = this.workspace.createObject({
				wtype : 'Workspace.objects.dna.BuildManager'
			});
		}
		this.workspace.buildManager.customMotifStore = this.customMotifStore;
		this.workspace.buildManager.on('beforerebuild', this.beforeRebuild, this);
		this.workspace.buildManager.on('rebuild', this.onRebuild, this);
		this.workspace.buildManager.on('error', this.showError, this);
	},
	forceRebuild : function() {
		this.workspace.buildManager.needsRebuild();
	},
	showLibraryTreeWindow : function() {
		if(this.workspace.buildManager.lastLibrary) {
			if(!this.libraryTreeWindow) {
				this.libraryTreeWindow = Ext.create('App.ui.nodal.LibraryWindow', {
					lastLibrary : this.workspace.buildManager.lastLibrary,
					sourceDynaml : this.workspace.buildManager.lastDynaml
				})
			}
			this.libraryTreeWindow.show();
		}
	},
	makeBuildStatusTip : function() {
		if(!this.buildStatusTip) {
			this.buildStatusTip = Ext.create('Ext.tip.ToolTip', {
				target : this.buildStatusButton.getEl(),
				renderTo : Ext.getBody(),
				anchor : 'top',
				cls : 'build-tip',
			});
		}
	},
	showBuildStatus : function() {
		this.makeBuildStatusTip();
		this.buildStatusTip.show();
	},
	updateBuildStatus : function(state, buttonMsg, msg) {
		this.makeBuildStatusTip();

		this.buildStatusButton.state = state;
		var icon, cls;
		switch (state) {
			case 'done':
				cls = 'build-done-tip';
				icon = 'tick';
				break;
			case 'building':
				cls = 'build-building-tip';
				icon = 'progress';
				break;
			case 'error':
				cls = 'build-error-tip';
				icon = 'error';
				break;
		}
		this.buildStatusButton.setIconCls(icon);
		this.buildStatusButton.setText(buttonMsg);
		this.buildStatusTip.removeCls('build-done-tip').removeCls('build-building-tip').removeCls('build-error-tip').addCls(cls);
		this.buildStatusTip.update(msg);
	},
	beforeRebuild : function() {
		this.updateBuildStatus('building', 'Building system', 'Building system to check for errors...');
	},
	onRebuild : function() {
		this.updateBuildStatus('done', 'Build completed', 'Build completed successfully.');
		if(this.libraryTreeWindow) {
			this.libraryTreeWindow.setLibrary(this.workspace.buildManager.lastLibrary, this.workspace.buildManager.lastDynaml);
		}
	},
	showError : function(msg, e) {
		this.updateBuildStatus('error', 'Errors', msg);
	},
}, function() {
	Workspace.DDManager.addHandler('ext/motif', function(data, e) {
		var pos = this.getAdjustedXY(e), tool;
		tool = this.workspace.activeTool;
		this.workspace.setActiveTool('node');
		this.workspace.getActiveTool().buildMotif(data.draggedRecord.get('spec'), pos.x, pos.y);
		this.workspace.setActiveTool(tool);
	});
});
