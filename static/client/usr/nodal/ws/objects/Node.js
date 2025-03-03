/**
 * Represents a single node in a {@link App.usr.nodal.Canvas nodal system}. Compiles to an {@link App.dynamic.Node}.
 */
Ext.define('App.usr.nodal.ws.objects.Node', {
	extend: 'App.usr.nodal.ws.objects.AbstractNode',
	wtype: 'App.usr.nodal.ws.objects.Node',
	
	motif: '0',
	name: false,
	polarity: 0,

	iconCls: 'node',

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
			//var obj = this.getLibraryObject(), struct = obj ? obj.getAnnotatedStructure() : null;
			var obj = this.getLibraryObject();
			if(obj) {
				return {
					structure: obj.getSegmentwiseStructure().toDotParen(), 
					strands: obj.getStrands(), 
					sequences: obj.getSequences()
				};
			}
			return null;
		});
		this.expose('strands',function () {
			return this.getRealtime('strands');
		},false,false,false);

	},
	isReal: function() {
		var parent = this.getParent();
		return !!parent ? parent.isWType('App.usr.nodal.ws.objects.Motif') : false;
	},
	nextName: function() {
		return this.workspace.buildManager.getNextNodeName()
	},
	onRebuild: function() {
		this.change('computedPolarity',this.get('computedPolarity'));
		this.change('structure',this.get('structure'));
		this.change('strands',this.get('strands'));
	},
	getRealtime: function(prop) {
		if(this.workspace.buildManager)
		return this.workspace.buildManager.getRealtime('node',this.get('name'),prop);
	},
	getLibraryObject: function() { 
		if(this.workspace.buildManager)
		return this.workspace.buildManager.getRealtime('node',this.get('name'),'this');
	},
}, function() {
	Workspace.reg('App.usr.nodal.ws.objects.Node',App.usr.nodal.ws.objects.Node);
	Workspace.regAlias('Workspace.objects.dna.Node','App.usr.nodal.ws.objects.Node');

});