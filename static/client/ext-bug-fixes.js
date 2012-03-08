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

Ext.require('Ext.data.TreeStore');
Ext.data.TreeStore.override({
    load: function(options) {
        options = options || {};
        options.params = options.params || {};

        var me = this,
            node = options.node || me.tree.getRootNode(),
            root;

        // If there is not a node it means the user hasnt defined a rootnode yet. In this case lets just
        // create one for them.
        if (!node) {
            node = me.setRootNode({
                expanded: true
            });
        }

        if (me.clearOnLoad) {
        	// BUGFIX: from 4.0.2; without this, all files are deleted by ext on refresh of tree
            node.removeAll(false);//true,true);//true);
        }

        Ext.applyIf(options, {
            node: node
        });
        options.params[me.nodeParam] = node ? node.getId() : 'root';

        if (node) {
            node.set('loading', true);
        }

        return me.callParent([options]);
    },
});