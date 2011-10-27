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
		
		this.expose('mol',
		// getter
		function() {
			 var mol = this.sketcher.getMolecule();
			 return ChemDoodle.writeMol(mol);
		},
		// setter
		function(value) {
			var mol = ChemDoodle.readMol(value);
			this.sketcher.loadMolecule(mol);
		},true,false);
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
		var sketcher = new ChemDoodle.SketcherCanvas(this.getId()+'_sketcher', 500, 300, App.scriptsUrl+'/ChemDoodleWeb/', ChemDoodle.featureDetection.supports_touch(), true);

	}
}, function() {
	Workspace.reg('Workspace.objects.ChemStructureObject', Workspace.objects.ChemStructureObject);
});