/**
 * Represents a strand in the secondary structure designer.
 */
Ext.define('Workspace.objects.secondary.Strand', {
	extend : 'Workspace.objects.SegmentedPath',
	require: ['Workspace.objects.secondary.Domain'],
	childWType: 'Workspace.objects.secondary.Domain',	

}, function() {
	Workspace.reg('Workspace.objects.secondary.Strand', Workspace.objects.secondary.Strand);
});
