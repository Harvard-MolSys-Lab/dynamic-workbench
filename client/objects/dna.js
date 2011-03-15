/***********************************************************************************************
 * InfoMachine
 * 
 * 
 * Copyright (c) 2010-2011 Casey Grun
 * 
 ***********************************************************************************************
 * ~/client/objects/dna.js
 * 
 * Defines {Workspace.Object} subclasses which implement elements of the nodal abstraction for
 * DNA hairpin-based reaction graph design.
 ***********************************************************************************************/
 
Ext.ns('Workspace.objects.dna');

////////////////////////////////////////////////////////////////////////////////////////////////

Workspace.objects.dna.NodePort = function() {};
Ext.apply(Workspace.objects.dna.NodePort.prototype,{
//	wtype: 'Workspace.objects.dna.NodePort',
	fill: 'white',
	strokeWidth: 3,
	isResizable: false,
});

Ext.copyTo(Workspace.objects.dna.NodePort.prototype,Workspace.VectorEllipseObject.prototype,['getRadiusX','getRadiusY','getCenterX','getCenterY']);

////////////////////////////////////////////////////////////////////////////////////////////////

Workspace.objects.dna.InputPort = Ext.extend(Workspace.VectorPathObject,{
	wtype: 'Workspace.objects.dna.InputPort',
	width: 12,
	height: 12,
	shape: 'triangle',
	stroke: 'orange',
	name: 'Input Port',
	path: false,
	render: function(){
        this.arguments = [this.get('x') + this.getRadiusX(), this.get('y') + this.getRadiusY(), this.getRadiusX()]; //, this.getRadiusY()];
		Workspace.VectorPathObject.superclass.render.call(this);
        this.path = this.vectorElement.attr('path');
        this.updateDimensions();
    },
});

App.mixin(Workspace.objects.dna.InputPort,Workspace.objects.dna.NodePort);

//Ext.copyTo(Workspace.objects.dna.InputPort.prototype,Workspace.VectorPathObject.prototype,['getHighlightProxy','updateHighlightProxy','updatePath','updateDimensions','translate','setPosition',])

Workspace.reg('Workspace.objects.dna.InputPort',Workspace.objects.dna.InputPort);

////////////////////////////////////////////////////////////////////////////////////////////////

Workspace.objects.dna.OutputPort = Ext.extend(Workspace.VectorEllipseObject,{
	wtype: 'Workspace.objects.dna.OutputPort',
	shape: 'ellipse',
	stroke: '#33ccff',
	name: 'Output Port',
	width: 8,
	height: 8,
	stroke: 'orange',
	constructor: function() {
		Workspace.objects.dna.OutputPort.superclass.constructor.apply(this,arguments);
		this.expose('complementarity',true,true,true,false);
	}
});

App.mixin(Workspace.objects.dna.OutputPort,Workspace.objects.dna.NodePort);

Workspace.reg('Workspace.objects.dna.OutputPort',Workspace.objects.dna.OutputPort);

////////////////////////////////////////////////////////////////////////////////////////////////

Workspace.objects.dna.Node = Ext.extend(Workspace.IdeaObject,{
	wtype: 'Workspace.objects.dna.Node',
	layout: 'Workspace.objects.dna.NodeLayout',
	
	motif: '0',
	name: false,
	shape: 'ellipse',
	width: 30,
	height: 30,
	strokeWidth: 3,
	autoFill: false,
	fill: '#ffffff',
	stroke: '#000000',
	theta: Math.PI,
	destroyChildren: true,
	isResizable: false,
	
	render: function(){
        this.arguments = [this.get('x') + this.getRadiusX(), this.get('y') + this.getRadiusY(), this.getRadiusX(), this.getRadiusY()];
        Workspace.VectorEllipseObject.superclass.render.call(this);
        this.layout.doFirstLayout();
        this.toBack();
   },
   
   constructor: function() {
   		this.shimConfig = {
   			cls: 'workspace-label-callout',
   			offsets: [0,-5]
   		};
   		Workspace.objects.dna.Node.superclass.constructor.apply(this,arguments);
   		
   		this.expose('motif',true,true,true,false);
   		this.expose('theta',true,true,true,false);

   		if(!this.name) {
   			this.name = Workspace.objects.dna.Node.nextName();
   		}
   }
});

