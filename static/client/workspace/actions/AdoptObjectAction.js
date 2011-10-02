

/**
 * @class Workspace.actions.AdoptObjectAction
 * Action which encapsulates adoption (assigning a parent) to one or more {@link Workspace.objects.Object}
 * @extends Workspace.actions.Action
 * @cfg {Object[]} subjects
 * Workspace objects to be deleted
 * @constructor
 * @param {Object} config
 */
Ext.define('Workspace.actions.AdoptObjectAction', {
	extend: 'Workspace.actions.Action',
	constructor: function(config) {
		Ext.apply(this, config)
		Workspace.actions.AdoptObjectAction.superclass.constructor.apply(this, arguments);
		Ext.applyIf(this, {
			scope: this
		})
	},
	wtype: 'AdoptObjectAction',
	handler: function() {
		Ext.each(this.subjects, function(obj) {
			this.parent.adopt(obj)
		},
		this);
		if (this.parent.adjustSize) {
			this.parent.adjustSize()
		}
	},
	getUndo: function() {
		return new Workspace.actions.OrphanObjectAction({
			objects: this.subjects.concat([]),
			text: 'Undo "' + this.text + '"',
			iconCls: this.iconCls
		});
	},
	serialize: function() {
		return {
			wtype: this.wtype,
			parent: Workspace.Components.serialize(this.parent),
			subjects: Workspace.Components.serialize(this.subjects)
		}
	}
});