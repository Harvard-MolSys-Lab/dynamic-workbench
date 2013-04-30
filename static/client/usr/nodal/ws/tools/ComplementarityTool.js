////////////////////////////////////////////////////////////////////////////////////////////////

Ext.define('App.usr.nodal.ws.tools.ComplementarityTool', {
	extend:'Workspace.tools.ConnectorTool',
	requires: ['App.usr.nodal.ws.objects.Complement',],
	parameters: {
		"arrow-end": 'classic-wide-long',
		"stroke-dasharray": '.',
		"stroke":"#aaa",
		"stroke-width":1.5,
	},
	acceptLeft: function() {
		return App.usr.nodal.ws.objects.Complement.prototype.acceptLeft.apply(this,arguments);
	},
	acceptRight: function() {
		return App.usr.nodal.ws.objects.Complement.prototype.acceptRight.apply(this,arguments);
	},
	canConnect: function() {
		return App.usr.nodal.ws.objects.Complement.prototype.canConnect.apply(this,arguments);
	},
	onConnect: function(conn,left,right) {
		if(left.isWType('App.usr.nodal.ws.objects.BridgePort') && right.isWType('App.usr.nodal.ws.objects.BridgePort')) {
			conn.setBoth = true;
			conn.updateProperty();
		}
	},
	targetWType: 'App.usr.nodal.ws.objects.Complement'
}, function() {
	Workspace.Tools.register('complementarity',App.usr.nodal.ws.tools.ComplementarityTool);
});

