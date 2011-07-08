Ext.define('App.ui.DD.RulesWindow', {
	extend: 'Ext.window.Window',
	plain: true,
	bodyBorder: false,
	border: false,
	layout: 'fit',
	initComponent: function() {
		Ext.apply(this, {
			items: {
				xtype: 'form',
				frame: true,
				defaults: {
					labelAlign: 'top',
					// labelWidth: 150,
				},
				items: [{
					boxLabel: "Prevent 4 G's and 4 C's in a row",
					xtype: 'checkboxfield',
					itemId: 'rule_4g',
				},{
					boxLabel: "Prevent 6 A/T bases in a row and 6 G/C bases in a row",
					xtype: 'checkboxfield',
					itemId: 'rule_6at',
				},{
					boxLabel: 'Domains must start and end with C',
					xtype: 'checkboxfield',
					itemId: 'rule_ccend',
				},{
					boxLabel: "Minimize G's in domain design",
					xtype: 'checkboxfield',
					itemId: 'rule_ming',
				},{
					boxLabel: 'Target worst domain for mutations',
					xtype: 'checkboxfield',
					itemId: 'rule_targetworst',
				},{
					fieldLabel: "Constrain initial domain sequences",
					xtype: 'textfield',
					itemId: 'rule_init',
				},{
					fieldLabel: 'Constrain bases in domains',
					xtype: 'textfield',
					itemId: 'rule_gatc_avail',
				},{
					boxLabel: 'Lock all bases in strands loaded from file',
					xtype: 'checkboxfield',
					itemId: 'rule_lockold',
				},],
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
	save: function() {
		this.designer.updateRules(this.getValues());
	},
	getValues: function() {
		return this.form.getValues();
	},
	setValues: function(v) {
		return this.form.getForm().setValues(v);
	},
});