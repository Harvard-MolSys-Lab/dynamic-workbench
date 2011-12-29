////////////////////////////////////////////////////////////////////////////////////////////////

Ext.define('Workspace.objects.dna.BridgePort', {
	extend:'Workspace.objects.Rectangle',
	mixins: {
		port: 'Workspace.objects.dna.NodePort'
	},
	wtype: 'Workspace.objects.dna.BridgePort',
	width: 8,
	height: 8,
	polarity: 1,
	shape: 'square',
	stroke: 'purple',
	strokeWidth: 2,
	name: 'Bridge Port',
	isResizable: false,

	path: false,
	constructor: function() {
		Workspace.objects.dna.BridgePort.superclass.constructor.apply(this,arguments);
		this.expose('complementarity',true,true,true,false);
	},
	render: function() {
		this.arguments = [this.get('x') + this.getRadiusX(), this.get('y') + this.getRadiusY(), this.getRadiusX()]; //, this.getRadiusY()];
		Workspace.objects.Rectangle.superclass.render.call(this);
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
	Workspace.reg('Workspace.objects.dna.BridgePort',Workspace.objects.dna.BridgePort);
});