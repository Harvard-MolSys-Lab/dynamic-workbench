/**
 * @class Workspace.actions.ChangePropertyAction
 * An action which encapsulates a change in one or more properties of a group of {@link Workspace.objects.Object}s
 * @extends Workspace.actions.Action
 * @cfg {Workspace.objects.Object[]} subjects The objects to modify
 * @cfg {Object} values The properties to modify
 */
Ext.define('Workspace.actions.ChangePropertyAction', {
	extend: 'Workspace.actions.Action',
	constructor: function(config) {
		Workspace.actions.ChangePropertyAction.superclass.constructor.apply(this, arguments);
		Ext.applyIf(this, {
			scope: this
		})
	},
	wtype: 'ChangePropertyAction',
	handler: function() {
		for (var i = 0, l = this.subjects.length, subject; i < l; i++) {
			subject = this.subjects[i];
			for (var key in this.values) {
				subject.set(key, this.values[key]);
			}
		}
	},
	getUndo: function() {
		var undoData = {};
		for (var i = 0, l = this.subjects.length, subject; i < l; i++) {
			subject = this.subjects[i];
			for (var key in this.values) {
				undoData[key] = subject.get(key);
			}
		}
		return new Workspace.actions.ChangePropertyAction({
			subjects: this.subjects.concat([]),
			values: undoData,
			text: 'Undo "' + this.text + '"',
			iconCls: this.iconCls,
		});
	},
	serialize: function() {
		return {
			wtype: this.wtype,
			subjects: Workspace.Components.serialize(this.subjects),
			values: Workspace.Components.serialize(this.values)
		}
	}
});