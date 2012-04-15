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
		Workspace.ConnectionLabel.superclass.constructor.apply(this,arguments);
	},
	render: function() {
		this.callParent(arguments);
	},
	/**
	 * onMove
	 * Invoked when the element moves; repositions the shim
	 * @private
	 */
	onMove : function() {
		if(this.object) {
			var oEl = this.object.getEl();
			if(oEl) {
				var el = this.getEl();
				//el.alignTo(Ext.fly(oEl),this.position,this.offsets,this.animate);
				el.position('absolute');
				this.updateSize(this.object.get(this.property));
				el.setLeftTop((this.object.getX() + this.object.getWidth() / 2 - el.getWidth() / 2)+this.offsets[0], (this.object.getY() + this.object.getHeight() / 2 - el.getHeight() / 2)+this.offsets[1]);
			}
		}
	},
	updateSize: function() {
		this.callParent(arguments);
	}
});