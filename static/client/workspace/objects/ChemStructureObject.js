////////////////////////////////////////////////////////////////////////////////////////////////
/**
 * @class Workspace.objects.ChemStructureObject
 * Represents a workspace object containing an editable chemical structure
 * @extends Workspace.objects.ElementObject
 */
// Workspace.objects.ChemStructureObject = {};
Ext.define('Workspace.objects.ChemStructureObject', {
	constructor: function(workspace, config) {
		Workspace.objects.ChemStructureObject.superclass.constructor.call(this, workspace, config);

		Ext.apply(this.elementSpec, {
			tag: 'div',
			cls: 'textbox'
		});

	},
	extend: 'Workspace.ElementObject',
	wtype: 'Workspace.objects.ChemStructureObject',
	name: 'New Chemical Structure',
	iconCls: 'chem',
	isEditable: true,
	isSelectable: true,
	isResizable: true,
	editor: 'chemdraw',
	render: function() {
		Workspace.objects.ChemStructureObject.superclass.render.call(this, arguments);
	}
}, function() {
	Workspace.reg('Workspace.objects.ChemStructureObject', Workspace.objects.ChemStructureObject);
});