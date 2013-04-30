/**
 * @class App.usr.nodal.ws.tools.PortTool
 * Allows adding {@link Workspace.objects.nodal.NodePort ports} to 
 * {@link Workspace.objects.nodal.Node nodes}.
 */
Ext.define('App.usr.nodal.ws.tools.PortTool', {
	extend:'Workspace.tools.BaseTool',
	require: ['App.usr.nodal.ws.objects.OutputPort','App.usr.nodal.ws.objects.InputPort',],
	mixins: {
		highlightable: 'Workspace.tools.Highlightable'
	},
	
	click: function(e,item) {
		var pos = this.getAdjustedXY(e), port;
		if(item && this.accept(item)) {
			var name = item.nextPortName();
			if(e.altKey) {
				port = this.workspace.createObject({
					name: name,
					wtype: 'App.usr.nodal.ws.objects.OutputPort',
					x: pos.x,
					y: pos.y
				});
			} else if(e.shiftKey) {
				port = this.workspace.createObject({
					name: name,
					wtype: 'App.usr.nodal.ws.objects.BridgePort',
					x: pos.x,
					y: pos.y
				});
			} else {
				port = this.workspace.createObject({
					name: name,
					wtype: 'App.usr.nodal.ws.objects.InputPort',
					x: pos.x,
					y: pos.y
				});
			}
			item.adopt(port);
		}
	},
	accept: function(item) {
		return (item.isWType(['App.usr.nodal.ws.objects.Node','App.usr.nodal.ws.objects.Motif']));
	},
	mouseover: function(e,item) {
		this.mixins.highlightable.mouseover.apply(this,arguments);
	},
	mouseout: function(e,item) {
		this.mixins.highlightable.mouseout.apply(this,arguments);
	},
	/**
	 * @inheritdoc App.usr.nodal.ws.objects.BuildManager#buildPort
	 */
	buildPort: function(config) {
		return this.workspace.buildManager.buildPort(config);
	}
}, function() {
	Workspace.Tools.register('port', App.usr.nodal.ws.tools.PortTool);
});
////////////////////////////////////////////////////////////////////////////////////////////////