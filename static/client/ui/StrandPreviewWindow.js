Ext.define('App.ui.StrandPreviewWindow',{
	requires: ['App.ui.StrandPreview'],
	extend:'Ext.window.Window',
	width: 400,
	height: 400,
	layout: 'fit',
	title: "Secondary Structure Preview",
	plain: true,
	bodyBorder: false,
	border: false,
	closeAction: 'hide',
	initComponent: function() {
		Ext.apply(this,{
			layout: 'border',
			items: [{
				xtype: 'codemirror',
				mode: 'nupack',
				
				//height: 100,
				title: 'Structure',
				//margin: '0 0 5 0',
				fieldLabel: 'Structure',
				// name: 'design_job[target_structure]',
				labelAlign: 'top',
				region: 'north',
				split: true,
				//frame: true,
			},Ext.create('App.ui.StrandPreview',{
				region: 'center',
				height: 200,
				frame: true,
				adjacencyMode: 1,
			})],
			buttons: [{
				text: 'Preview',
				handler: this.doSubmit,
				scope: this,
			}]
		});
		//this.on('afterrender',this.afterrender,this);
		this.callParent(arguments);
	},

	doSubmit: function() {
		var codemirror = this.down('codemirror');
		var targetStructure = codemirror.getValue();
		
		var strandPreview = this.down('strandpreview');
		
		strandPreview.setValue(targetStructure)
	},
	updateDesign: function(design) {
		var designField = this.down('codemirror');
		designField.setValue(design);
	}
})

