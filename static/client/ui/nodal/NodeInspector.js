Ext.define('App.ui.nodal.NodeInspector', {
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
				increment: 15,
				anchor : '95%',
				objectBinding : 'theta',
				tipText : function(thumb) {
					return String(thumb.value) + '°';
				}
			}, {
				fieldLabel : 'Motif',
				objectBinding : 'motif',
				anchor : '95%',
			}],
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