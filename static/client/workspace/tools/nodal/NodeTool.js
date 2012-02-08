/**
 * Allows the creation of arbitrary nodes. Generally used to allow creation of 
 * nodes of particular motifs by the {@link App.ui.MotifPallette}.
 */
Ext.define('Workspace.tools.nodal.NodeTool', {
	extend:'Workspace.tools.BaseTool',
	defaultMotif: '0',
	requires: ['Workspace.objects.dna.Node','Workspace.tools.nodal.PortTool'],
	click: function(e,item) {
		var pos = this.getAdjustedXY(e);
		this.buildMotif(this.defaultMotif,pos.x,pos.y);
	},
	/**
	 * Builds a node of the given motif type at the provided coordinates
	 * @param {String} type The name of the motif in Workspace.objects.dna.Motifs
	 * @param {Number} x
	 * @param {Number} y
	 * @returns {Workspace.objects.dna.Node} node
	 */
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
				var cfg = _.deepClone(spec[i]);
				if(_.isObject(cfg)) {
					cfg.name = 'p'+(i+1);
					cfg.wtype = Workspace.objects.dna.PortClasses[cfg.role];
					cfg.stroke = App.dynamic.Compiler.getColor(cfg);
				}
				node.adopt(this.buildPort(cfg));
			}
		}
		return node;
	},
	/**
	 * @inheritdoc Workspace.tools.nodal.PortTool#buildPort
	 */
	buildPort: function() {
		return Workspace.tools.nodal.PortTool.prototype.buildPort.apply(this,arguments);
	}
}, function() {
	Workspace.Tools.register('node', Workspace.tools.nodal.NodeTool);
});