
/**
 * Represents a single motif in a {@link App.ui.NodalCanvas nodal system}
 */
Ext.define('Workspace.objects.dna.Motif', {
	extend: 'Workspace.objects.dna.AbstractNode',
	wtype: 'Workspace.objects.dna.Motif',
	layout: 'Workspace.objects.dna.MotifLayout',
	name: false,
	proxifyOnMove : true,
	polarity: 0,
	requires: ['Workspace.objects.dna.MotifLayout',],
	constructor: function() {
		this.callParent(arguments);
		this.workspace.buildManager.on('rebuild',this.onRebuild,this);
		this.expose('dynaml',true,true,true,false);
		this.expose('nodes',function() {
			return _.filter(this.getChildren(),function(child) { return child.hasWType('Workspace.objects.dna.Node')});
		},false,false,false);
	},
	render: function() {
		this.callParent(arguments);
		this.addShim(new Workspace.ConnectionLabel({
			cls: 'workspace-label-plain workspace-label-small',
			offsets:[0,2],
			//offsets: [11,26],
			property: 'name',
			editable: true
		}));

	},
	nextName: function() {
		return this.workspace.buildManager.getNextMotifName()
	},
	onRebuild: function() {
		
	},
	getRealtime: function(prop) {
		return this.workspace.buildManager.getRealtime('motif',this.get('name'),prop);
	},
	getLibraryObject: function() { 
		return this.workspace.buildManager.getRealtime('motif',this.get('name'),'this');
	},
	destroy: function() {
		if(this.errorProxy) {
			this.errorProxy.destroy();
			delete this.errorProxy();
		}
	}
}, function() {
	Workspace.reg('Workspace.objects.dna.Motif',Workspace.objects.dna.Motif);

});