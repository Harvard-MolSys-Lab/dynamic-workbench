Ext.define('App.ui.nodal.MotifInspector', {
	requires : ['App.ui.CodeMirror'],
	extend : 'Ext.form.Panel',
	title : 'Motif',
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
				xtype: 'codemirror',
				objectBinding: 'dynaml',
				objectBindingEvent: 'blur',
				height: 300,
				title: 'DyNAML',
				collapsed: false,
				collapsible: true,
				cls: 'simple-header',
				mode: {
					name: 'javascript',
					json: true,
				}
			}],
			showIf : function(wtype) {
				return (wtype == 'Workspace.objects.dna.Motif');
			},
		})
		this.callParent(arguments);
		this.mixins.boundObjectPanel.initialize.apply(this, arguments);
	},
	mixins : {
		boundObjectPanel : 'App.ui.BoundObjectPanel'
	},

})