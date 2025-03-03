////////////////////////////////////////////////////////////////////////////////////////////////
/**
 * @class Workspace.tools.CodeMirrorTool
 * Allows {@link Workspace.objects.CodeObject}s to be edited using CodeMirror.
 * Node: this, Workspace.tools.AlohaTool and Workspace.tools.MathQuillTool, etc. are a special 
 * subset of tools called 'editor tools'. A separate subclass is forthcoming, but essentially 
 * they have two extra methods, attach and detach, which are used to link and delink them to 
 * single, specific objects (ie: rich text boxes, math equations).
 * @extends Workspace.tools.BaseTool
 * @param {Object} workspace
 * @param {Object} config
 */
Ext.define('Workspace.tools.CodeMirrorTool', {
	constructor: function(workspace, config) {
		Workspace.tools.CodeMirrorTool.superclass.constructor.call(this, workspace, config);
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
			// save reference to the attached item
			this.item = item;

			// watch for the user to click outside the codemirror element
			var tool = this;
			this.endEditFunction = function() {
				this.workspace.endEdit();
			};
			this.item.codemirror.setOption('onBlur',_.bind(this.endEditFunction,this));
			this.item.updateCodeMirrorOption('readOnly',false);
			this.item.codemirror.focus();
			
			return true;
		}
		return false;
	},
	/**
	 * detach
	 * called before the editor is dissociated from the passed object
	 */
	detach: function() {
		if (this.item) {
			this.item.codemirror.setOption('onBlur',null);
			this.item.set('text', this.item.codemirror.getValue());
			this.item.updateCodeMirrorOption('readOnly','nocursor');
			this.item = false;
		}
	},
	activate: function() {
		this.callParent(arguments);
	},
	deactivate: function() {
		this.callParent(arguments);
		this.detach();
	}
}, function() {
	Workspace.Tools.register('codemirror', Workspace.tools.CodeMirrorTool);
});
