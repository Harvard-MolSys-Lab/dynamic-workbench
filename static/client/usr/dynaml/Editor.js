Ext.define('App.usr.dynaml.Editor', {
	extend : 'App.usr.text.Editor',
	
	iconCls : 'dynaml',
	editorType : 'DyNAML',
	requires: ['App.usr.nodal.LibraryWindow','App.usr.nupack.Editor','App.ui.CodeMirror',],
	trap: true,
	initComponent : function() {
		Ext.apply(this, {
			mode : {name:'javascript', json:true},
			tbar : [{
				xtype: 'splitbutton',
				text : 'Compile',
				iconCls : 'compile',
				handler : this.compileDynamicServer,
				scope : this,
				menu : [{
					text : 'Compile locally',
					handler : this.compileDynamicLocal,
					scope : this,
				}]
			}, {
				text : 'Format',
				iconCls : 'edit',
				handler : function() {
					this.editor.autoFormatSelection()
				},
				scope : this,
			}, '->', Ext.create('App.ui.SaveButton', {
				app : this,
			})],
		});
		this.callParent(arguments);
	},
	compileDynamicServer : function() {
		var data = this.getValue(), node = this.doc.getDocumentPath();
		//App.path.repostfix([this.ribbon.canvas.doc.getDocumentPath(),'txt']);
		App.runTask('Nodal', {
			node : node,
			data : data,
			action : 'dynamic',
		}, _.bind(function() {
			//this.enableMenus();
			Ext.msg('Nodal Build', 'Build of system <strong>{0}</strong> completed.', this.doc.getBasename());
		}, this));
	},
	compileDynamicLocal : function() {
		var res;
		if(this.trap) {

			try {
				res = this.compile();
			} catch (e) {
				App.log(e.message, {
					level : 'error'
				});
				//throw e
			}
		} else {
			res = this.compile();
		}
		if(res) {
			this.lastLibrary = res;
			this.showLibraryTreeWindow();
		}
		// App.log(this.printStrands(res));
		// App.log(this.printStrands(res, {
			// annotations : false,
		// }));
		// App.log(res.toNupackOutput());
// 
		// console.log(this.printStrands2(res));
		// }
	},
	showLibraryTreeWindow : function() {
		if(!this.libraryTreeWindow && this.lastLibrary) {
			this.libraryTreeWindow = Ext.create('App.usr.nodal.LibraryWindow',{
				lastLibrary: this.lastLibrary
			})
		} else if(this.lastLibrary) {
			this.libraryTreeWindow.setLibrary(this.lastLibrary);
		}
		this.libraryTreeWindow.show();
	},
	compile : function() {
		var val = this.getValue();
		var json = jsonlint.parse(val);  
		return App.dynamic.Compiler.compile(this.getValue());
	},
	printStrands : function(lib, options) {
		return App.dynamic.Compiler.printStrands(lib, options);
	}
})