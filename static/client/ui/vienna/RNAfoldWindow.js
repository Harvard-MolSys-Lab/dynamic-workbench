/**
 * Shows a window allowing access to the TBI Vienna [RNAfold software](http://rna.tbi.univie.ac.at/cgi-bin/RNAfold.cgi) 
 * as a web service.
 */
Ext.define('App.ui.vienna.RNAfoldWindow',{
	extend:'App.ui.sequence.AnalysisWindow',
	title: "RNAfold Secondary Structure Calculator",
	url: 'http://rna.tbi.univie.ac.at/cgi-bin/RNAfold.cgi',
	cite: 'gruber_etal_2008',
	iconCls: 'tbi',
	height: 480,
	getForm: function() {
		return {
			height: 300,
			items: [{
				name: 'p',
				xtype: 'combobox',
				fieldLabel : 'Compute',
				value: "p",
				store: Ext.create('Ext.data.Store', {
				    fields: ['view', 'value'],
				    data : [
				        {"view":"Partition function + MFE Structure", "value":"p"},
				        {"view":"MFE Structure only", "value":"mfe"},
				    ],
				}),
				queryMode: 'local',
			    displayField: 'view',
			    valueField: 'value',
			},{
				name: 'Temp',
				xtype: 'numberfield',
				value: 20.0,
				fieldLabel : 'Temperature (°C)',
			},{
				name: 'param',
				xtype: 'combobox',
				fieldLabel : 'Parameter Set',
				value: "dna",
				store: Ext.create('Ext.data.Store', {
				    fields: ['view', 'value'],
				    data : [
				        {"view":"DNA (Matthews 2004)", "value":"dna"},
				        {"view":"RNA (Turner 2004)", "value":"rna2004"},
				        {"view":"RNA (Turner 1999)", "value":"rna1999"},
				        {"view":"RNA (Andronescu 2007)", "value":"andronescu"},
				    ],
				}),
				queryMode: 'local',
			    displayField: 'view',
			    valueField: 'value',
			},{
				name: 'dangles',
				xtype: 'combobox',
				fieldLabel : 'Dangle treatment',
				value: "d2",
				store: Ext.create('Ext.data.Store', {
				    fields: ['view', 'value'],
				    data : [
				        {"view":"no dangling end energies", "value":"d0"},
				        {"view":"unpaired bases can participate in at most one dangling end (MFE folding only)", "value":"d1"},
				        {"view":"dangling energies on both sides of a helix in any case", "value":"d2"},
				        {"view":"allow coaxial stacking of adjacent helices in multi-loops (MFE folding only)", "value":"d3"},
				    ],
				}),
				queryMode: 'local',
			    displayField: 'view',
			    valueField: 'value',
			},{
				name: 'circ',
				boxLabel : 'Sequence Type',
				xtype: 'checkbox',
				value: false,
	        },{
				name: 'nocloseGU',
				boxLabel : 'No GU pairs at the end of helices',
				xtype: 'checkbox',
				checked: false,
	        },{
				name: 'noLP',
				boxLabel : 'Avoid isolated base pairs',
				xtype: 'checkbox',
				checked: false,
	        },{
				name: 'SVG',
				boxLabel : 'SVG output',
				xtype: 'checkbox',
				checked: true,
	        },{
				name: 'mountain',
				boxLabel : 'Mountain Plot',
				xtype: 'checkbox',
				checked: true,
	        },{
				name: 'reliability',
				boxLabel : 'Confidence Indicators',
				xtype: 'checkbox',
				checked: true,
	        },]
		};
	},
	getParams: function() { 
		return {
			SCREEN: this.getValue(),
			PAGE: 2,
			proceed: 'proceed',
		}
	},
});


