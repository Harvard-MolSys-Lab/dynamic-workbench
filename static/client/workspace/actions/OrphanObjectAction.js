/**
 * @class Workspace.actions.OrphanObjectAction
 * Action which encapsulates orphaning (removing from parent) of one or more {@link Workspace.objects.Object}
 * @extends Workspace.actions.Action
 * @cfg {Object[]} subjects
 * Workspace objects to be deleted
 * @constructor
 * @param {Object} config
 */
Ext.define('Workspace.actions.OrphanObjectAction', {
	extend: 'Workspace.actions.Action',
	constructor: function(config) {
		Ext.apply(this, config)
		Workspace.actions.OrphanObjectAction.superclass.constructor.apply(this, arguments);
		Ext.applyIf(this, {
			scope: this
		})
	},
	wtype: 'OrphanObjectAction',
	handler: function() {
		Ext.each(this.subjects, function(obj) {
			obj.orphan()
		});
	},
	getUndo: function() {
		// TODO: fix this
		return new Workspace.actions.AdoptObjectAction({
			objects: this.subjects.concat([]),
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
