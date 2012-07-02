////////////////////////////////////////////////////////////////////////////////////////////////

// Ext.define('Workspace.objects.dna.OutputPort', {
	// extend:'Workspace.objects.Path',
	// mixins: {
		// port: 'Workspace.objects.dna.NodePort'
	// },
	// wtype: 'Workspace.objects.dna.OutputPort',
	// shape: 'circ',
	// stroke: '#33ccff',
	// strokeWidth: 2,
	// name: 'Output Port',
	// role: 'output',
	// width: 8,
	// height: 8,
	// polarity: 1,
	// rotation: 0,
	// isResizable: false,
	// preventRotate: true,
	// constructor: function() {
		// this.callParent(arguments);
		// this.mixins.port.constructor.apply(this,arguments);
		// //Workspace.objects.dna.OutputPort.superclass.constructor.apply(this,arguments);
		// this.expose('complementarity',true,true,true,false);
	// },
	// initialize: function() {
		// if(this.complementarity) {
			// this.set('complementarity', Workspace.Components.realize(this.complementarity));
		// }
		// //this.set('rotation',0)
		// this.callParent(arguments);
	// },
	// render: function() {
		// this.arguments = [this.get('x') + this.getRadiusX(), this.get('y') + this.getRadiusY(), this.getRadiusX()]; //, this.getRadiusY()];
		// Workspace.objects.Path.superclass.render.call(this);
		// this.path = this.vectorElement.attr('path');
		// this.updateDimensions();
		// this.mixins.port.render.apply(this,arguments);
	// },
	// // render: function() {
		// // this.callParent(arguments);
		// // this.mixins.port.render.apply(this,arguments);
		// // Workspace.objects.VectorObject.prototype.updateAttr.call(this,'rotation',0);
	// // },
	// updateAttr: function(attrName, value) {
		// if(attrName!='rotation') {
			// return this.callParent(arguments);
		// } else {
			// return this.callParent([attrName,0]);
		// }
	// },
// }, function() {
	// Workspace.reg('Workspace.objects.dna.OutputPort',Workspace.objects.dna.OutputPort);
// });

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
	getTransform: function() {
		return '';
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
	attributes: function(attrArray) {
		if(!attrArray) {
			attrArray = _.clone(Workspace.objects.dna.OutputPort.attrArray);
		} else {
			attrArray = _.filter(attrArray,function(attr) { return attr != 'rotation'});
		}
		return this.callParent([attrArray]);
	},
}, function() {
	Workspace.objects.dna.OutputPort.attrArray = _.filter(Workspace.objects.VectorObject.attrArray,function(attr) { return attr != 'rotation'});
	Workspace.reg('Workspace.objects.dna.OutputPort',Workspace.objects.dna.OutputPort);
});