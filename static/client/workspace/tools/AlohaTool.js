////////////////////////////////////////////////////////////////////////////////////////////////
/**
 * @class Workspace.tools.AlohaTool
 * Allows {@link Workspace.objects.RichTextObject}s to be edited using the Aloha HTML5 editor.
 * Node: Workspace.tools.AlohaTool and Workspace.tools.MathQuillTool are a special subset of tools called 'editor tools'. A separate
 * subclass is forthcoming, but essentially they have two extra methods, attach and detach, which are
 * used to link and delink them to single, specific objects (ie: rich text boxes, math equations).
 * @extends Workspace.tools.BaseTool
 * @param {Object} workspace
 * @param {Object} config
 */
Ext.define('Workspace.tools.AlohaTool', {
	constructor: function(workspace, config) {
		Workspace.tools.AlohaTool.superclass.constructor.call(this, workspace, config);
	},
	extend: 'Workspace.tools.BaseTool',
	click: function(e, item) {

	},
	dblclick: function(e, item) {

	},
	mousedown: function(e, item) {

	},
	mouseup: function(e, item) {

	},
	mousemove: function(e, item) {

	},
	/**
	 * attach
	 * Assosciates the editor with the passed object
	 * @param {Workspace.Object} item
	 */
	attach: function(item) {
		if (item.element) {
			// save reference to the attached item and the Aloha.Editable object
			this.item = item;
			this.editable = new GENTICS.Aloha.Editable($(Ext.fly(item.element).dom).attr('contentEditable', false));
			//this.editable = new GENTICS.Aloha.Editable($(Ext.fly(item.element).dom));
			// watch for the user to click outside the aloha element
			var tool = this;
			// because fucking aloha doesn't have a real event binding system
			this.endEditFunction = function() {
				tool.workspace.endEdit();
			};
			$(this.editable).bind('editableDeactivated', this.endEditFunction);

			// activate this editable
			this.editable.enable();
			this.editable.activate();
			// this.editable.focus();
		}
	},
	/**
	 * detach
	 * called before the editor is dissociated from the passed object
	 */
	detach: function() {
		if (this.item) {
			$(Ext.fly(this.item.element).dom).attr('contentEditable', false);
			if (this.endEditFunction) {
				// unbind the function watching for blur
				$(this.editable).unbind('editableDeactivated', this.endEditFunction);
				this.endEditFunction = false;
			}
			if (this.editable) {
				this.editable.disable();
				this.editable.destroy();
				this.editable = false;
			}

			// rebuild events because somehow between aloha and contentEditable they usually get clobbered
			if (this.item.buildEvents) {
				this.item.buildEvents();
			}

			this.item.set('text', this.item.getEl().dom.innerHTML);
			this.item = false;
		}
	},
	activate: function() {
		Workspace.tools.AlohaTool.superclass.activate.call(this);
	},
	deactivate: function() {
		Workspace.tools.AlohaTool.superclass.deactivate.call(this);
		this.detach();
	}
}, function() {
	Workspace.Tools.register('aloha', Workspace.tools.AlohaTool);
});
