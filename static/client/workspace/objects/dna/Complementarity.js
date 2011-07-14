////////////////////////////////////////////////////////////////////////////////////////////////

Ext.define('Workspace.objects.dna.Complementarity', {
	extend:'Workspace.objects.Connection',
	showLabel: false,
	property: 'complementarity',
	acceptLeft: function(item) {
		return (item.getId && (item.isWType('Workspace.objects.dna.OutputPort') || item.isWType('Workspace.objects.dna.BridgePort')));
	},
	acceptRight: function(item) {
		return (item.getId && (item.isWType('Workspace.objects.dna.InputPort')|| item.isWType('Workspace.objects.dna.BridgePort')));
	},
	canConnect: function(left,right) {
		return (left.isWType('Workspace.objects.dna.OutputPort') && right.isWType('Workspace.objects.dna.InputPort')) || (left.isWType('Workspace.objects.dna.BridgePort') && right.isWType('Workspace.objects.dna.BridgePort'));
	},
}, function() {
	Workspace.reg('Workspace.objects.dna.Complementarity',Workspace.objects.dna.Complementarity);
});