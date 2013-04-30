/**
 * Allows graphical editing of Nodal systems.
 */
Ext.define('App.usr.nodal.Canvas', {
	extend : 'App.usr.canvas.Canvas',
	editorType : 'Nodal',
	title: 'Nodal',
	iconCls : 'nodal',
	requires : ['App.usr.nodal.HomeTab', 'App.usr.nodal.BuildTab', 'App.usr.nodal.CommandTab', 'App.usr.canvas.FillStrokeTab', //
	'App.usr.nodal.ws.objects.BuildManager', 'App.usr.nodal.ws.objects.Node', 'App.usr.nodal.ws.objects.Complement', //
	'App.usr.nodal.ws.tools.NodeTool', 'App.usr.nodal.ws.tools.PortTool', 'App.usr.nodal.ws.tools.ComplementarityTool', //
	'App.usr.nodal.ws.tools.MotifTool', 'App.usr.nodal.ws.tools.ExposureTool', //
	'App.usr.nodal.NodeInspector', 'App.usr.nodal.PortInspector', 'App.usr.nodal.MotifInspector', 'App.usr.nodal.MotifPalette',
	'App.usr.nodal.LibraryWindow'],
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
				xtype : 'fillstroketab',
				title : 'Style',
				border : false,
			}, {
				xtype : 'nodal-commandtab',
				title : 'Command',
				border : false,
			}],
		});

		// this.customMotifStore = Ext.create('Ext.data.Store', {
		// 	model : App.usr.nodal.ws.objects.motifStore.model,
		// 	loadFromArray: function (array) {
		// 		for(var m in array) {
		// 			data[i] = {
		// 				number: m, //parseInt(m),
		// 				spec: array[m]
		// 			};
		// 			i++;
		// 		}
		// 	}
		// });
		this.customMotifStore = Ext.create('App.usr.nodal.ws.objects.MotifStore');
		this.motifStore = Ext.create('App.usr.nodal.ws.objects.MotifStore');
		
		/**
		 * @property {App.usr.nodal.MotifPalette} palette
		 */
		this.palettes = [Ext.create('App.usr.nodal.MotifPalette', {
			ref : 'palatte',
			title : 'Standard',
			store: this.motifStore,
		}), Ext.create('App.usr.nodal.MotifPalette', {
			ref : 'customPalatte',
			title : 'Custom',
			store : this.customMotifStore,
		})];
		/**
		 * @property {App.usr.nodal.NodeInspector} nodeInspector
		 */
		this.inspectors = [Ext.create('App.usr.nodal.NodeInspector', {
			ref : 'nodeInspector',
		}),

		/**
		 * @property {App.usr.nodal.PortInspector} portInspector
		 */
		Ext.create('App.usr.nodal.PortInspector', {
			ref : 'portInspector',
		}),
		/**
		 * @property {App.usr.nodal.MotifInspector} motifInspector
		 */
		Ext.create('App.usr.nodal.MotifInspector', {
			ref : 'motifInspector'
		})];
		
		this.bbarItems = [{
			iconCls : '',
			ref : 'buildStatusButton',
			text: 'Waiting for input...',
			iconCls: 'progress',
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
	/**
	 * Assign the workspace the version associated with the current version of the Compiler standard library.
	 */
	createBlankWorkspace: function () {
		return {version: App.dynamic.Compiler.standardMotifsCurrentVersion};
	},
	setupWorkspace : function() {
		if(!this.workspace.buildManager) {
			this.workspace.buildManager = this.workspace.createObject({
				wtype : 'App.usr.nodal.ws.objects.BuildManager'
			});
		}
		this.workspace.buildManager.customMotifStore = this.customMotifStore;

		// Check the {@link Workspace#version standard motif library version}, and load the 
		// appropriate motifs into the #motifStore 
		if(this.workspace.version != App.dynamic.Compiler.standardMotifsCurrentVersion) {
			if(!('version' in this.workspace)) {
				this.workspace.version = 0;
			}
			this.motifStore.loadFromHash(App.usr.nodal.ws.objects.MotifLibraries[this.workspace.version]);
		} else {
			this.motifStore.loadFromHash(App.usr.nodal.ws.objects.Motifs); 
		}

		/**
		 * @property {Number} version 
		 * Tracks which version of the {@link App.dynamic.Compiler.standardMotifsVersions standard motif library} 
		 * the workspace uses. This affects which motifs appear in the #palette and from where motifs in the compiled
		 * library are fetched. 
		 * @member  Workspace
		 */

		this.workspace.expose('version',true,true,true);

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
				this.libraryTreeWindow = Ext.create('App.usr.nodal.LibraryWindow', {
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
				dismissDelay: 0
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
