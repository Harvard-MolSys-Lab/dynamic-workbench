Ext.define('App.ui.StatMenu', {
	extend: 'Ext.menu.Menu',
	labelText: 'Statistic: ',
	baseText: 'Value: ',
	initComponent: function() {
		Ext.apply(this, {
			resizable: {
				transparent: true,
			},
			items: [{
				text: this.labelText,
				canActivate: false
			},{
				xtype: 'textfield',
				ref: 'field',
				validate: Ext.bind(this.doValidate,this),
				scope: this,
				indent: true,
				invalidText: this.invalidText,
				invalidCls: 'x-form-invalid',
				validateOnChange: this.validateOnChange,
			},'-',{
				text: this.baseText,
				defaultText: this.baseText,
				canActivate: false,
				disabled: true,
				ref: 'output',
			}]
		});
		this.callParent(arguments);
		_.each(this.query('*[ref]'), function(cmp) {
			this[cmp.ref] = cmp;
		},this);
		this.field.on('blur', this.onBlur,this);
	},
	validate: function() {
		return true;
	},
	algorithm: function() {
		return 0;
	},
	doValidate: function() {
		var v1 = this.field.getValue();
		return this.validate(v1 || '');
	},
	onBlur: function() {
		this.validityChange(this.doValidate());
	},
	validityChange: function(isValid) {
		this.output.setDisabled(!isValid);
		if(isValid) {
			this.output.setText(this.baseText + this.algorithm(this.field.getValue()));
		} else {
			this.output.setText('N/A');
		}
	},
	populate: function(s1) {
		this.field.suspendEvents();

		if(s1) {
			this.field.setValue(s1);
		}
		this.field.resumeEvents();
		this.validityChange(this.doValidate());
	},
})