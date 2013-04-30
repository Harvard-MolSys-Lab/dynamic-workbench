/**
 * Abstract class for showing dialogs that allow submission of sequence analysis tasks to various web services, such as Caltech's NUPACK, TBI Vienna's RNAfold, and SUNY Albany's QuikFold.
 */
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
	maxStrandCount: 20,
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
		
		var strands = this.getStrands(), strandCount = strands.length, start_index = 0, end_index;
		
		do {
			end_index = start_index + Math.min(strandCount,this.maxStrandCount)
			form.doAction('standardsubmit',{
				params: this.getParams(start_index,end_index),
				target: '_blank',
				url: this.url,
				method: 'post',
				enctype:'multipart/form-data',
			});
			strandCount -= this.maxStrandCount;
			start_index += this.maxStrandCount;
		} while(strandCount > 0)		
		
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
