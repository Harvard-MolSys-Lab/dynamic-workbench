Ext.define('App.ui.nupack.PartitionWindow',{
	extend:'App.ui.sequence.AnalysisWindow',
	title: "NUPACK Partition Calculator",
	url: 'http://www.nupack.org/partition/new',
	cite: 'zadeh_etal_2011',
	iconCls: 'nupack-icon',
	height: 500,
	getForm: function() {
		return {
			items: [{
				fieldLabel: 'Nucleic Acid',
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
	            xtype      : 'fieldcontainer',
	            fieldLabel : 'Concentration',
	            defaultType: 'numberfield',
	            defaults: {
	                flex: 1,
	                labelWidth: 30,
	            },
	            layout: 'hbox',
	            items: [
	                {
						name: 'conc_value',
						value: 0.1,
						margins: '0 5 0 0',
					},{
						//fieldLabel : 'Mg<sup>2+</sup>',
						name: 'conc_scale',
						value: 'u',
						xtype: 'combobox',
						value: "u",
						store: Ext.create('Ext.data.Store', {
						    fields: ['view', 'value'],
						    data : [
						        {"view":"cM", "value":'c'},
						        {"view":"mM", "value":'m'},
						        {"view":"µM", "value":'u'},
						        {"view":"nM", "value":'n'},
						        {"view":"pM", "value":'n'},
						    ],
						}),
						forceSelect: true,
						queryMode: 'local',
					    displayField: 'view',
					    valueField: 'value',
					}
	            ]
	        },{
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
						fieldLabel : 'Na<sup>+</sup> (M)',
						value: 1.0,
						margins: '0 5 0 0',
					},{
						fieldLabel : 'Mg<sup>2+</sup> (M)',
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
		}
	},

	getParams: function(start_index,end_index) {
		start_index || (start_index = 0);
		end_index || (end_index = null);
		
		var strands = this.getStrands();
		var scales = {
			'p':-12,
			'n':-9,
			'u':-6,
			'm':-3,
			'c':-2,
			'd':-1,
		}
		var defaultScale = this.down('[name=conc_scale]').getValue();
		var defaultConc = this.down('[name=conc_value]').getValue();
		
		var partition_sequence = _.compact(_.map(strands,function(strand,i) {			
			var list;

			// Simple case; just sequence, no fancy input
			if(/^\s*([AaTtCcGgUu]+)\s*$/.test(strand)) {
				strand = strand.trim();
				return {
					name: i, 
					concentration: defaultConc,
					scale: scales[defaultScale],
					contents: strand
				};
			}

			list = strand.trim().match(/(\w+)?\s?(\[(\d+)([pnumd])M\])?\s?:?\s?([AaTtCcGgUu]+)/);
			// ["m1 [1uM] : ATCG", "m1", "[1uM]", "1", "u", "ATCG"]
			if(list) {
				return {
					name:list[1] || "strand_"+i, 
					concentration:list[3] || defaultConc,
					scale:list[4] ? scales[list[4]] : scales[defaultScale], 
					contents:list[5],
				};
			} else {
				return null;
			}
		}));
		
		if(end_index == null) {
			partition_sequence = partition_sequence.slice(start_index);
		} else {
			partition_sequence = partition_sequence.slice(start_index,end_index);
		}
		
		return _.reduce(partition_sequence,function(memo,strand,i) {
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
			});

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