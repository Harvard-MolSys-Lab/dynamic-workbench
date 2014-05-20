/**
 * Allows conversion of files in various formats
 */
Ext.define('App.ui.ConvertButton', {
	extend: 'Ext.button.Split',
	text: 'Convert',
	iconCls: 'dil',
	fromMode: 'pil',
	defaultToMode: 'dil',
	initComponent: function() {
		
		Ext.apply(this,{
			handler: this.makeConvertHandler(this.defaultToMode),
			scope: this,

			menu: [{
				text: 'DIL',
				handler: this.makeConvertHandler('dil'),
				iconCls: 'dil',
				scope: this,
			},{
				text: 'PIL',
				handler: this.makeConvertHandler('pil'),
				iconCls: 'pil',
				scope: this,
			}]
		});
		
		this.callParent(arguments);
	},
	makeConvertHandler: function(mode) {
		return function() {
			this.runConverter(mode);
		}
	},
	runConverter: function(mode) {
		var node = this.app.doc.getDocumentPath(),
			resNode = App.path.addExt(App.path.removeExt(node),mode);

		App.runTask('Converter', {
			node: this.app.getDocumentPath(),
			to: mode,
			from: this.fromMode,

		},function(text, args, success) {
			if(success) 
				Ext.msg('Converter','Conversion completed.');
			else
				Ext.msg('Converter','Conversion failed. Click for details.',{handler: 'console', cls:'error'});

		},this,{
			openOnEnd: [resNode]
		});
		Ext.msg('Converter','Conversion started.');
	},
})