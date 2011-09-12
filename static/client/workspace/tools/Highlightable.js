////////////////////////////////////////////////////////////////////////////////////////////////

Ext.define('Workspace.tools.Highlightable', {
	constructor: function() {
	},
	accept: function() {
		return true;
	},
	setHoverItem: function() {
	},
	mouseover: function(e,item) {
		if(item && item.highlight && this.accept(item)) {
			item.highlight();
			this.setHoverItem(item);
		}
		if(e) e.stopEvent();
	},
	mouseout: function(e,item) {
		if(item && item.unhighlight) {
			item.unhighlight();
			this.setHoverItem(false);
		}
		if(e) e.stopEvent();
	}
});