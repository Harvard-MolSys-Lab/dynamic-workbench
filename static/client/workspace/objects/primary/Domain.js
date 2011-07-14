Ext.define('Workspace.objects.primary.Domain',{
	extend: 'Workspace.objects.dna.Domain',
	wtype: 'Workspace.objects.primary.Domain',
	initialize: function() {
		this.rebuildPath();     
	},
},
function() {
	Workspace.reg('Workspace.objects.primary.Domain',Workspace.objects.primary.Domain);
})