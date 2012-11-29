Ext.define('App.ui.AddDomainButton', {
	extend: 'Ext.button.Split',
	text: 'Add',
	iconCls: 'plus',
	xtype: 'splitbutton',
	tooltip: 'Click the button to add a new domain of the default length. Click the arrow to choose the default length, ' + 'or add domains with specific sequences to the design. ',
	initComponent: function() {
		Ext.applyIf(this,{
			addDomain: function(len) {}
		});
		this.addDomLen = Ext.widget({
			/**
			 * @property {Ext.form.field.Number} addDomLen
			 * Control allowing the user to select the number of bases in the domain to be added
			 */
			xtype: 'numberfield',
			name: 'addDomLen',
			value: 8,
			min: 2,
			indent: true,
		});

		Ext.apply(this, {
			handler: this.onClickHandler,
			scope: this,
			menu: [{
				text: 'New domain length: ',
				canActivate: false,
			}, this.addDomLen, {
				/**
				 * @property {Ext.menu.Item} addDomainItem
				 * Menu item which triggers a domain of length specified in {@link #addDomLen} to be added to the designer.
				 */
				text: 'Add Domain',
				iconCls: 'tick',
				name: 'addDomainItem',
				handler: this.onClickHandler,
				scope: this,
			}]
		});
		this.callParent(arguments);
		//this.addDomLen = this.down('[name=addDomLen]');
		//this.addDomainItem = this.down('[name=addDomainItem]');
	},
	onClickHandler : function() {
		var len = this.addDomLen.getValue();
		this.addDomain(len);
	},
	
});