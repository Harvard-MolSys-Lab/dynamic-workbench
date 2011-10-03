// var options = {
// MAX_MUTATIONS: 10, // maximum number of simultaneous mutations
// GCstr:2,
// ATstr:1,
// GTstr:0,
// MBstr:-3, // mismatch, bulge
// LLstr:-0.5, // large loop
// DHstr:3, // score for domain ending in a base pair
// LHbases:4,
// LHstart:2,
// LHpower:2,
// MAX_IMPORTANCE:100,
// INTRA_SCORE:5, // score bonus for intrastrand/dimerization interactions
// CROSSTALK_SCORE:-5, // score bonus for crosstalk (as compared to interaction)
// CROSSTALK_DIV:2, // crosstalk score is divided by this much (and then score is subtracted)
// GGGG_PENALTY:50,
// ATATAT_PENALTY:20,
// };
Ext.define('App.ui.dd.OptionsWindow', {
    extend: 'Ext.window.Window',
    title: 'Score Parameters',
    layout: 'fit',
    plain: true,
    bodyBorder: false,
    border: false,
    width: 730,
    initComponent: function () {
        Ext.apply(this, {
            items: {
                xtype: 'form',
                frame: true,
                defaults: {
                    labelAlign: 'right',
                    labelWidth: 250,
                },
                items: [{
                    fieldLabel: 'Maximum simultaneous mutations',
                    xtype: 'numberfield',
                    name: 'MAX_MUTATIONS',
                }, {
                    xtype: 'fieldset',
                    title: 'Base composition',
                    defaults: {
                        labelAlign: 'right',
                        labelWidth: 175,
                    },
                    layout: {
                        type: 'table',
                        columns: 2,
                    },
                    items: [{
                        fieldLabel: 'GC Score',
                        xtype: 'numberfield',
                        name: 'GCstr',
                    }, {
                        fieldLabel: 'GT score',
                        xtype: 'numberfield',
                        name: 'GTstr',
                    }, {
                        fieldLabel: 'AT Score',
                        xtype: 'numberfield',
                        name: 'ATstr',
                    },{
                        fieldLabel: 'Shannon Entropy multiplier',
                        xtype: 'numberfield',
                        name: 'SHANNON_BONUS',
                        tooltip: {
                        	html: 'Amount by which to multiply the adjusted Shannon entropy. Increase to increase the importance of sequence diversity relative '+
                        	'to other factors. Adjusted Shannon entropy = (Shannon entropy - offset) * multiplier'
                        }
                    },  {
                        fieldLabel: 'GGGG Penalty',
                        xtype: 'numberfield',
                        name: 'GGGG_PENALTY',
                    }, {
                    	fieldLabel: 'Shannon Entropy offset',
                    	xtype: 'numberfield',
                    	name: 'SHANNON_ADJUST',
                    	tooltip: {
                    		html: 'Expected Shannon entropy for a sequence, as a percent. 1 = 100% information density. Higher values will actively penalize '+
                    		'sequences with low entropy. '
                    	}
                    }, {
                        fieldLabel: '6 consecutive A/T or G/C score',
                        xtype: 'numberfield',
                        name: 'ATATAT_PENALTY',
                    },]
                }, {
                    xtype: 'container',
                    layout: {
                        type: 'table',
                        columns: 2,
                    },
                    height: 130,
                    defaults: {
                        margin: 2,
                        height: 125,
                    },
                    items: [{
                        xtype: 'fieldset',
                        title: 'Matches',
                        defaults: {
                            labelAlign: 'right',
                            labelWidth: 175,
                        },
                        items: [{
                            fieldLabel: 'Mismatch/bulge score',
                            xtype: 'numberfield',
                            name: 'MBstr',
                        }, {
                            fieldLabel: 'Larger loop score (per extra base)',
                            xtype: 'numberfield',
                            name: 'LLstr',
                        }, {
                            fieldLabel: 'Penalty for pairing at ends of domains',
                            xtype: 'numberfield',
                            name: 'DHstr',
                        }, ]
                    }, {
                        xtype: 'fieldset',
                        title: 'Exponential Scoring',
                        defaults: {
                            labelAlign: 'right',
                            labelWidth: 175,
                        },
                        items: [{
                            fieldLabel: 'Number of bases before exponential score kicks in',
                            xtype: 'numberfield',
                            name: 'LHbases',
                        }, {
                            fieldLabel: 'Exponential score initial',
                            xtype: 'numberfield',
                            name: 'LHstart',
                        }, {
                            fieldLabel: 'Exponential score power',
                            xtype: 'numberfield',
                            name: 'LHpower',
                        }, ]
                    }, ]
                }, {
                    xtype: 'fieldset',
                    title: 'Crosstalk',
                    defaults: {
                        labelAlign: 'right',
                        labelWidth: 175,
                    },
                    items: [{
                        fieldLabel: 'Intra-domain bonus score',
                        xtype: 'numberfield',
                        name: 'INTRA_SCORE',
                    }, {
                        fieldLabel: 'Crosstalk bonus score',
                        xtype: 'numberfield',
                        name: 'CROSSTALK_SCORE',
                    }, {
                        fieldLabel: 'Crosstalk score divide factor',
                        xtype: 'numberfield',
                        name: 'CROSSTALK_DIV',
                    }]
                }, ],
                buttons: [{
                    text: 'Save',
                    handler: this.save,
                    scope: this,
                }]
            }
        });
        this.callParent(arguments);
        this.form = this.down('form');
    },
    save: function () {
        this.designer.updateOptions(this.getValues());
        this.hide();
    },
    getValues: function () {
        return this.form.getValues();
    },
    setValues: function (v) {
        return this.form.getForm().setValues(v);
    },
});

// var rules = {
// rule_4g : 1, // cannot have 4 G's or 4 C's in a row
// rule_6at : 1, // cannot have 6 A/T or G/C bases in a row
// rule_ccend : 1, // domains MUST start and end with C
// rule_ming : 1, // design tries to minimize usage of G
// rule_init : 7, // 15 = polyN, 7 = poly-H, 3 = poly-Y, 2 = poly-T
// rule_targetworst : 1, // target worst domain
// rule_gatc_avail : 15, // all bases available
// rule_lockold : 0, // lock all old bases (NO)
// }