Ext.define('App.ui.NodalCanvas',{
	extend: 'App.ui.Canvas',
	requires: ['App.ui.nodal.HomeTab','App.ui.nodal.BuildTab','Workspace.objects.dna.Node','Workspace.objects.dna.Complementarity',
	'Workspace.tools.nodal.NodeTool','Workspace.tools.nodal.PortTool','Workspace.tools.nodal.ComplementarityTool',] 
});