////////////////////////////////////////////////////////////////////////////////////////////////

Ext.define('App.usr.nodal.ws.objects.Complement', {
	extend : 'Workspace.objects.Connection',
	showLabel : false,
	property : 'complementarity',
	thetaProperty: 'rotation',
	dthetaProperty: 'dtheta',
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
			item.isWType(['App.usr.nodal.ws.objects.OutputPort','App.usr.nodal.ws.objects.BridgePort'])
			);
	},
	acceptRight : function(item) {
		return (item.getId && 
			item.isWType(['App.usr.nodal.ws.objects.InputPort','App.usr.nodal.ws.objects.BridgePort']));
	},
	canConnect : function(left, right) {
		var lnode = left.getParent(), rnode = right.getParent();

		// make sure we're:
		// connecting output -> input
		return ((left.isWType('App.usr.nodal.ws.objects.OutputPort') && right.isWType('App.usr.nodal.ws.objects.InputPort')) ||
		 
		 // or bridge -> bridge
		 (left.isWType('App.usr.nodal.ws.objects.BridgePort') && right.isWType('App.usr.nodal.ws.objects.BridgePort'))) &&
		 
		 // AND, both nodes are part of the same motif, or global
		 ( lnode && rnode ? lnode.getParent() == rnode.getParent() : false );
	},
}, function() {
	Workspace.reg('App.usr.nodal.ws.objects.Complement', App.usr.nodal.ws.objects.Complement);
	Workspace.regAlias('Workspace.objects.dna.Complementarity', 'App.usr.nodal.ws.objects.Complement');

});
