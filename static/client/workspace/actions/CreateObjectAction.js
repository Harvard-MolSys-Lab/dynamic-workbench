

/**
 * @class Workspace.actions.CreateObjectAction
 * Action which encapsulates creation of one or more {@link Workspace.objects.Object}s
 * @extends Workspace.actions.Action
 * @cfg {Object[]} objects
 * Serialized workspace objects to be created
 * @constructor
 * @param {Object} config
 * @cfg {Object[]} objects An array of {@link Workspace.objects.Object} configs
 */
Ext.define('Workspace.actions.CreateObjectAction', {
	extend: 'Workspace.actions.Action',
	constructor: function(config) {
		Workspace.actions.CreateObjectAction.superclass.constructor.apply(this, arguments);
		Ext.applyIf(this, {
			scope: this
		})
	},
	wtype: 'CreateObjectAction',
	handler: function() {
		this.workspace.createObjects(this.objects);
	},
	getUndo: function() {
		return new Workspace.actions.DeleteObjectAction({
			subjects: this.subjects.concat([]),
			text: 'Undo "' + this.text + '"',
			iconCls: this.iconCls
		});
	},
	serialize: function() {
		return {
			wtype: this.wtype,
			objects: Workspace.Components.serialize(this.subjects),
		}
	}
});