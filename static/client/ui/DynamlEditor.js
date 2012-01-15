Ext.define('App.ui.DynamlEditor', {
	extend : 'App.ui.TextEditor',
	mode : 'javascript',
	iconCls : 'dynaml',
	editorType : 'DyNAML',
	initComponent : function() {
		Ext.apply(this, {
			tbar : [{
				text : 'Compile',
				iconCls : 'compile',
				handler : function() {
					try{
						var res = this.compile();
						App.log(this.printStrands(res));
						App.log(this.printStrands(res,{
							annotations: false,
						}));
						App.log(res.toNupackOutput())
						//console.log(this.printStrands2(res));
					} catch (e) {
						App.log(e.message,{level: 'error'});
						throw e
					}
				},
				scope : this,
			}, {
				text: 'Format',
				iconCls: 'edit',
				handler: function() {
					this.editor.autoFormatSelection()
				}, 
				scope: this,
			}, '->', Ext.create('App.ui.SaveButton', {
				app : this,
			})],
		});
		this.callParent(arguments);
	},
	
	compile : function() {
		return App.dynamic.Compiler.compile(this.getValue());
	},
	printStrands : function(lib,options) {
		return App.dynamic.Compiler.printStrands(lib,options);
	}
})