////////////////////////////////////////////////////////////////////////////////////////////////

Ext.define('Workspace.objects.secondary.Complementarity', {
	extend : 'Workspace.objects.Connection',
	showLabel : false,
	property : 'complementarity',
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
		return (item.getId && item.isWType('Workspace.objects.secondary.Domain'));
	},
	acceptRight : function(item) {
		return (item.getId && item.isWType('Workspace.objects.secondary.Domain'));
	},
	canConnect : function(left, right) {
		return true;
	},
	onConnect: function(left, right) {
		this.workspace.complementarityManager.makeComplementary(left,right);
	},
}, function() {
	Workspace.reg('Workspace.objects.secondary.Complementarity', Workspace.objects.secondary.Complementarity);
});
