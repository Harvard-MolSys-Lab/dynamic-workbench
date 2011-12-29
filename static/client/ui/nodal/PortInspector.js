Ext.define('App.ui.nodal.PortInspector', {
	extend : 'Ext.form.Panel',
	title : 'Port',
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
			}, ],
			showIf : function(wtype) {
				return (wtype == 'Workspace.objects.dna.InputPort') || (wtype == 'Workspace.objects.dna.OutputPort') || (wtype == 'Workspace.objects.dna.BridgePort');
			},
		})
		this.callParent(arguments);
		this.mixins.boundObjectPanel.initialize.apply(this, arguments);
	},
	mixins : {
		boundObjectPanel : 'App.ui.BoundObjectPanel'
	},

})