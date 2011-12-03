////////////////////////////////////////////////////////////////////////////////////////////////

Ext.define('Workspace.tools.nodal.ComplementarityTool', {
	extend:'Workspace.tools.ConnectorTool',
	require: ['Workspace.objects.dna.Complementarity',],
	parameters: {
		"arrow-end": 'classic-wide-long',
		"stroke-dasharray": '.',
		"stroke":"#aaa",
		"stroke-width":1.5,
	},
	acceptLeft: function() {
		return Workspace.objects.dna.Complementarity.prototype.acceptLeft.apply(this,arguments);
	},
	acceptRight: function() {
		return Workspace.objects.dna.Complementarity.prototype.acceptRight.apply(this,arguments);
	},
	canConnect: function() {
		return Workspace.objects.dna.Complementarity.prototype.canConnect.apply(this,arguments);
	},
	onConnect: function(conn,left,right) {
		if(left.isWType('Workspace.objects.dna.BridgePort') && right.isWType('Workspace.objects.dna.BridgePort')) {
			conn.setBoth = true;
			conn.updateProperty();
		}
	},
	targetWType: 'Workspace.objects.dna.Complementarity'
}, function() {
	Workspace.Tools.register('complementarity',Workspace.tools.nodal.ComplementarityTool);
});

