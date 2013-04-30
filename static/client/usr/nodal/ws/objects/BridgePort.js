/**
 * Represents a single Bridge port on a {@link App.usr.nodal.ws.objects.Node Node}.
 */
Ext.define('App.usr.nodal.ws.objects.BridgePort', {
	extend:'Workspace.objects.Rectangle',
	mixins: {
		port: 'App.usr.nodal.ws.objects.NodePort'
	},
	wtype: 'App.usr.nodal.ws.objects.BridgePort',
	width: 8,
	height: 8,
	polarity: 1,
	shape: 'square',
	stroke: 'purple',
	strokeWidth: 2,
	name: 'Bridge Port',
	role: 'bridge',
	isResizable: false,

	path: false,
	constructor: function() {
		App.usr.nodal.ws.objects.BridgePort.superclass.constructor.apply(this,arguments);
		this.mixins.port.constructor.apply(this,arguments);
		this.expose('complementarity',true,true,true,false);
	},
	render: function() {
		this.arguments = [this.get('x') + this.getRadiusX(), this.get('y') + this.getRadiusY(), this.getRadiusX()]; //, this.getRadiusY()];
		Workspace.objects.Rectangle.superclass.render.call(this);
		this.mixins.port.render.apply(this,arguments);
		//		this.path = this.vectorElement.attr('path');
		//		this.updateDimensions();
	},
	initialize: function() {
		if(this.complementarity) {
			this.set('complementarity', Workspace.Components.realize(this.complementarity));
		}
		this.callParent(arguments);
	},
}, function() {
	Workspace.reg('App.usr.nodal.ws.objects.BridgePort',App.usr.nodal.ws.objects.BridgePort);
	Workspace.regAlias('Workspace.objects.dna.BridgePort','App.usr.nodal.ws.objects.BridgePort');
});