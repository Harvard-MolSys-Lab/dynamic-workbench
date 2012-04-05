Ext.define('App.ui.nodal.NodeInspector', {
	requires : ['App.ui.nodal.StrandPreview'],
	extend : 'Ext.form.Panel',
	title : 'Node',
	bodyPadding : 5,
	enableBoundFields : true,
	initComponent : function() {

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
				xtype : 'sliderfield',
				fieldLabel : 'Rotation',
				minValue : 0,
				maxValue : 360,
				width : 100,
				increment : 15,
				anchor : '95%',
				objectBinding : 'theta',
				tipText : function(thumb) {
					return String(thumb.value) + '°';
				}
			}, {
				xtype: 'numberfield',
				fieldLabel: 'Polarity',
				objectBinding : 'polarity',
				minValue: -1,
				maxValue: 1,
				step: 1,
				anchor : '95%',
			},{
				xtype : 'combo',
				store : Workspace.objects.dna.motifStore,
				queryMode : 'local',
				displayField : 'number',
				valueField : 'number',
				forceSelection : false,//true,
				listConfig : {
					getInnerTpl : function() {
						return '<div class="search-item"><img src="images/motifs/{number}.gif" /></div>';
					}
				},
				fieldLabel : 'Motif',
				objectBinding : 'motif',
				anchor : '95%',
			}, Ext.create('App.ui.nodal.StrandPreview', {
				objectBinding : 'structure',
				items : [],
				height: 150,
				anchor : '95%',
			})
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
	mixins : {
		boundObjectPanel : 'App.ui.BoundObjectPanel'
	},

})