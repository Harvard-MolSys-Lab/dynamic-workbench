////////////////////////////////////////////////////////////////////////////////////////////////

Ext.define('Workspace.objects.dna.NodePort', {
	requires: ['Workspace.objects.Ellipse','Workspace.ConnectionLabel'],
	constructor: function() {
	},
	//	wtype: 'Workspace.objects.dna.NodePort',
	fill: '#fff',
	strokeWidth: 2,
	isResizable: false,
	preventDragSelect: true,
	render: function() {
		this.addShim(Ext.create('Workspace.ConnectionLabel',{
			cls: 'workspace-label-plain-small',
			offsets: [0,5],
			property: 'polarity',
			editable: false
		}));
	}
}, function() {
	Workspace.objects.dna.NodePort.borrow(Workspace.objects.Ellipse,['getRadiusX','getRadiusY','getCenterX','getCenterY']);
});