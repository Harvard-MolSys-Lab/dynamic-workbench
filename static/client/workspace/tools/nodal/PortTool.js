/**
 * @class Workspace.tools.nodal.PortTool
 * Allows adding {@link Workspace.objects.nodal.NodePort ports} to 
 * {@link Workspace.objects.nodal.Node nodes}.
 */
Ext.define('Workspace.tools.nodal.PortTool', {
	extend:'Workspace.tools.BaseTool',
	require: ['Workspace.objects.dna.OutputPort','Workspace.objects.dna.InputPort',],
	mixins: {
		highlightable: 'Workspace.tools.Highlightable'
	},
	
	click: function(e,item) {
		var pos = this.getAdjustedXY(e), port;
		if(item && this.accept(item)) {
			if(e.altKey) {
				port = this.workspace.createObject({
					wtype: 'Workspace.objects.dna.OutputPort',
					x: pos.x,
					y: pos.y
				});
			} else {
				port = this.workspace.createObject({
					wtype: 'Workspace.objects.dna.InputPort',
					x: pos.x,
					y: pos.y
				});
			}
			item.adopt(port);
		}
	},
	accept: function(item) {
		return (item.isWType(['Workspace.objects.dna.Node','Workspace.objects.dna.Motif']));
	},
	mouseover: function(e,item) {
		this.mixins.highlightable.mouseover.apply(this,arguments);
	},
	mouseout: function(e,item) {
		this.mixins.highlightable.mouseout.apply(this,arguments);
	},
	/**
	 * @inheritdoc Workspace.objects.dna.BuildManager#buildPort
	 */
	buildPort: function(config) {
		return this.workspace.buildManager.buildPort(config);
	}
}, function() {
	Workspace.Tools.register('port', Workspace.tools.nodal.PortTool);
});
////////////////////////////////////////////////////////////////////////////////////////////////