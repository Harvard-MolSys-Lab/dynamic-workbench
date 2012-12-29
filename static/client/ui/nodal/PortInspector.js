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
			}, {
				//objectBinding: 'segments',
				objectBinding: 'footprint',
				fieldLabel: 'Footprint',
				xtype: 'displayfield',
				// renderer: function(segments) {
				// 	return _.map(segments,function footprint (seg) {
				// 		return (seg.role && seg.role == 'toehold') ? '<u>'+seg.getLength()+'</u>' : seg.getLength();
				// 	}).join(' ');
				// },
			},{
				objectBinding: 'computedPolarity',
				fieldLabel: 'Polarity',
				xtype: 'displayfield',
			}],
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