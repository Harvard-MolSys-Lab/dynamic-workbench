////////////////////////////////////////////////////////////////////////////////////////////////

Ext.define('App.usr.nodal.ws.objects.Exposure', {
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
			item.isWType(['App.usr.nodal.ws.objects.OutputPort', //
			'App.usr.nodal.ws.objects.BridgePort','App.usr.nodal.ws.objects.InputPort'])  &&//
			lnode && lnode.hasParent()
			);
	},
	acceptRight : function(item) {
		var motif = item.getParent()
		return (item.getId && (
			(item.isWType(['App.usr.nodal.ws.objects.OutputPort',
					'App.usr.nodal.ws.objects.BridgePort','App.usr.nodal.ws.objects.InputPort'])  
				&& motif 
				&& motif.isWType('App.usr.nodal.ws.objects.Motif')) 
			|| item.isWType('App.usr.nodal.ws.objects.Motif'))
		);
	},
	canConnect : function(left, right) {
		var lnode = left.getParent(), motif = right.getParent();
		return ((left.hasWType(right.wtype) && lnode && motif && (lnode.getParent() == motif)) 
			|| right.isWType('App.usr.nodal.ws.objects.Motif'))
	},
}, function() {
	Workspace.reg('App.usr.nodal.ws.objects.Exposure', App.usr.nodal.ws.objects.Exposure);
	Workspace.regAlias('Workspace.objects.dna.Exposure', 'App.usr.nodal.ws.objects.Exposure');

});
