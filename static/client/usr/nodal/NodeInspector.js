Ext.define('App.usr.nodal.NodeInspector', {
	requires : ['App.usr.nodal.StrandPreview'],
	extend : 'Ext.form.Panel',
	title : 'Node',
	bodyPadding : 5,
	enableBoundFields : true,
	initComponent : function() {
		var me = this;

		Ext.apply(this, {
			defaults : {
				xtype : 'textfield',
			},
			fieldDefaults : {
				labelWidth : 100,
			},
			items : [{
				objectBinding : 'name',
				anchor : "100%",
			}, {
				xtype: 'displayfield',
				fieldLabel: 'Definition',
				labelAlign: 'top',
				objectBinding: 'strands',
				valueToRaw: function (value) {
					return value || [];
				},
				renderer: function(spec) {
					spec || (spec = []);
					return _.map(spec,function(strand) {
						return '<div class="strand-glyph-container'+(strand?'':' strand-glyph-unknown')+'">'+
						'<span class="strand-glyph-name">'+strand.name+'</span>'+ 
						_.map(strand.getDomains(),function(dom) {
							return '<div class="domain-glyph domain-glyph-'+dom.role+'">' + (dom.name ? '<span class="domain-glyph-name">'+dom.name+'</span>':'')+
								_.map(dom.getSegments(),function(seg) { 
									return '<span class="segment-glyph segment-glyph-'+seg.role+'">'+seg.identity+'</span>'+(seg.polarity==-1?'<sup>*</sup>':'') 
								}).join(' ')+
								'</div>'
						}).join(' ')+
						'</div>';
					}).join(' + ');
				},
			}, Ext.create('App.ui.StrandPreview', {
				objectBinding : 'annotatedStructure',
				loopMode: 'linear',
				items : [],
				height: 150,
				anchor : '100%',
				resizable: true,
			}), {
				xtype : 'combo',
				store : Workspace.objects.dna.motifStore,
				queryMode : 'local',
				displayField : 'number',
				valueField : 'number',
				forceSelection : false, //true,
				// listConfig : {
				// 	getInnerTpl : function() {
				// 		return '<div class="search-item"><img src="images/motifs/{number}.gif" /></div>';
				// 	}
				// },
				fieldLabel : 'Motif',
				objectBinding : 'motif',
				anchor : '100%',
				margin: '5 0 5 0',
			}, {
				xtype: 'numberfield',
				fieldLabel: 'Polarity',
				objectBinding : 'polarity',
				minValue: -1,
				maxValue: 1,
				step: 1,
				anchor : '100%',
			},  {
				xtype : 'sliderfield',
				fieldLabel : 'Rotation',
				minValue : 0,
				maxValue : 360,
				width : 100,
				increment : 15,
				anchor : '100%',
				objectBinding : 'theta',
				tipText : function(thumb) {
					return String(thumb.value) + '°';
				}
			},
			// {
			// xtype : 'panel',
			// layout : 'fit',
			// border: '1 1 1 1',
			// objectBinding: 'motif',
			// height: 300,
			// anchor : '95%',
			// items : [],
			// }
			],
			showIf : function(wtype) {
				return (wtype == 'Workspace.objects.dna.Node');
			},
		})
		this.callParent(arguments);
		this.mixins.boundObjectPanel.initialize.apply(this, arguments);
	},
	getBoundObject: function () {
		return this.boundObjects.getAt(0);
	},
	mixins : {
		boundObjectPanel : 'App.ui.BoundObjectPanel'
	},

})