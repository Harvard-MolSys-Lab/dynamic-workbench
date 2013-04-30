////////////////////////////////////////////////////////////////////////////////////////////////

Ext.define('App.usr.nodal.ws.objects.InputPort', {
	extend:'Workspace.objects.Path',
	mixins: {
		port: 'App.usr.nodal.ws.objects.NodePort'
	},
	constructor: function() {
		this.callParent(arguments);
		this.mixins.port.constructor.apply(this,arguments);
	},
	wtype: 'App.usr.nodal.ws.objects.InputPort',
	role: 'input',
	width: 12,
	height: 12,
	polarity: 1,
	//shape: 'triangle',
	//dtheta: 30,
	shape: 'triangle2',
	dtheta: 0,

	stroke: 'orange',
	strokeWidth: 2,
	name: 'Input Port',
	path: false,
	render: function() {
		this.arguments = [this.get('x') + this.getRadiusX(), this.get('y') + this.getRadiusY(), this.getRadiusX()]; //, this.getRadiusY()];
		Workspace.objects.Path.superclass.render.call(this);
		this.path = this.vectorElement.attr('path');
		this.updateDimensions();
		this.mixins.port.render.apply(this,arguments);
	},
}, function() {
	Workspace.reg('App.usr.nodal.ws.objects.InputPort',App.usr.nodal.ws.objects.InputPort);
	Workspace.regAlias('Workspace.objects.dna.InputPort','App.usr.nodal.ws.objects.InputPort');
});
//Ext.copyTo(App.usr.nodal.ws.objects.InputPort.prototype,Workspace.VectorPathObject.prototype,['getHighlightProxy','updateHighlightProxy','updatePath','updateDimensions','translate','setPosition',])
