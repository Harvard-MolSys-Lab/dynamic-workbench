/**
 * @class Workspace.idea.FreeLayout
 * Allows arbitrary arrangement of children within
 * @abstract
 * @extends Workspace.idea.BaseLayout
 */
Ext.define('Workspace.idea.FreeLayout', {
	constructor: function(config) {
		Workspace.idea.FreeLayout.superclass.constructor.apply(this,arguments);
	},
	extend: 'Workspace.idea.BaseLayout',
	doLayout: function(applyToChildren) {
		var union = false; //(union !== false);
		applyToChildren = (applyToChildren !== false);
		box = Workspace.Utils.getBox(this.getObjects().getRange());
		box = Workspace.Utils.padBox(box, this.idea.padding);
		if (union)
			box = Workspace.Utils.boxUnion(box, this.idea.getBox())
		this.idea.setBox(box, applyToChildren);
	},
	doFirstLayout: function() {
		var union = false, applyToChildren = false;
		box = Workspace.Utils.getBox(this.getObjects().getRange());
		box = Workspace.Utils.padBox(box, this.idea.padding);
		if (union)
			box = Workspace.Utils.boxUnion(box, this.idea.getBox())
		this.idea.setBox(box, applyToChildren);
	},
	/*
	 addNextChild: function() {

	 }*/
},function() {	
	Workspace.Layouts.register('Workspace.idea.FreeLayout',Workspace.idea.FreeLayout);
});