////////////////////////////////////////////////////////////////////////////////////////////////

Ext.define('Workspace.tools.secondary.ComplementarityTool', {
	extend:'Workspace.tools.ConnectorTool',
	requires: ['Workspace.objects.secondary.Complementarity',],
	parameters: {
		"arrow-end": 'classic-wide-long',
		"stroke-dasharray": '.',
		"stroke":"#aaa",
		"stroke-width":1.5,
	},
	acceptLeft: function() {
		return Workspace.objects.secondary.Complementarity.prototype.acceptLeft.apply(this,arguments);
	},
	acceptRight: function() {
		return Workspace.objects.secondary.Complementarity.prototype.acceptRight.apply(this,arguments);
	},
	canConnect: function() {
		return Workspace.objects.secondary.Complementarity.prototype.canConnect.apply(this,arguments);
	},
	onConnect: function(conn,left,right) {
		if(conn.onConnect) { 
			conn.onConnect(left,right);
		} 
	},
	targetWType: 'Workspace.objects.secondary.Complementarity'
}, function() {
	Workspace.Tools.register('domain_complement',Workspace.tools.secondary.ComplementarityTool);
});

