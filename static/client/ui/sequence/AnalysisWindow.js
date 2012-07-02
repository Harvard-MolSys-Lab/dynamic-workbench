Ext.define('App.ui.sequence.AnalysisWindow',{
	extend:'Ext.window.Window',
	width: 400,
	height: 480,
	//layout: 'fit',
	layout: 'border',
	title: "Sequence Analysis",
	plain: true,
	bodyBorder: false,
	border: false,
	closeAction: 'hide',
	minimize : function() {
		this.toggleCollapse();
	},
	minimizable : true,
	maximizable : true,
	submitButtonText: 'Analyze',
	cite: '',
	initComponent: function() {
		Ext.apply(this,{
			items: [{
					xtype: 'codemirror',
					height: 100,
					mode: 'sequence',
					title: 'Sequences',
					region: 'center',
					//margin: '0 0 5 0',
					//fieldLabel: '',
					// name: 'design_job[target_structure]',
					// labelAlign: 'top',
				},Ext.apply({
					region: 'south',
					height: 260,
					split: true,
					xtype:'form',
					frame: true,
					defaults: {
						xtype: 'textfield',
						anchor: '100%',
					},
					dockedItems: [{
						xtype: 'cite',
						cite: this.cite,
					}],
			},this.getForm())],
			buttons: [{
				text: this.submitButtonText,
				handler: this.doSubmit,
				scope: this,
			}]
		});
		//this.on('afterrender',this.afterrender,this);
		this.callParent(arguments);
	},
	doSubmit: function() {	
		var form = this.down('form').getForm();
		form.doAction('standardsubmit',{
			params: this.getParams(),
			target: '_blank',
			url: this.url,
			method: 'post',
			enctype:'multipart/form-data',
		})
	},
	getForm: function() {
		return {};
	},
	getParams: function() {
		return {};
	},
	getValue: function() {
		var codemirror = this.down('codemirror');
		var val = codemirror.getValue();
		return val;
	},
	getStrands: function() {
		var val = this.getValue()
		var strands = _.compact(val.split('\n'));
		return strands;
	},
	updateStrands: function(strands) {
		var strandsField = this.down('codemirror');
		strandsField.setValue(strands);
	}
})
