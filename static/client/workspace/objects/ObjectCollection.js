////////////////////////////////////////////////////////////////////////////////////////////////
/**
 * @class Workspace.objects.ObjectCollection
 * Represents a collection of objects in the workspace
 * @extends Ext.util.MixedCollection
 */
// Workspace.objects.ObjectCollection = {};
Ext.define('Workspace.objects.ObjectCollection', {
	extend : 'Ext.util.MixedCollection',
	alias : 'Workspace.objects.Collection',
	getCommonWType : function() {
		var wtype = false, t = false;
		this.each(function(item) {
			if(!wtype) {
				wtype = item.wtype;
				t = Workspace.Components.getType(wtype);
			} else {
				while(!item.isWType(wtype) && t.superclass) {
					wtype = t.superclass.wtype;
					t = Workspace.Components.getType(wtype);
				}
			}
		});
		return wtype;
	}
})