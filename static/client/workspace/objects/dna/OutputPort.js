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
	role: 'output',
	width: 8,
	height: 8,
	polarity: 1,
	rotation: 0,
	isResizable: false,
	preventRotate: true,
	constructor: function() {
		this.callParent(arguments);
		this.mixins.port.constructor.apply(this,arguments);
		//Workspace.objects.dna.OutputPort.superclass.constructor.apply(this,arguments);
		this.expose('complementarity',true,true,true,false);
	},
	initialize: function() {
		if(this.complementarity) {
			this.set('complementarity', Workspace.Components.realize(this.complementarity));
		}
		//this.set('rotation',0)
		this.callParent(arguments);
	},
	render: function() {
		this.callParent(arguments);
		this.mixins.port.render.apply(this,arguments);
		Workspace.objects.VectorObject.prototype.updateAttr.call(this,'rotation',0);
	},
	updateAttr: function(attrName, value) {
		if(attrName!='rotation') {
			return this.callParent(arguments);
		} else {
			return this.callParent([attrName,0]);
		}
	},
}, function() {
	Workspace.reg('Workspace.objects.dna.OutputPort',Workspace.objects.dna.OutputPort);
});