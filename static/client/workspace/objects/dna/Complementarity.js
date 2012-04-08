////////////////////////////////////////////////////////////////////////////////////////////////

Ext.define('Workspace.objects.dna.Complementarity', {
	extend : 'Workspace.objects.Connection',
	showLabel : false,
	property : 'complementarity',
	thetaProperty: 'rotation',
	render : function() {
		this.callParent();
		// this.vectorElement.attr({
			// "arrow-end" : "classic-wide-long",
		// });
		this.set('strokeWidth',1.5);
		this.set('stroke',"#aaa");
		this.set('arrowEnd',"classic-wide-long");
	},
	strokeWidth : 1.5,
	arrowEnd:"classic-wide-long",
	stroke:"#999",
	acceptLeft : function(item) {
		return (item.getId && 
			item.isWType(['Workspace.objects.dna.OutputPort','Workspace.objects.dna.BridgePort'])
			);
	},
	acceptRight : function(item) {
		return (item.getId && 
			item.isWType(['Workspace.objects.dna.InputPort','Workspace.objects.dna.BridgePort']));
	},
	canConnect : function(left, right) {
		var lnode = left.getParent(), rnode = right.getParent();

		// make sure we're:
		// connecting output -> input
		return ((left.isWType('Workspace.objects.dna.OutputPort') && right.isWType('Workspace.objects.dna.InputPort')) ||
		 
		 // or bridge -> bridge
		 (left.isWType('Workspace.objects.dna.BridgePort') && right.isWType('Workspace.objects.dna.BridgePort'))) &&
		 
		 // AND, both nodes are part of the same motif, or global
		 ( lnode && rnode ? lnode.getParent() == rnode.getParent() : false );
	},
}, function() {
	Workspace.reg('Workspace.objects.dna.Complementarity', Workspace.objects.dna.Complementarity);
});
