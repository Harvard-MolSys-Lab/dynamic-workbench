Ext.require('Ext.grid.property.Store');
Ext.grid.property.Store.override({
	getProperty : function(row) {
		return Ext.isNumber(row) ? this.store.getAt(row) : this.store.getById(row);
	},
	setValue : function(prop, value, create) {
		var r = this.getRec(prop);
		if (r) {
			r.set('value', value);
			this.source[prop] = value;
		} else if (create) {

			this.source[prop] = value;
			r = new Ext.grid.property.Property({
				name: prop,
				value: value
			}, prop);
			this.add(r);
		}
	},
	remove : function(prop) {
		var r = this.getRec(prop);
		if(r) {
			this.remove(r);
			delete this.source[prop];
		}
	},
	getRec : function(prop) {
		return this.getById(prop);
	},
});