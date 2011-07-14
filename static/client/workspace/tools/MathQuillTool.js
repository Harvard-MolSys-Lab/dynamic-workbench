////////////////////////////////////////////////////////////////////////////////////////////////
/**
 * @class Workspace.tools.MathQuillTool
 * Allows LaTeX equations to be edited inline with MathQuill
 * @extends WorkspceTool
 * @param {Object} workspace
 * @param {Object} config
 */
Ext.define('Workspace.tools.MathQuillTool', {
	constructor: function(workspace, config) {
		Workspace.tools.MathQuillTool.superclass.constructor.call(this, workspace, config);
	},
	extend: 'Workspace.tools.BaseTool',
	click: function(e, item) {

	},
	dblclick: function(e, item) {
		if (!item || (item && item.getId && item.getId() != this.item.getId())) {
			this.workspace.endEdit();
		}
	},
	mousedown: function(e, item) {

	},
	mouseup: function(e, item) {

	},
	mousemove: function(e, item) {

	},
	attach: function(item) {
		if (item.element) {
			// save reference to the attached item and the Aloha.Editable object
			this.item = item;
			this.item.activate();
		}
	},
	detach: function() {
		if (this.item) {
			this.item.deactivate();

			// rebuild events because somehow between aloha and contentEditable they usually get clobbered
			if (this.item.buildEvents) {
				this.item.buildEvents();
			}
			this.item = false;
		}
	},
	activate: function() {
		Workspace.tools.MathQuillTool.superclass.activate.call(this);
	},
	deactivate: function() {
		Workspace.tools.MathQuillTool.superclass.deactivate.call(this);
		this.detach();
	}
}, function() {
	Workspace.Tools.register('mathquill', Workspace.tools.MathQuillTool);
});