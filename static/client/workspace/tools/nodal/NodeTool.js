/**
 * Allows the creation of arbitrary nodes. Generally used to allow creation of 
 * nodes of particular motifs by the {@link App.ui.MotifPallette}.
 */
Ext.define('Workspace.tools.nodal.NodeTool', {
	extend:'Workspace.tools.BaseTool',
	defaultMotif: '0',
	statics: {
		
	},
	requires: ['Workspace.objects.dna.Node','Workspace.tools.nodal.PortTool'],
	click: function(e,item) {
		var pos = this.getAdjustedXY(e);
		this.buildMotif(this.defaultMotif,pos.x,pos.y);
	},
	
	/**
	 * @inheritdoc Workspace.objects.dna.BuildManager#buildMotif
	 */
	buildMotif: function(name,x,y) {
		return this.workspace.buildManager.buildMotif(name,x,y);
	},
	/**
	 * @inheritdoc Workspace.objects.dna.BuildManager#buildPort
	 */
	buildPort: function(config) {
		return this.workspace.buildManager.buildPort(config);
	}
}, function() {
	Workspace.Tools.register('node', Workspace.tools.nodal.NodeTool);
});