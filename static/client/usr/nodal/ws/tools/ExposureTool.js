////////////////////////////////////////////////////////////////////////////////////////////////

Ext.define('App.usr.nodal.ws.tools.ExposureTool', {
	extend:'Workspace.tools.ConnectorTool',
	requires: ['App.usr.nodal.ws.objects.Exposure',],
	parameters: {
		"arrow-end": 'classic-wide-long',
		"stroke-dasharray": '.',
		"stroke":"#aaa",
		"stroke-width":1.5,
	},
	acceptLeft: function() {
		return App.usr.nodal.ws.objects.Exposure.prototype.acceptLeft.apply(this,arguments);
	},
	acceptRight: function() {
		return App.usr.nodal.ws.objects.Exposure.prototype.acceptRight.apply(this,arguments);
	},
	canConnect: function() {
		return App.usr.nodal.ws.objects.Exposure.prototype.canConnect.apply(this,arguments);
	},
	beforeConnect: function(left,right) {
		
		// If we dragged directly to a motif
		if(right.hasWType('App.usr.nodal.ws.objects.Motif')) {
			
			// Make a new port object
			var port = this.workspace.buildManager.buildPort({
				wtype: left.get('wtype'),
			});
			
			// Add port to motif
			right.adopt(port);
			
			// Expose
			this.rightObject = port;
		}
	},
	targetWType: 'App.usr.nodal.ws.objects.Exposure'
}, function() {
	Workspace.Tools.register('exposure',App.usr.nodal.ws.tools.ExposureTool);
});

