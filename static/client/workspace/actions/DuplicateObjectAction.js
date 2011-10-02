/**
 * @class Workspace.actions.DuplicateObjectAction
 * Action which encapsulates creation of one or more {@link Workspace.objects.Object}s
 * @extends Workspace.actions.Action
 * @cfg {Object[]} objects
 * Serialized workspace objects to be created
 * @constructor
 * @param {Object} config
 * @cfg {Object[]} objects An array of {@link Workspace.objects.Object} configs
 */
Ext.define('Workspace.actions.DuplicateObjectAction', {
	extend: 'Workspace.actions.Action',
	constructor: function(config) {
		Workspace.actions.DuplicateObjectAction.superclass.constructor.apply(this, arguments);
		var subj = [], o;
		Ext.each(config.objects, function(obj) {
			o = obj.serialize();
			delete o.id;
			if(o.x) {
				o.x+=10;
			}
			if(o.y) {
				o.y+=10;
			}
			subj.push(o);
		})
		Ext.applyIf(this, {
			scope: this,
			objects: subj
		});
	},
	wtype: 'DuplicateObjectAction',
	handler: function() {
		this.workspace.createObjects(this.objects);
	},
	getUndo: function() {
		return new Workspace.actions.DeleteObjectAction({
			subjects: this.objects.concat([]),
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