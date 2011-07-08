Ext.define('App.ui.TextEditor', {
	extend: 'Ext.panel.Panel',
	mixins: {
		app: 'App.ui.Application'
	},
	mode:'',
	layout: 'fit',
	editorType: '',
	constructor: function(config) {
		this.callParent(arguments);
		this.mixins.app.constructor.apply(this,arguments);
	},
	initComponent: function() {
		Ext.applyIf(this, {
			tbar: ['->',{
				text: 'Save',
				iconCls: 'save',
				handler: function() {
					this.saveFile();
				},
				scope: this,
			}],
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
	search: function(text) {
		this.editor.search(text);
	},
	replace: function(text,replace) {
		this.editor.replace(text,replace);
	}
});