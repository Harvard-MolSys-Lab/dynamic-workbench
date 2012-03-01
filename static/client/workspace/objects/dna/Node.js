
/**
 * Represents a single node in a {@link App.ui.NodalCanvas nodal system}
 */
Ext.define('Workspace.objects.dna.Node', {
	extend: 'Workspace.objects.IdeaObject',
	wtype: 'Workspace.objects.dna.Node',
	layout: 'Workspace.objects.dna.NodeLayout',
	requires: ['Workspace.objects.Ellipse','Workspace.objects.dna.NodeLayout','Workspace.objects.dna.InputPort','Workspace.objects.dna.OutputPort','Workspace.objects.dna.BridgePort','Workspace.objects.dna.Motifs','Workspace.ConnectionLabel'],
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
	strokeWidth: 2.5,
	autoFill: false,
	fill: '#ffffff',
	stroke: '#000000',
	theta: 180,
	destroyChildren: true,
	isResizable: false,
	polarity: 0,

	render: function() {
		this.arguments = [this.get('x') + this.getRadiusX(), this.get('y') + this.getRadiusY(), this.getRadiusX(), this.getRadiusY()];
		Workspace.objects.Ellipse.superclass.render.call(this);
		this.layout.doFirstLayout();
		this.toBack();
		this.addShim(new Workspace.ConnectionLabel({
			cls: 'workspace-label-plain workspace-label-small',
			offsets:[0,2],
			//offsets: [11,26],
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
		
		this.expose('polarity',true,true,true,false);
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