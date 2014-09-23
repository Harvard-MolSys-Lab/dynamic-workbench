if(!App)
	var App = {
		name : 'DyNAMiC Workbench'
	};

function msg(message) {
	return function() {
		if(!!message)
			Ext.Msg.show({
				title : 'Login',
				msg : message,
				buttons : Ext.Msg.OK,
				iconCls : 'lock'
			});
	};
}

Ext.onReady(function() {

	Ext.QuickTips.init();
	Ext.form.Field.prototype.msgTarget = 'side';

	Ext.require('Ext.ux.CheckColumn');

	Ext.define('App.model.User', {
		extend : 'Ext.data.Model',
		fields : [{
			name : '_id',
			type : 'string'
		}, {
			name : 'name',
			type : 'string'
		}, {
			name : 'email',
			type : 'string'
		}, {
			name : 'institution',
			type : 'string',
		}, {
			name : 'active',
			type : 'bool'
		}, {
			name : 'admin',
			type : 'bool'
		},],
	})

	var store = Ext.create('Ext.data.Store', {
		model : 'App.model.User',
		autoLoad : true,
		autoSync : true,
		batchActions: false,
		proxy : {
			batchActions: false,
			type : 'ajax',
			api : {
				read : '/users/read',
				create : '/users/create',
				update : '/users/update',
				destroy : '/users/destroy'
			},
			reader : {
				type : 'json',
				idProperty: '_id',
			},
			writer : {
				type : 'json',
				writeAllFields: true,
			},
			listeners : {
				exception : function(proxy, response, operation) {
					Ext.MessageBox.show({
						title : 'Exception',
						msg : operation.getError(),
						icon : Ext.MessageBox.ERROR,
						buttons : Ext.Msg.OK
					});
				}
			}
		}
	});
	
	// var rowEditing = Ext.create('Ext.grid.plugin.RowEditing', {
        // clicksToMoveEditor: 1,
        // autoCancel: false
    // });
    
    var cellEditing = Ext.create('Ext.grid.plugin.CellEditing', {
        clicksToEdit: 1
    });


	var adminWindow = Ext.create('Ext.container.Viewport',{
		closable : false,
		maximizable: true,
		width : 500,
		height : 300,
		modal : true,
		layout : 'border',
		title : "Administration for " + App.name,
		iconCls : 'lock',
		// autoScroll:true,
		items : [{
			html : 'Edit users who have access to ' + App.name + '.',
			frame : true,
			region : 'north',
			split : true,
			margins : '5 5 0 5'
		}, {
			xtype : 'grid',
			autoScroll:true,
			plugins: [cellEditing],
			region : 'center',
			// layout : 'anchor',
			frame : true,
			store: store,
			columns: [{
                text: 'ID',
                width: 40,
                sortable: true,
                dataIndex: '_id'
            }, {
                header: 'Email',
                flex: 1,
                sortable: true,
                dataIndex: 'email',
                field: {
                    type: 'textfield'
                }
            }, {
                header: 'Name',
                width: 100,
                sortable: true,
                dataIndex: 'name',
                field: {
                    type: 'textfield'
                }
            }, {
                header: 'Institution',
                width: 100,
                sortable: true,
                dataIndex: 'institution',
                field: {
                    type: 'textfield'
                }
            },{
            	header: 'Active',
            	dataIndex: 'active',
            	xtype: 'checkcolumn',
            	sortable: true,
            	editable: true,
            },{
            	header: 'Admin',
            	dataIndex: 'admin',
            	xtype: 'checkcolumn',
            	sortable: true,
            	editable: true,
            }]
		}]
	});
	adminWindow.show();

});
