/**
 * @class Workspace.actions.DeleteObjectAction
 * Action which encapsulates deletion of one or more {@link Workspace.objects.Object}
 * @extends Workspace.actions.Action
 * @cfg {Object[]} subjects
 * Workspace objects to be deleted
 * @constructor
 * @param {Object} config
 */
Ext.define('Workspace.actions.DeleteObjectAction', {
	extend: 'Workspace.actions.Action',
	constructor: function(config) {
		Workspace.actions.DeleteObjectAction.superclass.constructor.apply(this, arguments);
		Ext.applyIf(this, {
			scope: this
		})
	},
	wtype: 'DeleteObjectAction',
	handler: function() {
		this.workspace.deleteObjects(this.subjects);
	},
	getUndo: function() {
		return new Workspace.actions.CreateObjectAction({
			objects: Workspace.Components.serialize(this.subjects),
			text: 'Undo "' + this.text + '"',
			iconCls: this.iconCls
		});
	},
	serialize: function() {
		return {
			wtype: this.wtype,
			subjects: Workspace.Components.serialize(this.subjects)
		}
	}
});
