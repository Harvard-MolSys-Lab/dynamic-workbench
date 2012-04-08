////////////////////////////////////////////////////////////////////////////////////////////////

Ext.define('Workspace.objects.dna.Exposure', {
	extend : 'Workspace.objects.Connection',
	showLabel : false,
	property : 'exposure',
	render : function() {
		this.callParent();
		// this.vectorElement.attr({
			// "arrow-end" : "classic-wide-long",
		// });
		this.set('strokeWidth',1.5);
		this.set('stroke',"#aaa");
		this.set('strokeDashArray','- ');
		this.set('arrowEnd',"classic-wide-long");
	},
	strokeWidth : 1.5,
	arrowEnd:"classic-wide-long",
	stroke:"#999",
	acceptLeft : function(item) {
		var lnode = item.getParent()
		return (item.getId && 
			item.isWType(['Workspace.objects.dna.OutputPort', //
			'Workspace.objects.dna.BridgePort','Workspace.objects.dna.InputPort'])  &&//
			lnode && lnode.hasParent()
			);
	},
	acceptRight : function(item) {
		var motif = item.getParent()
		return (item.getId && 
			item.isWType(['Workspace.objects.dna.OutputPort', //
			'Workspace.objects.dna.BridgePort','Workspace.objects.dna.InputPort'])  &&//
			motif && motif.isWType('Workspace.objects.dna.Motif')
			);
	},
	canConnect : function(left, right) {
		var lnode = left.getParent(), motif = right.getParent();
		return left.hasWType(right.wtype) && lnode && motif && (lnode.getParent() == motif)
	},
}, function() {
	Workspace.reg('Workspace.objects.dna.Exposure', Workspace.objects.dna.Exposure);
});
