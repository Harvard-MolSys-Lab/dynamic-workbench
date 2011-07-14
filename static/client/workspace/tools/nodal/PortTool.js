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
		return (item.isWType('Workspace.objects.dna.Node'));
	},
	buildPort: function(name) {
		return this.workspace.createObject(Workspace.objects.dna.Ports[name]);
	}
}, function() {
	Workspace.Tools.register('port', Workspace.tools.nodal.PortTool);
});
////////////////////////////////////////////////////////////////////////////////////////////////