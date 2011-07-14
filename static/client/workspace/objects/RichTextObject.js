////////////////////////////////////////////////////////////////////////////////////////////////
/**
 * @class Workspace.objects.RichTextObject
 * Represents a workspace object containing editable, rich HTML
 * @extends Workspace.objects.ElementObject
 */
// Workspace.objects.RichTextObject = {};
Ext.define('Workspace.objects.RichTextObject', {
	constructor: function(workspace, config) {
		Workspace.objects.RichTextObject.superclass.constructor.call(this, workspace, config);

		Ext.apply(this.elementSpec, {
			tag: 'div',
			cls: 'textbox'
		});

		this.expose('text', true, true, true, false);
		//'getText', 'setText'); //,'text','string');
		this.on('change:text', this.setText, this)
	},
	extend: 'Workspace.objects.ElementObject',
	autoMaxWidth: 300,
	wtype: 'Workspace.objects.RichTextObject',
	isEditable: true,
	isSelectable: true,
	isResizable: true,
	text: '',
	name: "New Textbox",
	iconCls: 'text-icon',
	/**
	 * @cfg {String} editor
	 * The name of a {@link WorkspaceTool} to use to edit this object (activated on double-click)
	 */
	editor: 'aloha',
	render: function() {
		this.elementSpec.html = this.get('text');
		Workspace.objects.RichTextObject.superclass.render.call(this, arguments);
	},
	getText: function() {
		//this.text = this.getEl().innerHTML;
		return this.get('text');
		//this.text;
	},
	/**
	 * setText
	 * Updates the element with the passed HTML; automatically invoked when 'text' property is set.
	 * @private
	 * @param {Object} value
	 */
	setText: function(value) {
		this.text = value;
		this.getEl().update(value);
	},
	/**
	 * sizeToFit
	 * Automatically resizes the textbox to fit the provided text. Uses {@link #autoMaxWidth} to
	 * determine the width beyond which to wrap the text.
	 */
	sizeToFit: function() {
		var metrics = Ext.util.TextMetrics.createInstance(this.getEl());
		text = this.get('text'),
		width = metrics.getWidth(text);
		if(width > this.autoMaxWidth) {
			this.set('width',this.autoMaxWidth);
			metrics.setFixedWidth(this.autoMaxWidth);
		} else {
			this.set('width',width+20);
			metrics.setFixedWidth(width+20);
		}
		this.set('height',metrics.getHeight(text)+20);
	}
}, function() {
	Workspace.reg('Workspace.objects.RichTextObject', Workspace.objects.RichTextObject);
});
