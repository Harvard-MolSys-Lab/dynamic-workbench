Ext.define('App.ui.DD.RulesWindow', {
	extend: 'Ext.window.Window',
	plain: true,
	bodyBorder: false,
	border: false,
	layout: 'fit',
	title: 'Design Options',
	width: 350,
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
					name: 'rule_4g',
					inputValue: 1,
				},{
					boxLabel: "Prevent 6 A/T bases in a row and 6 G/C bases in a row",
					xtype: 'checkboxfield',
					name: 'rule_6at',
					inputValue: 1,
				},{
					boxLabel: 'Domains must start and end with C',
					xtype: 'checkboxfield',
					name: 'rule_ccend',
					inputValue: 1,
				},{
					boxLabel: "Minimize G's in domain design",
					xtype: 'checkboxfield',
					name: 'rule_ming',
					inputValue: 1,
				},{
					boxLabel: 'Target worst domain for mutations',
					xtype: 'checkboxfield',
					name: 'rule_targetworst',
					inputValue: 1,
				},Ext.create('App.ui.BasePicker',{
					labelAlign: 'top',
					fieldLabel: "Constrain initial domain sequences",
					name: 'rule_init',
					width: 320,
				}),Ext.create('App.ui.BasePicker',{
					labelAlign: 'top',
					fieldLabel: 'Constrain bases in domains',
					xtype: 'textfield',
					name: 'rule_gatc_avail',
					width: 320,
				}),{
					boxLabel: 'Lock all bases in strands loaded from file',
					xtype: 'checkboxfield',
					name: 'rule_lockold',
					inputValue: 1,
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
		this.hide();
	},
	getValues: function() {
		var v = this.form.getValues();
		_.each(this.query('basepicker'),function(cmp) {
			v[cmp.name] = cmp.getAggregate();
		});
		_.each(this.query('checkboxfield'),function(cmp) {
			if(!cmp.checked) { v[cmp.name] = 0; }
		})
		return v;
	},
	setValues: function(v) {
		var stringified = {}; 
		_.each(v,function(value,key) {stringified[key] = value.toString()});
		this.form.getForm().setValues(stringified);
		_.each(this.query('basepicker'),function(cmp) {
			if(v[cmp.name]) 
				cmp.setAggregate(v[cmp.name]);
		});
	},
});