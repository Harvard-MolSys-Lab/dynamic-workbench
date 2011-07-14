
////////////////////////////////////////////////////////////////////////////////////////////////
Ext.define('Workspace.tools.IdeaAdderTool', {
	constructor: function() {
		Workspace.tools.IdeaAdderTool.superclass.constructor.apply(this, arguments);
	},
	extend:'Workspace.tools.BaseTool',
	mixins: {
		highlightable: 'Workspace.tools.Highlightable',
	},
	click: function(e, item) {
		if (item && item.wtype == 'Workspace.IdeaObject') {
			this.workspace.doAction(new Workspace.Actions.AdoptObjectAction({
				subjects: this.workspace.getSelection(),
				parent: item
			}));
			this.workspace.changeTool('pointer');
		}
	},
	dblclick: function(e, item) {

	},
	mousedown: function(e, item) {

	},
	mouseup: function(e, item) {

	},
	mousemove: function(e, item) {

	},
	accept: function(item) {
		return (item && item.wtype=='Workspace.IdeaObject' && item.highlight);
	},
	// hack
	mouseover: function(e,item) {
		this.mixins.highlightable.mouseover.apply(this,arguments);
	},
	mouseout: function(e,item) {
		this.mixins.highlightable.mouseout.apply(this,arguments);
	},
	deactivate: function(e, item) {
		this.workspace.deselect();
	}
}, function() {
	Workspace.Tools.register('idea-add', Workspace.tools.IdeaAdderTool);
});