Ext.define('App.ui.nupack.PartitionWindow',{
	extend:'Ext.window.Window',
	width: 400,
	height: 400,
	layout: 'fit',
	title: "NUPACK Partition Calculator",
	plain: true,
	bodyBorder: false,
	border: false,
	closeAction: 'hide',
	initComponent: function() {
		Ext.apply(this,{
			items: [{
				xtype:'form',
				frame: true,
				defaults: {
					xtype: 'textfield',
					anchor: '100%',
				},
				items: [{
					xtype: 'codemirror',
					height: 50,
					mode: 'sequence',
					margins: '0 0 5 0',
					//fieldLabel: '',
					// name: 'design_job[target_structure]',
					// labelAlign: 'top',
				},{
					name      : 'partition_job[nucleic_acid_type]',
					value     : 'DNA',
				},
				/*{
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
		        },*/
		       {
					name: 'partition_job[temperature]',
					xtype: 'numberfield',
					value: 20.0,
					fieldLabel : 'Temperature (°C)',
				}, {
					name: 'partition_job[max_complex_size]',
					xtype: 'numberfield',
					value: 1,
					fieldLabel : 'Max Complex Size',
				},{
					name: 'partition_job[rna_parameter_file]',
					xtype: 'combobox',
					fieldLabel : 'RNA Parameters',
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
					name: 'partition_job[dna_parameter_file]',
					value: "dna1998",
					xtype: 'hidden'
				},{
					name: 'partition_job[dangle_level]',
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
							name: 'partition_job[na_salt]',
							fieldLabel : 'Na<sup>+</sup>',
							value: 1.0,
							margins: '0 5 0 0',
						},{
							fieldLabel : 'Mg<sup>2+</sup>',
							name: 'partition_job[mg_salt]',
							value: 0.0
						}
		            ]
		        },{
					name: 'partition_job[dotplot_target]',
					xtype: 'hidden',
					value: '',
				},{
					name: 'partition_job[email_address]',
					fieldLabel: 'Email'
				},{
					name: 'commit',
					value:'Analyze',
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
	doSubmit: function() {
		var codemirror = this.down('codemirror');
		var val = codemirror.getValue();
		var strands = _.compact(val.split('\n'));
		
		var scales = {
			'p':-12,
			'n':-9,
			'u':-6,
			'm':-3,
			'c':-2,
			'd':-1,
		}
		
		var partition_sequence = _.compact(_.map(strands,function(strand,i) {			
			var list = strand.trim().match(/(\w+)?\s?(\[(\d+)([pnumd])M\])?\s?:?\s?([AaTtCcGgUu]+)/);
			// ["m1 [1uM] : ATCG", "m1", "[1uM]", "1", "u", "ATCG"]
			if(list) {
				return {
					name:list[1] || "strand_"+i, 
					concentration:list[3] || 1,
					scale:list[4] ? scales[list[4]] : -6, 
					contents:list[5],
				};
			} else {
				return null;
			}
		}));
		
		
		
		var form = this.down('form').getForm();
		form.doAction('standardsubmit',{
			params: _.reduce(partition_sequence,function(memo,strand,i) {
				memo['partition_sequence['+i+'][name]'] = strand.name;
				memo['partition_sequence['+i+'][concentration]'] = strand.concentration;
				memo['partition_sequence['+i+'][scale]'] = strand.scale;
				memo['partition_sequence['+i+'][contents]'] = strand.contents;
				return memo;
			},{
				'partition_job[min_melt_temperature]':'',
				'partition_job[is_melt]':0,
				'partition_job[melt_temperature_increment]':'',
				'partition_job[max_melt_temperature]':'',
				'partition_job[num_sequences]':partition_sequence.length,
				'partition_job[pseudoknots]':0,
				'partition_job[predefined_complexes]':'',
				'partition_job[filter_min_fraction_of_max]':'',
				'partition_job[filter_max_number]':'',
			}),
			target: '_blank',
			url: 'http://www.nupack.org/partition/new',
			method: 'post',
			enctype:'multipart/form-data',
		})
	},
	updateStrands: function(strands) {
		var strandsField = this.down('codemirror');
		strandsField.setValue(strands);
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