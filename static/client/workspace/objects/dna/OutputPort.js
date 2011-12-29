////////////////////////////////////////////////////////////////////////////////////////////////

Ext.define('Workspace.objects.dna.OutputPort', {
	extend: 'Workspace.objects.Ellipse',
	mixins: {
		port: 'Workspace.objects.dna.NodePort'
	},
	wtype: 'Workspace.objects.dna.OutputPort',
	shape: 'ellipse',
	stroke: '#33ccff',
	strokeWidth: 2,
	name: 'Output Port',
	width: 8,
	height: 8,
	polarity: 1,
	isResizable: false,
	constructor: function() {
		this.callParent(arguments);
		//Workspace.objects.dna.OutputPort.superclass.constructor.apply(this,arguments);
		this.expose('complementarity',true,true,true,false);
	},
	initialize: function() {
		if(this.complementarity) {
			this.set('complementarity', Workspace.Components.realize(this.complementarity));
		}
		this.callParent(arguments);
	},
}, function() {
	Workspace.reg('Workspace.objects.dna.OutputPort',Workspace.objects.dna.OutputPort);
});