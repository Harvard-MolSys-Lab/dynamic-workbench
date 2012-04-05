////////////////////////////////////////////////////////////////////////////////////////////////
/**
 * @class Workspace.objects.CodeObject
 * Represents a workspace object containing a code editor
 * @extends Workspace.objects.ElementObject
 */
// Workspace.objects.CodeObject = {};
Ext.define('Workspace.objects.CodeObject', {
	requires: ['Workspace.tools.CodeMirrorTool'],
	constructor: function(workspace, config) {
		Workspace.objects.CodeObject.superclass.constructor.call(this, workspace, config);
		Ext.apply(this,{
			lineNumbers: false,
			lineWrapping: false,
		});
		
		Ext.apply(this.elementSpec, {
			tag: 'div',
			cls: 'textbox',
			children: [{
				tag: 'textarea',
			}]
		});

		this.expose('text', true, true, true, false);
		this.expose('mode', true, true, true, false);
		this.expose('theme', true, true, true, false);
		this.expose('lineNumbers', true, true, true, false);
		this.expose('lineWrapping', true, true, true, false);
		//'getText', 'setText'); //,'text','string');
		this.on('change:text', this.setText, this);
		this.on('change:mode',this.updateMode,this);
		this.on('change:theme',this.updateTheme,this);
		this.on('change:lineNumbers',_.bind(this.updateCodeMirrorOption,this,'lineNumbers'));
		this.on('change:lineWrapping',_.bind(this.updateCodeMirrorOption,this,'lineWrapping'));
	},
	enableLineNumbers: false,
	enableLineWrapping: false,
	updateCodeMirrorOption: function(option,value) {
		this.codemirror.setOption(option,value);
	},
	updateMode: function(newValue) {
		this.updateCodeMirrorOption('mode',newValue);
	},
	updateTheme: function(newValue) {
		this.updateCodeMirrorOption('theme',newValue);
	},
	theme: 'default',
	mode: 'text',
	extend: 'Workspace.objects.ElementObject',
	/**
	 * @cfg {Number} autoMaxWidth
	 */
	autoMaxWidth: 300,
	wtype: 'Workspace.objects.CodeObject',

	isEditable: true,
	isSelectable: true,
	isResizable: true,
	/**
	 * @cfg {String}
	 */
	text: '',
	name: "New Code box",
	iconCls: 'text-icon',
	/**
	 * @cfg {String} editor
	 * The name of a {@link Workspace.tools.BaseTool} to use to edit this object (activated on double-click)
	 */
	editor: 'codemirror',
	render: function() {
		this.elementSpec.html = this.get('text');
		this.callParent(arguments);
		var textarea = this.getEl().down('textarea').dom;
		if(textarea) {
			var me = this;
			this.codemirror = CodeMirror.fromTextArea(textarea, {
	            lineNumbers:        me.get('lineNumbers'),
	            lineWrapping:       me.get('lineWrapping'),
	            theme:              me.get('theme'),
	            mode:               me.get('mode'),
	            readOnly: 			'nocursor',
	            value:				me.get('text'),
				onCursorActivity : Ext.bind(this.onCursorActivity, this)
			},this);
		}
		//Workspace.objects.CodeObject.superclass.render.call(this, arguments);
	},
	onCursorActivity: function() {
		
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
		this.codemirror.setValue(value);
		//this.getEl().update(value);
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
	Workspace.reg('Workspace.objects.CodeObject', Workspace.objects.CodeObject);
});
