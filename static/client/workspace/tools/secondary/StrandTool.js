////////////////////////////////////////////////////////////////////////////////////////////////
/**
 * @class Workspace.tools.secondary.StrandTool
 * Draws multi-domain strands
 */
Ext.define('Workspace.tools.secondary.StrandTool', {
	constructor: function(workspace, config) {
		this.callParent(arguments);
	},
	extend:'Workspace.tools.PolyLineTool',
	requires: ['Workspace.objects.secondary.Strand'],

	buildObject: function() {
		return {
			wtype: 'Workspace.objects.secondary.Strand',
			points: this.currentPoints,
			//path: this.currentPath,
			fillOpacity: 0.1
		};
	},
}, function() {
	Workspace.Tools.register('strand', Workspace.tools.secondary.StrandTool);
});