/**
 * Displays results of a {@link App.dynamic.Library DyNAMiC library} compilation.
 */
Ext.define('App.usr.nodal.LibraryWindow', {
	extend : 'Ext.window.Window',
	requires: ['App.usr.nupack.Editor','App.ui.CodeMirror',],
	title : 'Compiled library',
	minimize : function() {
		this.toggleCollapse();
	},
	minimizable : true,
	maximizable : true,
	bodyBorder : false,
	border : false,
	plain : true,
	showTree: false,
	layout : 'fit',
	closeAction: 'hide',
	initComponent : function() {
		if(this.lastLibrary) {

			Ext.apply(this, {
				items : [{
					xtype : 'tabpanel',
					plain : true,
					items : [{
						title: 'SVG',
						xtype: 'panel',
						name: 'svg',
						html: this.lastLibrary.toSVGOutput()
					}, {
						title: 'DIL',
						xtype : 'codemirror',
						mode : {'name': 'javascript', 'json':true},
						name: 'dil',
						value: this.lastLibrary.toDilOutput(),
					},{
						title : 'NUPACK',
						xtype : 'codemirror',
						mode : 'nupack',
						name : 'nupack',
						value : this.lastLibrary.toNupackOutput()
					}, {
						title : 'DD',
						xtype : 'codemirror',
						mode : 'nupack',
						name : 'dd',
						value : this.lastLibrary.toDomainsOutput()
					}, {
						title : 'PIL',
						xtype : 'codemirror',
						mode : 'pepper',
						name : 'pil',
						value : this.lastLibrary.toPilOutput()
					}, {
						title : 'Enum',
						xtype : 'codemirror',
						mode : 'pepper',
						name : 'enum',
						value : this.lastLibrary.toEnumOutput()
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
			
			if(this.showTree) {
				this.items[0].items.push({
					title : 'Tree',
					xtype : 'objectbrowser',
					data : this.lastLibrary,
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
		
		var dilPanel = this.down("codemirror[name='dil']");
		if(dilPanel) {
			dilPanel.setValue(this.lastLibrary.toDilOutput())
		}
		
		var nupack = this.down("codemirror[name='nupack']");
		if(nupack) {
			nupack.setValue(this.lastLibrary.toNupackOutput());
		}

		var ddPanel = this.down("codemirror[name='dd']");
		if(ddPanel) {
			ddPanel.setValue(this.lastLibrary.toDomainsOutput());
		}
		
		var pilPanel = this.down("codemirror[name='pil']");
		if(pilPanel) {
			pilPanel.setValue(this.lastLibrary.toPilOutput());
		}
		var emumPanel = this.down("codemirror[name='emum']");
		if(emumPanel) {
			emumPanel.setValue(this.lastLibrary.toEnumOutput());
		}

		var svgPanel = this.down("panel[name='svg']");
		if(svgPanel) {
			svgPanel.update(this.lastLibrary.toSVGOutput(true));
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
