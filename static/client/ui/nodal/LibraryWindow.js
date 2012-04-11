/**
 * Displays results of a {@link App.dynamic.Library DyNAMiC library} compilation.
 */
Ext.define('App.ui.nodal.LibraryWindow', {
	extend : 'Ext.window.Window',
	requires: ['App.ui.NupackEditor','App.ui.CodeMirror',],
	title : 'Compiled library',
	minimize : function() {
		this.toggleCollapse();
	},
	minimizable : true,
	maximizable : true,
	bodyBorder : false,
	border : false,
	plain : true,
	layout : 'fit',
	closeAction: 'hide',
	initComponent : function() {
		if(this.lastLibrary) {

			Ext.apply(this, {
				items : [{
					xtype : 'tabpanel',
					plain : true,
					items : [{
						title : 'Tree',
						xtype : 'objectbrowser',
						data : this.lastLibrary,
					}, {
						title : 'NUPACK',
						xtype : 'codemirror',
						mode : 'nupack',
						value : this.lastLibrary.toNupackOutput()
					}, {
						title : 'DD',
						xtype : 'codemirror',
						mode : 'nupack',
						value : this.lastLibrary.toDomainsOutput()
					}, {
						title : 'Strands',
						xtype : 'codemirror',
						mode : 'text',
						name: 'strands',
						value : this.printStrands(this.lastLibrary)
					},{
						title : 'Source',
						xtype : 'codemirror',
						mode : 'text',
						name : 'source',
						value : this.printStrands(this.lastLibrary,{annotations: true, originalSegmentNames: true})
					}],
				}],
			});
			if(this.sourceDynaml) {
				this.items[0].items.push({
					title: 'DyNAML',
					xtype: 'codemirror',
					mode: 'javascript',
					value: this.dynamlToString(),
				})
			}
			
		} else {
			Ext.apply(this, {
				items : [{
					html : 'No library to show.',
					frame : true,
					border : false,
					bodyBorder : false,
				}]
			})
		}
		this.callParent(arguments);
	},
	setLibrary : function(lib,source) {
		this.lastLibrary = lib;
		this.sourceDynaml = source ? source : null;
		var tabs = this.down('tabpanel');
		var oldBrowser = this.down('objectbrowser');
		tabs.remove(oldBrowser);

		tabs.add({
			title : 'Tree',
			xtype : 'objectbrowser',
			data : this.lastLibrary,
		});

		var nupack = this.down("codemirror[mode='nupack']");
		if(nupack) {
			nupack.setValue(this.lastLibrary.toNupackOutput());
		}

		var ddPanel = this.down("codemirror[mode='dd']");
		if(ddPanel) {
			ddPanel.setValue(this.lastLibrary.toDomainsOutput());
		}

		var strands = this.down("codemirror[name='strands']");
		if(strands) {
			strands.setValue(this.printStrands(this.lastLibrary));
		}
		var source = this.down("codemirror[name='source']");
		if(source) {
			source.setValue(this.printStrands(this.lastLibrary,{annotations: true, originalSegmentNames: true}));
		}
		
		
		if(this.sourceDynaml) {
			var sourcePanel = this.down("codemirror[mode='javascript']");
			if(sourcePanel) {
				sourcePanel.setValue(this.dynamlToString());
			} else {
				tabs.add({
					title: 'DyNAML',
					xtype: 'codemirror',
					mode: 'javascript',
					value: this.dynamlToString(),
				})
			}
		}

	},
	dynamlToString: function() {
		return _.isString(this.sourceDynaml) ? this.sourceDynaml : JSON.stringify(this.sourceDynaml,null,'\t');
	},
	printStrands : function(lib, options) {
		return App.dynamic.Compiler.printStrands(lib, options);
	},
	width : 400,
	height : 400,
});
