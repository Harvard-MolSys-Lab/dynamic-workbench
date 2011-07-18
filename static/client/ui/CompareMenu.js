/**
 * Displays a menu allowing the user to compare two values
 */
Ext.define('App.ui.CompareMenu', {
	extend: 'Ext.menu.Menu',
	//plain: true,
	/**
	 * Text to show when {@link #validate} returns false
	 */
	invalidText: 'Invalid Comparison',
	/**
	 * Text to show in {@link #output}
	 */
	defaultText: 'Edit distance: ',
	/**
	 * True to automatically call {@link #validate} when the value of either {@link #field1} or
	 * {@link #field2} changes
	 */
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
				/**
				 * @property {Ext.form.field.Text} field1
				 */
				xtype: 'textfield',
				ref: 'field1',
				validate: Ext.bind(this.doValidate,this),
				scope: this,
				indent: true,
				invalidText: this.invalidText,
				invalidCls: 'x-form-invalid',
				validateOnChange: this.validateOnChange,
			},{
				/**
				 * @property {Ext.form.field.Text} field2
				 */
				xtype: 'textfield',
				ref: 'field2',
				validate: Ext.bind(this.doValidate,this),
				scope: this,
				indent: true,
				invalidText: this.invalidText,
				invalidCls: 'x-form-invalid',
				validateOnChange: this.validateOnChange,
			},'-',{
				/**
				 * @property output
				 * {Ext.menu.Item} containing the result of {@link #algorithm}.
				 */
				text: this.defaultText,
				defaultText: this.defaultText,
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
	/**
	 * Custom logic to determine whether the given comparison is valid
	 */
	validate: function() {
		return true;
	},
	/**
	 * Custom logic to compute the given comparison
	 */
	algorithm: function() {
		return 0;
	},
	/**
	 * Applies {@link #validate}.
	 */
	doValidate: function() {
		var v1 = this.field1.getValue();
		v2 = this.field2.getValue();
		return this.validate(v1 || '', v2 || '');
	},
	/**
	 * Calls {@link #validityChange} on blur of {@link #field1} or {@link #field2}
	 */
	onBlur: function() {
		this.validityChange(this.doValidate());
	},
	/**
	 * Calls {@link #validate} and determines whether to set the value of {@link #output} with the result of 
	 * {@link #algorithm}.
	 */
	validityChange: function(isValid) {
		this.output.setDisabled(!isValid);
		if(isValid) {
			this.output.setText(this.output.defaultText + this.algorithm(this.field1.getValue(),this.field2.getValue()));
		} else {
			this.output.setText('N/A');
		}
	},
	/**
	 * Sets the values of {@link #field1} and {@link #field2}
	 * @param {String} s1 The value of {@link #field1}
	 * @param {String} s2 The value of {@link #field2}
	 */
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
