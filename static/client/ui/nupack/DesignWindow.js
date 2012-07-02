Ext.define('App.ui.nupack.DesignWindow',{
	extend:'Ext.window.Window',
	width: 400,
	height: 400,
	layout: 'fit',
	title: "NUPACK Multiobjective Designer",
	plain: true,
	bodyBorder: false,
	border: false,
	closeAction: 'hide',
	minimize : function() {
		this.toggleCollapse();
	},
	minimizable : true,
	maximizable : true,
	initComponent: function() {
		Ext.apply(this,{
			layout: 'border',
			items: [{
					xtype: 'codemirror',
					mode: 'nupack',
					
					//height: 100,
					title: 'Design',
					//margin: '0 0 5 0',
					fieldLabel: 'Design',
					// name: 'design_job[target_structure]',
					labelAlign: 'top',
					region: 'center',
					//frame: true,
				},{
					split: true,
					region: 'south',
					height: 200,
					xtype:'form',
					frame: true,
					defaults: {
						xtype: 'textfield',
						anchor: '100%',
					},
					items: [{
						name      : 'design_job[nucleic_acid_type]',
						value     : 'DNA',
					},/*{
			            xtype      : 'fieldcontainer',
			            fieldLabel : 'Nucleic Acid',
			            defaultType: 'radiofield',
			            defaults: {
			                flex: 1
			            },
			            layout: 'hbox',
			            items: [
			                {
			                    boxLabel  : 'DNA',
			                    checked   : true,
			                    name      : 'design_job[nucleic_acid_type]',
			                    inputValue: 'DNA',
			                    id        : 'radio1'
			                }, {
			                    boxLabel  : 'RNA',
			                    name      : 'design_job[nucleic_acid_type]',
			                    inputValue: 'RNA',
			                },
			            ]
			        },*/{
						name: 'design_job[temperature]',
						xtype: 'numberfield',
						value: 20.0,
						fieldLabel : 'Temperature (°C)',
					},{
						name: 'design_job[number_of_trials]',
						xtype: 'numberfield',
						fieldLabel : 'Designs',
						value: 1,
					},{
						name: 'design_job[rna_parameter_file]',
						xtype: 'combobox',
						fieldLabel : 'RNA Parameters:',
						value: "rna1995",
						store: Ext.create('Ext.data.Store', {
						    fields: ['view', 'value'],
						    data : [
						        {"view":"Serra and Turner, 1995", "value":"rna1995"},
						        {"view":"Mathews et al., 1999", "value":"rna1999"},
						    ],
						}),
						queryMode: 'local',
					    displayField: 'view',
					    valueField: 'value',
					},{
						name: 'design_job[dna_parameter_file]',
						value: "dna1998",
						xtype: 'hidden'
					},{
						name: 'design_job[dangle_level]',
						xtype: 'combobox',
						fieldLabel : 'Dangles',
						value: 1,
						store: Ext.create('Ext.data.Store', {
						    fields: ['view', 'value'],
						    data : [
						        {"view":"None", "value":0},
						        {"view":"Some", "value":1},
						        {"view":"All", "value":2}
						    ],
						}),
						queryMode: 'local',
					    displayField: 'view',
					    valueField: 'value',
					},{
			            xtype      : 'fieldcontainer',
			            fieldLabel : 'Salts',
			            defaultType: 'numberfield',
			            defaults: {
			                flex: 1,
			                labelWidth: 30,
			            },
			            layout: 'hbox',
			            items: [
			                {
								name: 'design_job[na_salt]',
								fieldLabel : 'Na<sup>+</sup>',
								value: 1.0,
								margins: '0 5 0 0',
							},{
								fieldLabel : 'Mg<sup>2+</sup>',
								name: 'design_job[mg_salt]',
								value: 0.0
							}
			            ]
			        },{
						name: 'design_job[dotplot_target]',
						xtype: 'hidden',
						value: '',
					},{
						name: 'design_job[email_address]',
						fieldLabel: 'Email'
					},{
						name: 'commit',
						value:'Design',
						xtype:'hidden',
					},{
						name: 'preview_token',
						value:'',
						xtype:'hidden',
					}]
			}],
			buttons: [{
				text: 'Design',
				handler: this.doSubmit,
				scope: this,
			}]
		});
		//this.on('afterrender',this.afterrender,this);
		this.callParent(arguments);
	},
	// afterrender : function() {
		// var textarea = this.getEl().down('textarea').dom,
			// textareaCmp = this.down('textarea');
		// if(textarea && textareaCmp) {
			// var me = this;
			// this.codemirror = CodeMirror.fromTextArea(textarea, {
				// matchBrackets:      false,
	            // electricChars:      false,
	            // indentUnit:         false,
	            // smartIndent:        false,
	            // indentWithTabs:     true,
	            // lineNumbers:        true,
	            // lineWrapping:       true,
	            // firstLineNumber:    1,
	            // mode: 'nupack',
// 				
			// });
			// this.codemirror.setValue(textareaCmp.getValue());
		// }
	// },
	doSubmit: function() {
		var codemirror = this.down('codemirror');
		var targetStructure = codemirror.getValue();
		
		var form = this.down('form').getForm();
		form.doAction('standardsubmit',{
			target: '_blank',
			url: 'http://www.nupack.org/design/new',
			method: 'post',
			enctype:'multipart/form-data',
			params: {
				'design_job[target_structure]':targetStructure,
			}
		})
	},
	updateDesign: function(design) {
		var designField = this.down('codemirror');
		designField.setValue(design);
	}
})

/*
<form target="_blank" action="http://www.nupack.org/design/new" method="post" enctype="multipart/form-data" id="<%= id %>">
<textarea name="design_job[target_structure]"><%= target_structure %></textarea></label>
<input type="text" name="preview_token" value=""></input>
<input type="text" name="design_job[nucleic_acid_type]" value="<%= nucleic_acid_type %>"></input>
<input type="text" name="design_job[temperature]" value="<%= temperature %>"></input>
<input type="text" name="design_job[number_of_trials]" value="<%= number_of_trials %>"></input>
<input type="text" name="design_job[rna_parameter_file]" value="<%= rna_parameter_file %>"></input>
<input type="text" name="design_job[dna_parameter_file]" value="<%= dna_parameter_file %>"></input>
<input type="text" name="design_job[dangle_level]" value="<%= dangle_level %>"></input>
<input type="text" name="design_job[na_salt]" value="<%= na_salt %>"></input>
<input type="text" name="design_job[mg_salt]" value="<%= mg_salt %>"></input>
<input type="text" name="design_job[dotplot_target]" value="<%= dotplot_target %>"></input>
<input type="text" name="design_job[email_address]" value="<%= email_address %>"></input>
<input type="text" name="commit" value="Design"></input>
<input type="submit" name="" />
</form>
 */