Ext.copyTo(Workspace.objects.dna.Node.prototype,Workspace.VectorEllipseObject.prototype,['getRadiusX','getRadiusY','getCenterX','getCenterY','updateX','updateY','updateWidth','updateHeight']);

Workspace.objects.dna.Node.nextName = function() {
	var i = -1, s='ABCDEFGHIJKLMNOPQRSTUVWXYZ';
	return function() {
		i++;
		var r = '', n = i;
		do {
			r = r + s.charAt(n % 26);
			n -= 25;
		}
		while(n>0) 
		return r;
	};
}();

Workspace.reg('Workspace.objects.dna.Node',Workspace.objects.dna.Node);

////////////////////////////////////////////////////////////////////////////////////////////////

Workspace.objects.dna.NodeLayout = Ext.extend(Workspace.idea.BaseLayout,{
	doLayout: function() {
		var count = this.idea.children.getCount(), 
		theta = 0;//this.idea.get('theta'),
		dtheta = 2*Math.PI / count, 
		cx = this.idea.getCenterX(),
		cy = this.idea.getCenterY(), 
		rx = this.idea.getRadiusX(), 
		ry = this.idea.getRadiusY();
		this.idea.children.each(function(child) {
			// bit of a hack; 
			// TODO: Make sure doLayout isn't applied before children are rendered
			if(child.is('rendered')) {
				child.setPosition(
					parseInt(cx + Math.cos(theta) * rx - child.getWidth()) + 5, // HACK
					parseInt(cy + Math.sin(theta) * ry - child.getHeight()) + 5
				);
				theta += dtheta;
			}
		});
	},
	childrenMovable: false,
});

Workspace.Layouts.register('Workspace.objects.dna.NodeLayout',Workspace.objects.dna.NodeLayout);

////////////////////////////////////////////////////////////////////////////////////////////////

Workspace.objects.dna.Motifs = {
	'0': [],
	'1': ['init',], // initiator (2 segments)
	'2': ['init',], // initiator (3 segments)
	'3': ['input','blue'],
	'4': ['input','green','blue'], //'blue','green'],
	'5': ['input','pink'], 
	'6': ['input','pink','blue','green'], // TODO FIX ORDER
	'7': ['input','blue','purple'],
	'8': ['input','purple','green'],
	'9': ['input','purple'],
};

Workspace.objects.dna.Ports = {
	'input': {wtype: 'Workspace.objects.dna.InputPort'},
	'init': {wtype: 'Workspace.objects.dna.OutputPort', stroke:'#553300'},
	'green': {wtype: 'Workspace.objects.dna.OutputPort', stroke:'#66ff33'},
	'blue':  {wtype: 'Workspace.objects.dna.OutputPort', stroke:'#33ccff'},
	'pink':  {wtype: 'Workspace.objects.dna.OutputPort', stroke:'#ff1177'},
	'purple':  {wtype: 'Workspace.objects.dna.OutputPort', stroke:'#9900cc'},
};

Workspace.objects.dna.motifStore = (function() {
	var data = [], i=0;
	for(var m in Workspace.objects.dna.Motifs) {
		data[i] = {
			number: m,
			spec: Workspace.objects.dna.Motifs[m]
		};
		i++;
	}
	return new Ext.data.JsonStore({
		data: { root: data },
		root: 'root',
		fields: ['number','spec']
	});
})();

////////////////////////////////////////////////////////////////////////////////////////////////

Workspace.objects.dna.Complementarity = Ext.extend(Workspace.ConnectionObject,{
	showLabel: false,
	property: 'complementarity',
	acceptLeft: function(item) {
		return (item.getId && item.isWType('Workspace.objects.dna.OutputPort'));
	},
	acceptRight: function(item) {
		return (item.getId && item.isWType('Workspace.objects.dna.InputPort'));
	},
	canConnect: function() {
		return true;
	}
});

Workspace.reg('Workspace.objects.dna.Complementarity',Workspace.objects.dna.Complementarity);


