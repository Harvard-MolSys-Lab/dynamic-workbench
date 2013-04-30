/**
 * Allows the creation of arbitrary nodes. Generally used to allow creation of 
 * nodes of particular motifs by the {@link App.ui.MotifPallette}.
 */
Ext.define('App.usr.nodal.ws.tools.NodeTool', {
	extend:'Workspace.tools.BaseTool',
	defaultMotif: '0',
	statics: {
		
	},
	requires: ['App.usr.nodal.ws.objects.Node','App.usr.nodal.ws.tools.PortTool'],
	click: function(e,item) {
		var pos = this.getAdjustedXY(e);
		this.buildMotif(this.defaultMotif,pos.x,pos.y);
	},
	
	/**
	 * @inheritdoc App.usr.nodal.ws.objects.BuildManager#buildMotif
	 */
	buildMotif: function(spec,x,y) {
		return this.workspace.buildManager.buildMotif(spec,x,y);
	},
	/**
	 * @inheritdoc App.usr.nodal.ws.objects.BuildManager#buildPort
	 */
	buildPort: function(config) {
		return this.workspace.buildManager.buildPort(config);
	}
}, function() {
	Workspace.Tools.register('node', App.usr.nodal.ws.tools.NodeTool);
});