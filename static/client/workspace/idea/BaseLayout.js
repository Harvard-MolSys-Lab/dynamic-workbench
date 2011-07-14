////////////////////////////////////////////////////////////////////////////////////////////////
/**
 * @class Workspace.idea.BaseLayout
 * Calculates position of the children of a {@link Workspace.objects.IdeaObject}
 * @abstract
 * @extends Ext.util.Observable
 */
Ext.define('Workspace.idea.BaseLayout', {
	constructor: function(config) {
		Workspace.idea.BaseLayout.superclass.constructor.apply(this,arguments);
		Ext.apply(this,config);
		this.defaultChildConfig = {
			wtype: this.defaultChildType,
			width: 100,
			height: 100
		};
	},
	extend: 'Ext.util.Observable',
	resizable: true,
	childrenResizable: true,
	childrenMovable: true,
	defaultChildType: 'Workspace.RichTextObject',
	doLayout: function() {

	},
	doFirstLayout: function() {

	},
	addNextChild: function() {
		this.idea.addChild(this.idea.workspace.createChild(this.defaultChildConfig))
	},
	destroy: function() {
		this.fireEvent('destroy',this);
		delete this.idea;
	},
	getObjects: function() {
		if(this.idea) {
			return this.idea.children;
		} else if(this.objects) {
			return this.objects;
		}
	}
});
