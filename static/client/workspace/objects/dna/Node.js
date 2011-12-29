////////////////////////////////////////////////////////////////////////////////////////////////
Ext.ns('Workspace.objects.dna');


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
		wtype: 'Workspace.objects.dna.InputPort',
		stroke: 'orange',
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
			number: m, //parseInt(m),
			spec: Workspace.objects.dna.Motifs[m]
		};
		i++;
	}
	Ext.define('Motif', {
		extend: 'Ext.data.Model',
		fields: [{
			name: 'number',
			type: 'string'
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


Ext.define('Workspace.objects.dna.Node', {
	extend: 'Workspace.objects.IdeaObject',
	wtype: 'Workspace.objects.dna.Node',
	layout: 'Workspace.objects.dna.NodeLayout',
	requires: ['Workspace.objects.Ellipse','Workspace.objects.dna.NodeLayout','Workspace.objects.dna.InputPort','Workspace.objects.dna.OutputPort','Workspace.objects.dna.BridgePort',],
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
	theta: 180,
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