Ext.define('App.ui.CompareMenu', {
	extend: 'Ext.menu.Menu',
	//plain: true,
	invalidText: 'Invalid Comparison',
	validateOnChange: false,
	minWidth: 300,
	resizeHandles: 's e se',

	initComponent: function() {
		Ext.apply(this, {
			resizable: {
				transparent: true,
			},
			items: [{
				text: 'Compare:',
				canActivate: false
			},{
				xtype: 'textfield',
				ref: 'field1',
				validate: Ext.bind(this.doValidate,this),
				scope: this,
				indent: true,
				invalidText: this.invalidText,
				invalidCls: 'x-form-invalid',
				validateOnChange: this.validateOnChange,
			},{
				xtype: 'textfield',
				ref: 'field2',
				validate: Ext.bind(this.doValidate,this),
				scope: this,
				indent: true,
				invalidText: this.invalidText,
				invalidCls: 'x-form-invalid',
				validateOnChange: this.validateOnChange,
			},'-',{
				text: 'Edit distance: ',
				defaultText: 'Edit distance: ',
				canActivate: false,
				disabled: true,
				ref: 'output',
			}]
		});
		this.callParent(arguments);
		_.each(this.query('*[ref]'), function(cmp) {
			this[cmp.ref] = cmp;
		},this);
		this.field1.on('blur', this.onBlur,this);
		this.field2.on('blue', this.onBlur,this);
	},
	validate: function() {
		return true;
	},
	algorithm: function() {
		return 0;
	},
	doValidate: function() {
		var v1 = this.field1.getValue();
		v2 = this.field2.getValue();
		return this.validate(v1 || '', v2 || '');
	},
	onBlur: function() {
		this.validityChange(this.doValidate());
	},
	validityChange: function(isValid) {
		this.output.setDisabled(!isValid);
		if(isValid) {
			this.output.setText(this.output.defaultText + this.algorithm(this.field1.getValue(),this.field2.getValue()));
		} else {
			this.output.setText('N/A');
		}
	},
	populate: function(s1,s2) {
		this.field1.suspendEvents();
		this.field2.suspendEvents();

		if(s1) {
			this.field1.setValue(s1);
		}
		if(s2) {
			this.field2.setValue(s2);
		}
		this.field1.resumeEvents();
		this.field2.resumeEvents();
		this.validityChange(this.doValidate());
	},
});
