////////////////////////////////////////////////////////////////////////////////////////////////

Ext.define('Workspace.objects.dna.InputPort', {
	extend:'Workspace.objects.Path',
	mixins: {
		port: 'Workspace.objects.dna.NodePort'
	},
	wtype: 'Workspace.objects.dna.InputPort',
	width: 12,
	height: 12,
	shape: 'triangle',
	stroke: 'orange',
	strokeWidth: 2,
	dtheta: 30,
	name: 'Input Port',
	path: false,
	render: function() {
		this.arguments = [this.get('x') + this.getRadiusX(), this.get('y') + this.getRadiusY(), this.getRadiusX()]; //, this.getRadiusY()];
		Workspace.objects.Path.superclass.render.call(this);
		this.path = this.vectorElement.attr('path');
		this.updateDimensions();
	},
}, function() {
	Workspace.reg('Workspace.objects.dna.InputPort',Workspace.objects.dna.InputPort);
});
//Ext.copyTo(Workspace.objects.dna.InputPort.prototype,Workspace.VectorPathObject.prototype,['getHighlightProxy','updateHighlightProxy','updatePath','updateDimensions','translate','setPosition',])