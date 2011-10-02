/**
 * @class Workspace.actions.ExpandAction
 * Action which encapsulates expansion of a Workspace
 * @extends Workspace.actions.Action
 * @cfg {Number[]} size
 * Amount by which to expand the workspace ([xAmount,yAmount])
 * @constructor
 * @param {Object} config
 */
Ext.define('Workspace.actions.ExpandAction', {
	extend: 'Workspace.actions.Action',
	constructor: function(config) {
		Ext.apply(this, config, {
			size: [400, 400]
		});
		Workspace.actions.DeleteObjectAction.superclass.constructor.apply(this, arguments);
		Ext.applyIf(this, {
			scope: this
		})
	},
	wtype: 'ExpandAction',
	handler: function() {
		this.workspace.expand(this.size[0], this.size[1]);
	},
	getUndo: function() {

		return new Workspace.actions.ExpandAction({
			size: [ - this.size[0], -this.size[1]],
			text: 'Undo "' + this.text + '"',
			iconCls: this.iconCls
		});
	},
	serialize: function() {
		return {
			wtype: this.wtype,
			size: this.size
		}
	}
});