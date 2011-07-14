Ext.define('Workspace.tools.nodal.NodeTool', {
	extend:'Workspace.tools.BaseTool',
	defaultMotif: '0',
	requires: ['Workspace.objects.dna.Node','Workspace.tools.nodal.PortTool'],
	click: function(e,item) {
		var pos = this.getAdjustedXY(e);
		this.buildMotif(this.defaultMotif,pos.x,pos.y);
	},
	buildMotif: function(name,x,y) {
		var spec = Workspace.objects.dna.Motifs[name], node;
		if(spec) {
			node = this.workspace.createObject({
				wtype: 'Workspace.objects.dna.Node',
				x: x,
				y: y,
				motif: name
			});
			for(var i=0; i<spec.length; i++) {
				node.adopt(this.buildPort(spec[i]));
			}
		}
		return node;
	},
	buildPort: function() {
		return Workspace.tools.nodal.PortTool.prototype.buildPort.apply(this,arguments);
	}
}, function() {
	Workspace.Tools.register('node', Workspace.tools.nodal.NodeTool);
});