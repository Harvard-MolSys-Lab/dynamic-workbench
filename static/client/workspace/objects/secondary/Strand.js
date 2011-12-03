////////////////////////////////////////////////////////////////////////////////////////////////
/*
 * @class Workspace.objects.SegmentedPath
 * Represents a {@link Workspace.objects.Path path} whose segments are treated as separate objects
 */
Ext.define('Workspace.objects.secondary.Strand', {
	extend : 'Workspace.objects.SegmentedPath',
	require: ['Workspace.objects.secondary.Domain'],
	childWType: 'Workspace.objects.secondary.Domain',	

}, function() {
	Workspace.reg('Workspace.objects.secondary.Strand', Workspace.objects.secondary.Strand);
});
