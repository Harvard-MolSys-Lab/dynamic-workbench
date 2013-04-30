/**
 * Shows a window allowing access to the SUNY Albany [QuikFold software](http://mfold.rna.albany.edu/cgi-bin/DINAMelt/quikfold.cgi) 
 * as a web service.
 */
Ext.define('App.ui.mfold.QuikFoldWindow',{
	extend:'App.ui.sequence.AnalysisWindow',
	title: "QuikFold Secondary Structure Calculator",
	url: 'http://mfold.rna.albany.edu/cgi-bin/DINAMelt/quikfold.cgi',
	cite: 'markham_zuker_2005',
	iconCls: 'mfold',
	getForm: function() {
		return {
			items: [{
				fieldLabel: 'Name',
				name	  : 'name',
			},{
				name: 'temp',
				xtype: 'numberfield',
				value: 20.0,
				fieldLabel : 'Temperature (°C)',
			},{
				name: 'NA',
				xtype: 'combobox',
				fieldLabel : 'Nucleic Acid',
				value: "DNA",
				store: Ext.create('Ext.data.Store', {
				    fields: ['view', 'value'],
				    data : [
				        {"view":"DNA", "value":"DNA"},
				        {"view":"RNA (2.3)", "value":"RNA"},
				        {"view":"RNA (3.0)", "value":"RNA3"},
				    ],
				}),
				queryMode: 'local',
			    displayField: 'view',
			    valueField: 'value',
			},{
				name: 'type',
				fieldLabel : 'Sequence Type',
				xtype: 'combobox',
				value: 'linear',
				store: Ext.create('Ext.data.Store', {
				    fields: ['view', 'value'],
				    data : [
				        {"view":"Linear", "value":'linear'},
				        {"view":"Circular", "value":'circular'},
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
						name: 'Sodium',
						fieldLabel : 'Na<sup>+</sup>',
						value: 1.0,
						margins: '0 5 0 0',
					},{
						fieldLabel : 'Mg<sup>2+</sup>',
						name: 'Magnesium',
						value: 0.0
					},{
						labelWidth: 0,
						name: 'saltunit',
						xtype: 'combobox',
						value: 'mM',
						store: Ext.create('Ext.data.Store', {
						    fields: ['view', 'value'],
						    data : [
						        {"view":"M", "value":'M'},
						        {"view":"mM", "value":'mM'},
						    ],
						}),
						queryMode: 'local',
					    displayField: 'view',
					    valueField: 'value',
					}
	            ]
	        },{
	        	name: 'polymer',
	        	fieldLabel: 'Polymer Mode',
	        	xtype: 'checkbox',
	        	value: false,
	        },{
	        	name: 'p',
	        	fieldLabel: "% Suboptimal",
	        	value: 5,
	        },{
	        	name: 'w',
	        	fieldLabel: 'Window Size',
	        	value: 'default',
	        },{
	        	name: 'max',
	        	fieldLabel: 'Foldings',
	        	xtype: 'numberfield',
	        	value: 50,
	        },{
	        	name: 'maxbp',
	        	fieldLabel: 'Max distance between paired bases',
	        }]
		};
	},
	getParams: function() { 
		return {
			seq: this.getValue(),
		}
	},
	updateStrands: function(strands) {
		var strandsField = this.down('codemirror');
		strandsField.setValue(strands);
	}
});


