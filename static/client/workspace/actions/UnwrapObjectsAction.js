/**
 * @class Workspace.actions.UnwrapObjectsAction
 * Action which encapsulates unwrapping of a {@link Workspace.objects.Object}. Unwrapping 
 * orphans all children of an object, then deletes the parent. 
 * @extends Workspace.actions.Action
 */
Ext.define('Workspace.actions.UnwrapObjectsAction', {
	extend: 'Workspace.actions.Action',
	/**
	 * @cfg {Workspace.objects.Object[]} subjects
	 */

	/**
	 * @constructor
	 * @param {Object} config
	 */
	constructor: function(config) {
		Ext.apply(this, config)
		Workspace.actions.UnwrapObjectsAction.superclass.constructor.apply(this, arguments);
		Ext.applyIf(this, {
			scope: this
		})
	},
	wtype: 'UnwrapIdeaAction',
	handler: function() {
		Ext.each(this.subjects, function(obj) {
			var children = obj.getChildren();
			_.each(children,function(child) {
				child.orphan();
			})
		});
		this.workspace.deleteObjects(this.subjects);
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
