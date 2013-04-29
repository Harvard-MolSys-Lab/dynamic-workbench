/**
 * Allows editing of text {@link App.Document documents} with 
 * {@link App.ui.CodeMirror CodeMirror}.
 */
Ext.define('App.usr.text.Editor', {
	extend: 'Ext.panel.Panel',
	mixins: {
		app: 'App.ui.Application'
	},
	requires: ['App.ui.SaveButton','App.ui.CodeMirror'],
	/**
	 * @cfg {String}
	 * The name of the CodeMirror mode to use for syntax highlighting
	 */
	mode:'',
	layout: 'fit',
	editorType: '',
	constructor: function(config) {
		this.callParent(arguments);
		this.mixins.app.constructor.apply(this,arguments);
	},
	initComponent: function() {
		Ext.applyIf(this, {
			tbar: ['->',Ext.create('App.ui.SaveButton',{
				app: this,
				// handler: function() {
					// this.saveFile();
				// },
				// scope: this,
			})],
			items: [{
				xtype: 'codemirror',
				itemId: 'editor',
				border: false,
				mode: this.mode,
			}],
		});
		this.callParent(arguments);
		this.editor = this.down('.codemirror');
		this.on('afterrender',this.loadFile,this);
	},
	onLoad: function() {
		this.editor.setValue(this.data);
	},
	getSaveData: function() {
		return this.editor.getValue();
	},
	/**
	 * @inheritdoc App.ui.CodeMirror#search
	 */
	search: function(text) {
		this.editor.search(text);
	},
	/**
	 * @inheritdoc App.ui.CodeMirror#replace
	 */
	replace: function(text,replace) {
		this.editor.replace(text,replace);
	},
	/**
	 * @inheritdoc App.ui.CodeMirror#setValue
	 */
	setValue: function() {
		return this.editor.setValue.apply(this.editor,arguments);
	},
	/**
	 * @inheritdoc App.ui.CodeMirror#getValue
	 */
	getValue: function() {
		return this.editor.getValue.apply(this.editor,arguments);
	},
	/**
	 * Returns the current selection.
	 */
	getSelection: function() {
		return this.editor.codemirror.getSelection();
	},
	getSelectionOrValue: function() {
		var sel = this.editor.codemirror.getSelection();
		if(sel=='') {
			sel = this.editor.getValue();
		}
		return sel;
	},
	getCursor: function(start) {
		return this.editor.codemirror.getCursor(start);
	},
	getCursorRange: function() {
		return [this.editor.codemirror.getCursor(true),this.editor.codemirror.getCursor(false)];
	}
});