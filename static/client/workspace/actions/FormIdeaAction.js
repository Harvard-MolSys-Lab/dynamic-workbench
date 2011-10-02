/**
 * @class Workspace.actions.FormIdeaAction
 * Action which encapsulates creating an idea from one or more objects
 * @extends Workspace.actions.Action
 * @cfg {Object[]} subjects
 * Workspace objects to be added to the idea
 * @constructor
 * @param {Object} config
 */
Ext.define('Workspace.actions.FormIdeaAction', {
	extend: 'Workspace.actions.Action',
	constructor: function(config) {
		Workspace.actions.FormIdeaAction.superclass.constructor.apply(this, arguments);
		Ext.applyIf(this, {
			scope: this,
			ideaConfig: {}
		})
	},
	wtype: 'FormIdeaAction',
	handler: function() {
		Ext.apply(this.ideaConfig, {
			children: this.subjects,
			wtype: 'Workspace.IdeaObject'
		});
		var parent = this.workspace.createObject(this.ideaConfig);

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
			subjects: Workspace.Components.serialize(this.subjects)
		}
	}
});
