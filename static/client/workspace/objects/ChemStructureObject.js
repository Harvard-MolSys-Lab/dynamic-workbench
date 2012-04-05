////////////////////////////////////////////////////////////////////////////////////////////////
/**
 * @class Workspace.objects.ChemStructureObject
 * Represents a workspace object containing an editable chemical structure
 * @extends Workspace.objects.ElementObject
 */
// Workspace.objects.ChemStructureObject = {};
Ext.define('Workspace.objects.ChemStructureObject', {
	constructor: function(workspace, config) {
		//Workspace.objects.ChemStructureObject.superclass.constructor.call(this, workspace, config);
		this.callParent(arguments);
		
		Ext.apply(this.elementSpec, {
			tag: 'div',
			cls: 'chembox',
			children: [{
				tag: 'canvas',
				id: this.getId()+'_sketcher',
			}]
		});
		
		this.expose('mol',
		// getter
		function() {
			 var mol = this.sketcher.getMolecule();
			 return ChemDoodle.writeMOL(mol);
		},
		// setter
		function(value) {
			var mol = ChemDoodle.readMOL(value);
			this.sketcher.loadMolecule(mol);
		},true,false);
	},
	extend: 'Workspace.objects.ElementObject',
	wtype: 'Workspace.objects.ChemStructureObject',
	name: 'New Chemical Structure',
	iconCls: 'chem',
	isEditable: true,
	isSelectable: true,
	isResizable: true,
	padding: 22,
	//editor: 'chemdraw',
	updateWidth: function(w) {
		this.callParent(arguments);
		w = w - this.padding;
		if(this.sketcher)
			this.sketcher.width = w;
		this.getCanvas().setWidth(w);
	},
	updateHeight: function(h) {
		this.callParent(arguments);
		h = h - this.padding;
		if(this.sketcher)
			this.sketcher.height = h;
		this.getCanvas().setHeight(h);
	},
	getCanvas: function() {
		return this.getEl().down('canvas');
	},
	render: function() {
		//Workspace.objects.ChemStructureObject.superclass.render.call(this, arguments);
		this.callParent(arguments);
		/*this.getId()+'_sketcher'*/
		var canvas = this.getEl().down('canvas'),
			canvasId = canvas.id;
			//App.libUrl+'/ChemDoodleWeb/install/sketcher/icons/'
		this.sketcher = new ChemDoodle.SketcherCanvas(canvasId, this.getWidth()-this.padding, this.getHeight()-this.padding, null, ChemDoodle.featureDetection.supports_touch(), true);
		
	},
	mousedown: function(e) {
		if(e.getTarget().tagName.toLowerCase()=='canvas') {
			e.stopEvent();
			return false;
		}
		this.callParent(arguments);
	},
	destroy: function() {
		
	}
}, function() {
	Workspace.reg('Workspace.objects.ChemStructureObject', Workspace.objects.ChemStructureObject);
});