/**
 * @class Workspace.ConnectionLabel
 * @extends Workspace.Label
 */
Workspace.ConnectionLabel = {};
Ext.define('Workspace.ConnectionLabel', {
	extend : 'Workspace.Label',

	constructor : function() {
		Ext.applyIf(this, {
			elementSpec : {
				tag : 'div',
				cls : 'workspace-label-center'
			},
			offsets: [0,0]
		});
		//Workspace.ConnectionLabel.superclass.constructor.apply(this,arguments);
		this.callParent(arguments);
	},
	getLeft: function(el) {		return (this.object.getX() + this.object.getWidth() / 2 - el.getWidth() / 2)	},	getTop: function(el) {		return (this.object.getY() + this.object.getHeight() / 2 - el.getHeight() / 2)	},
});