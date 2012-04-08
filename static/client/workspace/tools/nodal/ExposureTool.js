////////////////////////////////////////////////////////////////////////////////////////////////

Ext.define('Workspace.tools.nodal.ExposureTool', {
	extend:'Workspace.tools.ConnectorTool',
	requires: ['Workspace.objects.dna.Exposure',],
	parameters: {
		"arrow-end": 'classic-wide-long',
		"stroke-dasharray": '.',
		"stroke":"#aaa",
		"stroke-width":1.5,
	},
	acceptLeft: function() {
		return Workspace.objects.dna.Exposure.prototype.acceptLeft.apply(this,arguments);
	},
	acceptRight: function() {
		return Workspace.objects.dna.Exposure.prototype.acceptRight.apply(this,arguments);
	},
	canConnect: function() {
		return Workspace.objects.dna.Exposure.prototype.canConnect.apply(this,arguments);
	},
	onConnect: function(conn,left,right) {
		
	},
	targetWType: 'Workspace.objects.dna.Exposure'
}, function() {
	Workspace.Tools.register('exposure',Workspace.tools.nodal.ExposureTool);
});

