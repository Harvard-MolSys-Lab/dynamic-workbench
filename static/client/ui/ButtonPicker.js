/**
 * Menu allowing the user to select several display options for a {@link App.ui.StrandPreview}
 */
Ext.define('App.ui.ButtonPicker',{
	extend: 'Ext.button.Button',
	initComponent: function() {
		Ext.apply(this,{
		});

		this.callParent(arguments);
		if(this.menu) {
			// update value when item is selected
			this.menu.on('click',this.update,this);

			// find all menu items
			var items = this.menu.query('menuitem');

			// record items and icons associated with each possible value
			this.iconMap = {};
			this.itemMap = {};
			for(var i=0; i<items.length; i++) {
				this.iconMap[items[i].value] = items[i].iconCls;
				this.itemMap[items[i].value] = items[i];
			}
		}

		this.setValue(this.value);
	},
	update: function (menu, item, e) {
		if(item) {
			this.setValue(item.value);
		}		
	},
	setValue: function (value) {
		this.value = value;
		this.setIconCls(this.iconMap[value]);
	},
	getValue: function() {
		return this.value;
	}

});