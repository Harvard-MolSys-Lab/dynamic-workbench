
/**
 * Represents a single node in a {@link App.ui.NodalCanvas nodal system}
 */
Ext.define('Workspace.objects.dna.Node', {
	extend: 'Workspace.objects.dna.AbstractNode',
	wtype: 'Workspace.objects.dna.Node',
	
	motif: '0',
	name: false,
	polarity: 0,

	render: function() {
		this.callParent(arguments);
		this.addShim(new Workspace.ConnectionLabel({
			cls: 'workspace-label-plain workspace-label-small',
			offsets:[0,2],
			//offsets: [11,26],
			property: 'motif',
			editable: false
		}));

	},
	constructor: function() {
		this.callParent(arguments);
		
		this.expose('motif',true,true,true,false);
		this.expose('computedPolarity',function() {
			return this.getRealtime('polarity');
		},false,false,false);
		this.expose('structure',function() {
			var obj = this.getLibraryObject(), struct = obj ? obj.getStructure() : null;
			try {			
				return struct ? struct.toDotParen() : '';
			} catch (e) {
				return '';
			}
		},false,false,false);
		this.expose('annotatedStructure',function() {
			var obj = this.getLibraryObject(), struct = obj ? obj.getAnnotatedStructure() : null;
			return struct;
		});

	},
	isReal: function() {
		var parent = this.getParent();
		return !!parent ? parent.isWType('Workspace.objects.dna.Motif') : false;
	},
	nextName: function() {
		return this.workspace.buildManager.getNextNodeName()
	},
	onRebuild: function() {
		this.change('computedPolarity',this.get('computedPolarity'));
		this.change('structure',this.get('structure'));
	},
	getRealtime: function(prop) {
		return this.workspace.buildManager.getRealtime('node',this.get('name'),prop);
	},
	getLibraryObject: function() { 
		return this.workspace.buildManager.getRealtime('node',this.get('name'),'this');
	},
}, function() {
	Workspace.reg('Workspace.objects.dna.Node',Workspace.objects.dna.Node);

});