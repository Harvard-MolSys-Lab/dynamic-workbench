Ext.define('App.ui.SecondaryCanvas',{
	extend: 'App.ui.Canvas',
	editorType: 'Secondary',
	iconCls: 'nodal',
	requires: ['App.ui.secondary.HomeTab','Workspace.objects.secondary.ComplementarityManager','Workspace.tools.secondary.StrandTool'],
	border : false,

	constructor: function() {
		Ext.applyIf(this,{
			ribbonItems : [{
				xtype : 'secondary-hometab',
				title : 'Home',
				border : false,
			},],
		});
		// this.palettes = [Ext.create('App.ui.MotifPalette',{
				// ref: 'palatte',
				// title: 'Motifs',
		// })];
		// this.inspectors = [Ext.create('App.ui.nodal.NodeInspector')];
		this.callParent(arguments);
	},
	setupWorkspace: function() {
		if(!this.workspace.complementarityManager) {
			this.workspace.complementarityManager = this.workspace.createObject({wtype:'Workspace.objects.secondary.ComplementarityManager'});
		}
	}
});