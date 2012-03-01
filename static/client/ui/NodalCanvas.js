/**
 * Allows graphical editing of Nodal systems.
 */
Ext.define('App.ui.NodalCanvas',{
	extend: 'App.ui.Canvas',
	editorType: 'Nodal',
	iconCls: 'nodal',
	requires: ['App.ui.nodal.HomeTab','App.ui.nodal.BuildTab','Workspace.objects.dna.BuildManager','Workspace.objects.dna.Node','Workspace.objects.dna.Complementarity',
	'Workspace.tools.nodal.NodeTool','Workspace.tools.nodal.PortTool','Workspace.tools.nodal.ComplementarityTool',
	'App.ui.nodal.NodeInspector','App.ui.nodal.PortInspector','App.ui.MotifPalette'],
	border : false,

	constructor: function() {
		Ext.applyIf(this,{
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
		/**
		 * @property {App.ui.MotifPalette} palette
		 */
		this.palettes = [Ext.create('App.ui.MotifPalette',{
				ref: 'palatte',
				title: 'Motifs',
		})];
		/**
		 * @property {App.ui.nodal.NodeInspector} nodeInspector
		 */
		this.inspectors = [Ext.create('App.ui.nodal.NodeInspector',{
			ref :'nodeInspector',
		}),
		/**
		 * @property {App.ui.nodal.PortInspector} portInspector
		 */
		Ext.create('App.ui.nodal.PortInspector',{
			ref :'portInspector',
		})];
		this.callParent(arguments);
	},
	setupWorkspace: function() {
		if(!this.workspace.buildManager) {
			this.workspace.buildManager = this.workspace.createObject({wtype:'Workspace.objects.dna.BuildManager'});
		}
	}
},function() {
	Workspace.DDManager.addHandler('ext/motif', function(data,e) {
		var pos = this.getAdjustedXY(e), tool;
		tool = this.workspace.activeTool;
		this.workspace.setActiveTool('node');
		this.workspace.getActiveTool().buildMotif(data.draggedRecord.get('number'),pos.x,pos.y);
		this.workspace.setActiveTool(tool);
	});
});