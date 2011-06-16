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

Ext.define('Workspace.objects.dna.NodePort', {
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
	isResizable: false,
	constructor: function() {
		Workspace.objects.dna.OutputPort.superclass.constructor.apply(this,arguments);
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
////////////////////////////////////////////////////////////////////////////////////////////////

Ext.define('Workspace.objects.dna.BridgePort', {
	extend:'Workspace.objects.Rectangle',
	mixins: {
		port: 'Workspace.objects.dna.NodePort'
	},
	wtype: 'Workspace.objects.dna.BridgePort',
	width: 8,
	height: 8,
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
////////////////////////////////////////////////////////////////////////////////////////////////

Ext.define('Workspace.objects.dna.Node', {
	extend: 'Workspace.objects.IdeaObject',
	wtype: 'Workspace.objects.dna.Node',
	layout: 'Workspace.objects.dna.NodeLayout',
	statics: {
		nextName: function() {
			var i = -1, s='ABCDEFGHIJKLMNOPQRSTUVWXYZ';
			return function() {
				i++;
				var r = '', n = i;
				do {
					r = r + s.charAt(n % 26);
					n -= 25;
				} while(n>0)
				return r;
			};
		}()
	},
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

	render: function() {
		this.arguments = [this.get('x') + this.getRadiusX(), this.get('y') + this.getRadiusY(), this.getRadiusX(), this.getRadiusY()];
		Workspace.objects.Ellipse.superclass.render.call(this);
		this.layout.doFirstLayout();
		this.toBack();
		this.addShim(new Workspace.Label({
			cls: 'workspace-label-plain',
			offsets: [11,26],
			property: 'motif',
			editable: false
		}));

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
		this.on('change:theta', function() {
			this.layout.doLayout();
		},this);
	},
	addChild: function() {
		this.callParent(arguments);
		this.layout.doLayout();
	}
}, function() {
	Workspace.objects.dna.Node.borrow(Workspace.objects.Ellipse,['getRadiusX','getRadiusY','getCenterX','getCenterY','updateX','updateY','updateWidth','updateHeight']);
	Workspace.reg('Workspace.objects.dna.Node',Workspace.objects.dna.Node);

});
////////////////////////////////////////////////////////////////////////////////////////////////

Ext.define('Workspace.objects.dna.NodeLayout', {
	extend:'Workspace.idea.BaseLayout',
	doLayout: function() {
		if(!this.ignore) {
			var count = this.idea.children.getCount(),
			theta = this.idea.get('theta'),
			dtheta = 2*Math.PI / count,
			cx = this.idea.getCenterX(),
			cy = this.idea.getCenterY(),
			rx = this.idea.getRadiusX(),
			ry = this.idea.getRadiusY();
			this.ignore = true;
			this.idea.children.each( function(child) {
				// bit of a hack;
				// TODO: Make sure doLayout isn't applied before children are rendered
				if(child.is('rendered')) {
					child.setPosition(
					parseInt(cx + Math.cos(theta) * rx - child.getWidth()) + this.paddingTop, // HACK
					parseInt(cy + Math.sin(theta) * ry - child.getHeight()) + this.paddingLeft
					);
					child.set('rotation',Raphael.deg(theta));
					theta = (theta + dtheta) % (2 * Math.PI);
				}
			},this);
			this.ignore = false;
		}
	},
	childrenMovable: false,
	paddingTop: 5,
	paddingLeft: 5,
}, function() {
	Workspace.Layouts.register('Workspace.objects.dna.NodeLayout',Workspace.objects.dna.NodeLayout);
});
////////////////////////////////////////////////////////////////////////////////////////////////

Workspace.objects.dna.Motifs = {
	'0': [],
	'1': ['init',], // initiator (2 segments)
	'2': ['init',], // initiator (3 segments)
	'3': ['input','blue'],
	'4': ['input','green','blue'], //'blue','green'],
	'5': ['input','pink'],
	'6': ['input','green','blue','pink',], // TODO FIX ORDER
	'7': ['input','purple','blue'],
	'8': ['input','green','purple'],
	'9': ['input','purple',],
	'19': ['input','blue'],
};

Workspace.objects.dna.Ports = {
	'input': {
		wtype: 'Workspace.objects.dna.InputPort'
	},
	'init': {
		wtype: 'Workspace.objects.dna.OutputPort',
		stroke:'#553300'
	},
	'green': {
		wtype: 'Workspace.objects.dna.OutputPort',
		stroke:'#66ff33'
	},
	'blue': {
		wtype: 'Workspace.objects.dna.OutputPort',
		stroke:'#33ccff'
	},
	'pink': {
		wtype: 'Workspace.objects.dna.BridgePort',
		stroke:'#ff1177'
	},
	'purple': {
		wtype: 'Workspace.objects.dna.BridgePort',
		stroke:'#9900cc'
	},
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
	Ext.define('Motif', {
		extend: 'Ext.data.Model',
		fields: [{
			name: 'number',
			type:'int'
		},{
			name: 'spec',
			type: 'auto'
		}
		]
	});
	return Ext.create('Ext.data.Store', {
		data: data,
		model: 'Motif',
	});
})();
////////////////////////////////////////////////////////////////////////////////////////////////

Ext.define('Workspace.objects.dna.Complementarity', {
	extend:'Workspace.objects.Connection',
	showLabel: false,
	property: 'complementarity',
	acceptLeft: function(item) {
		return (item.getId && (item.isWType('Workspace.objects.dna.OutputPort') || item.isWType('Workspace.objects.dna.BridgePort')));
	},
	acceptRight: function(item) {
		return (item.getId && (item.isWType('Workspace.objects.dna.InputPort')|| item.isWType('Workspace.objects.dna.BridgePort')));
	},
	canConnect: function(left,right) {
		return (left.isWType('Workspace.objects.dna.OutputPort') && right.isWType('Workspace.objects.dna.InputPort')) || (left.isWType('Workspace.objects.dna.BridgePort') && right.isWType('Workspace.objects.dna.BridgePort'));
	},
}, function() {
	Workspace.reg('Workspace.objects.dna.Complementarity',Workspace.objects.dna.Complementarity);
});