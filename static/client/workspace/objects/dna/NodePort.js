////////////////////////////////////////////////////////////////////////////////////////////////

Ext.define('Workspace.objects.dna.NodePort', {
	requires: ['Workspace.objects.Ellipse'],
	constructor: function() {
	},
	//	wtype: 'Workspace.objects.dna.NodePort',
	fill: '#fff',
	strokeWidth: 2,
	isResizable: false,
	preventDragSelect: true,
}, function() {
	Workspace.objects.dna.NodePort.borrow(Workspace.objects.Ellipse,['getRadiusX','getRadiusY','getCenterX','getCenterY']);
});