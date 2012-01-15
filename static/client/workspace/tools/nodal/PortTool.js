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
		return (item.isWType('Workspace.objects.dna.Node'));
	},
	
	/**
	 * Constructs a {@link Workspace.objects.nodal.NodePort port}
	 * @param {String/Object} config String name of a port class in Workspace.objects.dna.Ports or configuration object for a Workspace.objects.nodal.NodePort. 
	 */
	buildPort: function(config) {
		config || (config = {});
		if(_.isString(config)) {
			return this.workspace.createObject(Workspace.objects.dna.Ports[config]);
		} else {
			if(!config.name) {
				
			}
			return this.workspace.createObject(config);
		}
	}
}, function() {
	Workspace.Tools.register('port', Workspace.tools.nodal.PortTool);
});
////////////////////////////////////////////////////////////////////////////////////////////////