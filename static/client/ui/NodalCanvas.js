Ext.define('App.ui.NodalCanvas',{
	extend: 'App.ui.Canvas',
	editorType: 'Nodal',
	iconCls: 'nodal',
	requires: ['App.ui.nodal.HomeTab','App.ui.nodal.BuildTab','Workspace.objects.dna.Node','Workspace.objects.dna.Complementarity',
	'Workspace.tools.nodal.NodeTool','Workspace.tools.nodal.PortTool','Workspace.tools.nodal.ComplementarityTool',
	'App.ui.nodal.NodeInspector',],
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
		this.palettes = [Ext.create('App.ui.MotifPalette',{
				ref: 'palatte',
				title: 'Motifs',
		})];
		this.inspectors = [Ext.create('App.ui.nodal.NodeInspector')];
		this.callParent(arguments);
	} 
});