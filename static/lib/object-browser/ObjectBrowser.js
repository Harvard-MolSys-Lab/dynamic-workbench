Ext.define('Components.ObjectBrowser', {

	extend : 'Ext.tree.Panel',
	alias : 'widget.objectbrowser',
	objId : 1,
	getNewId : function() {
		this.objId++;
		return this.objId;
	},
	initComponent : function() {
		Ext.apply(this, {
			forceFit : true,
			useArrows : true,
			rootVisible : false,
			multiSelect : true,
			columns : [{
				xtype : 'treecolumn',
				text : (this.keyTitle || 'Key'),
				sortable : true,
				dataIndex : 'key',
				flex : 2
			}, {
				text : (this.valueTitle || 'Value'),
				sortable : true,
				dataIndex : 'value'
			}]
		});

		if( typeof this.nullValue == 'undefined') {
			this.nullValue = 'null';
		}
		this.store = this.createStore(this.data);

		return this.callParent(arguments);
	},
	createStore : function(data) {
		var modelName = this.id + '-Objects';

		Ext.define(modelName, {
			extend : 'Ext.data.Model',
			fields : [{
				name : 'key',
				type : 'string'
			}, {
				name : 'value',
				type : 'string'
			}, {
				name : 'id',
				type : 'string'
			}],
			idProperty: 'id',
		});

		return Ext.create('Ext.data.TreeStore', {
			folderSort : true,
			model : modelName,
			proxy : {
				type : 'memory',
				data : {
					text : 'root',
					children : this.parseObject(data)
				}
			}
		});
	},
	getNodeId : function(treeId) {
		return this.getId() + '-node-'+treeId;
	},
	parseObject : function(o) {
		var items = [];
		
		var me = this;
		
		function renderObject(key,obj) {
			if(typeof obj === 'object' && (obj !== null)) {
				return {
					key : key,
					value : '<a href="'+me.getNodeId(obj)+'">'+me.getTypeName(obj)+'</a>',
					iconCls : 'tree-node-' + me.findType(obj),
					children : me.parseObject(obj),
					//id: me.getNodeId(obj._objTreeId),
				}
			}  else {
				var v = (obj === null) ? me.nullValue : obj;
				return {
					key : key,
					value : v,
					leaf : true,
					iconCls : 'tree-node-' + me.findType(v),
					//id: me.getNodeId(obj._objTreeId),
				};
			}
		}
		
		// avoid recursive references
		if(!o._objTreeId) {
			o._objTreeId = this.getNewId();

			if(o.hasOwnProperty('length') && ( typeof o === 'object')) {
				var idx = o.length;
				while(idx--) {
					items.push(renderObject('[' + idx + ']',o[idx]));
					
					// if( typeof o[idx] === 'object' && (o[idx] !== null)) {
						// items.push(renderObject('[' + idx + ']',obj));
						// // items.push({
							// // key : '[' + idx + ']',
							// // value : '<a href="#">Object</a>',
							// // iconCls : 'tree-node-' + this.findType(o[idx]),
							// // children : this.parseObject(o[idx])
						// // });
					// } else {
						// var v = (o[idx] === null) ? this.nullValue : o[idx];
						// items.push({
							// key : '[' + idx + ']',
							// value : v,
							// leaf : true,
							// iconCls : 'tree-node-' + this.findType(v)
						// });
					// }
				}
			} else if(!o.hasOwnProperty('length') && ( typeof o === 'object')) {
				for(var key in o) {
					if(o.hasOwnProperty(key) && key != '_objTreeId') {
						items.push(renderObject(key,o[key]));
						
						// if( typeof o[key] === 'object' && (o[key] !== null)) {
							// items.push({
								// key : key,
								// value : '',
								// iconCls : 'tree-node-' + this.findType(o[key]),
								// children : this.parseObject(o[key])
							// });
						// } else {
							// var v = (o[key] === null) ? this.nullValue : o[key];
							// items.push({
								// key : key,
								// value : v,
								// leaf : true,
								// iconCls : 'tree-node-' + this.findType(v)
							// });
						// }
					}
				}
			}
		}

		return items;
	},
	getTypeName : function(o) {
		if(typeof o != 'undefined') {
			return o.constructor.name;
		} else {
			return 'undefined';
		}
	},
	findType : function(o) {
		if( typeof o === 'object') {
			if(o.hasOwnProperty('length')) {
				return 'array';
			} else {
				return 'object';
			}
		} else {
			return typeof o;
		}
	}
});
